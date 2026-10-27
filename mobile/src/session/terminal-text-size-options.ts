import type { PickerOption } from '../components/PickerModal'

export type TextSizeValue = 'smallest' | 'smaller' | 'default' | 'large' | 'larger' | 'largest'

// Baseline zoom sits above fit-to-width; keep presets in sync with TERMINAL_TEXT_SCALES and pinch snapping.
export const TEXT_SIZE_OPTIONS: (PickerOption<TextSizeValue> & { scale: number })[] = [
  { value: 'smallest', label: 'Smallest (50%)', scale: 0.5 },
  { value: 'smaller', label: 'Smaller (75%)', scale: 0.75 },
  { value: 'default', label: 'Default (100%)', scale: 1 },
  { value: 'large', label: 'Large (125%)', scale: 1.25 },
  { value: 'larger', label: 'Larger (150%)', scale: 1.5 },
  { value: 'largest', label: 'Largest (200%)', scale: 2 }
]

export function textSizeValueFromScale(scale: number): TextSizeValue {
  return TEXT_SIZE_OPTIONS.find((o) => o.scale === scale)?.value ?? 'default'
}
