import { useSyncExternalStore } from 'react'
import { usePageBridgeClientIfPresent } from '../transport/client-context.web'
import type { FoldDivision } from './fold-division'

const noSubscription = (): (() => void) => () => undefined
const flat = (): null => null

/** The page reads the hinge the shell measured; a shell too old to send one reads as flat. */
export function useFoldDivision(): FoldDivision | null {
  const client = usePageBridgeClientIfPresent()
  return useSyncExternalStore(
    client ? client.onFoldDivisionUpdate : noSubscription,
    client ? () => client.getShellSession()?.foldDivision ?? null : flat
  )
}
