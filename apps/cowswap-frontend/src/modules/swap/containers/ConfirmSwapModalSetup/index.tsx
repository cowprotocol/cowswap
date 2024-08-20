import { useCallback, useMemo, useState } from 'react'

import { getMinimumReceivedTooltip } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useENS } from '@cowprotocol/ens'
import { Command } from '@cowprotocol/types'
import { useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'
import { CurrencyAmount, Percent, TradeType } from '@uniswap/sdk-core'

import { HighFeeWarning } from 'legacy/components/SwapWarnings'
import { useActivityDerivedState } from 'legacy/hooks/useActivityDerivedState'
import { PriceImpact } from 'legacy/hooks/usePriceImpact'
import { useMultipleActivityDescriptors } from 'legacy/hooks/useRecentActivity'
import { Order } from 'legacy/state/orders/actions'
import { useOrder } from 'legacy/state/orders/hooks'
import TradeGp from 'legacy/state/swap/TradeGp'

import { useInjectedWidgetParams } from 'modules/injectedWidget'
import {
  parameterizeTradeRoute,
  TradeConfirmation,
  TradeConfirmModal,
  useReceiveAmountInfo,
  useTradeConfirmActions,
  useTradeConfirmState,
} from 'modules/trade'
import { TradeBasicConfirmDetails } from 'modules/trade/containers/TradeBasicConfirmDetails'
import { NoImpactWarning } from 'modules/trade/pure/NoImpactWarning'

import { Routes } from 'common/constants/routes'
import { useOrderProgressBarV2Props } from 'common/hooks/orderProgressBarV2'
import { useCancelOrder } from 'common/hooks/useCancelOrder'
import { useGetSurplusData } from 'common/hooks/useGetSurplusFiatValue'
import { useNavigate } from 'common/hooks/useNavigate'
import { CurrencyPreviewInfo } from 'common/pure/CurrencyAmountPreview'
import { NetworkCostsSuffix } from 'common/pure/NetworkCostsSuffix'
import { RateInfoParams } from 'common/pure/RateInfo'
import { TransactionSubmittedContent } from 'common/pure/TransactionSubmittedContent'
import useNativeCurrency from 'lib/hooks/useNativeCurrency'

import { TradeUrlParams } from '../../../trade/types/TradeRawState'
import { useIsEoaEthFlow } from '../../hooks/useIsEoaEthFlow'
import { useShouldPayGas } from '../../hooks/useShouldPayGas'
import { useSwapConfirmButtonText } from '../../hooks/useSwapConfirmButtonText'
import { useSwapState } from '../../hooks/useSwapState'
import { NetworkCostsTooltipSuffix } from '../../pure/NetworkCostsTooltipSuffix'
import { getNativeSlippageTooltip, getNonNativeSlippageTooltip } from '../../pure/Row/RowSlippageContent'
import { RowDeadline } from '../Row/RowDeadline'

const CONFIRM_TITLE = 'Swap'

export interface ConfirmSwapModalSetupProps {
  chainId: SupportedChainId
  inputCurrencyInfo: CurrencyPreviewInfo
  outputCurrencyInfo: CurrencyPreviewInfo
  priceImpact: PriceImpact
  rateInfoParams: RateInfoParams
  refreshInterval: number
  allowedSlippage: Percent
  trade: TradeGp | undefined

  doTrade(): void
}

export function ConfirmSwapModalSetup(props: ConfirmSwapModalSetupProps) {
  const {
    chainId,
    inputCurrencyInfo,
    outputCurrencyInfo,
    doTrade,
    priceImpact,
    allowedSlippage,
    trade,
    refreshInterval,
    rateInfoParams,
  } = props

  const { account } = useWalletInfo()
  const { ensName } = useWalletDetails()
  const { recipient } = useSwapState()
  const tradeConfirmActions = useTradeConfirmActions()
  const receiveAmountInfo = useReceiveAmountInfo()
  const widgetParams = useInjectedWidgetParams()
  const shouldPayGas = useShouldPayGas()
  const isEoaEthFlow = useIsEoaEthFlow()
  const nativeCurrency = useNativeCurrency()

  const isInvertedState = useState(false)

  const slippageAdjustedSellAmount = trade?.maximumAmountIn(allowedSlippage)
  const isExactIn = trade?.tradeType === TradeType.EXACT_INPUT

  const buttonText = useSwapConfirmButtonText(slippageAdjustedSellAmount)

  const labelsAndTooltips = useMemo(
    () => ({
      slippageLabel: isEoaEthFlow ? 'Slippage tolerance (modified)' : undefined,
      slippageTooltip: isEoaEthFlow
        ? getNativeSlippageTooltip(chainId, [nativeCurrency.symbol])
        : getNonNativeSlippageTooltip(),
      expectReceiveLabel: isExactIn ? 'Expected to receive' : 'Expected to sell',
      minReceivedLabel: isExactIn ? 'Minimum receive' : 'Maximum sent',
      minReceivedTooltip: getMinimumReceivedTooltip(allowedSlippage, isExactIn),
      networkCostsSuffix: shouldPayGas ? <NetworkCostsSuffix /> : null,
      networkCostsTooltipSuffix: <NetworkCostsTooltipSuffix />,
    }),
    [chainId, allowedSlippage, nativeCurrency.symbol, isEoaEthFlow, isExactIn, shouldPayGas]
  )

  const submittedContent = useSubmittedContent(chainId)

  return (
    <TradeConfirmModal title={CONFIRM_TITLE} submittedContent={submittedContent}>
      <TradeConfirmation
        title={CONFIRM_TITLE}
        account={account}
        ensName={ensName}
        refreshInterval={refreshInterval}
        inputCurrencyInfo={inputCurrencyInfo}
        outputCurrencyInfo={outputCurrencyInfo}
        onConfirm={doTrade}
        onDismiss={tradeConfirmActions.onDismiss}
        isConfirmDisabled={false}
        priceImpact={priceImpact}
        buttonText={buttonText}
        recipient={recipient}
      >
        <>
          {receiveAmountInfo && (
            <TradeBasicConfirmDetails
              isInvertedState={isInvertedState}
              rateInfoParams={rateInfoParams}
              slippage={allowedSlippage}
              receiveAmountInfo={receiveAmountInfo}
              widgetParams={widgetParams}
              labelsAndTooltips={labelsAndTooltips}
              recipient={recipient}
              account={account}
              hideLimitPrice
              hideUsdValues
              withTimelineDot={false}
              alwaysRow
            >
              <RowDeadline />
            </TradeBasicConfirmDetails>
          )}
          <HighFeeWarning trade={trade} />
          {!priceImpact.priceImpact && <NoImpactWarning isAccepted withoutAccepting />}
        </>
      </TradeConfirmation>
    </TradeConfirmModal>
  )
}

function useSubmittedContent(chainId: SupportedChainId) {
  const { transactionHash } = useTradeConfirmState()
  const order = useOrder({ chainId, id: transactionHash || undefined })

  const orderProgressBarV2Props = useSetupAdditionalProgressBarProps(chainId, order)

  const navigateToNewOrderCallback = useNavigateToNewOrderCallback()

  return useCallback(
    (onDismiss: Command) => (
      <TransactionSubmittedContent
        chainId={chainId}
        hash={transactionHash || undefined}
        onDismiss={onDismiss}
        activityDerivedState={orderProgressBarV2Props.activityDerivedState}
        orderProgressBarV2Props={orderProgressBarV2Props}
        navigateToNewOrderCallback={navigateToNewOrderCallback}
      />
    ),
    [chainId, transactionHash, orderProgressBarV2Props, order, navigateToNewOrderCallback]
  )
}

// TODO: doesn't belong here
export function useSetupAdditionalProgressBarProps(chainId: SupportedChainId, order: Order | undefined) {
  const orderId = order?.id
  const [activity] = useMultipleActivityDescriptors({ chainId, ids: orderId ? [orderId] : [] })
  const activityDerivedState = useActivityDerivedState({ chainId, activity })
  const progressBarV2Props = useOrderProgressBarV2Props({ chainId, activityDerivedState })

  const getCancellation = useCancelOrder()
  const showCancellationModal = useMemo(
    // Sort of duplicate cancellation logic since ethflow on creating state don't have progress bar props
    () => progressBarV2Props?.showCancellationModal || (order && getCancellation ? getCancellation(order) : null),
    [progressBarV2Props?.showCancellationModal, order, getCancellation]
  )
  const surplusData = useGetSurplusData(order)
  const receiverEnsName = useENS(order?.receiver).name || undefined

  return useMemo(() => {
    const data = { ...progressBarV2Props, activityDerivedState, surplusData, chainId, receiverEnsName, showCancellationModal, isProgressBarSetup: true }

    if (!progressBarV2Props) {
      // Not setup, but cancellation still needed for ethflow
      return { ...data, isProgressBarSetup: false }
    }
    // Add supplementary stuff
    return data
  }, [progressBarV2Props, activityDerivedState, surplusData, chainId, receiverEnsName, showCancellationModal])
}

// TODO: move to its own file/module
export type NavigateToNewOrderCallback = (chainId: SupportedChainId, order?: Order, callback?: Command) => () => void

export function useNavigateToNewOrderCallback(): NavigateToNewOrderCallback {
  const navigate = useNavigate()

  return useCallback(
    (chainId: SupportedChainId, order?: Order, callback?: Command) => {
      const inputCurrencyAmount = order
        ? CurrencyAmount.fromRawAmount(order.inputToken, order.sellAmount).toFixed(order.inputToken.decimals)
        : ''
      const outputCurrencyAmount = order
        ? CurrencyAmount.fromRawAmount(order.outputToken, order.buyAmount).toFixed(order.outputToken.decimals)
        : ''

      const tradeUrlParam: TradeUrlParams = {
        chainId: String(chainId),
        inputCurrencyId: order?.sellToken,
        inputCurrencyAmount,
        outputCurrencyId: order?.buyToken,
        outputCurrencyAmount,
        orderKind: order?.kind,
      }
      const swapLink = parameterizeTradeRoute(tradeUrlParam, Routes.SWAP, true)

      return () => {
        navigate(swapLink)
        callback?.()
      }
    },
    [navigate]
  )
}
