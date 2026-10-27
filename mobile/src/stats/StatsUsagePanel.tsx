import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { ActivityIndicator, Pressable, View } from 'react-native'
import { RefreshCw } from 'lucide-react-native'
import type { RpcClient } from '../transport/rpc-client'
import { colors } from '../theme/mobile-theme'
import {
  BlockLabel,
  CardDivider,
  DailyBars,
  formatSessionTime,
  Legend,
  MetricStrip,
  MixBar,
  Notice,
  Segmented,
  UsageRow,
  UsageSection
} from './stats-usage-parts'
import { homeHostStatsRead } from '../home/mobile-home-host-operations'
import { totalHomeStats, type HomeStatsSummary } from './home-stats-total'
import { formatDuration } from './HomeStatsCards'
import { fetchUsageReport } from './usage-snapshot-operations'
import {
  buildUsageOverview,
  formatCost,
  formatTokens,
  USAGE_PROVIDER_LABELS,
  USAGE_PROVIDERS,
  type UsageBreakdownRow,
  type UsageProviderId,
  type UsageProviderReport,
  type UsageRange,
  type UsageScope
} from './usage-report-model'

type UsageTab = 'overview' | UsageProviderId

const TABS = [
  { id: 'overview', label: 'All agents' },
  ...USAGE_PROVIDERS.map((id) => ({ id, label: USAGE_PROVIDER_LABELS[id] }))
]
const RANGES = [
  { id: '7d', label: '7d' },
  { id: '30d', label: '30d' },
  { id: '90d', label: '90d' },
  { id: 'all', label: 'All' }
]
const SCOPES = [
  { id: 'orca', label: 'Orca only' },
  { id: 'all', label: 'All sessions' }
]

// Desktop overview hues, one per agent so the stacked daily bars stay readable.
const PROVIDER_COLORS: Record<UsageProviderId, string> = {
  claude: '#d97757',
  codex: '#38bdf8',
  opencode: '#34d399',
  muse: colors.statusPurple
}
const MIX_COLORS = { input: '#38bdf8', output: '#34d399', cache: '#f59e0b' }

type ReportState =
  | { status: 'loading' }
  | { status: 'unsupported' }
  | { status: 'error' }
  | { status: 'ok'; providers: Record<UsageProviderId, UsageProviderReport> }

