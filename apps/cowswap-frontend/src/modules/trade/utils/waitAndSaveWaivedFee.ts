import { isSellOrder } from '@cowprotocol/common-utils'
import type { OrderKind } from '@cowprotocol/cow-sdk'

import type { WaitAndSaveComparisonQuote } from '../state/waitAndSaveComparisonQuoteAtom'

export interface GetWaitAndSaveWaivedFeeParams {
  comparison: WaitAndSaveComparisonQuote | null
  mainQuote: WaitAndSaveMainQuote
  orderKind: OrderKind | undefined
  userQuoteWithWaitAndSave: boolean
}

export interface WaitAndSaveMainQuote {
  buyAmount: string | undefined
  feeAmount: string | undefined
  sellAmount: string | undefined
}

export interface WaitAndSaveWaivedFeeRawAmount {
  amount: bigint
  currency: 'buy' | 'sell'
}

/**
 * Positive waived-fee atoms, or undefined when the comparison is missing, stale, or not a saving.
 * A sell order pairs on the main buy amount: on-quote buy minus off-quote buy, in the buy token.
 * A buy order pairs on the main gross sell (`sellAmount + feeAmount`): off-quote gross sell minus
 * on-quote gross sell, in the sell token. The network fee is part of what the user sells, and a
 * fee shared by both quotes cancels out.
 */
export function getWaitAndSaveWaivedFeeRawAmount(
  params: GetWaitAndSaveWaivedFeeParams,
): WaitAndSaveWaivedFeeRawAmount | undefined {
  const { comparison, mainQuote, orderKind, userQuoteWithWaitAndSave } = params
  if (!comparison || !orderKind || comparison.enableWaitForCow === userQuoteWithWaitAndSave) return undefined

  return isSellOrder(orderKind)
    ? sellOrderWaivedFee(comparison, mainQuote, userQuoteWithWaitAndSave)
    : buyOrderWaivedFee(comparison, mainQuote, userQuoteWithWaitAndSave)
}

export function parsePositiveBuyAmount(value: string | undefined): bigint | undefined {
  if (!value || !/^\d+$/.test(value)) return undefined

  const amount = BigInt(value)
  return amount > 0n ? amount : undefined
}

function buyOrderWaivedFee(
  comparison: WaitAndSaveComparisonQuote,
  mainQuote: WaitAndSaveMainQuote,
  userQuoteWithWaitAndSave: boolean,
): WaitAndSaveWaivedFeeRawAmount | undefined {
  const mainGross = grossSell(mainQuote.sellAmount, mainQuote.feeAmount)
  const storedMainGross = grossSell(comparison.mainSellAmount, comparison.mainFeeAmount)
  if (mainGross === undefined || storedMainGross === undefined || mainGross !== storedMainGross) return undefined

  const comparisonGross = grossSell(comparison.sellAmount, comparison.feeAmount)
  if (comparisonGross === undefined) return undefined

  const onGross = userQuoteWithWaitAndSave ? mainGross : comparisonGross
  const offGross = userQuoteWithWaitAndSave ? comparisonGross : mainGross
  const delta = offGross - onGross
  return delta > 0n ? { amount: delta, currency: 'sell' } : undefined
}

function grossSell(sellAmount: string | undefined, feeAmount: string | undefined): bigint | undefined {
  const sell = parseAtoms(sellAmount)
  if (sell === undefined) return undefined

  const fee = feeAmount ? parseAtoms(feeAmount) : 0n
  if (fee === undefined) return undefined

  return sell + fee
}

function parseAtoms(value: string | undefined): bigint | undefined {
  if (value === undefined || !/^\d+$/.test(value)) return undefined

  return BigInt(value)
}

function sellOrderWaivedFee(
  comparison: WaitAndSaveComparisonQuote,
  mainQuote: WaitAndSaveMainQuote,
  userQuoteWithWaitAndSave: boolean,
): WaitAndSaveWaivedFeeRawAmount | undefined {
  const { buyAmount: mainBuyAmount } = mainQuote
  if (!mainBuyAmount || comparison.mainBuyAmount !== mainBuyAmount) return undefined

  const onBuy = parseAtoms(userQuoteWithWaitAndSave ? mainBuyAmount : comparison.buyAmount)
  const offBuy = parseAtoms(userQuoteWithWaitAndSave ? comparison.buyAmount : mainBuyAmount)
  if (onBuy === undefined || offBuy === undefined) return undefined

  const delta = onBuy - offBuy
  return delta > 0n ? { amount: delta, currency: 'buy' } : undefined
}
