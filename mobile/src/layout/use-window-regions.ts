import type { FoldDivision } from './fold-division'
import type { CoverCorner, WindowRect } from './window-regions'

const NO_OCCLUSIONS: readonly WindowRect[] = []

/** No platform but iOS reports a hinge division yet. */
export function useFoldDivision(): FoldDivision | null {
  return null
}

/** No platform but iOS reports an occluded status column yet. */
export function useSideRailTop(): number | null {
  return null
}

/** No platform but iOS reports occluded regions yet. */
export function useOcclusions(): readonly WindowRect[] {
  return NO_OCCLUSIONS
}

/** Only the page reads a corner block the shell measured; natively it is measured directly. */
export function useReportedCoverCorner(): CoverCorner | null {
  return null
}
