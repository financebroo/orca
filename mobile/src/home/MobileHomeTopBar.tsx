import { RefreshCw, Settings } from 'lucide-react-native'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { OrcaLogo } from '../components/OrcaLogo'
import { colors, spacing } from '../theme/mobile-theme'
import { useStatusColumn, useStatusColumnPadding } from '../layout/side-safe-area'
import { PORTRAIT_CLOCK_CENTER_Y } from '../layout/portrait-header-line'

const ICON_BUTTON_SIZE = 36

/**
 * No `onOpenSettings` hides the gear: unfolded landscape moves it into the side rail. `onRefresh`
 * adds the Stats & Usage refresh beside it (unfolded portrait, which has no rail).
 */
export function MobileHomeTopBar({
  onOpenSettings,
  onRefresh
}: {
  onOpenSettings?: () => void
  onRefresh?: () => void
}) {
  const statusColumn = useStatusColumn()
  const statusColumnPadding = useStatusColumnPadding()
  // Unfolded portrait (the corner status block): the row sits on the clock's line, like the host header.
  const onClockLine = statusColumn !== null && !statusColumn.cover
  return (
    <View
      style={[
        styles.topBar,
        statusColumnPadding > 0 && { paddingRight: statusColumnPadding },
        onClockLine && { paddingTop: PORTRAIT_CLOCK_CENTER_Y - ICON_BUTTON_SIZE / 2 }
      ]}
    >
      <View style={styles.brandLockup}>
        <View style={styles.logoMark}>
          <OrcaLogo size={18} />
        </View>
        <Text style={styles.brandName}>Orca</Text>
      </View>
      <View style={styles.actions}>
        {onRefresh ? (
          <Pressable
            style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
            onPress={onRefresh}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Refresh usage"
          >
            <RefreshCw size={18} color={colors.textSecondary} />
          </Pressable>
        ) : null}
        {onOpenSettings ? (
          <Pressable
            style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
            onPress={onOpenSettings}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Settings"
          >
            <Settings size={18} color={colors.textSecondary} />
          </Pressable>
        ) : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md
  },
  brandLockup: { flexDirection: 'row', alignItems: 'center', minWidth: 0 },
  logoMark: { marginRight: spacing.sm },
  brandName: { color: colors.textPrimary, fontSize: 17, fontWeight: '700' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  iconButton: {
    width: ICON_BUTTON_SIZE,
    height: ICON_BUTTON_SIZE,
    borderRadius: ICON_BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconButtonPressed: { backgroundColor: colors.bgRaised }
})