/** Mobile port of the desktop Settings → Stats & Usage pane, read from one paired desktop. */
export function StatsUsagePanel(props: {
  client: RpcClient | null
  /** Home passes its all-desktop totals; Settings leaves this out and reads this desktop's. */
  counters?: HomeStatsSummary | null
  /** Extra rows for the Activity card (home puts account usage there). */
  activityExtra?: ReactNode
  /** Set when the screen owns the refresh button (the landscape rail); bump it to reload. */
  refreshKey?: number
}) {
  const { client } = props
  const [scope, setScope] = useState<UsageScope>('orca')
  const [range, setRange] = useState<UsageRange>('30d')
  const [tab, setTab] = useState<UsageTab>('overview')
  const [report, setReport] = useState<ReportState>({ status: 'loading' })
  const [ownCounters, setOwnCounters] = useState<HomeStatsSummary | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const countersGiven = props.counters !== undefined
  const counters = countersGiven ? props.counters : ownCounters

  useEffect(() => {
    if (!client) {
      return
    }
    let stale = false
    setReport({ status: 'loading' })
    fetchUsageReport(client, scope, range)
      .then((result) => {
        if (!stale) {
          setReport(result.status === 'ok' ? result : { status: 'unsupported' })
        }
      })
      .catch(() => {
        if (!stale) {
          setReport({ status: 'error' })
        }
      })
    return () => {
      stale = true
    }
  }, [client, scope, range, reloadKey, props.refreshKey])

  useEffect(() => {
    if (!client || countersGiven) {
      return
    }
    let stale = false
    homeHostStatsRead
      .request(client, null)
      .then((reply) => {
        const verdict = homeHostStatsRead.interpret(reply)
        if (!stale && verdict.accepted) {
          setOwnCounters(totalHomeStats({ host: verdict.value }, ['host']))
        }
      })
      .catch(() => {})
    return () => {
      stale = true
    }
  }, [client, countersGiven, reloadKey, props.refreshKey])

  const reload = useCallback(() => setReloadKey((key) => key + 1), [])
  const showFilters = report.status !== 'unsupported'

  return (
    <View>
      <UsageSection title="Activity" first>
        {counters ? (
          <MetricStrip
            items={[
              { label: 'Agents spawned', value: counters.totalAgentsSpawned.toLocaleString() },
              { label: 'Agent time', value: formatDuration(counters.totalAgentTimeMs) },
              { label: 'PRs created', value: counters.totalPRsCreated.toLocaleString() }
            ]}
          />
        ) : (
          <Notice>{client ? 'Loading activity…' : 'Connect to a desktop to see stats.'}</Notice>
        )}
        {props.activityExtra ? (
          <>
            <CardDivider />
            {props.activityExtra}
          </>
        ) : null}
      </UsageSection>
      {client ? (
        <UsageSection
          title="Usage"
          accessory={
            props.refreshKey !== undefined ? undefined : (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Refresh usage"
                hitSlop={8}
                onPress={reload}
              >
                <RefreshCw size={14} color={colors.textMuted} />
              </Pressable>
            )
          }
        >
          {showFilters ? (
            <>
              <Segmented items={TABS} selected={tab} onSelect={(id) => setTab(id as UsageTab)} />
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={{ flex: 2 }}>
                  <Segmented
                    items={SCOPES}
                    selected={scope}
                    onSelect={(id) => setScope(id as UsageScope)}
                  />
                </View>
                <View style={{ flex: 3 }}>
                  <Segmented
                    items={RANGES}
                    selected={range}
                    onSelect={(id) => setRange(id as UsageRange)}
                  />
                </View>
              </View>
              <CardDivider />
            </>
          ) : null}
          {report.status === 'loading' ? (
            <ActivityIndicator color={colors.textMuted} />
          ) : report.status === 'unsupported' ? (
            <Notice>Usage analytics need a newer Orca on this desktop.</Notice>
          ) : report.status === 'error' ? (
            <Notice>Could not load usage. Tap refresh to retry.</Notice>
          ) : tab === 'overview' ? (
            <OverviewBody providers={report.providers} />
          ) : (
            <ProviderBody report={report.providers[tab]} />
          )}
        </UsageSection>
      ) : null}
      {report.status === 'ok' ? (
        tab === 'overview' ? (
          <AgentList providers={report.providers} onOpen={setTab} />
        ) : (
          <ProviderLists report={report.providers[tab]} />
        )
      ) : null}
    </View>
  )
}

function OverviewBody(props: { providers: Record<UsageProviderId, UsageProviderReport> }) {
  const overview = useMemo(() => buildUsageOverview(props.providers), [props.providers])
  if (!overview.hasAnyEnabled) {
    return (
      <Notice>Usage tracking is off. Turn it on in the desktop's Settings → Stats & Usage.</Notice>
    )
  }
  return (
    <>
      <MetricStrip
        items={[
          { label: 'Tokens', value: formatTokens(overview.totalTokens) },
          { label: 'Est. cost', value: formatCost(overview.costUsd) },
          { label: 'Sessions', value: overview.sessions.toLocaleString() },
          { label: 'Active days', value: overview.activeDays.toLocaleString() }
        ]}
      />
      <CardDivider />
      <BlockLabel>Daily tokens</BlockLabel>
      <DailyBars
        days={overview.daily.map((entry) => ({
          day: entry.day,
          segments: USAGE_PROVIDERS.map((id) => ({
            color: PROVIDER_COLORS[id],
            value: entry.byProvider[id]
          }))
        }))}
      />
      <CardDivider />
      <TokenMix
        input={overview.newInputTokens}
        output={overview.outputTokens}
        cache={overview.cacheTokens}
      />
    </>
  )
}

