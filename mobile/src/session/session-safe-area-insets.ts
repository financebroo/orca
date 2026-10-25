import type { EdgeInsets } from 'react-native-safe-area-context'

// A sideways iPhone clears its home indicator in 21pt; the Duo's inner screen sideways reports more.
export const IOS_LANDSCAPE_BOTTOM_INSET_MAX = 21

/** The session's insets: on iOS in landscape the bottom is capped so the input dock sits low. */
export function resolveSessionSafeAreaInsets(
  insets: EdgeInsets,
  args: { isIos: boolean; isLandscape: boolean }
): EdgeInsets {
  if (!args.isIos || !args.isLandscape || insets.bottom <= IOS_LANDSCAPE_BOTTOM_INSET_MAX) {
    return insets
  }
  return { ...insets, bottom: IOS_LANDSCAPE_BOTTOM_INSET_MAX }
}
