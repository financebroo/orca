import { View, Text, Pressable, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ChevronLeft, PanelLeftOpen } from 'lucide-react-native'
import { MobileSessionHeaderIconButton } from './MobileSessionHeaderIconButton'
import { MobileSessionPanelActions } from './MobileSessionPanelActions'
import { MobileSessionTabStrip } from './MobileSessionTabStrip'
import { MobileSessionViewControls } from './MobileSessionViewControls'
import { StatusDot } from '../components/StatusDot'
import { styles } from './mobile-session-styles'
import { spacing } from '../theme/mobile-theme'
import { useHostSidebarReveal } from '../layout/host-sidebar-reveal'
import { useResponsiveLayout } from '../layout/responsive-layout'
import {
  PORTRAIT_CLOCK_CENTER_Y,
  PORTRAIT_NAME_CENTER_Y,
  PORTRAIT_SESSION_BAR_HEIGHT
} from '../layout/portrait-header-line'
import { useCoverCorner, useStatusColumn } from '../layout/side-safe-area'
import {
  COVER_CAMERA_CENTER_FROM_EDGE,
  COVER_CAMERA_RADIUS,
  coverHeaderRowPaddingTop
} from '../layout/window-regions'
import type { MobileSessionController } from './use-mobile-session-controller'

export function MobileSessionHeader({ controller }: { controller: MobileSessionController }) {
  const {
    hostId,
    isFolderWorkspaceRoute,
    isFloatingWorkspaceRoute,
    presentedConnState,
    forceReconnectHost,
    worktreeName,
    activePanel,
    setShowHeaderMoreActions,
    requestLeaveSession,
    visibleTabs,
    showConnectionRetry,
    terminalSummary,
    handlePanelTap,
    showHeaderMoreButton
  } = controller
  const revealSidebar = useHostSidebarReveal()
  // Folded, the status column (Dynamic Island, clock) runs down beside the header and tab rows.
  const { sessionSideRail, statusColumnWidth } = controller
  // Why: a sideways phone is ~390pt tall, so the tabs share the top bar instead of taking a second row.
  const hasTabs = visibleTabs.length > 0
  const { isLandscapePhone, isWideLayout } = useResponsiveLayout()
  const tabsInTopBar = isLandscapePhone && hasTabs
  // iPhone Duo (2026-10-27): unfolded portrait, the header runs up beside the top-right status block,
  // so its six icons stack in two rows of three (view controls over panel actions) left of it.
  const statusBlock = useStatusColumn()
  const iconsStacked = isWideLayout && statusBlock !== null && sessionSideRail !== 'fullWidth'
  // Folded on its side only a top-corner block needs room: the row steps around it, as tall as the
  // block and centered on the camera; a bottom-corner block leaves the row the full width.
  const coverCorner = useCoverCorner()
  const topCorner = coverCorner?.top ? coverCorner : null
  const tabStrip = hasTabs ? (
    <MobileSessionTabStrip
      controller={controller}
      inTopBar={tabsInTopBar}
      centered={tabsInTopBar && topCorner !== null}
    />
  ) : null
  return (
    <SafeAreaView
      style={[
        styles.sessionChrome,
        sessionSideRail === 'fullWidth' &&
          coverCorner === null && { paddingRight: statusColumnWidth },
        // 2026-10-27 on device: the full 84pt block left the back button too far from the camera. The
        // button's 36pt visual now starts at the camera's edge, past the bar's 8pt padding and its 4pt
        // touch margin, so the chevron sits 8pt from the camera.
        topCorner?.side === 'left' && {
          paddingLeft: COVER_CAMERA_CENTER_FROM_EDGE + COVER_CAMERA_RADIUS - spacing.sm - spacing.xs
        },
        topCorner?.side === 'right' && { paddingRight: topCorner.width }
      ]}
      edges={topCorner ? [] : ['top']}
    >
      <View
        style={[
          styles.sessionTopBar,
          isWideLayout && styles.sessionTopBarWide,
          topCorner && {
            minHeight: topCorner.height,
            paddingTop: coverHeaderRowPaddingTop(topCorner),
            paddingBottom: 0
          },
          // iPhone Duo (2026-10-27), by preference: the tab row rises under the icon rows and runs to
          // the right edge, under the status icons.
          iconsStacked && {
            paddingRight: statusBlock.width,
            height: PORTRAIT_SESSION_BAR_HEIGHT,
            alignItems: 'flex-start'
          }
        ]}
      >
        <View style={[styles.sessionIconRow, iconsStacked && portraitLine.button]}>
          {revealSidebar ? (
            <MobileSessionHeaderIconButton
              accessibilityLabel="Show sidebar"
              icon={PanelLeftOpen}
              onPress={revealSidebar}
            />
          ) : null}
          <MobileSessionHeaderIconButton
            accessibilityLabel="Back to worktrees"
            icon={ChevronLeft}
            onPress={requestLeaveSession}
          />
        </View>

        <View
          style={[
            styles.sessionTitleBlock,
            tabsInTopBar && styles.sessionTitleBlockBesideTabs,
            iconsStacked && portraitLine.title
          ]}
        >
          <Text style={styles.sessionTitle} numberOfLines={1}>
            {worktreeName || 'Terminal'}
          </Text>
          <Pressable
            style={styles.sessionMetaRow}
            disabled={!showConnectionRetry}
            onPress={() => {
              if (hostId && forceReconnectHost) {
                void forceReconnectHost(hostId)
              }
            }}
            accessibilityRole={showConnectionRetry ? 'button' : undefined}
            accessibilityLabel={showConnectionRetry ? 'Reconnect to desktop' : undefined}
          >
            <StatusDot state={presentedConnState} />
            <Text style={styles.sessionMetaText} numberOfLines={1}>
              {terminalSummary}
            </Text>
          </Pressable>
        </View>
        {tabsInTopBar ? tabStrip : null}
        {(() => {
          // The side rail hosts these when the window has one (MobileSessionSideRail).
          const panelActions =
            sessionSideRail === 'actions' ? null : (
              <MobileSessionPanelActions
                isFolderWorkspaceRoute={isFolderWorkspaceRoute}
                isFloatingWorkspaceRoute={isFloatingWorkspaceRoute}
                activePanel={activePanel}
                showHeaderMoreButton={showHeaderMoreButton}
                handlePanelTap={handlePanelTap}
                setShowHeaderMoreActions={setShowHeaderMoreActions}
              />
            )
          if (iconsStacked) {
            return (
              <View style={[styles.sessionIconRows, portraitLine.iconRows]}>
                <View style={[styles.sessionIconRow, portraitLine.iconRow]}>
                  <MobileSessionViewControls controller={controller} stacked />
                </View>
                <View style={[styles.sessionIconRow, portraitLine.iconRow]}>{panelActions}</View>
              </View>
            )
          }
          return (
            <>
              {panelActions}
              {/* Unfolded only: the folded header has no room beside the status column. */}
              {isWideLayout ? <MobileSessionViewControls controller={controller} /> : null}
            </>
          )
        })()}
      </View>

      {tabsInTopBar ? null : tabStrip}
    </SafeAreaView>
  )
}

// Offsets from the top bar's 4pt top padding: the icon rows put the lower one on the clock, and the
// back button and the title block (title over tab count) are centered between the rows. The rows are
// 30pt apart, under the buttons' 36pt, so the lower row reaches the clock without the top one leaving
// the screen.
const BAR_PADDING_TOP = 4
const ICON_ROW_HEIGHT = 30
// Title line, 2pt gap, tab count line.
const TITLE_BLOCK_HEIGHT = 35
const portraitLine = StyleSheet.create({
  button: { marginTop: PORTRAIT_NAME_CENTER_Y - 18 - BAR_PADDING_TOP },
  title: { marginTop: PORTRAIT_NAME_CENTER_Y - TITLE_BLOCK_HEIGHT / 2 - BAR_PADDING_TOP },
  iconRows: {
    marginTop: PORTRAIT_CLOCK_CENTER_Y - ICON_ROW_HEIGHT * 1.5 - BAR_PADDING_TOP
  },
  iconRow: { height: ICON_ROW_HEIGHT }
})
