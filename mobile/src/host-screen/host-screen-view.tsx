import { Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { hostScreenStyles as styles } from './host-screen-styles'
import { HostScreenHeader } from './host-screen-header'
import { HostScreenOverlays } from './host-screen-overlays'
import { HostWorkspaceList } from './host-workspace-list'
import type { HostScreenController } from './use-host-screen-controller'
import { usePublishHostScreenSideRail } from './host-screen-side-rail'
import { useCoverCorner, useStatusColumn } from '../layout/side-safe-area'

export function HostScreenView({ controller }: { controller: HostScreenController }) {
  usePublishHostScreenSideRail(controller)
  // Folded on its side with the block in a top corner: the header lines up with the camera instead.
  const coverCorner = useCoverCorner()
  // Folded upright the camera is in the status column's top; the header lines up with it the same way.
  const coverPortrait = useStatusColumn()?.cover === true
  const topCorner = !controller.embedded && (coverCorner?.top === true || coverPortrait)
  if (controller.state.error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{controller.state.error}</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.topChromeSafeArea} edges={topCorner ? [] : ['top']}>
        <HostScreenHeader controller={controller} />
      </SafeAreaView>
      <HostWorkspaceList controller={controller} />
      <HostScreenOverlays controller={controller} />
    </View>
  )
}
