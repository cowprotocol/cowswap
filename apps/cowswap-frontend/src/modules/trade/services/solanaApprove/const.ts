/**
 * Unlimited SPL approval amount — u64 max (SPL token amounts are u64).
 *
 * Mirrors the intent of the EVM `MAX_APPROVE_AMOUNT` (MAX_UINT256): approve once, then trade without
 * re-approving. Partial approvals pass an exact amount instead of this.
 */
export const SOLANA_MAX_APPROVE_AMOUNT = 2n ** 64n - 1n
