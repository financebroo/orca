import { ChevronDown, ChevronRight } from 'lucide-react-native'
import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { RuntimeWorktreeAgentRow } from '../../../src/shared/runtime-types'
import { colors, radii, spacing } from '../theme/mobile-theme'
import { agentDotState } from '../worktree/agent-row-display'
import { AgentStateDot } from './AgentStateDot'
import { MobileAgentIcon } from './MobileAgentIcon'

const MAX_VISIBLE_AGENTS = 3
// iPhone Duo (2026-10-27): a squeezed sidebar shows fewer chips and a bigger +N instead of clipping.
// One chip: 3 + 10pt dot + 2 + 13pt icon + 3, plus the 4pt gap; the +N label needs ~18pt.
const AGENT_CHIP_STEP = 35
const HIDDEN_COUNT_WIDTH = 18

function visibleAgentCount(total: number, width: number | null): number {
  const max = Math.min(MAX_VISIBLE_AGENTS, total)
  if (width === null || max * AGENT_CHIP_STEP + (total > max ? HIDDEN_COUNT_WIDTH : 0) <= width) {
    return max
  }
  return Math.max(1, Math.floor((width - HIDDEN_COUNT_WIDTH) / AGENT_CHIP_STEP))
}

type Props = {
  agents: RuntimeWorktreeAgentRow[]
  expanded: boolean
  now: number
  onToggle: () => void
}

export function WorktreeAgentSummary({ agents, expanded, now, onToggle }: Props) {
  const [iconsWidth, setIconsWidth] = useState<number | null>(null)
  const visibleAgents = agents.slice(0, visibleAgentCount(agents.length, iconsWidth))
  const hiddenCount = agents.length - visibleAgents.length
  const subject = `${agents.length} agents`

  return (
    <Pressable
      style={({ pressed }) => [
        styles.summary,
        !expanded && styles.summaryCollapsed,
        pressed && styles.summaryPressed
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${expanded ? 'Collapse' : 'Expand'} ${subject}`}
      accessibilityState={{ expanded }}
      onPress={(event) => {
        event.stopPropagation()
        onToggle()
      }}
    >
      {expanded ? (
        <Text style={styles.expandedLabel}>{subject}</Text>
      ) : (
        <View
          style={styles.agentIcons}
          onLayout={(event) => setIconsWidth(event.nativeEvent.layout.width)}
        >
          {visibleAgents.map((agent) => (
            <View key={agent.paneKey} style={styles.agentStatus}>
              <AgentStateDot state={agentDotState(agent, now)} />
              {agent.agentType ? <MobileAgentIcon agentId={agent.agentType} size={13} /> : null}
            </View>
          ))}
          {hiddenCount > 0 ? <Text style={styles.hiddenCount}>+{hiddenCount}</Text> : null}
        </View>
      )}
      {expanded ? (
        <ChevronDown size={12} color={colors.textMuted} />
      ) : (
        <ChevronRight size={12} color={colors.textMuted} />
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  summary: {
    minHeight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
    borderRadius: radii.button
  },
  summaryCollapsed: {
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.bgRaised
  },
  summaryPressed: {
    opacity: 0.72
  },
  expandedLabel: {
    flex: 1,
    paddingLeft: spacing.xs,
    fontSize: 11,
    fontWeight: '500',
    color: colors.textMuted
  },
  agentIcons: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs
  },
  agentStatus: {
    height: 19,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 3,
    borderRadius: radii.button,
    backgroundColor: colors.bgPanel
  },
  hiddenCount: {
    fontSize: 10,
    color: colors.textMuted
  }
})
