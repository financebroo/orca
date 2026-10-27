import { Pressable, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Plus } from 'lucide-react-native'
import { colors, spacing } from '../theme/mobile-theme'
import { useStatusColumn } from '../layout/side-safe-area'

// Export diameter so worktree list reserves matching padding and last row stays tappable.
export const FAB_SIZE = 48
// Folded Duo: the size of a native iOS bottom-bar button, centered under the status column at the bottom edge.
const FOLDED_FAB_SIZE = 44

type NewWorkspaceFabProps = {
  onPress: () => void
  disabled?: boolean
}

// Phone-only FAB sits above home indicator and outside list-row hit area.
export function NewWorkspaceFab({ onPress, disabled }: NewWorkspaceFabProps): React.JSX.Element {
  const insets = useSafeAreaInsets()
  const statusColumn = useStatusColumn()
  const folded =
    statusColumn === null
      ? null
      : {
          width: FOLDED_FAB_SIZE,
          height: FOLDED_FAB_SIZE,
          borderRadius: FOLDED_FAB_SIZE / 2,
          right: Math.max(spacing.sm, statusColumn.centerFromRight - FOLDED_FAB_SIZE / 2),
          bottom: Math.max(spacing.sm, insets.bottom - spacing.sm)
        }
  return (
    <Pressable
      style={({ pressed }) => [
        styles.fab,
        folded ?? { bottom: spacing.xl + insets.bottom },
        pressed && styles.fabPressed,
        disabled && styles.fabDisabled
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel="New workspace"
      hitSlop={8}
    >
      <Plus size={folded ? 22 : 24} color={colors.bgBase} strokeWidth={folded ? 2.5 : 2.75} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: spacing.lg,
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    // High-contrast monochrome primary action; tight shadow avoids disabled-looking halo (STYLEGUIDE reserves color for state).
    backgroundColor: colors.surfaceBright,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4
  },
  fabPressed: {
    backgroundColor: colors.textPrimary
  },
  fabDisabled: {
    opacity: 0.5
  }
})
