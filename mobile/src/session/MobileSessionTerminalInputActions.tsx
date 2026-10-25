import { StyleSheet } from 'react-native'
import { styles } from './mobile-session-styles'
import { MobileTerminalInputActions } from './MobileTerminalInputActions'
import type { MobileSessionController } from './use-mobile-session-controller'

// The session's photo + mic actions, wired once for the input bars and the side rail.
export function MobileSessionTerminalInputActions({
  controller,
  inRail = false
}: {
  controller: MobileSessionController
  inRail?: boolean
}) {
  const {
    canSend,
    isAttaching,
    dictation,
    dictationMode,
    dictationEnabled,
    attachImage,
    handleDictationToggle,
    handleDictationPressIn,
    handleDictationPressOut,
    cancelDictation
  } = controller
  return (
    <MobileTerminalInputActions
      canSend={canSend}
      isAttaching={isAttaching}
      dictation={dictation}
      dictationMode={dictationMode}
      dictationEnabled={dictationEnabled}
      buttonStyle={inRail ? [styles.dictationButton, railStyles.button] : styles.dictationButton}
      activeButtonStyle={styles.dictationButtonActive}
      disabledButtonStyle={styles.sendButtonDisabled}
      onAttachImage={() => void attachImage('library')}
      onAttachFile={() => void attachImage('files')}
      onDictationToggle={handleDictationToggle}
      onDictationPressIn={handleDictationPressIn}
      onDictationPressOut={handleDictationPressOut}
      onDictationCancel={cancelDictation}
    />
  )
}

const railStyles = StyleSheet.create({
  // The input bar spaces its row with a right margin; the rail column spaces with gap.
  button: { marginRight: 0 }
})
