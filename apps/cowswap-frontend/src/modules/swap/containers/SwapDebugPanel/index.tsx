import { MouseEvent, ReactNode, useMemo, useState } from 'react'

import { isInjectedWidget, isMobile } from '@cowprotocol/common-utils'
import { PriceQuality } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { getParentOrigin } from '@cowprotocol/iframe-transport'
import {
  COW_WIDGET_CONNECTOR_ID,
  getIsInjectedMobileBrowser,
  getIsSafeAppIframe,
  useIsEagerConnectInProgress,
  useIsSmartContractWallet,
  useWalletDetails,
  useWalletInfo,
} from '@cowprotocol/wallet'

import styled from 'styled-components/macro'
import { useChainId, useConnection, useWalletClient } from 'wagmi'

import { useAppData, useAppDataHooks } from 'modules/appData'
import {
  TradeTypeToUiOrderType,
  useDerivedTradeState,
  useGetReceiveAmountInfo,
  useIsHooksTradeType,
  useIsNoImpactWarningAccepted,
  useNonEvmReceiverConfirmed,
  useTradePriceImpact,
  useTradeTypeInfo,
} from 'modules/trade'
import { useTradeFlowContext, useTradeFlowType } from 'modules/tradeFlow'
import { useGetTradeFormValidation, useIsTradeFormValidationPassed } from 'modules/tradeFormValidation'
import { getOrderValidTo, useTradeQuote } from 'modules/tradeQuote'
import { useHighFeeWarning } from 'modules/tradeWidgetAddons'

import { useGP2SettlementContractData } from 'common/hooks/useContract'

import { useShouldCheckBridgingRecipient } from '../../hooks/useSmartContractRecipientConfirmed'
import { useSwapDerivedState } from '../../hooks/useSwapDerivedState'
import { useSwapFormState } from '../../hooks/useSwapFormState'

const DEBUG_PARAM = 'debugTradeFlow'
const SUMMARY_PREFIX = 'Trade debug:'
const COPY_IDLE_TEXT = 'Copy'
const COPY_DONE_TEXT = 'Copied'
const COPY_FAIL_TEXT = 'Copy failed'

const Wrapper = styled.div`
  position: relative;
  z-index: 1;
  margin: 12px auto;
  width: min(960px, calc(100% - 24px));
  max-height: 70vh;
  overflow: auto;
  border: 1px solid #35d07f;
  border-radius: 8px;
  background: #06140d;
  color: #d8ffe7;
  font: 12px/1.45 monospace;
`

const Summary = styled.summary`
  position: sticky;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 12px;
  background: #0a2115;
  cursor: pointer;
  font-weight: 700;
`

const SummaryText = styled.span`
  min-width: 0;
  overflow-wrap: anywhere;
`

const CopyButton = styled.button`
  flex: 0 0 auto;
  border: 1px solid #35d07f;
  border-radius: 4px;
  padding: 4px 8px;
  background: #123621;
  color: #d8ffe7;
  font: inherit;
  cursor: pointer;

  &:hover {
    background: #1b4a2e;
  }
`

const Content = styled.pre`
  margin: 0;
  padding: 12px;
  white-space: pre-wrap;
  word-break: break-word;
`

interface SwapDebugPanelProps {
  contextIsReady: boolean
  deadline: number
}

export function SwapDebugPanel(props: SwapDebugPanelProps): ReactNode {
  const [enabled] = useState(() => {
    if (typeof window === 'undefined') return false

    return new URLSearchParams(window.location.search).get(DEBUG_PARAM) === '1'
  })

  if (!enabled) return null

  return <SwapDebugPanelContent {...props} />
}

