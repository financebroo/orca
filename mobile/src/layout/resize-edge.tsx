import { useState } from 'react'
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler'
import { colors } from '../theme/mobile-theme'

type Props = {
  /** Positions the grab strip over the pane's border (absolute top/bottom/side/width). */
  style: StyleProp<ViewStyle>
  /** Which side of the strip the pane's border is on, where the highlight line draws. */
  border: 'left' | 'right'
  onStart: () => void
  /** Horizontal travel since the drag started, in points. */
  onDrag: (translationX: number) => void
  onEnd: () => void
}

/**
 * iPhone Duo (2026-10-27): pane resize edge shared by the host sidebar and the session dock. A native
 * pan, not a PanResponder, so UIKit recognizers such as the iOS 26 content swipe-back cannot take the
 * touch mid-drag; the border lights up while dragging.
 */
export function ResizeEdge({ style, border, onStart, onDrag, onEnd }: Props) {
  const [dragging, setDragging] = useState(false)
  const pan = Gesture.Pan()
    .runOnJS(true)
    .activeOffsetX([-2, 2])
    .shouldCancelWhenOutside(false)
    .onStart(() => {
      setDragging(true)
      onStart()
    })
    .onUpdate((event) => onDrag(event.translationX))
    .onFinalize(() => {
      setDragging(false)
      onEnd()
    })
  return (
    <GestureHandlerRootView style={style}>
      <GestureDetector gesture={pan}>
        <View style={styles.hit}>
          {dragging ? (
            <View style={[styles.line, border === 'right' ? styles.lineRight : styles.lineLeft]} />
          ) : null}
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  hit: { flex: 1 },
  // 3pt over the pane's 1pt border.
  line: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: colors.accentBlue
  },
  lineRight: { right: -1 },
  lineLeft: { left: -1 }
})
