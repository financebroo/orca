import { StyleSheet, Text, View } from 'react-native'
import type { HomeStatsSummary } from '../stats/home-stats-total'
import { HomeStatsCards } from '../stats/HomeStatsCards'
import { colors, spacing } from '../theme/mobile-theme'
import { MobileHomeAppUpdateCard } from './MobileHomeAppUpdateCard'
import { useStatusColumnPadding } from '../layout/side-safe-area'

/** `stats` null hides the counters; the unfolded split moves them to its left column. */
export function MobileHomeListHeader({ stats }: { stats: HomeStatsSummary | null }) {
  // Folded Duo: the hero and stats sit beside the status column; everything below runs full width.
  const statusColumnPadding = useStatusColumnPadding()
  const besideStatusColumn = statusColumnPadding > 0 && { paddingRight: statusColumnPadding }
  return (
    <View>
      <View style={[styles.hero, besideStatusColumn]}>
        <Text style={styles.heroTitle}>Welcome back</Text>
      </View>
      {stats ? <HomeStatsCards stats={stats} style={besideStatusColumn} /> : null}
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
