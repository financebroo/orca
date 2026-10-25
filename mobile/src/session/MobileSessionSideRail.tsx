import { StyleSheet, View } from 'react-native'
import { colors, spacing } from '../theme/mobile-theme'
import { SIDE_RAIL_DRAWN_BY_SCREEN, useSideRailContent } from '../layout/side-rail'
import { MobileSessionPanelActions } from './MobileSessionPanelActions'
import { MobileSessionTerminalInputActions } from './MobileSessionTerminalInputActions'
import type { MobileSessionController } from './use-mobile-session-controller'

function MobileSessionSideRail({ controller }: { controller: MobileSessionController }) {
  const {
    isFolderWorkspaceRoute,
    isFloatingWorkspaceRoute,
    activePanel,
    showHeaderMoreButton,
    handlePanelTap,
    setShowHeaderMoreActions,
    activeMarkdownTab,
    activeFileTab,
    activeBrowserTab,
    showNativeChat
  } = controller
  // Same condition as MobileSessionCommandDock: input actions only while its input bar shows.
  const showInputActions =
    !activeMarkdownTab && !activeFileTab && !activeBrowserTab && !showNativeChat
  return (
    <View style={styles.rail}>
      <MobileSessionPanelActions
        isFolderWorkspaceRoute={isFolderWorkspaceRoute}
        isFloatingWorkspaceRoute={isFloatingWorkspaceRoute}
        activePanel={activePanel}
        showHeaderMoreButton={showHeaderMoreButton}
        handlePanelTap={handlePanelTap}
        setShowHeaderMoreActions={setShowHeaderMoreActions}
      />
      {showInputActions ? (
        <>
          <View style={styles.divider} />
          <MobileSessionTerminalInputActions controller={controller} inRail />
        </>
      ) : null}
    </View>
  )
}

/** Unfolded, moves the session's header and input actions into the side rail; folded, takes the
 *  rail's column for full-width content (the header pads for the status column itself). */
export function usePublishMobileSessionSideRail(controller: MobileSessionController): void {
  const mode = controller.sessionSideRail
  useSideRailContent(
    mode === 'actions' ? (
      <MobileSessionSideRail controller={controller} />
    ) : mode === 'fullWidth' ? (
      SIDE_RAIL_DRAWN_BY_SCREEN
    ) : null
  )
}

const styles = StyleSheet.create({
  rail: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm
  },
  divider: {
    width: 24,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderSubtle
  }
})
