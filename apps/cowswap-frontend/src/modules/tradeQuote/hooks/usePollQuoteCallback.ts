import { useAtomValue } from 'jotai'
import { RefObject, useCallback, useMemo, useRef } from 'react'

import { useIsOnline, useIsWindowVisible, usePrevious } from '@cowprotocol/common-hooks'
import { getCurrencyAddress } from '@cowprotocol/common-utils'
import { isSolanaAddress, isSolanaChain } from '@cowprotocol/cow-sdk'
import { useAreUnsupportedTokens } from '@cowprotocol/tokens'
import { useSolanaWalletProvider, useWalletInfo } from '@cowprotocol/wallet'

import { useAppKitConnection } from '@reown/appkit-adapter-solana/react'
import { PublicKey } from '@solana/web3.js'
import { captchaCanQuoteAtom } from 'entities/captcha/state/captchaCanQuoteAtom'
import { useGetCorrelatedTokensByChainId } from 'entities/correlatedTokens'

import { QuoteParams } from './useQuoteParams'
import { useTradeQuote } from './useTradeQuote'
import { useTradeQuoteManager } from './useTradeQuoteManager'

import { doQuotePolling, QuoteUpdateContext } from '../services/doQuotePolling'
import { fetchAndProcessQuote } from '../services/fetchAndProcessQuote'
import { tradeQuoteInputAtom } from '../state/tradeQuoteInputAtom'
import { SolanaSigningContext, TradeQuoteFetchParams, TradeQuotePollingParameters } from '../types'

// eslint-disable-next-line max-lines-per-function
export function usePollQuoteCallback(
  quotePollingParams: TradeQuotePollingParameters,
  quoteParamsState: QuoteParams | undefined,
  currentAmountRef: RefObject<string | null>,
): (hasParamsChanged: boolean, forceUpdate?: boolean) => boolean {
  const canQuote = useAtomValue(captchaCanQuoteAtom)
  const { fastQuote } = useAtomValue(tradeQuoteInputAtom)
  const getCorrelatedTokensByChainId = useGetCorrelatedTokensByChainId()
  const tradeQuote = useTradeQuote()
  const tradeQuoteRef = useRef(tradeQuote)
  // eslint-disable-next-line react-hooks/refs
  tradeQuoteRef.current = tradeQuote

  const { quoteParams, appData, inputCurrency, hasSmartSlippage } = quoteParamsState || {}
  const hasSmartSlippagePrev = usePrevious(hasSmartSlippage)

  const tradeQuoteManager = useTradeQuoteManager(inputCurrency && getCurrencyAddress(inputCurrency))
  const getIsUnsupportedTokens = useAreUnsupportedTokens()

  const isWindowVisible = useIsWindowVisible()
  const isOnline = useIsOnline()
  const isOnlineRef = useRef(isOnline)
  // eslint-disable-next-line react-hooks/refs
  isOnlineRef.current = isOnline

  const updatingStartTimestamp = useRef<number | null>(null)

  const { account: walletAccount, chainId } = useWalletInfo()
  const solanaProvider = useSolanaWalletProvider()
  const { connection: solanaConnection } = useAppKitConnection()

  const solanaSigningContext: SolanaSigningContext | undefined = useMemo(() => {
    if (!isSolanaChain(chainId) || !isSolanaAddress(walletAccount) || !solanaProvider || !solanaConnection)
      return undefined

    return { owner: new PublicKey(walletAccount), provider: solanaProvider, connection: solanaConnection }
  }, [chainId, walletAccount, solanaProvider, solanaConnection])

  return useCallback(
    // eslint-disable-next-line complexity
    (hasParamsChanged: boolean, forceUpdate = false): boolean => {
      const { isQuoteUpdatePossible, isConfirmOpen } = quotePollingParams

      if (
        !canQuote ||
        !isQuoteUpdatePossible ||
        !tradeQuoteManager ||
        !quoteParams ||
        getIsUnsupportedTokens(quoteParams)
      ) {
        return false
      }

      if (quoteParams.amount.toString() === '0' || quoteParams.amount.toString() !== currentAmountRef.current) {
        tradeQuoteManager.reset()
        return false
      }

      const fetchQuote = (fetchParams: TradeQuoteFetchParams): Promise<void> => {
        const now = Date.now()
        updatingStartTimestamp.current = now

        return fetchAndProcessQuote(
          fetchParams,
          quoteParams,
          quotePollingParams,
          appData,
          tradeQuoteManager,
          getCorrelatedTokensByChainId,
          solanaSigningContext,
        )
      }

      const isBridge = quoteParams.sellTokenChainId !== quoteParams.buyTokenChainId
      /**
       * In bridging mode, bridge deposit amount (input amount) is the swap min receive amount
       * Because of that, we cannot change slippage without refetching the quote
       */
      const smartSlippageModeChanged = isBridge && hasSmartSlippagePrev !== hasSmartSlippage

      const context: QuoteUpdateContext = {
        currentQuote: tradeQuoteRef.current,
        quoteParams,
        appData,
        fetchQuote,
        hasParamsChanged,
        forceUpdate: smartSlippageModeChanged || forceUpdate,
        isBrowserOnline: isOnlineRef.current && isWindowVisible,
        isConfirmOpen,
        fastQuote,
        hasSmartSlippage,
      }

      /**
       * Fetch the quote instantly once the quote params are changed
       */
      return doQuotePolling(context)
    },
    [
      quoteParams,
      appData,
      tradeQuoteManager,
      isWindowVisible,
      fastQuote,
      getIsUnsupportedTokens,
      quotePollingParams,
      getCorrelatedTokensByChainId,
      hasSmartSlippage,
      hasSmartSlippagePrev,
      currentAmountRef,
      canQuote,
      solanaSigningContext,
    ],
  )
}
