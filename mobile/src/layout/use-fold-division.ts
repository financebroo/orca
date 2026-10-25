import type { FoldDivision } from './fold-division'

/** No platform but iOS reports a hinge division yet. */
export function useFoldDivision(): FoldDivision | null {
  return null
}
