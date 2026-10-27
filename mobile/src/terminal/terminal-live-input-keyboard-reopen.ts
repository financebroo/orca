import { hostOs } from '../platform/host-os'

/** Android keeps a hidden TextInput focused after Back closes the IME, so focus must blur first. */
export function reopensFocusedInputWhenKeyboardHidden(): boolean {
  // iPhone Duo (2026-10-27): iOS too; in the page's web view a tap after the keyboard closed kept the
  // hidden field focused, so focus() was a no-op and the keyboard only came back some of the time.
  return hostOs() === 'android' || hostOs() === 'ios'
}
