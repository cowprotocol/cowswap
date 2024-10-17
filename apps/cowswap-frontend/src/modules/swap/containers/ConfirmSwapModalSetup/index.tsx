import { useCallback, useMemo, useState } from 'react'

import { getMinimumReceivedTooltip } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Command } from '@cowprotocol/types'
import { useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'
import { Percent, TradeType } from '@uniswap/sdk-core'

import { HighFeeWarning } from 'legacy/components/SwapWarnings'
import { PriceImpact } from 'legacy/hooks/usePriceImpact'
import { useOrder } from 'legacy/state/orders/hooks'
import TradeGp from 'legacy/state/swap/TradeGp'

import { useInjectedWidgetParams } from 'modules/injectedWidget'
import { useIsSmartSlippageApplied } from 'modules/swap/hooks/useIsSmartSlippageApplied'
import {
  TradeConfirmation,
  TradeConfirmModal,
  useReceiveAmountInfo,
  useTradeConfirmActions,
  useTradeConfirmState,
} from 'modules/trade'
import { TradeBasicConfirmDetails } from 'modules/trade/containers/TradeBasicConfirmDetails'
import { NoImpactWarning } from 'modules/trade/pure/NoImpactWarning'

import { useOrderProgressBarV2Props } from 'common/hooks/orderProgressBarV2'
import { CurrencyPreviewInfo } from 'common/pure/CurrencyAmountPreview'
import { NetworkCostsSuffix } from 'common/pure/NetworkCostsSuffix'
import { RateInfoParams } from 'common/pure/RateInfo'
import { TransactionSubmittedContent } from 'common/pure/TransactionSubmittedContent'
import useNativeCurrency from 'lib/hooks/useNativeCurrency'

import { useBaseFlowContextSource } from '../../hooks/useFlowContext'
import { useIsEoaEthFlow } from '../../hooks/useIsEoaEthFlow'
import { useNavigateToNewOrderCallback } from '../../hooks/useNavigateToNewOrderCallback'
import { useShouldPayGas } from '../../hooks/useShouldPayGas'
import { useSwapConfirmButtonText } from '../../hooks/useSwapConfirmButtonText'
import { useSwapState } from '../../hooks/useSwapState'
import { NetworkCostsTooltipSuffix } from '../../pure/NetworkCostsTooltipSuffix'
import { getNativeSlippageTooltip, getNonNativeSlippageTooltip } from '../../pure/Row/RowSlippageContent'
import { RowDeadline } from '../Row/RowDeadline'
import { useSmartSwapSlippage } from '../../hooks/useSwapSlippage'

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
  const baseFlowContextSource = useBaseFlowContextSource()

  const isInvertedState = useState(false)

  const slippageAdjustedSellAmount = trade?.maximumAmountIn(allowedSlippage)
  const isExactIn = trade?.tradeType === TradeType.EXACT_INPUT

  const buttonText = useSwapConfirmButtonText(slippageAdjustedSellAmount)

  const isSmartSlippageApplied = useIsSmartSlippageApplied()
  const smartSlippage = useSmartSwapSlippage()

  const labelsAndTooltips = useMemo(
    () => ({
      slippageLabel:
        isEoaEthFlow || isSmartSlippageApplied
          ? `Slippage tolerance (${isEoaEthFlow ? 'modified' : 'dynamic'})`
          : undefined,
      slippageTooltip: isEoaEthFlow
        ? getNativeSlippageTooltip(chainId, [nativeCurrency.symbol])
        : getNonNativeSlippageTooltip({ isDynamic: !!smartSlippage }),
      expectReceiveLabel: isExactIn ? 'Expected to receive' : 'Expected to sell',
      minReceivedLabel: isExactIn ? 'Minimum receive' : 'Maximum sent',
      minReceivedTooltip: getMinimumReceivedTooltip(allowedSlippage, isExactIn),
      networkCostsSuffix: shouldPayGas ? <NetworkCostsSuffix /> : null,
      networkCostsTooltipSuffix: <NetworkCostsTooltipSuffix />,
    }),
    [chainId, allowedSlippage, nativeCurrency.symbol, isEoaEthFlow, isExactIn, shouldPayGas],
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
        appData={baseFlowContextSource?.appData || undefined}
      >
        {(restContent) => (
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
            {restContent}
            <HighFeeWarning trade={trade} />
            {!priceImpact.priceImpact && <NoImpactWarning isAccepted withoutAccepting />}
          </>
        )}
      </TradeConfirmation>
    </TradeConfirmModal>
  )
}

function useSubmittedContent(chainId: SupportedChainId) {
  const { transactionHash } = useTradeConfirmState()
  const order = useOrder({ chainId, id: transactionHash || undefined })

  const orderProgressBarV2Props = useOrderProgressBarV2Props(chainId, order)

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
    [chainId, transactionHash, orderProgressBarV2Props, navigateToNewOrderCallback],
  )
}
