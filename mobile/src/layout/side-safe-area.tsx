import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { Platform, StyleSheet, View } from 'react-native'
import {
  SafeAreaFrameContext,
  SafeAreaInsetsContext,
  SafeAreaProvider,
  useSafeAreaFrame,
  useSafeAreaInsets,
  type EdgeInsets
} from 'react-native-safe-area-context'
import {
  resolveSideRailWidth,
  SideRailAvailableContext,
  SideRailHost,
  useSideRailDrawnByScreen
} from './side-rail'
import { hostOs } from '../platform/host-os'
import { useSideRailTop } from './use-window-regions'

const WindowSafeAreaInsetsContext = createContext<EdgeInsets | null>(null)

/** The Duo cover screen's status column: `width` from the right edge, from the top down to `bottom` (window points). */
export type StatusColumn = {
  readonly width: number
  readonly bottom: number
  /** Where the clock and Wi-Fi are centered, measured from the right edge. */
  readonly centerFromRight: number
  /** Folded cover screen (true) vs unfolded portrait's corner block (false). */
  readonly cover: boolean
}

// Measured on the Duo cover screen 2026-10-27: an 84pt inset, status items centered 48pt from the
// right edge, not 42; buttons centered on the inset sat 6pt off the clock.
const STATUS_ITEMS_CENTER_OFFSET = 6

const StatusColumnContext = createContext<StatusColumn | null>(null)

// Below this window width the Duo is folded: the PR's 600pt split cutoff, under the 669pt inner screen.
const COVER_SCREEN_MAX_WIDTH = 600

// iPhone Duo (2026-10-27): unfolded in portrait, iOS reports the status block (clock, Wi-Fi, battery
// in the top-right corner) as an ~82pt top inset across the whole width, which left a huge empty band
// over every screen. Measured that day: the items span 27-119pt from the right edge, so 128pt clears
// them with a margin. Content now starts at the top; only rows beside the block clear it.
const PORTRAIT_STATUS_BLOCK_WIDTH = 128
const PORTRAIT_STATUS_ITEMS_CENTER_FROM_RIGHT = 73
// A plain status bar is ~24pt; only the Duo's corner block reports this much.
const PORTRAIT_STATUS_BLOCK_MIN_INSET = 60

