import { Pressable, StyleSheet, View } from 'react-native'
import { RefreshCw, Settings } from 'lucide-react-native'
import { colors, radii, spacing } from '../theme/mobile-theme'

// Unfolded landscape: Settings and Refresh sit in the right rail under the status items, the same
// 44pt buttons the host list puts there. Rendered at the app root, so it takes props only.
export function MobileHomeSideRail(props: { onOpenSettings: () => void; onRefresh: () => void }) {
  return (
    <View style={styles.rail}>
      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        onPress={props.onOpenSettings}
        accessibilityRole="button"
        accessibilityLabel="Settings"
      >
        <Settings size={18} color={colors.textSecondary} />
      </Pressable>
      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        onPress={props.onRefresh}
        accessibilityRole="button"
        accessibilityLabel="Refresh usage"
      >
        <RefreshCw size={18} color={colors.textSecondary} />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  rail: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  button: {
    width: 44,
    height: 44,
    borderRadius: radii.button,
    alignItems: 'center',
    justifyContent: 'center'
  },
  pressed: { opacity: 0.7 }
})
