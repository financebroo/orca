import { useEffect } from 'react'
import { useCoverCorner } from '../layout/side-safe-area'
import { useFoldDivision, useSideRailTop } from '../layout/use-window-regions'
import type { BridgeCoverCorner } from './bridge/bridge-cover-corner'
import type { BridgeFoldDivision } from './bridge/bridge-fold-division'

export type ShellWindowRegions = {
  readonly foldDivision: BridgeFoldDivision | null
  readonly sideRailTop: number | null
  readonly coverCorner: BridgeCoverCorner | null
}

/** The hinge, status column and corner block the shell reads natively; the page cannot see them. */
export function useShellWindowRegions(): ShellWindowRegions {
  return {
    foldDivision: useFoldDivision(),
    sideRailTop: useSideRailTop(),
    coverCorner: useCoverCorner()
  }
}

/** Hands moved regions to the page on the same lane as the insets. */
export function usePublishedWindowRegions(
  bridge: {
    publishFoldDivision: (division: BridgeFoldDivision | null) => void
    publishSideRailTop: (top: number | null) => void
    publishCoverCorner: (corner: BridgeCoverCorner | null) => void
  },
  { foldDivision, sideRailTop, coverCorner }: ShellWindowRegions
): void {
  const { publishFoldDivision, publishSideRailTop, publishCoverCorner } = bridge
  useEffect(() => {
    publishFoldDivision(foldDivision)
  }, [publishFoldDivision, foldDivision])
  useEffect(() => {
    publishSideRailTop(sideRailTop)
  }, [publishSideRailTop, sideRailTop])
  useEffect(() => {
    publishCoverCorner(coverCorner)
  }, [publishCoverCorner, coverCorner])
}
