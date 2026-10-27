import { useSyncExternalStore } from 'react'
import { usePageBridgeClientIfPresent } from '../transport/client-context.web'
import type { FoldDivision } from './fold-division'
import type { CoverCorner, WindowRect } from './window-regions'

const NO_OCCLUSIONS: readonly WindowRect[] = []

const noSubscription = (): (() => void) => () => undefined
const none = (): null => null

/** The page reads the hinge the shell measured; a shell too old to send one reads as flat. */
export function useFoldDivision(): FoldDivision | null {
  const client = usePageBridgeClientIfPresent()
  return useSyncExternalStore(
    client ? client.onWindowRegionsUpdate : noSubscription,
    client ? () => client.getShellSession()?.foldDivision ?? null : none
  )
}

/** Where the shell measured the side rail can start; null from a shell too old to send it. */
export function useSideRailTop(): number | null {
  const client = usePageBridgeClientIfPresent()
  return useSyncExternalStore(
    client ? client.onWindowRegionsUpdate : noSubscription,
    client ? () => client.getShellSession()?.sideRailTop ?? null : none
  )
}

/** The page has no occlusion feed; a page never sits under the folded Duo's corner block. */
export function useOcclusions(): readonly WindowRect[] {
  return NO_OCCLUSIONS
}

/** The folded Duo's corner block the shell measured; null from a shell too old to send it. */
export function useReportedCoverCorner(): CoverCorner | null {
  const client = usePageBridgeClientIfPresent()
  return useSyncExternalStore(
    client ? client.onWindowRegionsUpdate : noSubscription,
    client ? () => client.getShellSession()?.coverCorner ?? null : none
  )
}
