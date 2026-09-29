import type { TWAPOrderStruct } from '../types'

/**
 * Returns the scheduled part start as a Unix timestamp in seconds.
 * `t` is the interval between part starts. `span` is the part validity duration.
 * A zero `span` means the full interval (`t`), not zero seconds.
 *
 * Expiry is inclusive: validTo = start + (span || t) - 1.
 * The inverse calculation adds one second to recover the start.
 * For example, a 60-second part starts at 12:00:00 and expires at 12:00:59.
 */
export function getTwapPartStartTime(validTo: number, { span, t }: Pick<TWAPOrderStruct, 'span' | 't'>): number {
  return validTo - (span || t) + 1
}
