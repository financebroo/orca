/** A rect in window points. */
export type WindowRect = { x: number; y: number; width: number; height: number }

/**
 * Where the side rail can start: below every occluded rect that reaches the window's right edge
 * (the Duo's status column and Dynamic Island). Null when nothing there is occluded.
 */
export function sideRailTopFromOcclusions(
  occlusions: readonly WindowRect[],
  windowWidth: number
): number | null {
  let top: number | null = null
  for (const rect of occlusions) {
    if (rect.x + rect.width >= windowWidth - 1 && rect.x > windowWidth / 2) {
      top = Math.max(top ?? 0, rect.y + rect.height)
    }
  }
  return top
}

/** The folded Duo's status block when the outer display lies on its side: one corner, one side. */
export type CoverCorner = {
  side: 'left' | 'right'
  /** True when the block sits in a top corner, false for a bottom one. */
  top: boolean
  width: number
  height: number
}

// A one-sided inset this wide is the status column, not a plain phone's landscape notch.
export const COVER_COLUMN_MIN_INSET = 60

// Measured on an iPhone Duo folded on its side, 2026-10-27: the 37pt camera circle sits at (29.3, 29.3)
// in the top-left 84x82 block and at (611.7, 399.7) in the bottom-right one, so its center is 47.8pt from
// the window edge either way, 6.8pt off the block's middle.
export const COVER_CAMERA_CENTER_FROM_EDGE = 47.8
export const COVER_CAMERA_RADIUS = 18.5

/** Top padding that centers a header row on the camera while the row stays as tall as the block. */
export function coverHeaderRowPaddingTop(corner: Pick<CoverCorner, 'height'>): number {
  return Math.max(0, 2 * COVER_CAMERA_CENTER_FROM_EDGE - corner.height)
}

/**
 * iPhone Duo (2026-10-27): folded and on its side (678x466), iOS reports the status column as a
 * full-height 84pt side inset, yet only one 84x82pt corner block is occluded: bottom-right with the
 * inset on the right, top-left with it on the left. Null when the inset is not that column.
 */
export function coverCornerFromOcclusions(
  insets: { left: number; right: number },
  windowWidth: number,
  occlusions: readonly WindowRect[]
): CoverCorner | null {
  const side =
    insets.left >= COVER_COLUMN_MIN_INSET && insets.right < 1
      ? 'left'
      : insets.right >= COVER_COLUMN_MIN_INSET && insets.left < 1
        ? 'right'
        : null
  if (side === null) {
    return null
  }
  let block: WindowRect | null = null
  for (const rect of occlusions) {
    const touchesSide = side === 'left' ? rect.x <= 1 : rect.x + rect.width >= windowWidth - 1
    if (touchesSide && (block === null || rect.width * rect.height > block.width * block.height)) {
      block = rect
    }
  }
  return block === null
    ? null
    : { side, top: block.y < 1, width: block.width, height: block.height }
}
