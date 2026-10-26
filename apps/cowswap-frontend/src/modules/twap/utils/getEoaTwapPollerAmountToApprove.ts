import { maxUint256 } from 'viem'

export interface GetEoaTwapPollerAmountToApproveParams {
  amountToApprove: bigint
  sellAmount: bigint
  isDaiLikePermit: boolean
}

/** Poller approve/permit amount: Dai-like → unlimited; `0n` (vault-relayer covered) → sell amount. */
export function getEoaTwapPollerAmountToApprove({
  amountToApprove,
  sellAmount,
  isDaiLikePermit,
}: GetEoaTwapPollerAmountToApproveParams): bigint {
  if (isDaiLikePermit) {
    return maxUint256
  }

  return amountToApprove > 0n ? amountToApprove : sellAmount
}
