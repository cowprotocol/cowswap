import { OrderKind, type OrderParameters } from '@cowprotocol/cow-sdk'

import BigNumber from 'bignumber.js'

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

  return quoteWithHookGas(orderParams, hookGas) ?? orderParams
}

/** `ceil(hookGas * gasPrice / sellTokenPrice)` as an integer sell-token atom. */
function ceilHookGasFee(hookGas: bigint, gasPrice: BigNumber, sellTokenPrice: BigNumber): bigint {
  const gasPriceDp = gasPrice.decimalPlaces() ?? 0
  const sellTokenPriceDp = sellTokenPrice.decimalPlaces() ?? 0
  const numerator = new BigNumber(hookGas.toString()).times(gasPrice.shiftedBy(gasPriceDp)).shiftedBy(sellTokenPriceDp)
  const denominator = sellTokenPrice.shiftedBy(sellTokenPriceDp + gasPriceDp)
  const rounded = numerator.plus(denominator).minus(1).div(denominator).integerValue(BigNumber.ROUND_FLOOR)

  return BigInt(rounded.toFixed(0))
}

/** Quoted gas plus hook gas, rounded up so a fractional gas amount stays an integer string. */
function integerGasAmount(gasAmount: string, hookGas: bigint): string | undefined {
  const quotedGas = new BigNumber(gasAmount)
  if (!quotedGas.isFinite() || quotedGas.isNegative()) return undefined

  return quotedGas.integerValue(BigNumber.ROUND_CEIL).plus(hookGas.toString()).toFixed(0)
}

function positiveDecimal(value: string): BigNumber | undefined {
  const parsed = new BigNumber(value)

  return !parsed.isFinite() || !parsed.gt(0) ? undefined : parsed
}

function quoteWithHookGas<T extends QuoteOrderParams>(orderParams: T, hookGas: bigint): T | undefined {
  const gasPrice = positiveDecimal(orderParams.gasPrice)
  const sellTokenPrice = positiveDecimal(orderParams.sellTokenPrice)

  if (!gasPrice || !sellTokenPrice) return undefined

  const sellAmount = BigInt(orderParams.sellAmount)
  const buyAmount = BigInt(orderParams.buyAmount)
  const feeAmount = BigInt(orderParams.feeAmount)

  if (sellAmount <= 0n || buyAmount <= 0n) return undefined

  const extraFee = ceilHookGasFee(hookGas, gasPrice, sellTokenPrice)
  const extraFeeBuy = (buyAmount * extraFee) / sellAmount
  const gasAmount = integerGasAmount(orderParams.gasAmount, hookGas)

  if (extraFee <= 0n || extraFee >= sellAmount || extraFeeBuy >= buyAmount || gasAmount === undefined) {
    return undefined
  }

  return {
    ...orderParams,
    sellAmount: (sellAmount - extraFee).toString(),
    buyAmount: (buyAmount - extraFeeBuy).toString(),
    feeAmount: (feeAmount + extraFee).toString(),
    gasAmount,
  }
}

function sumHookGasLimit(preHooks: readonly CowHook[] | undefined): bigint {
  if (!preHooks?.length) return 0n

  return preHooks.reduce((sum, hook) => sum + BigInt(hook.gasLimit), 0n)
}
