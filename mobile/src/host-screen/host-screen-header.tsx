import { Pressable, Text, View } from 'react-native'
import {
  workspaceOptionsAccessibilityLabel,
  WORKSPACE_OPTIONS_TITLE
} from '../worktree/workspace-options-copy'
import { WorkspaceOptionsCountBadge } from './workspace-options-count-badge'
import {
  ChevronLeft,
  List,
  PanelLeftClose,
  Plus,
  Search,
  Settings,
  SquareTerminal,
  UserCircle,
  X
} from 'lucide-react-native'
import { StatusDot } from '../components/StatusDot'
import { classifyConnection, type ConnectionVerdict } from '../transport/connection-health'
import { useCalmConnectionState } from '../transport/calm-connection-state'
import { colors, spacing } from '../theme/mobile-theme'
import {
  PORTRAIT_NAME_CENTER_Y,
  usePortraitSessionChromeHeight
} from '../layout/portrait-header-line'
import { useStatusColumnPadding } from '../layout/side-safe-area'
import { hostScreenStyles as styles } from './host-screen-styles'
import type { HostScreenController } from './use-host-screen-controller'

function isErrorVerdict(v: ConnectionVerdict): boolean {
  return v.kind === 'warning' || v.kind === 'unreachable' || v.kind === 'auth-failed'
}

