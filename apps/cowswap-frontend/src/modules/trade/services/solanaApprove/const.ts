/**
 * Unlimited SPL approval amount — u64 max (SPL token amounts are u64).
 *
 * Used to approve once and then trade without re-approving; partial approvals pass an exact amount instead.
 */
export const SOLANA_MAX_APPROVE_AMOUNT = 2n ** 64n - 1n
