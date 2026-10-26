/**
 * `HAS_MINT_AUTHORITY` reads as "Has Mint Authority", `2.69%_TRANSFER_FEES` as "2.69% Transfer Fees".
 *
 * The rate is baked into the warning type upstream, so the set of types is open-ended and cannot be
 * mapped to fixed copy. Words already starting with a digit are left alone to keep the rate intact.
 */
export function humanizeWarningType(type: string): string {
  return type
    .split('_')
    .map((word) => (/^[a-z]/i.test(word) ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : word))
    .join(' ')
}
