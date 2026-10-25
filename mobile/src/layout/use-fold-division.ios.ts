import { useEffect, useState } from 'react'
import { requireOptionalNativeModule, type EventSubscription } from 'expo-modules-core'
import type { FoldDivision } from './fold-division'

type FoldDivisionModule = {
  addListener: (
    event: 'onChange',
    listener: (payload: { division: FoldDivision | null }) => void
  ) => EventSubscription
}

// Optional: a build without the module (or an SDK older than iOS 27.1) reports flat.
const nativeFoldDivision = requireOptionalNativeModule<FoldDivisionModule>('OrcaFoldDivision')

export function useFoldDivision(): FoldDivision | null {
  const [division, setDivision] = useState<FoldDivision | null>(null)
  useEffect(() => {
    const subscription = nativeFoldDivision?.addListener('onChange', (payload) => {
      setDivision(payload.division ?? null)
    })
    return () => subscription?.remove()
  }, [])
  return division
}
