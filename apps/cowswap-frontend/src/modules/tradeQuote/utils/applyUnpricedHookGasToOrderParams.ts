import { OrderKind, type OrderParameters } from '@cowprotocol/cow-sdk'

import type { CowHook } from 'modules/appData'

type QuoteOrderParams = Pick<
  OrderParameters,
  'kind' | 'sellAmount' | 'buyAmount' | 'feeAmount' | 'gasAmount' | 'gasPrice' | 'sellTokenPrice'
>

/**
 * Patches sell-quote amounts so the UI includes hook gas the orderbook underpriced.
 *
 * Network fee is roughly `gasAmount * gasPrice / sellTokenPrice`. A verified quote
 * sets `gasAmount` from simulation. The EOA TWAP quote pre-hook is a no-op with a
 * declared `gasLimit` (the real `pollFunds` budget), so simulation only burns a few
 * thousand gas and unused `gasLimit` is not charged.
 *
 * This adds that declared budget as `extraFee = ceil(hookGas * gasPrice / sellTokenPrice)`,
 * raises `feeAmount`, and reduces after-fee sell/buy so the user's total sell stays the
 * same and the presented receive is worse by the missing fee.
 */
export function applyUnpricedHookGasToOrderParams<T extends QuoteOrderParams>(
  orderParams: T,
  preHooks: readonly CowHook[] | undefined,
): T {
  const hookGas = sumHookGasLimit(preHooks)
  if (hookGas <= 0n || orderParams.kind !== OrderKind.SELL) {
    return orderParams
  }

  const gasPrice = BigInt(orderParams.gasPrice)
  const sellTokenPrice = BigInt(orderParams.sellTokenPrice)
  if (gasPrice <= 0n || sellTokenPrice <= 0n) {
    return orderParams
  }

  const sellAmount = BigInt(orderParams.sellAmount)
  const buyAmount = BigInt(orderParams.buyAmount)
  const feeAmount = BigInt(orderParams.feeAmount)
  if (sellAmount <= 0n || buyAmount <= 0n) {
    return orderParams
  }

  const extraFee = ceilDiv(hookGas * gasPrice, sellTokenPrice)
  const extraFeeBuy = (buyAmount * extraFee) / sellAmount
  if (extraFee <= 0n || extraFee >= sellAmount || extraFeeBuy >= buyAmount) {
    return orderParams
  }

  return {
    ...orderParams,
    sellAmount: (sellAmount - extraFee).toString(),
    buyAmount: (buyAmount - extraFeeBuy).toString(),
    feeAmount: (feeAmount + extraFee).toString(),
    gasAmount: (BigInt(orderParams.gasAmount) + hookGas).toString(),
  }
}

function ceilDiv(numerator: bigint, denominator: bigint): bigint {
  return (numerator + denominator - 1n) / denominator
}

function sumHookGasLimit(preHooks: readonly CowHook[] | undefined): bigint {
  if (!preHooks?.length) return 0n

  return preHooks.reduce((sum, hook) => sum + BigInt(hook.gasLimit), 0n)
}
