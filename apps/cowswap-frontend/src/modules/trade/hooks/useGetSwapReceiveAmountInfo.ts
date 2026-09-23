import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { getAddressKey, type OrderParameters } from '@cowprotocol/cow-sdk'
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
  const orderParams = useOrderParamsWithEoaTwapHookGas(quoteResponse?.quote)
  const protocolFeeBps = useTradeQuoteProtocolFee()

  const { inputCurrency, outputCurrency } = useQuoteCurrencies()

  return useMemo(() => {
    // Avoid states mismatch
    if (orderKind !== orderParams?.kind) return null
    if (!orderParams || !inputCurrency || !outputCurrency || !derivedSlippage) return null

    return {
      orderParams,
      inputCurrency,
      outputCurrency,
      slippagePercent: derivedSlippage,
      partnerFeeBps: volumeFeeBps,
      protocolFeeBps,
    }
  }, [orderKind, orderParams, volumeFeeBps, inputCurrency, outputCurrency, protocolFeeBps, derivedSlippage])
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
  const tradeQuote = useTradeQuote()
  const quoteResponse = tradeQuote?.quote?.quoteResults.quoteResponse

  const inputCurrency = useTokenByAddress(
    quoteResponse?.quote?.sellToken ? getAddressKey(quoteResponse.quote.sellToken) : undefined,
  )
  const outputCurrency = useTokenByAddress(
    quoteResponse?.quote?.buyToken ? getAddressKey(quoteResponse.quote.buyToken) : undefined,
  )

  return { inputCurrency, outputCurrency }
}
