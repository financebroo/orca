import { useWindowDimensions } from 'react-native'
import { hostOs } from '../platform/host-os'
import { useWindowSafeAreaInsets } from './side-safe-area'

// iPhone Duo (2026-10-27): unfolded portrait. Measured on an iPhone Duo that day (screenshots 10.24.37,
// 10.57.52): the clock's center sits 47pt from the top of the screen, the top icon row's 17pt. The
// lower icon row is centered on the clock. Owner's call (screenshot 12.30.04): the host and worktree
// name blocks and both back buttons are centered between the two rows, so they read as one row.
export const PORTRAIT_CLOCK_CENTER_Y = 47
export const PORTRAIT_TOP_ROW_CENTER_Y = 17
export const PORTRAIT_NAME_CENTER_Y = (PORTRAIT_CLOCK_CENTER_Y + PORTRAIT_TOP_ROW_CENTER_Y) / 2

// The session header row above the tabs: two 30pt icon rows from 2pt below the top, plus 4pt.
export const PORTRAIT_SESSION_BAR_HEIGHT = 66

// The session ribbon's tab row (full width, under the status icons, by choice): 36pt tabs,
// its 1pt top border and the ribbon's 1pt bottom border.
const SESSION_TAB_ROW_HEIGHT = 38

/**
 * Unfolded portrait only: how tall the session ribbon (header row, then tabs beside the status
 * block) is, so the sidebar header beside it ends on the same line. Computed, not measured: the native
 * sidebar and the page's session header run in different JS runtimes and cannot share a layout.
 */
export function usePortraitSessionChromeHeight(): number | null {
  const insets = useWindowSafeAreaInsets()
  const { width, height } = useWindowDimensions()
  const portraitUnfolded = hostOs() === 'ios' && width >= 600 && height > width && insets.top >= 60
  return portraitUnfolded ? PORTRAIT_SESSION_BAR_HEIGHT + SESSION_TAB_ROW_HEIGHT : null
}
