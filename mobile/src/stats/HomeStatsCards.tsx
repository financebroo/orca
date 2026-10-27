import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native'
import type { HomeStatsSummary } from './home-stats-total'
import { colors, spacing } from '../theme/mobile-theme'

export function formatDuration(ms: number): string {
  const totalMinutes = Math.floor(ms / 60_000)
  const totalHours = Math.floor(totalMinutes / 60)
  const days = Math.floor(totalHours / 24)
  const hours = totalHours % 24
  if (days > 0) {
    return `${days}d ${hours}h`
  }
  const minutes = totalMinutes % 60
  return totalHours > 0 ? `${totalHours}h ${minutes}m` : `${totalMinutes}m`
}

export function HomeStatsCards(props: { stats: HomeStatsSummary; style?: StyleProp<ViewStyle> }) {
  const { stats } = props
  return (
    <View style={[styles.statsRow, props.style]}>
      <View style={styles.statCard}>
        <Text style={styles.statValue}>{stats.totalAgentsSpawned.toLocaleString()}</Text>
        <Text style={styles.statLabel}>Agents spawned</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statValue}>{formatDuration(stats.totalAgentTimeMs)}</Text>
        <Text style={styles.statLabel}>Agent time</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statValue}>{stats.totalPRsCreated.toLocaleString()}</Text>
        <Text style={styles.statLabel}>PRs created</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: spacing.lg },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(26,26,26,0.6)',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: spacing.md
  },
  statValue: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3
  },
  statLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '500', marginTop: 2 }
})
