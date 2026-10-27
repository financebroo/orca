import { useCallback, useState } from 'react'
import type { ViewStyle } from 'react-native'
import type { Edge } from 'react-native-safe-area-context'
import { useFocusEffect } from 'expo-router'
import { spacing } from '../theme/mobile-theme'
import { useCoverCorner } from './side-safe-area'
import { SIDE_RAIL_DRAWN_BY_SCREEN, useSideRailContent } from './side-rail'
import { coverHeaderRowPaddingTop, type CoverCorner } from './window-regions'

/**
 * Folded on its side: the focused screen runs full width under the status strip (as Home and the
 * workspace list do), and its header row is as tall as a top-corner block, beside it.
 * iPhone Duo (2026-10-27): every screen opened from the workspace list follows the list.
 */
export function useCoverStripScreen(): { topCorner: CoverCorner | null; safeEdges: Edge[] } {
  const coverCorner = useCoverCorner()
  const [focused, setFocused] = useState(true)
  // Why: a pushed screen stays mounted under the next one, which must get the strip back.
  useFocusEffect(
    useCallback(() => {
      setFocused(true)
      return () => setFocused(false)
    }, [])
  )
  useSideRailContent(coverCorner !== null && focused ? SIDE_RAIL_DRAWN_BY_SCREEN : null)
  const topCorner = coverCorner?.top ? coverCorner : null
  return { topCorner, safeEdges: topCorner ? [] : ['top'] }
}

/**
 * The header row's style beside a top-corner block (one row, as tall as the block); null otherwise.
 * `containerPadding` is the side padding the row already sits inside.
 */
export function useCoverHeaderRowStyle(containerPadding = 0): ViewStyle | null {
  const coverCorner = useCoverCorner()
  const topCorner = coverCorner?.top ? coverCorner : null
  return topCorner
    ? {
        // As tall as the block, so the camera sits inside the ribbon, with the row centered on the
        // camera (2026-10-27 on device: the block's middle left the row slightly above the camera).
        minHeight: topCorner.height,
        paddingTop: coverHeaderRowPaddingTop(topCorner),
        paddingBottom: 0,
        ...(topCorner.side === 'left'
          ? { paddingLeft: topCorner.width - containerPadding }
          : { paddingRight: topCorner.width + spacing.xs - containerPadding })
      }
    : null
}
