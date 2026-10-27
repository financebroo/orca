import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { ALargeSmall, Monitor, Smartphone } from 'lucide-react-native'
import { PickerModal } from '../components/PickerModal'
import { colors, spacing } from '../theme/mobile-theme'
import { saveTerminalTextScale } from '../storage/preferences'
import { MobileSessionHeaderIconButton } from './MobileSessionHeaderIconButton'
import { getMobileNativeChatToggleActions } from './mobile-native-chat-toggle-action'
import { isTerminalPhoneDisplayMode } from './mobile-session-route-helpers'
import {
  TEXT_SIZE_OPTIONS,
  textSizeValueFromScale,
  type TextSizeValue
} from './terminal-text-size-options'
import type { MobileSessionController } from './use-mobile-session-controller'

/**
 * iPhone Duo (2026-10-27), unfolded: chat/terminal view, phone/desktop fit and text size beside the
 * header's panel actions (owner's call), instead of only in the tab's long-press sheet and Settings.
 * They follow the panel actions, after a divider.
 */
export function MobileSessionViewControls({
  controller,
  stacked = false
}: {
  controller: MobileSessionController
  /** Unfolded portrait: a row of its own above the panel actions, so no divider. */
  stacked?: boolean
}) {
  const {
    activeHandle,
    canSend,
    terminalModes,
    toggleDisplayMode,
    sessionTabs,
    nativeChatController,
    nativeChatTranscriptIsLocalReadable,
    toggleTabChatView,
    activeMarkdownTab,
    activeFileTab,
    activeBrowserTab,
    terminalTextScale,
    setTerminalTextScale,
    terminalTextScaleRevisionRef
  } = controller
  const [textSizePickerOpen, setTextSizePickerOpen] = useState(false)
  if (activeMarkdownTab || activeFileTab || activeBrowserTab || !activeHandle) {
    return null
  }
  // Same availability as the tab sheet's "Switch to chat view": only agent tabs with a transcript.
  const chatToggle = getMobileNativeChatToggleActions({
    terminalHandle: activeHandle,
    tabs: sessionTabs.filter((tab) => tab.type === 'terminal'),
    isTabChatView: nativeChatController.isTabChatView,
    nativeChatTranscriptIsLocalReadable,
    onClose: () => {},
    onToggle: toggleTabChatView
  })[0]
  const phoneMode = isTerminalPhoneDisplayMode(activeHandle, terminalModes)
  const selectTextSize = (value: TextSizeValue) => {
    const option = TEXT_SIZE_OPTIONS.find((o) => o.value === value)
    if (!option) {
      return
    }
    // Same path as pinch-to-zoom: bump the revision so a pending Settings reload cannot undo it.
    terminalTextScaleRevisionRef.current += 1
    setTerminalTextScale(option.scale)
    void saveTerminalTextScale(option.scale)
  }
  return (
    <>
      {stacked ? null : <View style={styles.divider} />}
      {chatToggle?.icon ? (
        <MobileSessionHeaderIconButton
          accessibilityLabel={chatToggle.label}
          icon={chatToggle.icon}
          onPress={chatToggle.onPress}
        />
      ) : null}
      <MobileSessionHeaderIconButton
        accessibilityLabel={phoneMode ? 'Switch to desktop mode' : 'Switch to phone mode'}
        icon={phoneMode ? Monitor : Smartphone}
        disabled={!canSend}
        onPress={() => void toggleDisplayMode(activeHandle)}
      />
      <MobileSessionHeaderIconButton
        accessibilityLabel="Terminal text size"
        icon={ALargeSmall}
        onPress={() => setTextSizePickerOpen(true)}
      />
      <PickerModal<TextSizeValue>
        visible={textSizePickerOpen}
        title="Terminal text size"
        options={TEXT_SIZE_OPTIONS}
        selected={textSizeValueFromScale(terminalTextScale)}
        onSelect={selectTextSize}
        onClose={() => setTextSizePickerOpen(false)}
      />
    </>
  )
}

const styles = StyleSheet.create({
  divider: {
    width: StyleSheet.hairlineWidth,
    height: 20,
    marginHorizontal: spacing.xs,
    backgroundColor: colors.borderSubtle
  }
})
