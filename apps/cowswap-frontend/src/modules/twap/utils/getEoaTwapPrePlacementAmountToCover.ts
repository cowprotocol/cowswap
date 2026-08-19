/**
 * Extra headroom (bps) on top of the TWAP sell when deciding if pre-placement Approve is needed.
 *
 * The intermediate sell=buy funding order often sells slightly more than the TWAP sell amount
 * (protocol costs / slippage). Funding size is only known after the quote inside placeEoaTwapOrder.
 * Without this buffer, allowance can cover the TWAP sell (Approve skipped in the stepper) but still
 * fall short of the funding sell. In this case, we'll request approval to the user again, but if it
 * falls short once again (e.g. the user manually edits the amount to approve), an error will be shown.
 *
 * When Approve does run and the user hasn't opted into partial approvals, the on-chain tx uses
 * maxUint256; see {@link getEoaTwapAmountToApprove} for the partial-approve case, which still
 * approves at least this buffer.
 */
export const EOA_TWAP_FUNDING_ALLOWANCE_BUFFER_BPS = 100n // 1%

/**
 * TWAP sell atoms plus {@link EOA_TWAP_FUNDING_ALLOWANCE_BUFFER_BPS} for pre-placement allowance checks.
 */
export function getEoaTwapPrePlacementAmountToCover(sellAmountAtoms: bigint): bigint {
  return sellAmountAtoms + (sellAmountAtoms * EOA_TWAP_FUNDING_ALLOWANCE_BUFFER_BPS) / 10000n
}
