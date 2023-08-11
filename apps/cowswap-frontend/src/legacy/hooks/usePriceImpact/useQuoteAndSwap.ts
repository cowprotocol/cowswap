import { useEffect, useState } from 'react'

import { OrderKind } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { DEFAULT_DECIMALS } from 'legacy/constants'
import { ZERO_ADDRESS } from 'legacy/constants/misc'
import { useGetGpPriceStrategy } from 'legacy/hooks/useGetGpPriceStrategy'
import { QuoteError } from 'legacy/state/price/actions'
import { QuoteInformationObject } from 'legacy/state/price/reducer'
import { useTradeExactInWithFee } from 'legacy/state/swap/extension'
import { isWrappingTrade } from 'legacy/state/swap/utils'
import { onlyResolvesLast } from 'legacy/utils/async'
import { getPromiseFulfilledValue, isPromiseFulfilled } from 'legacy/utils/misc'
import { getBestQuote, QuoteResult } from 'legacy/utils/price'

import { useIsEoaEthFlow } from 'modules/swap/hooks/useIsEoaEthFlow'
import { useWalletInfo } from 'modules/wallet'

import { getPriceQuality } from 'api/gnosisProtocol/api'
import { LegacyFeeQuoteParams } from 'api/gnosisProtocol/legacy/types'

type WithLoading = { loading: boolean; setLoading: (state: boolean) => void }

type ExactInSwapParams = {
  parsedAmount: CurrencyAmount<Currency> | undefined
  outputCurrency: Currency | undefined
  quote: QuoteInformationObject | undefined
}

type GetQuoteParams = {
  amountAtoms: string | undefined
  sellToken?: string | null
  buyToken?: string | null
  fromDecimals?: number
  toDecimals?: number
  validTo?: number
  verifyQuote: boolean
} & WithLoading

type FeeQuoteParamsWithError = LegacyFeeQuoteParams & { error?: QuoteError }

const getBestQuoteResolveOnlyLastCall = onlyResolvesLast<QuoteResult>(getBestQuote)

export function useCalculateQuote(params: GetQuoteParams) {
  const {
    amountAtoms: amount,
    sellToken,
    buyToken,
    fromDecimals = DEFAULT_DECIMALS,
    toDecimals = DEFAULT_DECIMALS,
    loading,
    setLoading,
    validTo,
    verifyQuote,
  } = params
  const { chainId } = useWalletInfo()
  const { account } = useWalletInfo()
  const isEthFlow = useIsEoaEthFlow()
  const strategy = useGetGpPriceStrategy()

  const [quote, setLocalQuote] = useState<QuoteInformationObject | FeeQuoteParamsWithError | undefined>()

  useEffect(() => {
    // bail out early - amount here is undefined if usd price impact is valid
    if (!sellToken || !buyToken || !amount || !validTo) return

    setLoading(true)

    const quoteParams = {
      amount,
      sellToken,
      buyToken,
      // B > A Trade is always a sell
      kind: OrderKind.SELL,
      fromDecimals,
      toDecimals,
      // TODO: check
      userAddress: account || ZERO_ADDRESS,
      chainId,
      validTo,
      isEthFlow,
      priceQuality: getPriceQuality({ verifyQuote }),
    }
    let quoteData: QuoteInformationObject | LegacyFeeQuoteParams = quoteParams
    getBestQuoteResolveOnlyLastCall({
      strategy,
      quoteParams,
      fetchFee: true,
      isPriceRefresh: false,
    })
      .then(({ cancelled, data }) => {
        if (cancelled) return

        const [price, fee] = data as QuoteResult

        quoteData = {
          ...quoteParams,
          fee: getPromiseFulfilledValue(fee, undefined),
          price: getPromiseFulfilledValue(price, undefined),
          lastCheck: Date.now(),
        }
        // check the promise fulfilled values
        // handle if rejected
        if (!isPromiseFulfilled(fee)) {
          // fee error takes precedence
          throw fee.reason
        } else if (!isPromiseFulfilled(price)) {
          throw price.reason
        }

        // use a local state vs redux as redux state retriggers price updaters..
        // and we don't really care about the BA quote anyways
        setLocalQuote(quoteData)
      })
      .catch((err) => {
        console.error('[usePriceImpact] Error getting new quote:', err)
        const quoteError = { ...quoteData, error: err } as FeeQuoteParamsWithError
        setLocalQuote(quoteError)
      })
      .finally(() => setLoading(false))
  }, [
    amount,
    account,
    chainId,
    buyToken,
    sellToken,
    toDecimals,
    fromDecimals,
    validTo,
    isEthFlow,
    setLoading,
    strategy,
    verifyQuote,
  ])

  return { quote, loading, setLoading }
}

// calculates a new Quote and inverse swap values
export default function useExactInSwap({ quote, outputCurrency, parsedAmount }: ExactInSwapParams) {
  const { chainId } = useWalletInfo()

  const isWrapping = isWrappingTrade(parsedAmount?.currency, outputCurrency, chainId)

  const bestTradeExactIn = useTradeExactInWithFee({
    parsedAmount,
    outputCurrency,
    quote,
    isWrapping,
  })

  return bestTradeExactIn
}