function ProviderBody(props: { report: UsageProviderReport }) {
  const { report } = props
  const label = USAGE_PROVIDER_LABELS[report.id]
  if (!report.enabled) {
    return (
      <Notice>{`${label} tracking is off. Turn it on in the desktop's Settings → Stats & Usage.`}</Notice>
    )
  }
  if (!report.hasData) {
    return (
      <Notice>
        {report.isScanning ? `Scanning ${label} sessions…` : `No ${label} usage found yet.`}
      </Notice>
    )
  }
  return (
    <>
      <MetricStrip
        items={[
          { label: 'Tokens', value: formatTokens(report.totalTokens) },
          { label: 'Est. cost', value: formatCost(report.costUsd) },
          { label: 'Sessions', value: report.sessions.toLocaleString() },
          {
            label: report.activityLabel === 'turns' ? 'Turns' : 'Events',
            value: report.activityCount.toLocaleString()
          }
        ]}
      />
      <CardDivider />
      <BlockLabel>Daily tokens</BlockLabel>
      <DailyBars
        days={report.daily.map((entry) => ({
          day: entry.day,
          segments: [{ color: PROVIDER_COLORS[report.id], value: entry.totalTokens }]
        }))}
      />
      <CardDivider />
      <TokenMix
        input={report.newInputTokens}
        output={report.outputTokens}
        cache={report.cacheTokens}
      />
    </>
  )
}

function TokenMix(props: { input: number; output: number; cache: number }) {
  return (
    <>
      <BlockLabel>Token mix</BlockLabel>
      <MixBar
        parts={[
          { color: MIX_COLORS.input, value: props.input },
          { color: MIX_COLORS.output, value: props.output },
          { color: MIX_COLORS.cache, value: props.cache }
        ]}
      />
      <Legend
        items={[
          { color: MIX_COLORS.input, label: `Input ${formatTokens(props.input)}` },
          { color: MIX_COLORS.output, label: `Output ${formatTokens(props.output)}` },
          { color: MIX_COLORS.cache, label: `Cache ${formatTokens(props.cache)}` }
        ]}
      />
    </>
  )
}

function AgentList(props: {
  providers: Record<UsageProviderId, UsageProviderReport>
  onOpen: (id: UsageProviderId) => void
}) {
  const reports = USAGE_PROVIDERS.map((id) => props.providers[id])
  if (!reports.some((report) => report.enabled)) {
    return null
  }
  const max = Math.max(1, ...reports.map((report) => report.totalTokens))
  return (
    <UsageSection title="By agent">
      <View style={{ marginVertical: -8 }}>
        {reports.map((report, index) => (
          <UsageRow
            key={report.id}
            first={index === 0}
            label={USAGE_PROVIDER_LABELS[report.id]}
            value={
              report.enabled
                ? `${formatTokens(report.totalTokens)} · ${formatCost(report.costUsd)}`
                : 'Off'
            }
            dotColor={PROVIDER_COLORS[report.id]}
            share={report.enabled ? report.totalTokens / max : undefined}
            onPress={() => props.onOpen(report.id)}
          />
        ))}
      </View>
    </UsageSection>
  )
}

function ProviderLists(props: { report: UsageProviderReport }) {
  const { report } = props
  if (!report.enabled || !report.hasData) {
    return null
  }
  const color = PROVIDER_COLORS[report.id]
  return (
    <>
      <BreakdownSection title="By model" rows={report.models} color={color} />
      <BreakdownSection title="By project" rows={report.projects} color={color} />
      {report.recentSessions.length > 0 ? (
        <UsageSection title="Recent sessions">
          <View style={{ marginVertical: -8 }}>
            {report.recentSessions.map((session, index) => (
              <UsageRow
                key={session.id || index}
                first={index === 0}
                label={session.project || 'Unknown project'}
                detail={[
                  formatSessionTime(session.lastActiveAt),
                  session.model,
                  `${session.durationMinutes}m`
                ]
                  .filter(Boolean)
                  .join(' · ')}
                value={formatTokens(session.totalTokens)}
              />
            ))}
          </View>
        </UsageSection>
      ) : null}
    </>
  )
}

function BreakdownSection(props: { title: string; rows: UsageBreakdownRow[]; color: string }) {
  if (props.rows.length === 0) {
    return null
  }
  const max = Math.max(1, ...props.rows.map((row) => row.totalTokens))
  return (
    <UsageSection title={props.title}>
      <View style={{ marginVertical: -8 }}>
        {props.rows.slice(0, 8).map((row, index) => (
          <UsageRow
            key={row.key || index}
            first={index === 0}
            label={row.label || row.key}
            value={`${formatTokens(row.totalTokens)} · ${formatCost(row.costUsd)}`}
            dotColor={props.color}
            share={row.totalTokens / max}
          />
        ))}
      </View>
    </UsageSection>
  )
}
