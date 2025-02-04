import { useMemo } from 'react'

import { getMinimumReceivedTooltip } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'
import { Percent, TradeType } from '@uniswap/sdk-core'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'
import TradeGp from 'legacy/state/swap/TradeGp'
import { useUserTransactionTTL } from 'legacy/state/user/hooks'

import { useAppData } from 'modules/appData'
import {
  TradeConfirmation,
  TradeConfirmModal,
  useIsEoaEthFlow,
  useOrderSubmittedContent,
  useReceiveAmountInfo,
  useShouldPayGas,
  useTradeConfirmActions,
} from 'modules/trade'
import { TradeBasicConfirmDetails } from 'modules/trade/containers/TradeBasicConfirmDetails'
import { useIsSmartSlippageApplied, useSmartTradeSlippage } from 'modules/tradeSlippage'
import { HighFeeWarning, NetworkCostsTooltipSuffix, RowDeadline } from 'modules/tradeWidgetAddons'

import { CurrencyPreviewInfo } from 'common/pure/CurrencyAmountPreview'
import { NetworkCostsSuffix } from 'common/pure/NetworkCostsSuffix'
import { RateInfoParams } from 'common/pure/RateInfo'
import { getNativeSlippageTooltip, getNonNativeSlippageTooltip } from 'common/utils/tradeSettingsTooltips'
import useNativeCurrency from 'lib/hooks/useNativeCurrency'

import { useSwapConfirmButtonText } from '../../hooks/useSwapConfirmButtonText'
import { useSwapState } from '../../hooks/useSwapState'

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
  const shouldPayGas = useShouldPayGas()
  const isEoaEthFlow = useIsEoaEthFlow()
  const nativeCurrency = useNativeCurrency()
  const appData = useAppData()
  const [userDeadline] = useUserTransactionTTL()

  const slippageAdjustedSellAmount = trade?.maximumAmountIn(allowedSlippage)
  const isExactIn = trade?.tradeType === TradeType.EXACT_INPUT

  const buttonText = useSwapConfirmButtonText(slippageAdjustedSellAmount)

  const isSmartSlippageApplied = useIsSmartSlippageApplied()
  const smartSlippage = useSmartTradeSlippage()

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
    [
      chainId,
      allowedSlippage,
      nativeCurrency.symbol,
      isEoaEthFlow,
      isExactIn,
      shouldPayGas,
      isSmartSlippageApplied,
      smartSlippage,
    ],
  )

  const submittedContent = useOrderSubmittedContent(chainId)

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
        appData={appData || undefined}
      >
        {(restContent) => (
          <>
            {receiveAmountInfo && (
              <TradeBasicConfirmDetails
                rateInfoParams={rateInfoParams}
                slippage={allowedSlippage}
                receiveAmountInfo={receiveAmountInfo}
                labelsAndTooltips={labelsAndTooltips}
                recipient={recipient}
                account={account}
                hideLimitPrice
                hideUsdValues
                withTimelineDot={false}
              >
                <RowDeadline deadline={userDeadline} />
              </TradeBasicConfirmDetails>
            )}
            {restContent}
            <HighFeeWarning readonlyMode />
          </>
        )}
      </TradeConfirmation>
    </TradeConfirmModal>
  )
}
