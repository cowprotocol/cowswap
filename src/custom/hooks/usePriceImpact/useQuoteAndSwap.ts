import { useEffect, useState } from 'react'
import { OrderKind } from '@gnosis.pm/gp-v2-contracts'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useTradeExactInWithFee } from 'state/swap/extension'
import { QuoteInformationObject } from 'state/price/reducer'

import { useWalletInfo } from 'hooks/useWalletInfo'
import { useActiveWeb3React } from 'hooks/web3'

import { getPromiseFulfilledValue, isPromiseFulfilled } from 'utils/misc'
import { supportedChainId } from 'utils/supportedChainId'
import { FeeQuoteParams, getBestQuote, QuoteResult } from 'utils/price'

import { ZERO_ADDRESS } from 'constants/misc'
import { SupportedChainId } from 'constants/chains'
import { DEFAULT_DECIMALS } from 'constants/index'
import { QuoteError } from 'state/price/actions'
import { isWrappingTrade } from 'state/swap/utils'

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
} & WithLoading

type FeeQuoteParamsWithError = FeeQuoteParams & { error?: QuoteError }

export function useCalculateQuote(params: GetQuoteParams) {
  const {
    amountAtoms: amount,
    sellToken,
    buyToken,
    fromDecimals = DEFAULT_DECIMALS,
    toDecimals = DEFAULT_DECIMALS,
    loading,
    setLoading,
  } = params
  const { chainId: preChain } = useActiveWeb3React()
  const { account } = useWalletInfo()

  const [quote, setLocalQuote] = useState<QuoteInformationObject | FeeQuoteParamsWithError | undefined>()

  useEffect(() => {
    const chainId = supportedChainId(preChain)
    // bail out early - amount here is undefined if usd price impact is valid
    if (!sellToken || !buyToken || !amount) return

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
      chainId: chainId || SupportedChainId.MAINNET,
    }
    let quoteData: QuoteInformationObject | FeeQuoteParams = quoteParams
    getBestQuote({
      quoteParams,
      fetchFee: true,
      isPriceRefresh: false,
    })
      .then((quoteResp) => {
        const [price, fee] = quoteResp as QuoteResult

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
  }, [amount, account, preChain, buyToken, sellToken, toDecimals, fromDecimals, setLoading])

  return { quote, loading, setLoading }
}

// calculates a new Quote and inverse swap values
export default function useExactInSwap({ quote, outputCurrency, parsedAmount }: ExactInSwapParams) {
  const { chainId } = useActiveWeb3React()

  const isWrapping = isWrappingTrade(parsedAmount?.currency, outputCurrency, chainId)

  const bestTradeExactIn = useTradeExactInWithFee({
    parsedAmount,
    outputCurrency,
    quote,
    isWrapping,
  })

  return bestTradeExactIn
}
