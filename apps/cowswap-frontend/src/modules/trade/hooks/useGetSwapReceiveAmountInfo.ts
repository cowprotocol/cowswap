import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { getAddressKey, isSolanaChain, type OrderParameters } from '@cowprotocol/cow-sdk'
import { Currency } from '@cowprotocol/currency'
import { useTokenByAddress } from '@cowprotocol/tokens'
import { Nullish } from '@cowprotocol/types'
import { isEoaAtom, useWalletInfo } from '@cowprotocol/wallet'

import { useAppData } from 'modules/appData'
import {
  applyUnpricedHookGasToOrderParams,
  getEoaTwapQuotePreHooks,
  useTradeQuote,
  useTradeQuoteProtocolFee,
} from 'modules/tradeQuote'
import { useVolumeFee } from 'modules/volumeFee'

import { useDerivedTradeState } from './useDerivedTradeState'

import { ReceiveAmountInfo } from '../types'
import { getReceiveAmountInfo } from '../utils/getReceiveAmountInfo'
import { ReceiveAmountInfoParams } from '../utils/types'

interface ReceiveAmountCurrencies {
  inputCurrency: Nullish<Currency>
  outputCurrency: Nullish<Currency>
}

export function useGetSwapReceiveAmountInfo(): ReceiveAmountInfo | null {
  const params = useSwapReceiveAmountInfoParams()

  return useMemo(() => (params ? getReceiveAmountInfo(params) : null), [params])
}

export function useSwapReceiveAmountInfoParams(): ReceiveAmountInfoParams | null {
  const derivedTradeState = useDerivedTradeState()
  const tradeQuote = useTradeQuote()
  const volumeFeeBps = useVolumeFee()?.volumeBps
  const orderKind = derivedTradeState?.orderKind
  const derivedSlippage = derivedTradeState?.slippage

  const quoteResults = tradeQuote?.quote?.quoteResults
  const quoteResponse = quoteResults?.quoteResponse
  const quotedOrderParams = quoteResponse?.quote
  const orderParams = useOrderParamsWithEoaTwapHookGas(quotedOrderParams)
  const protocolFeeBps = useTradeQuoteProtocolFee()

  const { inputCurrency, outputCurrency } = useQuoteCurrencies()

  return useMemo(() => {
    // Avoid states mismatch
    if (orderKind !== orderParams?.kind || orderKind !== quotedOrderParams?.kind) return null
    if (!orderParams || !quotedOrderParams || !inputCurrency || !outputCurrency || !derivedSlippage) return null

    return {
      orderParams,
      quotedOrderParams,
      inputCurrency,
      outputCurrency,
      slippagePercent: derivedSlippage,
      partnerFeeBps: volumeFeeBps,
      protocolFeeBps,
    }
  }, [
    orderKind,
    orderParams,
    quotedOrderParams,
    volumeFeeBps,
    inputCurrency,
    outputCurrency,
    protocolFeeBps,
    derivedSlippage,
  ])
}

function useOrderParamsWithEoaTwapHookGas(quotedOrderParams: OrderParameters | undefined): OrderParameters | undefined {
  const { isTwapEoaEnabled } = useFeatureFlags()
  const isEoa = useAtomValue(isEoaAtom)
  const { chainId } = useWalletInfo()
  const appData = useAppData()

  return useMemo(() => {
    const additionalPreHooks = getEoaTwapQuotePreHooks({
      orderClass: appData?.doc?.metadata?.orderClass?.orderClass,
      isTwapEoaEnabled: !!isTwapEoaEnabled,
      isEoa,
      chainId,
    })

    return quotedOrderParams
      ? applyUnpricedHookGasToOrderParams(quotedOrderParams, additionalPreHooks)
      : quotedOrderParams
  }, [quotedOrderParams, appData?.doc?.metadata?.orderClass?.orderClass, isTwapEoaEnabled, isEoa, chainId])
}

function useQuoteCurrencies(): ReceiveAmountCurrencies {
  const { chainId } = useWalletInfo()
  const quoteResults = useTradeQuote().quote?.quoteResults
  const quote = quoteResults?.quoteResponse?.quote

  // A native-SOL buy is quoted against WSOL (`toSplMint` in `@cowprotocol/sdk-trading-solana`), so the
  // response echoes the wrapped mint while settlement credits lamports. `tradeParameters` keeps the mint
  // the user asked for, which is the one every amount has to be labelled with.
  const buyToken = isSolanaChain(chainId) ? quoteResults?.tradeParameters.buyToken : quote?.buyToken

  const inputCurrency = useTokenByAddress(quote?.sellToken && getAddressKey(quote.sellToken))
  const outputCurrency = useTokenByAddress(buyToken && getAddressKey(buyToken))

  return { inputCurrency, outputCurrency }
}
