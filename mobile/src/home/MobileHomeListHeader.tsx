import { StyleSheet, Text, View } from 'react-native'
import type { HomeStatsSummary } from '../stats/home-stats-total'
import { HomeStatsCards } from '../stats/HomeStatsCards'
import { colors, spacing } from '../theme/mobile-theme'
import { MobileHomeAppUpdateCard } from './MobileHomeAppUpdateCard'

/** `stats` null hides the counters; the wide two-column home moves them to its left column. */
export function MobileHomeListHeader({ stats }: { stats: HomeStatsSummary | null }) {
  return (
    <View>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Welcome back</Text>
      </View>
      {stats ? <HomeStatsCards stats={stats} /> : null}
      <MobileHomeAppUpdateCard />
      <Text style={styles.sectionHeading}>Desktops</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  hero: { paddingTop: spacing.xs, paddingBottom: spacing.md },
  heroTitle: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs
  }
})
