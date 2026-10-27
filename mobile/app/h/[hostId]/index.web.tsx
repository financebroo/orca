import { useEffect, useRef } from 'react'
import { useLocalSearchParams } from 'expo-router'
import { WorkspaceDetailPlaceholder } from '../../../src/components/WorkspaceDetailPlaceholder'
import { HostScreen } from '../../../src/host-screen/HostScreen'
import { usePageOwnsHostArea } from '../../../src/mobile-web-shell/page-owns-host-area'
import { firstParam } from '../../../src/navigation/route-param-reader'
import { useRouteHandoff } from '../../../src/navigation/route-handoff'

// Render screen directly: native sibling imports a shell module that throws in browsers, and manifest imports every route.
export default function HostWorktreeRoute() {
  const ownsHostArea = usePageOwnsHostArea()
  const params = useLocalSearchParams<{
    hostId?: string | string[]
    openSession?: string | string[]
    name?: string | string[]
  }>()
  const hostId = firstParam(params.hostId)
  const openSession = firstParam(params.openSession)
  const name = firstParam(params.name)
  const router = useRouteHandoff()
  // iPhone Duo (2026-10-27): the native app hands a session over to open beside this page's sidebar,
  // once per document, so going back to the host does not reopen it. Same push as a sidebar tap
  // (use-host-worktree-actions): the handoff router keeps it in the page; useOpenMobileSession went
  // native and landed on the narrow session route again. Deferred a frame so the navigator is mounted.
  const openedRef = useRef(false)
  useEffect(() => {
    if (!ownsHostArea || openedRef.current || hostId === '' || openSession === '') {
      return
    }
    const label = name === '' ? '' : `?name=${encodeURIComponent(name)}`
    // Marked inside the frame: a rerender before it fires cancels it and schedules a new one.
    const frame = requestAnimationFrame(() => {
      openedRef.current = true
      router.push(
        `/h/${encodeURIComponent(hostId)}/session/${encodeURIComponent(openSession)}${label}`
      )
    })
    return () => cancelAnimationFrame(frame)
  }, [hostId, name, openSession, ownsHostArea, router])
  // The placeholder only beside the page's own sidebar: without the host area this is the list.
  return ownsHostArea ? <WorkspaceDetailPlaceholder /> : <HostScreen />
}
