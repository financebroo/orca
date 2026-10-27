import { useCallback, useState } from 'react'
import { useFocusEffect } from 'expo-router'
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaFrame, useSafeAreaInsets } from 'react-native-safe-area-context'
import { useOpenMobileAccounts } from '../accounts/use-open-mobile-accounts'
import { getProvenCachedWorktrees } from '../cache/worktree-cache'
import { ActionSheetModal } from '../components/ActionSheetModal'
import { ConfirmModal } from '../components/ConfirmModal'
import { getHostListActionSheetActions } from '../host-list-action-sheet-actions'
import { hostRouteWithNotice } from '../host-route-notice'
import { foldPosture, type FoldPosture } from '../layout/fold-division'
import { useResponsiveLayout } from '../layout/responsive-layout'
import { useCoverCorner, useWindowSafeAreaInsets } from '../layout/side-safe-area'
import {
  SIDE_RAIL_DRAWN_BY_SCREEN,
  useSideRailAvailable,
  useSideRailContent
} from '../layout/side-rail'
import { useFoldDivision } from '../layout/use-window-regions'
import { triggerMediumImpact } from '../platform/haptics'
import { useOpenMobileSession } from '../session/use-open-mobile-session'
import { useOpenMobileTasks } from '../tasks/use-open-mobile-tasks'
import { StatsUsagePanel } from '../stats/StatsUsagePanel'
import { colors, spacing } from '../theme/mobile-theme'
import {
  useDisconnectHostClient,
  useForceReconnect,
  useForgetHostClient
} from '../transport/host-client-hooks'
import { hostEndpointLabel } from '../transport/host-endpoint-label'
import { resolveHomeHostConnectionState } from '../transport/home-host-auto-connect'
import { removeHostAndCloseClient } from '../transport/host-removal-lifecycle'
import { loadHostCatalog } from '../transport/host-store'
import type { HostCatalogEntry, HostProfile } from '../transport/types'
import { useOpenMobileHostEdit } from '../transport/use-open-mobile-host-edit'
import type { HomeWorktreeSummary } from '../worktree/home-worktree-info'
import { isResumeTargetConfirmedMissing, type HomeResumeCard } from '../worktree/home-resume-card'
import { MobileHomeAccountUsageCards } from './MobileHomeAccountUsageCards'
import { MobileHomeEmptyState } from './MobileHomeEmptyState'
import { MobileHomeHostList } from './MobileHomeHostList'
import { MobileHomeListFooter } from './MobileHomeListFooter'
import { MobileHomeSideRail } from './MobileHomeSideRail'
import { MobileHomeTopBar } from './MobileHomeTopBar'
import { useMobileHomeData } from './use-mobile-home-data'
import { newWorkspaceOverlayHref } from '../new-workspace/new-workspace-overlay-route'

const MIN_COLUMN_WIDTH = 280

// Half folded book-style, the stats column ends at the hinge and the host list starts past it, so
// each column sits whole on its own display. Null when flat or when a column would get too narrow.
function resolveHingeColumns(
  posture: FoldPosture,
  leftInset: number,
  areaWidth: number
): { leftWidth: number; hingeWidth: number } | null {
  if (posture.kind !== 'sideBySide') {
    return null
  }
  const leftWidth = posture.leftEnd - leftInset
  const hingeWidth = posture.rightStart - posture.leftEnd
  const fits =
    leftWidth >= MIN_COLUMN_WIDTH && areaWidth - leftWidth - hingeWidth >= MIN_COLUMN_WIDTH
  return fits ? { leftWidth, hingeWidth } : null
}

