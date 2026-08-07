/**
 * Extra headroom (bps) on top of the setup-order fee estimate when deciding if pre-placement
 * Vault Relayer Approve is needed.
 *
 * Under JIT funding the sell=buy setup BUY order is 1 wei, so its sell amount is mostly
 * protocol costs. Exact size is only known after the quote inside placeEoaTwapOrder. This buffer
 * reduces the chances of a second approve prompt when the quote slightly exceeds a conservative fee estimate.
 *
 * When Approve does run, the on-chain tx still uses maxUint256. This buffer is only used for checking.
 */
export const EOA_TWAP_FUNDING_ALLOWANCE_BUFFER_BPS = 100n // 1%

/** BUY amount for the minimal JIT setup sell=buy order. */
export const EOA_TWAP_SETUP_BUY_AMOUNT_ATOMS = 1n

/**
 * Setup fee estimate atoms + {@link EOA_TWAP_FUNDING_ALLOWANCE_BUFFER_BPS} for pre-placement VR checks.
 */
export function getEoaTwapPrePlacementAmountToCover(setupFeeEstimateAtoms: bigint): bigint {
  return setupFeeEstimateAtoms + (setupFeeEstimateAtoms * EOA_TWAP_FUNDING_ALLOWANCE_BUFFER_BPS) / 10000n
}

/**
 * Conservative sell-token cover for the dust BUY setup order before a quote exists.
 * Roughly 0.05 of the token (or 5 atoms when decimals ≤ 2).
 */
export function getEoaTwapSetupFeeEstimateAtoms(decimals: number): bigint {
  if (decimals <= 2) {
    return 5n
  }

  return 5n * 10n ** BigInt(decimals - 2)
}
