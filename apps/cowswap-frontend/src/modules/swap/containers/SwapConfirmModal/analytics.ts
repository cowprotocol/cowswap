import { formatUnitsSafe, getCurrencyAddress } from '@cowprotocol/common-utils'
import type { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { CowSwapAnalyticsCategory, toCowSwapGtmEvent } from 'common/analytics/types'

export interface SwapConfirmBaseEventParams {
  isBridge: boolean
  fromChainId: number | undefined
  toChainId: number | undefined
  walletAddress: string | undefined
  walletAddressAlias?: string | undefined
  inputCurrency: Currency
  inputAmount: CurrencyAmount<Currency>
  outputSymbol?: string | undefined
}

export interface SwapConfirmExtraFieldsParams {
  outputCurrency?: Currency
  outputAmount?: CurrencyAmount<Currency> | null
  toChainId?: number
}

export interface SwapConfirmEventParams {
  chainId: number | undefined
  inputAmount: CurrencyAmount<Currency> | null
  outputAmount: CurrencyAmount<Currency> | null
  account: string | undefined
  ensName: string | undefined
}

export function isSwapConfirmBridge(fromChainId: number | undefined, toChainId: number | undefined): boolean {
  return fromChainId !== undefined && toChainId !== undefined && toChainId !== fromChainId
}

export function buildSwapConfirmLabel(
  fromChainId: number | undefined,
  toChainId: number | undefined,
  inputSymbol?: string,
  outputSymbol?: string,
  amountHuman?: string,
): string {
  return `From: ${fromChainId}, To: ${toChainId ?? 'unknown'}, TokenIn: ${inputSymbol || ''}, TokenOut: ${outputSymbol || ''}, Amount: ${amountHuman || ''}`
}

export function buildSwapConfirmBaseEvent(params: SwapConfirmBaseEventParams): Record<string, unknown> {
  const {
    isBridge,
    fromChainId,
    toChainId,
    walletAddress,
    walletAddressAlias,
    inputCurrency,
    inputAmount,
    outputSymbol,
  } = params

  const sellAmount = formatUnitsSafe(inputAmount.quotient.toString(), inputCurrency.decimals)

  return {
    category: isBridge ? CowSwapAnalyticsCategory.Bridge : CowSwapAnalyticsCategory.TRADE,
    action: isBridge ? 'swap_bridge_confirm_click' : 'swap_confirm_click',
    label: buildSwapConfirmLabel(
      fromChainId,
      toChainId,
      inputCurrency.symbol || '',
      outputSymbol || '',
      inputAmount.toSignificant(6),
    ),
    fromChainId,
    ...(toChainId !== undefined ? { toChainId } : {}),
    walletAddress,
    ...(walletAddressAlias ? { walletAddressAlias } : {}),
    sellToken: getCurrencyAddress(inputCurrency),
    sellTokenSymbol: inputCurrency.symbol || '',
    sellTokenChainId: inputCurrency.chainId ?? fromChainId,
    sellAmount,
    sellAmountHuman: inputAmount.toSignificant(6),
    value: Number(inputAmount.toSignificant(6)),
  }
}

export function buildSwapConfirmExtraFields(params: SwapConfirmExtraFieldsParams): Record<string, unknown> {
  const { outputCurrency, outputAmount, toChainId } = params
  if (!outputCurrency || !outputAmount) return {}

  const buyAmountExpected = formatUnitsSafe(outputAmount.quotient.toString(), outputCurrency.decimals)
  const extra: Record<string, unknown> = {
    buyToken: getCurrencyAddress(outputCurrency),
    buyTokenSymbol: outputCurrency.symbol || '',
    buyAmountExpected,
    buyAmountHuman: outputAmount.toSignificant(6),
  }

  const resolvedBuyChainId = outputCurrency.chainId ?? toChainId
  if (typeof resolvedBuyChainId !== 'undefined') extra.buyTokenChainId = resolvedBuyChainId

  return extra
}

export function buildSwapConfirmEvent(params: SwapConfirmEventParams): string | undefined {
  const { chainId, inputAmount, outputAmount, account, ensName } = params

  const inputCurrency = inputAmount?.currency
  const outputCurrency = outputAmount?.currency

  if (!inputAmount || !inputCurrency) return undefined

  const toChainId = outputCurrency?.chainId
  const isBridge = isSwapConfirmBridge(chainId, toChainId)

  const base = buildSwapConfirmBaseEvent({
    isBridge,
    fromChainId: chainId,
    toChainId,
    walletAddress: account,
    walletAddressAlias: ensName || undefined,
    inputCurrency,
    inputAmount,
    outputSymbol: outputCurrency?.symbol,
  })

  const extra = buildSwapConfirmExtraFields({ outputCurrency, outputAmount, toChainId })

  return toCowSwapGtmEvent({ ...base, ...extra } as Parameters<typeof toCowSwapGtmEvent>[0])
}