// TODO: Remove this temporary panel after the MetaMask iOS trade-flow issue is diagnosed.
// eslint-disable-next-line max-lines-per-function, complexity
function SwapDebugPanelContent({ contextIsReady, deadline }: SwapDebugPanelProps): ReactNode {
  const [copyButtonText, setCopyButtonText] = useState(COPY_IDLE_TEXT)
  const walletInfo = useWalletInfo()
  const walletDetails = useWalletDetails()
  const walletConnection = useConnection()
  const wagmiChainId = useChainId()
  const isEagerConnectInProgress = useIsEagerConnectInProgress()
  const isSmartContractWallet = useIsSmartContractWallet()
  const settlementContract = useGP2SettlementContractData()
  const walletClientQuery = useWalletClient()
  const walletClient = walletClientQuery.data
  const isWidget = isInjectedWidget()
  const isSafeAppIframe = getIsSafeAppIframe()
  const parentOrigin = getParentOrigin()
  const isInjectedMobileBrowser = getIsInjectedMobileBrowser()

  const derivedTradeState = useDerivedTradeState()
  const swapDerivedState = useSwapDerivedState()
  const receiveAmountInfo = useGetReceiveAmountInfo()
  const tradeQuote = useTradeQuote()
  const appData = useAppData()
  const appDataHooks = useAppDataHooks()
  const tradeTypeInfo = useTradeTypeInfo()
  const tradeType = tradeTypeInfo?.tradeType
  const uiOrderType = tradeType ? TradeTypeToUiOrderType[tradeType] : null
  const isHooksTradeType = useIsHooksTradeType()
  const tradeFlowContext = useTradeFlowContext({ deadline })
  const tradeFlowType = useTradeFlowType()
  const primaryFormValidation = useGetTradeFormValidation()
  const isPrimaryValidationPassed = useIsTradeFormValidationPassed()
  const swapFormState = useSwapFormState()
  const priceImpact = useTradePriceImpact()
  const { feeWarningAccepted, isHighFee, isHighBridgeFee } = useHighFeeWarning()
  const isNoImpactWarningAccepted = useIsNoImpactWarningAccepted()
  const shouldCheckBridgingRecipient = useShouldCheckBridgingRecipient()
  const nonEvmReceiverConfirmed = useNonEvmReceiverConfirmed()

  const inputAmount = receiveAmountInfo?.amountsToSign.sellAmount
  const outputAmount = receiveAmountInfo?.amountsToSign.buyAmount
  const sellAmountBeforeFee = receiveAmountInfo?.afterNetworkCosts.sellAmount
  const networkFee = receiveAmountInfo?.costs.networkFee.amountInSellCurrency
  const validTo = getOrderValidTo(deadline, tradeQuote)
  const quotePriceQuality = tradeQuote.fetchParams?.priceQuality

  const readyChecks = useMemo(
    () => ({
      inputAmount: Boolean(inputAmount),
      outputAmount: Boolean(outputAmount),
      sellAmountBeforeFee: Boolean(sellAmountBeforeFee),
      networkFee: Boolean(networkFee),
      sellToken: Boolean(derivedTradeState?.inputCurrency),
      buyToken: Boolean(derivedTradeState?.outputCurrency),
      account: Boolean(walletInfo.account),
      appData: Boolean(appData),
      quote: Boolean(tradeQuote.quote),
      quoteIsOptimal: quotePriceQuality === PriceQuality.OPTIMAL,
      orderKind: Boolean(derivedTradeState?.orderKind),
      settlementContract: Boolean(settlementContract),
      uiOrderType: Boolean(uiOrderType),
      validTo: validTo > 0,
      walletClient: Boolean(walletClient),
    }),
    [
      appData,
      derivedTradeState?.inputCurrency,
      derivedTradeState?.orderKind,
      derivedTradeState?.outputCurrency,
      inputAmount,
      networkFee,
      outputAmount,
      quotePriceQuality,
      sellAmountBeforeFee,
      settlementContract,
      tradeQuote.quote,
      uiOrderType,
      validTo,
      walletClient,
      walletInfo.account,
    ],
  )

  const debugInfo = useMemo(
    // TODO: Remove this temporary panel after the MetaMask iOS trade-flow issue is diagnosed.
    // eslint-disable-next-line complexity, max-lines-per-function
    () => ({
      time: new Date().toISOString(),
      url: typeof window === 'undefined' ? null : window.location.href,
      runtime: {
        isWidget,
        isSafeAppIframe,
        parentOrigin,
        isMobile,
        isInjectedMobileBrowser,
        expectedWagmiStorageKey: getExpectedWagmiStorageKey({ isWidget, isSafeAppIframe }),
        walletStorageKeys: getWalletStorageKeys(),
        host: typeof window === 'undefined' ? null : window.location.host,
        hash: typeof window === 'undefined' ? null : window.location.hash,
      },
      button: {
        contextIsReady,
        tradeFlowContextFromDebugHook: Boolean(tradeFlowContext),
        primaryFormValidation,
        isPrimaryValidationPassed,
        swapFormState,
        feeWarningAccepted,
        isHighFee,
        isHighBridgeFee,
        isNoImpactWarningAccepted,
        shouldCheckBridgingRecipient,
        nonEvmReceiverConfirmed,
      },
      readyChecks,
      wallet: {
        walletInfo,
        walletDetails,
        isEagerConnectInProgress,
        isSmartContractWallet,
        wagmi: {
          status: walletConnection.status,
          address: walletConnection.address,
          chainId: walletConnection.chainId,
          chain: walletConnection.chain?.id,
          globalChainId: wagmiChainId,
          connector: walletConnection.connector
            ? {
                id: walletConnection.connector.id,
                name: walletConnection.connector.name,
                type: walletConnection.connector.type,
                uid: walletConnection.connector.uid,
              }
            : null,
        },
        walletClientQuery: {
          status: walletClientQuery.status,
          fetchStatus: walletClientQuery.fetchStatus,
          isPending: walletClientQuery.isPending,
          isFetching: walletClientQuery.isFetching,
          isError: walletClientQuery.isError,
          error: getErrorInfo(walletClientQuery.error),
          chainId: walletClient?.chain?.id,
          account: walletClient?.account?.address,
        },
      },
      tradeFlow: {
        tradeFlowType,
        deadline,
        validTo,
        settlement: {
          chainId: settlementContract.chainId,
          address: settlementContract.address,
        },
        tradeType,
        uiOrderType,
        isHooksTradeType,
      },
      quote: {
        isLoading: tradeQuote.isLoading,
        hasParamsChanged: tradeQuote.hasParamsChanged,
        localQuoteTimestamp: tradeQuote.localQuoteTimestamp,
        error: getErrorInfo(tradeQuote.error),
        hasQuote: Boolean(tradeQuote.quote),
        quoteId: tradeQuote.quote?.quoteResults.quoteResponse.id,
        priceQuality: quotePriceQuality,
        fetchParams: tradeQuote.fetchParams,
      },
      amounts: {
        inputAmount: formatCurrencyAmount(inputAmount),
        outputAmount: formatCurrencyAmount(outputAmount),
        sellAmountBeforeFee: formatCurrencyAmount(sellAmountBeforeFee),
        networkFee: formatCurrencyAmount(networkFee),
        swapInputAmount: formatCurrencyAmount(swapDerivedState.inputCurrencyAmount),
        swapOutputAmount: formatCurrencyAmount(swapDerivedState.outputCurrencyAmount),
        inputCurrency: formatCurrency(derivedTradeState?.inputCurrency),
        outputCurrency: formatCurrency(derivedTradeState?.outputCurrency),
        recipient: derivedTradeState?.recipient,
        recipientAddress: derivedTradeState?.recipientAddress,
        orderKind: derivedTradeState?.orderKind,
      },
      appData: appData
        ? {
            appDataKeccak256: appData.appDataKeccak256,
            env: appData.env,
            hookCounts: {
              pre: appDataHooks?.pre?.length ?? 0,
              post: appDataHooks?.post?.length ?? 0,
            },
          }
        : null,
      priceImpact,
    }),
    [
      appData,
      appDataHooks?.post?.length,
      appDataHooks?.pre?.length,
      contextIsReady,
      deadline,
      derivedTradeState?.inputCurrency,
      derivedTradeState?.orderKind,
      derivedTradeState?.outputCurrency,
      derivedTradeState?.recipient,
      derivedTradeState?.recipientAddress,
      feeWarningAccepted,
      inputAmount,
      isEagerConnectInProgress,
      isHighBridgeFee,
      isHighFee,
      isHooksTradeType,
      isInjectedMobileBrowser,
      isNoImpactWarningAccepted,
      isPrimaryValidationPassed,
      isSafeAppIframe,
      isSmartContractWallet,
      isWidget,
      networkFee,
      nonEvmReceiverConfirmed,
      outputAmount,
      parentOrigin,
      priceImpact,
      primaryFormValidation,
      quotePriceQuality,
      readyChecks,
      sellAmountBeforeFee,
      settlementContract.address,
      settlementContract.chainId,
      shouldCheckBridgingRecipient,
      swapDerivedState.inputCurrencyAmount,
      swapDerivedState.outputCurrencyAmount,
      swapFormState,
      tradeFlowContext,
      tradeFlowType,
      tradeQuote.error,
      tradeQuote.fetchParams,
      tradeQuote.hasParamsChanged,
      tradeQuote.isLoading,
      tradeQuote.localQuoteTimestamp,
      tradeQuote.quote,
      tradeType,
      uiOrderType,
      validTo,
      wagmiChainId,
      walletClient,
      walletClientQuery.error,
      walletClientQuery.fetchStatus,
      walletClientQuery.isError,
      walletClientQuery.isFetching,
      walletClientQuery.isPending,
      walletClientQuery.status,
      walletConnection.address,
      walletConnection.chain?.id,
      walletConnection.chainId,
      walletConnection.connector,
      walletConnection.status,
      walletDetails,
      walletInfo,
    ],
  )

  const failedChecks = Object.entries(readyChecks)
    .filter(([, value]) => !value)
    .map(([key]) => key)
  const summaryText = `${SUMMARY_PREFIX} ${contextIsReady ? 'ready' : 'blocked'}${
    failedChecks.length > 0 ? ` | failed: ${failedChecks.join(', ')}` : ''
  }`
  const debugText = useMemo(() => stringifyDebug(debugInfo), [debugInfo])

  function handleCopy(event: MouseEvent<HTMLButtonElement>): void {
    event.preventDefault()
    event.stopPropagation()

    copyTextToClipboard(debugText)
      .then(() => {
        setCopyButtonText(COPY_DONE_TEXT)
      })
      .catch(() => {
        setCopyButtonText(COPY_FAIL_TEXT)
      })
      .finally(() => {
        window.setTimeout(() => setCopyButtonText(COPY_IDLE_TEXT), 1600)
      })
  }

  return (
    <Wrapper>
      <details open>
        <Summary>
          <SummaryText>{summaryText}</SummaryText>
          {/* eslint-disable-next-line react/jsx-no-bind */}
          <CopyButton type="button" onClick={handleCopy}>
            {copyButtonText}
          </CopyButton>
        </Summary>
        <Content>{debugText}</Content>
      </details>
    </Wrapper>
  )
}

