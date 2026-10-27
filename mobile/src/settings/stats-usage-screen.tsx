import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ChevronLeft } from 'lucide-react-native'
import type { RpcClient } from '../transport/rpc-client'
import { StatsUsagePanel } from '../stats/StatsUsagePanel'
import { colors, spacing } from '../theme/mobile-theme'
import { useStatusColumnPadding } from '../layout/side-safe-area'
import { useCoverHeaderRowStyle, useCoverStripScreen } from '../layout/cover-strip-screen'

export default function StatsUsageScreen(props: { client: RpcClient | null; onBack: () => void }) {
  const insets = useSafeAreaInsets()
  const statusColumnPadding = useStatusColumnPadding()
  const { topCorner } = useCoverStripScreen()
  const coverHeaderRowStyle = useCoverHeaderRowStyle()
  return (
    <View style={[styles.container, { paddingTop: topCorner ? 0 : insets.top + spacing.sm }]}>
      <View
        style={[
          styles.topRow,
          statusColumnPadding > 0 && { paddingRight: statusColumnPadding },
          coverHeaderRowStyle
        ]}
      >
        <Pressable
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={props.onBack}
        >
          <ChevronLeft size={22} color={colors.textSecondary} />
        </Pressable>
        <Text style={styles.heading}>Stats & Usage</Text>
      </View>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: spacing.xl + insets.bottom }]}
      >
        <StatsUsagePanel client={props.client} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgBase },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm
  },
  heading: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  content: { paddingHorizontal: spacing.lg }
})
