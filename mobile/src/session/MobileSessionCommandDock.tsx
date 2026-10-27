import { View, ScrollView, TextInput, Pressable } from 'react-native'
import { hostOs } from '../platform/host-os'
import { ArrowUp, ChevronDown, Keyboard as KeyboardIcon } from 'lucide-react-native'
import {
  getTerminalCommandKeyboardType,
  getTerminalLiveInputKeyboardType
} from '../terminal/terminal-keyboard-type'
import { MobileSessionTerminalInputActions } from './MobileSessionTerminalInputActions'
import { MobileSessionAccessoryKeys } from './MobileSessionAccessoryKeys'
import { colors } from '../theme/mobile-theme'
import { styles } from './mobile-session-styles'
import { useKeyboardPersistingTaps } from '../platform/keyboard-persisting-taps'
import type { MobileSessionController } from './use-mobile-session-controller'

export function MobileSessionCommandDock({ controller }: { controller: MobileSessionController }) {
  const {
    insets,
    bufferedTerminalDraftState,
    autocompleteEnabled,
    liveInputCapture,
    bindCommandField,
    handleLiveInputChange,
    handleLiveInputKeyPress,
    bindLiveInputField,
    submitLiveInput,
    canSend,
    canCompose,
    liveInputEnabled,
    focusLiveInput,
    showNativeChat,
    handleSend,
    dismissSoftwareKeyboard,
    activeMarkdownTab,
    activeFileTab,
    activeBrowserTab,
    keyboardLift
  } = controller
  const accessoryBarKeepsKeyboard = useKeyboardPersistingTaps('always')
  const keysInRail = controller.terminalKeysBesideTerminal
  // Folded, the bar sits down by the screen's rounded corners; pull its ends in to clear them.
  const cornerFit = controller.sessionSideRail === 'fullWidth' && styles.inputBarCornerFit
  return (
    !activeMarkdownTab &&
    !activeFileTab &&
    !activeBrowserTab &&
    !showNativeChat && (
      <View
        style={[
          styles.commandDock,
          { paddingBottom: insets.bottom, transform: [{ translateY: -keyboardLift }] }
        ]}
      >
        {/* Accessory keys; the side rail or the folded status-column strip holds them when present. */}
        {keysInRail ? null : (
          <View
            ref={accessoryBarKeepsKeyboard}
            style={[styles.accessoryBar, keyboardLift === 0 && styles.accessoryBarTall]}
          >
            {liveInputEnabled ? (
              <>
                {/* iPhone Duo (2026-10-26): live input has no bar of its own; the row leads with a wide
                    keyboard key, then photo and mic, so nothing duplicates the terminal above the keyboard. */}
                <Pressable
                  style={({ pressed }) => [
                    styles.keyboardDismissKey,
                    styles.keyRowKeyboardKey,
                    pressed && styles.accessoryKeyPressed,
                    // iPhone Duo (2026-10-27): white while the keyboard is up, so its state reads at a glance.
                    keyboardLift > 0 && styles.keyRowKeyboardKeyActive,
                    !canSend && keyboardLift === 0 && styles.sendButtonDisabled
                  ]}
                  disabled={!canSend && keyboardLift === 0}
                  onPress={keyboardLift > 0 ? dismissSoftwareKeyboard : focusLiveInput}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={
                    keyboardLift > 0 ? 'Dismiss keyboard' : 'Show keyboard for live terminal input'
                  }
                >
                  <View style={styles.keyboardDismissGlyph}>
                    <KeyboardIcon
                      size={17}
                      color={keyboardLift > 0 ? colors.bgBase : colors.textSecondary}
                      strokeWidth={2}
                    />
                    {keyboardLift > 0 ? (
                      <ChevronDown
                        size={10}
                        color={colors.bgBase}
                        strokeWidth={2.5}
                        style={styles.keyboardDismissChevron}
                      />
                    ) : null}
                  </View>
                </Pressable>
                <MobileSessionTerminalInputActions controller={controller} inKeyRow />
                <TextInput
                  ref={bindLiveInputField}
                  style={styles.liveInputCapture}
                  value={liveInputCapture}
                  onChange={handleLiveInputChange}
                  onKeyPress={handleLiveInputKeyPress}
                  onSubmitEditing={submitLiveInput}
                  placeholder=""
                  showSoftInputOnFocus
                  autoCapitalize="none"
                  autoCorrect={false}
                  spellCheck={false}
                  smartInsertDelete={false}
                  // Why: iOS textContentType overrides autoComplete and can narrow the keyboard; keep IME switching available.
                  autoComplete="off"
                  keyboardType={getTerminalLiveInputKeyboardType(hostOs())}
                  returnKeyType="default"
                  blurOnSubmit={false}
                  editable={canSend}
                  importantForAutofill="no"
                />
              </>
            ) : (
              // Why: fixed keyboard escape hatch; outside ScrollView + shortcut path so it can't scroll away or be hidden (#5106).
              keyboardLift > 0 && (
                <Pressable
                  style={({ pressed }) => [
                    styles.keyboardDismissKey,
                    pressed && styles.accessoryKeyPressed
                  ]}
                  onPress={dismissSoftwareKeyboard}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Dismiss keyboard"
                  accessibilityHint="Hides the software keyboard and keeps the current terminal session open."
                >
                  <View style={styles.keyboardDismissGlyph}>
                    <KeyboardIcon size={15} color={colors.textSecondary} strokeWidth={2} />
                    <ChevronDown
                      size={10}
                      color={colors.textSecondary}
                      strokeWidth={2.5}
                      style={styles.keyboardDismissChevron}
                    />
                  </View>
                </Pressable>
              )
            )}
            {/* Why: default tap handling makes the first accessory-key tap dismiss the keyboard and get swallowed (#5106). */}
            <ScrollView
              style={styles.accessoryScroll}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.accessoryContent}
              keyboardShouldPersistTaps="always"
            >
              <MobileSessionAccessoryKeys controller={controller} tall={keyboardLift === 0} />
            </ScrollView>
          </View>
        )}

        {liveInputEnabled ? null : (
          <View style={[styles.inputBar, cornerFit]}>
            <TextInput
              ref={bindCommandField}
              // Why: Android caches IME inputType at mount, so toggling autocomplete must remount there; iOS updates in place.
              key={
                hostOs() === 'android'
                  ? autocompleteEnabled
                    ? 'cmd-input-ac-on'
                    : 'cmd-input-ac-off'
                  : 'cmd-input'
              }
              style={styles.textInput}
              value={bufferedTerminalDraftState.input}
              // Why: iOS kills active dictation/IME if JS writes a value differing from native text; store raw, normalize at send.
              onChangeText={bufferedTerminalDraftState.setInput}
              placeholder="Type a command…"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              autoCorrect={autocompleteEnabled}
              spellCheck={autocompleteEnabled}
              smartInsertDelete={false}
              // Why: not autofill content, but keyboard must stay default so non-Latin IMEs remain selectable.
              autoComplete="off"
              keyboardType={getTerminalCommandKeyboardType(hostOs(), autocompleteEnabled)}
              returnKeyType="send"
              blurOnSubmit={false}
              // Why: composing is local — an outage must not lock the field or discard typed text (#6713).
              editable={canCompose}
              onSubmitEditing={() => void handleSend()}
            />
            <MobileSessionTerminalInputActions controller={controller} />
            <Pressable
              style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
              disabled={!canSend}
              onPress={() => void handleSend()}
              accessibilityLabel="Send command"
            >
              <ArrowUp size={18} color={colors.textSecondary} strokeWidth={2.5} />
            </Pressable>
          </View>
        )}
      </View>
    )
  )
}
