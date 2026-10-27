import { styles } from './mobile-session-styles'
import { MobileTerminalInputActions } from './MobileTerminalInputActions'
import type { MobileSessionController } from './use-mobile-session-controller'

// The session's photo + mic actions, wired once for both input bars.
export function MobileSessionTerminalInputActions({
  controller,
  inKeyRow = false
}: {
  controller: MobileSessionController
  // drawn as keys in the accessory row instead of round buttons in the input bar.
  inKeyRow?: boolean
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
      buttonStyle={inKeyRow ? styles.keyRowActionKey : styles.dictationButton}
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