function getErrorInfo(error: unknown): { name?: string; message?: string } | null {
  if (!error) return null

  if (error instanceof Error) {
    return { name: error.name, message: error.message }
  }

  return { message: String(error) }
}

function formatCurrencyAmount(amount: CurrencyAmount<Currency> | null | undefined): string | null {
  if (!amount) return null

  return `${amount.toSignificant(8)} ${amount.currency.symbol ?? amount.currency.name ?? 'UNKNOWN'}`
}

function formatCurrency(
  currency: Currency | null | undefined,
): { chainId: number; symbol?: string; address?: string } | null {
  if (!currency) return null

  return {
    chainId: currency.chainId,
    symbol: currency.symbol ?? undefined,
    address: currency.isToken ? currency.address : undefined,
  }
}

function stringifyDebug(value: unknown): string {
  return JSON.stringify(
    value,
    (_key: string, nestedValue: unknown) => {
      if (typeof nestedValue === 'bigint') return `${nestedValue.toString()}n`

      return nestedValue
    },
    2,
  )
}

async function copyTextToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text)

    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', 'true')
  textarea.style.position = 'fixed'
  textarea.style.top = '0'
  textarea.style.left = '0'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()

  try {
    if (!document.execCommand('copy')) {
      throw new Error('Copy command failed')
    }
  } finally {
    document.body.removeChild(textarea)
  }
}

function getExpectedWagmiStorageKey({
  isWidget,
  isSafeAppIframe,
}: {
  isWidget: boolean
  isSafeAppIframe: boolean
}): string {
  const safeSuffix = isSafeAppIframe ? '_safe-app' : ''

  return isWidget ? `cowswap-wallet-${COW_WIDGET_CONNECTOR_ID}${safeSuffix}` : `cowswap-wallet${safeSuffix}`
}

function getWalletStorageKeys(): string[] {
  if (typeof window === 'undefined') return []

  try {
    return Object.keys(window.localStorage).filter((key) => key.includes('cowswap-wallet') || key.includes('wagmi'))
  } catch {
    return []
  }
}
