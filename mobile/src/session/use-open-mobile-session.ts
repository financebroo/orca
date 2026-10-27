import { useCallback } from 'react'
import { useRouter } from 'expo-router'
import { Platform } from 'react-native'
import { useResponsiveLayout } from '../layout/responsive-layout'
import { useOpenHostStackRoute } from '../navigation/use-open-host-stack-route'
import { mobileSessionRouteTarget, type MobileSessionRouteParams } from './mobile-session-route'

// iPhone Duo (2026-10-27): natively on the wide layout, the session route puts the page beside a native
// sidebar in a ~400pt pane, so it laid out as a phone (Home > Resume showed the old UI). The
// host route's page owns the whole area there and draws its own sidebar; it opens the session itself.
export const OPEN_SESSION_PARAM = 'openSession'

export function useOpenMobileSession(): (params: MobileSessionRouteParams) => void {
  const openHostStackRoute = useOpenHostStackRoute()
  const router = useRouter()
  const { isWideLayout } = useResponsiveLayout()
  const viaHostArea = isWideLayout && Platform.OS !== 'web'

  return useCallback(
    (params) => {
      if (viaHostArea && !params.paneKey && !params.executionHost) {
        // A plain push: the host-stack REPLACE dropped these params (traced on device: the host
        // route rendered with no openSession), so the page never opened the session.
        router.push({
          pathname: '/h/[hostId]',
          params: {
            hostId: params.hostId,
            [OPEN_SESSION_PARAM]: params.worktreeId,
            ...(params.name ? { name: params.name } : {})
          }
        })
        return
      }
      openHostStackRoute(params.hostId, mobileSessionRouteTarget(params))
    },
    [openHostStackRoute, router, viaHostArea]
  )
}