// Pad side cutouts/navigation bars once, then expose the padded frame and insets so descendants neither pad twice nor size past it.
export function SideSafeArea({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets()
  const frame = useSafeAreaFrame()
  // iOS only: on Android a one-sided inset is a navigation bar or cutout, not the Duo's status column.
  const railWidth = hostOs() === 'ios' ? resolveSideRailWidth(insets) : 0
  // iPhone Duo (2026-10-26): folded, the status column only occludes the top right, yet iOS reports it as a
  // full-height right inset, so every screen lost ~84pt of a 466pt width. Content now runs full width and
  // only the rows beside the column (headers) clear it via useStatusColumn().
  const sideRailTop = useSideRailTop()
  const portraitStatusBlock =
    hostOs() === 'ios' &&
    railWidth === 0 &&
    frame.width >= COVER_SCREEN_MAX_WIDTH &&
    frame.height > frame.width &&
    insets.top >= PORTRAIT_STATUS_BLOCK_MIN_INSET
  // A nested area (the page's session layout) sees the outer one's zeroed top and no right inset, so
  // it measures nothing; it keeps the column the outer area found (the portrait header stayed one row).
  const inheritedStatusColumn = useContext(StatusColumnContext)
  const measuredStatusColumn = useMemo<StatusColumn | null>(
    () =>
      railWidth > 0 && frame.width < COVER_SCREEN_MAX_WIDTH
        ? {
            width: railWidth,
            bottom: Math.max(insets.top, sideRailTop ?? 0),
            centerFromRight: railWidth / 2 + STATUS_ITEMS_CENTER_OFFSET,
            cover: true
          }
        : portraitStatusBlock
          ? {
              width: PORTRAIT_STATUS_BLOCK_WIDTH,
              bottom: Math.max(insets.top, sideRailTop ?? 0),
              centerFromRight: PORTRAIT_STATUS_ITEMS_CENTER_FROM_RIGHT,
              cover: false
            }
          : null,
    [railWidth, frame.width, insets.top, sideRailTop, portraitStatusBlock]
  )
  const statusColumn = measuredStatusColumn ?? inheritedStatusColumn
  const padRight = statusColumn !== null ? 0 : insets.right
  const areaInsets = useMemo(
    () => ({ ...insets, left: 0, right: 0, ...(portraitStatusBlock ? { top: 0 } : null) }),
    [insets, portraitStatusBlock]
  )
  const areaFrame = useMemo(
    () => ({
      ...frame,
      x: frame.x + insets.left,
      width: Math.max(0, frame.width - insets.left - padRight)
    }),
    [frame, insets.left, padRight]
  )
  // Subscribed for the boolean alone, so a screen republishing its rail does not re-render the app.
  const railDrawnByScreen = useSideRailDrawnByScreen()
  const showRailColumn = railWidth > 0 && statusColumn === null && !railDrawnByScreen
  // Below the status column when the platform measured it; otherwise from the top inset.
  const railTop = Math.max(insets.top, sideRailTop ?? 0)
  const area = (
    <WindowSafeAreaInsetsContext.Provider value={insets}>
      <SafeAreaFrameContext.Provider value={areaFrame}>
        <SafeAreaInsetsContext.Provider value={areaInsets}>
          <SideRailAvailableContext.Provider value={railWidth > 0}>
            <StatusColumnContext.Provider value={statusColumn}>
              {children}
            </StatusColumnContext.Provider>
          </SideRailAvailableContext.Provider>
        </SafeAreaInsetsContext.Provider>
      </SafeAreaFrameContext.Provider>
    </WindowSafeAreaInsetsContext.Provider>
  )
  // Native SafeAreaView measures its nearest native provider, so nest one inside the padding; web reads the adjusted context.
  // One tree shape whether or not the rail shows, so rotating never remounts the app.
  return (
    <View style={styles.row}>
      <View
        style={[
          styles.area,
          {
            paddingLeft: insets.left,
            paddingRight: railWidth > 0 ? 0 : padRight
          }
        ]}
      >
        {Platform.OS === 'web' ? area : <SafeAreaProvider>{area}</SafeAreaProvider>}
      </View>
      {showRailColumn ? (
        <View
          style={[
            styles.rail,
            {
              width: railWidth,
              paddingTop: railTop,
              paddingBottom: insets.bottom
            }
          ]}
        >
          <SideRailHost />
        </View>
      ) : null}
    </View>
  )
}

/** A subtree that never sits beside the status column (the unfolded portrait sidebar, on the left). */
export function ClearStatusColumn({ children }: { children: ReactNode }) {
  return <StatusColumnContext.Provider value={null}>{children}</StatusColumnContext.Provider>
}

/** Folded Duo, or unfolded portrait's corner block: what header rows must stay clear of; else null. */
export function useStatusColumn(): StatusColumn | null {
  return useContext(StatusColumnContext)
}

/** Right padding for a row that sits beside the status column (screen headers). */
export function useStatusColumnPadding(): number {
  return useContext(StatusColumnContext)?.width ?? 0
}

// Modals own a separate window outside SideSafeArea and need the original window insets.
export function useWindowSafeAreaInsets(): EdgeInsets {
  const insets = useSafeAreaInsets()
  return useContext(WindowSafeAreaInsetsContext) ?? insets
}

const styles = StyleSheet.create({
  row: { flex: 1, flexDirection: 'row' },
  area: { flex: 1 },
  // Bottom-aligned: the status items sit at the top of the column.
  rail: { justifyContent: 'flex-end', alignItems: 'center' }
})
