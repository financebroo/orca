import { describe, expect, it } from 'vitest'
import {
  coverCornerFromOcclusions,
  coverHeaderRowPaddingTop,
  sideRailTopFromOcclusions
} from './window-regions'

describe('sideRailTopFromOcclusions', () => {
  it('starts the rail below the status column and island at the right edge', () => {
    const statusColumn = { x: 867, y: 0, width: 84, height: 208 }
    const island = { x: 880, y: 12, width: 58, height: 120 }
    expect(sideRailTopFromOcclusions([statusColumn, island], 951)).toBe(208)
  })

  it('ignores occlusions away from the right edge', () => {
    expect(sideRailTopFromOcclusions([{ x: 0, y: 0, width: 84, height: 300 }], 951)).toBeNull()
    expect(sideRailTopFromOcclusions([], 951)).toBeNull()
  })
})

describe('coverHeaderRowPaddingTop', () => {
  it('centers a row in the 82pt block on the camera, 47.8pt from the edge', () => {
    const paddingTop = coverHeaderRowPaddingTop({ height: 82 })
    expect(paddingTop + (82 - paddingTop) / 2).toBeCloseTo(47.8)
  })
})

describe('coverCornerFromOcclusions', () => {
  // Measured on an iPhone Duo folded on its side, 2026-10-27 (678x466 window).
  const camera = (x: number, y: number) => ({ x, y, width: 37, height: 37 })

  it('finds the bottom-right block when the column inset is on the right', () => {
    expect(
      coverCornerFromOcclusions({ left: 0, right: 84 }, 678, [
        camera(611.7, 399.7),
        { x: 594, y: 384, width: 84, height: 82 }
      ])
    ).toEqual({ side: 'right', top: false, width: 84, height: 82 })
  })

  it('finds the top-left block when the column inset is on the left', () => {
    expect(
      coverCornerFromOcclusions({ left: 84, right: 0 }, 678, [
        camera(29.3, 29.3),
        { x: 0, y: 0, width: 84, height: 82 }
      ])
    ).toEqual({ side: 'left', top: true, width: 84, height: 82 })
  })

  it('is null for a plain landscape phone with a notch inset on both sides', () => {
    expect(
      coverCornerFromOcclusions({ left: 59, right: 59 }, 852, [
        { x: 0, y: 0, width: 59, height: 393 }
      ])
    ).toBeNull()
  })

  it('is null when nothing occluded touches the inset side', () => {
    expect(coverCornerFromOcclusions({ left: 0, right: 84 }, 678, [])).toBeNull()
  })
})