export function HostScreenHeader({ controller }: { controller: HostScreenController }) {
  const {
    actions,
    actionsInRail,
    connState,
    embedded,
    floatingWorkspaceEnabled,
    forceReconnectHost,
    hostId,
    hostDisplay,
    lastConnectedAt,
    onHideSidebar,
    reconnectAttempts,
    relayRecovery,
    state
  } = controller
  // Why: a drop healed in a few seconds must not flash the host dot amber.
  const presentedConnState = useCalmConnectionState(connState, lastConnectedAt)
  // Folded Duo: these rows sit beside the status column; the list below runs full width.
  const statusColumnPadding = useStatusColumnPadding()
  const sessionChromeHeight = usePortraitSessionChromeHeight()

  return (
    <View
      style={[
        styles.topChrome,
        // The icon row drops so its bottom line meets the session header's (unfolded portrait).
        embedded &&
          sessionChromeHeight !== null && {
            minHeight: sessionChromeHeight,
            justifyContent: 'space-between'
          }
      ]}
    >
      <View
        style={[
          styles.statusBar,
          statusColumnPadding > 0 && { paddingRight: statusColumnPadding + spacing.xs },
          // Unfolded portrait: the host block is centered on the session title block's line. Its
          // center is 21pt down in the plain bar (4pt padding, 34pt row), so the difference is added.
          embedded &&
            sessionChromeHeight !== null && {
              paddingTop: spacing.xs + PORTRAIT_NAME_CENTER_Y - 21
            }
        ]}
      >
        <Pressable
          style={styles.backButton}
          onPress={actions.leaveHost}
          accessibilityRole="button"
          accessibilityLabel="Back to hosts"
          hitSlop={8}
        >
          <ChevronLeft size={22} color={colors.textPrimary} />
        </Pressable>
        {(() => {
          const headerVerdict = classifyConnection({
            state: connState,
            reconnectAttempts,
            lastConnectedAt,
            hostName: state.hostName,
            ...relayRecovery
          })
          return (
            <>
              <View style={styles.hostIdentity}>
                <View style={styles.hostIdentityLine}>
                  {presentedConnState !== connState && !isErrorVerdict(headerVerdict) ? (
                    <StatusDot state={presentedConnState} />
                  ) : (
                    <StatusDot state={connState} verdict={headerVerdict} />
                  )}
                  <Text style={styles.hostNameText} numberOfLines={1}>
                    {hostDisplay.title}
                  </Text>
                </View>
                {hostDisplay.descriptorLine ? (
                  <Text style={styles.hostPlatformText} numberOfLines={1}>
                    {hostDisplay.descriptorLine}
                  </Text>
                ) : null}
              </View>
              {connState !== 'connected' &&
                (() => {
                  // Why: auth-failed has its own banner, so suppress the Reconnect button for that verdict.
                  const verdict = headerVerdict
                  const isError = isErrorVerdict(verdict)
                  // Null on the page, where the shell owns the connection and nothing here re-dials.
                  if (
                    !isError ||
                    !hostId ||
                    verdict.kind === 'auth-failed' ||
                    forceReconnectHost === null
                  ) {
                    return null
                  }
                  return (
                    <Pressable
                      style={styles.reconnectButton}
                      onPress={() => void forceReconnectHost(hostId)}
                      accessibilityRole="button"
                      accessibilityLabel="Reconnect"
                      hitSlop={8}
                    >
                      <Text style={styles.reconnectButtonText}>Reconnect</Text>
                    </Pressable>
                  )
                })()}
            </>
          )
        })()}
        {!embedded && !actionsInRail && floatingWorkspaceEnabled ? (
          <Pressable
            style={[
              styles.floatingWorkspaceHeaderButton,
              connState !== 'connected' && styles.toolbarIconDisabled
            ]}
            onPress={actions.openFloatingWorkspace}
            disabled={connState !== 'connected'}
            accessibilityRole="button"
            accessibilityLabel="Floating Workspace"
            hitSlop={8}
          >
            <SquareTerminal
              size={18}
              color={connState === 'connected' ? colors.textPrimary : colors.textMuted}
            />
          </Pressable>
        ) : null}
        {embedded && onHideSidebar ? (
          <Pressable
            style={styles.sidebarCollapseButton}
            onPress={onHideSidebar}
            accessibilityRole="button"
            accessibilityLabel="Hide sidebar"
            hitSlop={8}
          >
            <PanelLeftClose size={14} color={colors.textSecondary} />
          </Pressable>
        ) : null}
      </View>

      {embedded ? (
        <View style={styles.embeddedToolbar}>
          {/* iPhone Duo (2026-10-27): the Workspace options pill took a whole row of the sidebar; it is
              the gear at the end of the icon row now (owner's call). */}
          <View style={styles.embeddedToolbarRow}>
            <Pressable
              style={[
                styles.embeddedToolbarIconButton,
                connState !== 'connected' && styles.toolbarIconDisabled
              ]}
              onPress={() =>
                actions.navigateFromHostList(`/h/${encodeURIComponent(hostId)}/accounts`)
              }
              disabled={connState !== 'connected'}
              accessibilityRole="button"
              accessibilityLabel="Accounts"
            >
              <UserCircle
                size={16}
                color={connState === 'connected' ? colors.textSecondary : colors.textMuted}
              />
            </Pressable>

            <Pressable
              style={[
                styles.embeddedToolbarIconButton,
                connState !== 'connected' && styles.toolbarIconDisabled
              ]}
              onPress={() => actions.navigateFromHostList(`/h/${encodeURIComponent(hostId)}/tasks`)}
              disabled={connState !== 'connected'}
              accessibilityRole="button"
              accessibilityLabel="Tasks"
            >
              <List
                size={16}
                color={connState === 'connected' ? colors.textSecondary : colors.textMuted}
              />
            </Pressable>

            {floatingWorkspaceEnabled ? (
              <Pressable
                style={[
                  styles.embeddedToolbarIconButton,
                  connState !== 'connected' && styles.toolbarIconDisabled
                ]}
                onPress={actions.openFloatingWorkspace}
                disabled={connState !== 'connected'}
                accessibilityRole="button"
                accessibilityLabel="Floating Workspace"
              >
                <SquareTerminal
                  size={18}
                  color={connState === 'connected' ? colors.textSecondary : colors.textMuted}
                />
              </Pressable>
            ) : null}

            <Pressable
              style={[
                styles.embeddedToolbarIconButton,
                connState !== 'connected' && styles.toolbarIconDisabled
              ]}
              onPress={actions.openNewWorktreeModal}
              disabled={connState !== 'connected'}
              accessibilityRole="button"
              accessibilityLabel="New workspace"
            >
              <Plus
                size={16}
                color={connState === 'connected' ? colors.textPrimary : colors.textMuted}
              />
            </Pressable>

            <Pressable
              style={styles.embeddedToolbarIconButton}
              onPress={() => state.setShowSearch((s) => !s)}
              accessibilityRole="button"
              accessibilityLabel={state.showSearch ? 'Close search' : 'Search workspaces'}
            >
              {state.showSearch ? (
                <X size={16} color={colors.textSecondary} />
              ) : (
                <Search size={16} color={colors.textSecondary} />
              )}
            </Pressable>

            <Pressable
              style={styles.embeddedToolbarIconButton}
              onPress={() => state.setShowWorkspaceOptions(true)}
              accessibilityRole="button"
              accessibilityLabel={workspaceOptionsAccessibilityLabel(controller.activeFilterCount)}
            >
              <Settings
                size={16}
                color={controller.activeFilterCount > 0 ? colors.accentBlue : colors.textSecondary}
              />
            </Pressable>
          </View>
        </View>
      ) : (
        <View
          style={[
            styles.toolbar,
            statusColumnPadding > 0 && { paddingRight: statusColumnPadding + spacing.xs }
          ]}
        >
          <Pressable
            style={[styles.filterChip, controller.activeFilterCount > 0 && styles.filterChipActive]}
            onPress={() => state.setShowWorkspaceOptions(true)}
            accessibilityRole="button"
            accessibilityLabel={workspaceOptionsAccessibilityLabel(controller.activeFilterCount)}
          >
            <Text
              style={[
                styles.filterChipText,
                controller.activeFilterCount > 0 && styles.filterChipTextActive
              ]}
            >
              {WORKSPACE_OPTIONS_TITLE}
            </Text>
            <WorkspaceOptionsCountBadge count={controller.activeFilterCount} />
          </Pressable>

          <View style={styles.toolbarSpacer} />
          {/* The side rail holds these when the window has one (host-screen-side-rail). */}
          {actionsInRail ? null : (
            <>
              <Pressable
                style={styles.searchToggle}
                onPress={() =>
                  actions.navigateFromHostList(`/h/${encodeURIComponent(hostId)}/accounts`)
                }
                disabled={connState !== 'connected'}
                accessibilityRole="button"
                accessibilityLabel="Accounts"
              >
                <UserCircle
                  size={16}
                  color={connState === 'connected' ? colors.textSecondary : colors.textMuted}
                />
              </Pressable>

              <Pressable
                style={styles.searchToggle}
                onPress={() =>
                  actions.navigateFromHostList(`/h/${encodeURIComponent(hostId)}/tasks`)
                }
                disabled={connState !== 'connected'}
                accessibilityRole="button"
                accessibilityLabel="Tasks"
              >
                <List
                  size={16}
                  color={connState === 'connected' ? colors.textSecondary : colors.textMuted}
                />
              </Pressable>

              <Pressable
                style={styles.searchToggle}
                onPress={() => state.setShowSearch((s) => !s)}
                accessibilityRole="button"
                accessibilityLabel={state.showSearch ? 'Close search' : 'Search workspaces'}
              >
                {state.showSearch ? (
                  <X size={16} color={colors.textSecondary} />
                ) : (
                  <Search size={16} color={colors.textSecondary} />
                )}
              </Pressable>
            </>
          )}
        </View>
      )}
    </View>
  )
}
