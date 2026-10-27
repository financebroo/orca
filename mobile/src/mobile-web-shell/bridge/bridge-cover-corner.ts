import { z } from 'zod'
import { BRIDGE_MAX_SAFE_AREA_INSET } from './bridge-safe-area-insets'

const sizeSchema = z.number().finite().min(0).max(BRIDGE_MAX_SAFE_AREA_INSET)

/**
 * The folded Duo's corner status block when the outer display lies on its side, which the shell
 * measures natively and the page cannot see. Optional and additive: absent reads as no block, which
 * is every older shell, and an older page drops the field.
 */
export const BridgeCoverCornerSchema = z.object({
  side: z.enum(['left', 'right']),
  top: z.boolean(),
  width: sizeSchema,
  height: sizeSchema
})

export type BridgeCoverCorner = z.infer<typeof BridgeCoverCornerSchema>

export function sameCoverCorner(
  left: BridgeCoverCorner | null,
  right: BridgeCoverCorner | null
): boolean {
  if (left === null || right === null) {
    return left === right
  }
  return (
    left.side === right.side &&
    left.top === right.top &&
    left.width === right.width &&
    left.height === right.height
  )
}
