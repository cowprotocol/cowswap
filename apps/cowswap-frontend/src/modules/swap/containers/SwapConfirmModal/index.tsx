import { useSafaryTradeTracking, SafaryTradeType } from '@cowprotocol/analytics'
import { useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

import ms from 'ms.macro'

import type { PriceImpact } from 'legacy/hooks/usePriceImpact'

import { useAppData } from 'modules/appData'
import {
  TradeBasicConfirmDetails,
  TradeConfirmation,
  TradeConfirmModal,
  useOrderSubmittedContent,
  useReceiveAmountInfo,
  useTradeConfirmActions,
} from 'modules/trade'
import { HighFeeWarning, RowDeadline } from 'modules/tradeWidgetAddons'

import { useRateInfoParams } from 'common/hooks/useRateInfoParams'
import { CurrencyPreviewInfo } from 'common/pure/CurrencyAmountPreview'

import { useLabelsAndTooltips } from './useLabelsAndTooltips'

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

export function SwapConfirmModal(props: SwapConfirmModalProps) {
  const { inputCurrencyInfo, outputCurrencyInfo, priceImpact, recipient, doTrade: originalDoTrade } = props

  const { account, chainId } = useWalletInfo()
  const { ensName } = useWalletDetails()
  const appData = useAppData()
  const receiveAmountInfo = useReceiveAmountInfo()
  const tradeConfirmActions = useTradeConfirmActions()
  const { slippage } = useSwapDerivedState()
  const [deadline] = useSwapDeadlineState()

  const rateInfoParams = useRateInfoParams(inputCurrencyInfo.amount, outputCurrencyInfo.amount)
  const submittedContent = useOrderSubmittedContent(chainId)
  const labelsAndTooltips = useLabelsAndTooltips()

  // Use a custom hook to enhance doTrade with Safary tracking
  const doTrade = useSafaryTradeTracking({
    account,
    inputCurrencyInfo: {
      symbol: inputCurrencyInfo.amount?.currency.symbol,
      amount: inputCurrencyInfo.amount,
      fiatAmount: inputCurrencyInfo.fiatAmount
        ? typeof inputCurrencyInfo.fiatAmount === 'number'
          ? inputCurrencyInfo.fiatAmount
          : Number(inputCurrencyInfo.fiatAmount.toSignificant(6))
        : null,
    },
    outputCurrencyInfo: {
      symbol: outputCurrencyInfo.amount?.currency.symbol,
      amount: outputCurrencyInfo.amount,
      fiatAmount: outputCurrencyInfo.fiatAmount
        ? typeof outputCurrencyInfo.fiatAmount === 'number'
          ? outputCurrencyInfo.fiatAmount
          : Number(outputCurrencyInfo.fiatAmount.toSignificant(6))
        : null,
    },
    contractAddress: inputCurrencyInfo.amount?.currency.isToken ? inputCurrencyInfo.amount.currency.address : undefined,
    tradeType: SafaryTradeType.SWAP_ORDER,
    tradeFn: originalDoTrade,
  })

  return (
    <TradeConfirmModal title={CONFIRM_TITLE} submittedContent={submittedContent}>
      <TradeConfirmation
        title={CONFIRM_TITLE}
        account={account}
        ensName={ensName}
        inputCurrencyInfo={inputCurrencyInfo}
        outputCurrencyInfo={outputCurrencyInfo}
        onConfirm={doTrade}
        onDismiss={tradeConfirmActions.onDismiss}
        isConfirmDisabled={false}
        priceImpact={priceImpact}
        buttonText="Confirm Swap"
        recipient={recipient}
        appData={appData || undefined}
        refreshInterval={PRICE_UPDATE_INTERVAL}
      >
        {(restContent) => (
          <>
            {receiveAmountInfo && slippage && (
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
            )}
            {restContent}
            <HighFeeWarning readonlyMode />
          </>
        )}
      </TradeConfirmation>
    </TradeConfirmModal>
  )
}