export function MobileHomeScreen() {
  const data = useMobileHomeData()
  const insets = useSafeAreaInsets()
  const { isWideLayout, isTabletLayout, contentMaxWidth } = useResponsiveLayout()
  // Tablet-sized windows (iPad, unfolded iPhone Duo either way up): one column wastes the width, so
  // stats get their own column. Not isWideLayout: the unfolded Duo upright is 626pt wide, under its cutoff.
  const splitColumns = isTabletLayout
  const areaWidth = useSafeAreaFrame().width
  const hingeColumns = resolveHingeColumns(
    foldPosture(useFoldDivision()),
    useWindowSafeAreaInsets().left,
    areaWidth
  )
  const [refreshKey, setRefreshKey] = useState(0)
  const [focused, setFocused] = useState(true)
  // Why: Home stays mounted under pushed screens; they must get the rail back.
  useFocusEffect(
    useCallback(() => {
      setFocused(true)
      return () => setFocused(false)
    }, [])
  )
  const actionsInRail = useSideRailAvailable() && splitColumns && focused
  const refreshUsage = useCallback(() => setRefreshKey((key) => key + 1), [])
  const openSettings = useCallback(() => data.router.push('/settings'), [data.router])
  // Folded on its side, Home runs under the status strip; only the corner block stays clear.
  const claimsCoverStrip = useCoverCorner() !== null && focused
  useSideRailContent(
    actionsInRail ? (
      <MobileHomeSideRail onOpenSettings={openSettings} onRefresh={refreshUsage} />
    ) : claimsCoverStrip ? (
      SIDE_RAIL_DRAWN_BY_SCREEN
    ) : null
  )
  const openMobileHostEdit = useOpenMobileHostEdit()
  const openMobileTasks = useOpenMobileTasks()
  const openMobileSession = useOpenMobileSession()
  const openMobileAccounts = useOpenMobileAccounts()
  const disconnectHostClient = useDisconnectHostClient()
  const forgetHostClient = useForgetHostClient()
  const forceReconnectHost = useForceReconnect()
  const [actionTarget, setActionTarget] = useState<HostProfile | null>(null)
  const [confirmRemove, setConfirmRemove] = useState<{ id: string; name: string } | null>(null)

  const openResume = useCallback(
    (card: HomeResumeCard) => {
      if (
        isResumeTargetConfirmedMissing(
          card,
          getProvenCachedWorktrees(card.hostId) as HomeWorktreeSummary[] | null
        )
      ) {
        data.router.push(hostRouteWithNotice(card.hostId, 'worktree-missing'))
        return
      }
      openMobileSession({
        hostId: card.hostId,
        worktreeId: card.worktree.worktreeId,
        name: card.worktree.displayName || card.worktree.repo
      })
    },
    [data.router, openMobileSession]
  )

  function openHost(host: HostCatalogEntry): void {
    if (host.credentialStatus === 'missing') {
      data.router.push('/pair-scan')
    } else if (host.credentialStatus === 'temporarily-unavailable') {
      void loadHostCatalog()
        .then(data.setHostCatalog)
        .catch(() => Alert.alert('Could not check pairing', 'Please try again.'))
    } else {
      data.router.push(`/h/${host.id}`)
    }
  }

  function openHostActions(host: HostCatalogEntry): void {
    if (host.profile) {
      setActionTarget(host.profile)
    } else {
      setConfirmRemove(host)
    }
  }

  async function handleRemove(): Promise<void> {
    if (!confirmRemove) {
      return
    }
    const host = confirmRemove
    try {
      await removeHostAndCloseClient(host.id, forgetHostClient)
      setConfirmRemove(null)
      data.setHostCatalog(await loadHostCatalog())
    } catch {
      setConfirmRemove(host)
      Alert.alert('Could not remove host', 'Please try again.')
    }
  }

  const statsClient =
    data.allClients.find((entry) => entry.hostId === data.connectedHosts[0]?.id)?.client ?? null

  const accountUsage =
    data.accountsHosts.length > 0 ? (
      <MobileHomeAccountUsageCards
        items={data.accountsHosts}
        onOpen={openMobileAccounts}
        embedded
      />
    ) : null

  const hostList = (
    <MobileHomeHostList
      autoConnectHostIds={data.autoConnectHostIds}
      bottomInset={insets.bottom}
      contentMaxWidth={contentMaxWidth}
      footer={
        <MobileHomeListFooter
          accountsHosts={data.accountsHosts}
          connectedHosts={data.connectedHosts}
          resumeCard={data.resumeCard}
          taskProvidersByHost={data.taskProvidersByHost}
          onCreateWorkspace={() =>
            data.router.push(newWorkspaceOverlayHref(data.connectedHosts.map((host) => host.id)))
          }
          onOpenAccounts={openMobileAccounts}
          onOpenResume={openResume}
          onOpenTasks={openMobileTasks}
          onPairDesktop={() => data.router.push('/pair-scan')}
          hideAccountUsage={splitColumns}
        />
      }
      hostAttempts={data.hostAttempts}
      hostLastConnected={data.hostLastConnected}
      hostConnections={data.hostConnections}
      hosts={data.sortedHostCatalog}
      hostStates={data.hostStates}
      isWideLayout={isWideLayout && !splitColumns}
      stats={splitColumns ? null : data.stats}
      worktreeInfo={data.worktreeInfo}
      onOpen={openHost}
      onLongPress={(host) => {
        triggerMediumImpact()
        openHostActions(host)
      }}
      onOpenActions={openHostActions}
    />
  )

  return (
    // iPhone Duo (2026-10-27): native SafeAreaView read the unfolded portrait status block's real ~82pt
    // top inset and pushed Home below the clock; the context inset is zeroed there and the top bar
    // already clears the block on its right.
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <MobileHomeTopBar
        onOpenSettings={actionsInRail ? undefined : openSettings}
        onRefresh={splitColumns && !actionsInRail ? refreshUsage : undefined}
      />
      {data.hostCatalog.length === 0 ? (
        <MobileHomeEmptyState
          bottomInset={insets.bottom}
          contentMaxWidth={contentMaxWidth}
          isWideLayout={isWideLayout}
          onPairDesktop={() => data.router.push('/pair-scan')}
        />
      ) : splitColumns ? (
        <View style={styles.columns}>
          <ScrollView
            // Always a fixed width, never added or dropped keys (2026-10-27 on the Duo): a width
            // dropped on unfold stayed at its folded 455pt, and a flexBasis set on fold never
            // applied, collapsing the column to zero. Flat it is half the row; folded it ends at the hinge.
            style={{
              width: hingeColumns ? hingeColumns.leftWidth : areaWidth / 2,
              flexGrow: 0,
              flexShrink: 0
            }}
            contentContainerStyle={[
              styles.statsColumn,
              { paddingBottom: spacing.xl + insets.bottom }
            ]}
          >
            <Text style={styles.columnTitle}>Stats & Usage</Text>
            {/* The panel's first section (Activity) lines up with the right column's DESKTOPS card. */}
            <StatsUsagePanel
              client={statsClient}
              counters={data.stats}
              activityExtra={accountUsage}
              // The rail (landscape) or the top bar (portrait) owns refresh in the split.
              refreshKey={refreshKey}
            />
          </ScrollView>
          <View style={[styles.column, { marginLeft: hingeColumns?.hingeWidth ?? 0 }]}>
            {hostList}
          </View>
        </View>
      ) : (
        hostList
      )}
      <ActionSheetModal
        visible={actionTarget != null}
        title={actionTarget?.name}
        message={actionTarget ? hostEndpointLabel(actionTarget.endpoint) : undefined}
        actions={getHostListActionSheetActions({
          host: actionTarget,
          state: actionTarget
            ? resolveHomeHostConnectionState(
                actionTarget.id,
                data.hostStates[actionTarget.id],
                data.autoConnectHostIds
              )
            : 'disconnected',
          hasEverConnected: actionTarget
            ? (data.hostLastConnected[actionTarget.id] ?? null) != null
            : false,
          onDismiss: () => setActionTarget(null),
          onReconnect: (hostId) => void forceReconnectHost?.(hostId),
          onDisconnect: disconnectHostClient,
          onDiagnostics: (hostId) =>
            data.router.push({ pathname: '/connection-log', params: { hostId } }),
          onEdit: openMobileHostEdit,
          onRemove: (host) => setConfirmRemove(host)
        })}
        onClose={() => setActionTarget(null)}
      />
      <ConfirmModal
        visible={confirmRemove != null}
        title="Remove Host"
        message={`Remove "${confirmRemove?.name}"? You can re-pair later.`}
        confirmLabel="Remove"
        destructive
        onConfirm={() => void handleRemove()}
        onCancel={() => setConfirmRemove(null)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgBase },
  columns: { flex: 1, flexDirection: 'row' },
  column: { flex: 1 },
  statsColumn: { paddingHorizontal: spacing.lg },
  columnTitle: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
    paddingTop: spacing.xs,
    paddingBottom: spacing.md
  }
})
