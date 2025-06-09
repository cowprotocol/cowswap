import { ReactElement, ReactNode } from 'react'

import { BridgeProviderInfo } from '@cowprotocol/cow-sdk'
import { Command } from '@cowprotocol/types'
import { useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'
import { Percent } from '@uniswap/sdk-core'

import ms from 'ms.macro'

import type { PriceImpact } from 'legacy/hooks/usePriceImpact'

import { useAppData, AppDataInfo } from 'modules/appData'
import {
  QuoteDetails,
  useQuoteBridgeContext,
  useQuoteSwapContext,
  useShouldDisplayBridgeDetails,
  useBridgeQuoteAmounts,
  BridgeQuoteAmounts,
  QuoteSwapContext,
  QuoteBridgeContext,
} from 'modules/bridge'
import { useOrderSubmittedContent } from 'modules/orderProgressBar'
import {
  TradeBasicConfirmDetails,
  TradeConfirmation,
  TradeConfirmModal,
  useReceiveAmountInfo,
  useTradeConfirmActions,
  ReceiveAmountInfo,
  TradeConfirmActions,
} from 'modules/trade'
import { useTradeQuote } from 'modules/tradeQuote'
import { HighFeeWarning, RowDeadline } from 'modules/tradeWidgetAddons'

import { useRateInfoParams } from 'common/hooks/useRateInfoParams'
import { CurrencyPreviewInfo } from 'common/pure/CurrencyAmountPreview'
import { RateInfo, RateInfoParams } from 'common/pure/RateInfo'

import { useLabelsAndTooltips } from '../../hooks/useSwapConfirmModalLabels'
import { useDisableConfirmLogic, getButtonText } from '../../hooks/useSwapConfirmModalLogic'
import { useSwapDerivedState } from '../../hooks/useSwapDerivedState'
import { useSwapDeadlineState } from '../../hooks/useSwapSettings'

const CONFIRM_TITLE = 'Swap'
const PRICE_UPDATE_INTERVAL = ms`30s`

export interface SwapConfirmModalProps {
  doTrade(): Promise<false | void>

  inputCurrencyInfo: CurrencyPreviewInfo
  outputCurrencyInfo: CurrencyPreviewInfo
  priceImpact: PriceImpact
  recipient?: string | null
}

interface LabelsAndTooltips {
  slippageLabel?: ReactNode
  slippageTooltip?: ReactNode
  expectReceiveLabel?: ReactNode
  minReceivedLabel?: ReactNode
  minReceivedTooltip?: ReactNode
  networkCostsSuffix?: ReactNode
  networkCostsTooltipSuffix?: ReactNode
}

interface SwapConfirmModalData {
  account: string | undefined
  ensName: string | undefined
  appData: AppDataInfo | null
  receiveAmountInfo: ReceiveAmountInfo | null
  tradeConfirmActions: TradeConfirmActions
  slippage: Percent | null
  deadline: number
  shouldDisplayBridgeDetails: boolean
  isQuoteLoading: boolean
  bridgeProvider: BridgeProviderInfo | undefined
  bridgeQuoteAmounts: BridgeQuoteAmounts | null
  swapContext: QuoteSwapContext | null
  bridgeContext: QuoteBridgeContext | null
  rateInfoParams: RateInfoParams
  submittedContent: (onDismiss: Command) => ReactElement
  labelsAndTooltips: LabelsAndTooltips
}

function renderBridgeContent(
  bridgeProvider: BridgeProviderInfo,
  swapContext: QuoteSwapContext,
  bridgeContext: QuoteBridgeContext,
  rateInfoParams: RateInfoParams,
) {
  return (restContent: ReactElement) => (
    <>
      <RateInfo label="Price" rateInfoParams={rateInfoParams} />
      <QuoteDetails
        isCollapsible
        bridgeProvider={bridgeProvider}
        swapContext={swapContext}
        bridgeContext={bridgeContext}
      />
      {restContent}
    </>
  )
}

function renderSwapContent(
  receiveAmountInfo: ReceiveAmountInfo,
  slippage: Percent,
  rateInfoParams: RateInfoParams,
  recipient: string | null | undefined,
  account: string | undefined,
  labelsAndTooltips: LabelsAndTooltips,
  deadline: number,
) {
  return (restContent: ReactElement) => (
    <>
      <TradeBasicConfirmDetails
        rateInfoParams={rateInfoParams}
        slippage={slippage}
        receiveAmountInfo={receiveAmountInfo}
        recipient={recipient}
        account={account}
        labelsAndTooltips={labelsAndTooltips}
        hideLimitPrice
        hideUsdValues
        withTimelineDot={false}
      >
        <RowDeadline deadline={deadline} />
      </TradeBasicConfirmDetails>
      {restContent}
      <HighFeeWarning readonlyMode />
    </>
  )
}

function useSwapConfirmModalData(props: SwapConfirmModalProps): SwapConfirmModalData {
  const { inputCurrencyInfo, outputCurrencyInfo } = props

  const { account, chainId } = useWalletInfo()
  const { ensName } = useWalletDetails()
  const appData = useAppData()
  const receiveAmountInfo = useReceiveAmountInfo()
  const tradeConfirmActions = useTradeConfirmActions()
  const { slippage } = useSwapDerivedState()
  const [deadline] = useSwapDeadlineState()

  const shouldDisplayBridgeDetails = useShouldDisplayBridgeDetails()
  const { bridgeQuote, isLoading: isQuoteLoading } = useTradeQuote()

  const bridgeProvider = bridgeQuote?.providerInfo
  const bridgeQuoteAmounts = useBridgeQuoteAmounts(receiveAmountInfo, bridgeQuote)
  const swapContext = useQuoteSwapContext()
  const bridgeContext = useQuoteBridgeContext()

  const rateInfoParams = useRateInfoParams(inputCurrencyInfo.amount, outputCurrencyInfo.amount)
  const submittedContent = useOrderSubmittedContent(chainId, bridgeQuoteAmounts || undefined)
  const labelsAndTooltips = useLabelsAndTooltips()

  return {
    account,
    ensName,
    appData,
    receiveAmountInfo,
    tradeConfirmActions,
    slippage,
    deadline,
    shouldDisplayBridgeDetails,
    isQuoteLoading,
    bridgeProvider,
    bridgeQuoteAmounts,
    swapContext,
    bridgeContext,
    rateInfoParams,
    submittedContent,
    labelsAndTooltips,
  }
}

function getModalRenderContent(
  modalData: SwapConfirmModalData,
  recipient: string | null | undefined,
): ((restContent: ReactElement) => ReactElement) | undefined {
  const { shouldDisplayBridgeDetails, bridgeProvider, swapContext, bridgeContext, receiveAmountInfo, slippage } =
    modalData
  const shouldShowBridge = shouldDisplayBridgeDetails && bridgeProvider && swapContext && bridgeContext

  if (shouldShowBridge && receiveAmountInfo) {
    // TypeScript doesn't understand that shouldShowBridge guarantees these are defined
    return renderBridgeContent(bridgeProvider!, swapContext!, bridgeContext!, modalData.rateInfoParams)
  }

  if (receiveAmountInfo && slippage) {
    return renderSwapContent(
      receiveAmountInfo,
      slippage,
      modalData.rateInfoParams,
      recipient,
      modalData.account,
      modalData.labelsAndTooltips,
      modalData.deadline,
    )
  }

  return undefined
}

export function SwapConfirmModal(props: SwapConfirmModalProps): ReactElement {
  const { inputCurrencyInfo, outputCurrencyInfo, priceImpact, recipient, doTrade } = props
  const modalData = useSwapConfirmModalData(props)
  const disableConfirm = useDisableConfirmLogic(
    inputCurrencyInfo,
    modalData.shouldDisplayBridgeDetails,
    modalData.bridgeQuoteAmounts,
  )
  const buttonText = getButtonText(disableConfirm, inputCurrencyInfo)
  const renderContent = getModalRenderContent(modalData, recipient)

  return (
    <TradeConfirmModal title={CONFIRM_TITLE} submittedContent={modalData.submittedContent}>
      <TradeConfirmation
        title={CONFIRM_TITLE}
        account={modalData.account}
        ensName={modalData.ensName}
        inputCurrencyInfo={inputCurrencyInfo}
        outputCurrencyInfo={outputCurrencyInfo}
        onConfirm={doTrade}
        onDismiss={modalData.tradeConfirmActions.onDismiss}
        isConfirmDisabled={disableConfirm}
        priceImpact={priceImpact}
        buttonText={buttonText}
        recipient={recipient}
        appData={modalData.appData || undefined}
        refreshInterval={PRICE_UPDATE_INTERVAL}
        isQuoteLoading={modalData.isQuoteLoading}
      >
        {renderContent}
      </TradeConfirmation>
    </TradeConfirmModal>
  )
}
