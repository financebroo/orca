import { useEffect } from 'react'
import type { BridgeFoldDivision } from './bridge/bridge-fold-division'

// The shell reads the hinge natively, then hands it to the page with the hook below.
export { useFoldDivision } from '../layout/use-fold-division'

/** Hands a moved hinge to the page on the same lane; null when the device lies flat. */
export function usePublishedFoldDivision(
  publish: (division: BridgeFoldDivision | null) => void,
  division: BridgeFoldDivision | null
): void {
  useEffect(() => {
    publish(division)
  }, [publish, division])
}
