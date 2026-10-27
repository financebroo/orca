import { RefreshCw, Settings } from 'lucide-react-native'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { OrcaLogo } from '../components/OrcaLogo'
import { colors, spacing } from '../theme/mobile-theme'

/** `onRefresh` adds the Stats & Usage refresh beside the gear (wide two-column home). */
export function MobileHomeTopBar({
  onOpenSettings,
  onRefresh
}: {
  onOpenSettings: () => void
  onRefresh?: () => void
}) {
  return (
    <View style={styles.topBar}>
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
        <Pressable
          style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
          onPress={onOpenSettings}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Settings"
        >
          <Settings size={18} color={colors.textSecondary} />
        </Pressable>
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
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconButtonPressed: { backgroundColor: colors.bgRaised }
})
