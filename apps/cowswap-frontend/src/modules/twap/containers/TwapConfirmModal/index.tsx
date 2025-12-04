import React from 'react'

import { useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import { useAdvancedOrdersDerivedState } from 'modules/advancedOrders'
import {
  TradeConfirmation,
  TradeConfirmModal,
  useCommonTradeConfirmContext,
  useTradeConfirmActions,
  useTradePriceImpact,
} from 'modules/trade'
import { TradeBasicConfirmDetails } from 'modules/trade/containers/TradeBasicConfirmDetails'
import { DividerHorizontal } from 'modules/trade/pure/Row/styled'

import { useRateInfoParams } from 'common/hooks/useRateInfoParams'
import { NetworkCostsSuffix } from 'common/pure/NetworkCostsSuffix'

import { TwapConfirmDetails } from './TwapConfirmDetails'

import { useCreateTwapOrder } from '../../hooks/useCreateTwapOrder'
import { useIsFallbackHandlerRequired } from '../../hooks/useFallbackHandlerVerification'
import { useScaledReceiveAmountInfo } from '../../hooks/useScaledReceiveAmountInfo'
import { useTwapFormState } from '../../hooks/useTwapFormState'
import { useTwapOrder } from '../../hooks/useTwapOrder'
import { useTwapSlippage } from '../../hooks/useTwapSlippage'
import { TwapFormWarnings } from '../TwapFormWarnings'

const CONFIRM_TITLE = 'TWAP'

const getConfirmModalConfig = (): {
  priceLabel: string
  slippageLabel: string
  slippageTooltip: React.ReactNode
  limitPriceLabel: string
  limitPriceTooltip: React.ReactNode
  minReceivedLabel: string
  minReceivedTooltip: string
} => ({
  priceLabel: t`Rate`,
  slippageLabel: t`Price protection`,
  slippageTooltip: (
    <>
      <p>
        <Trans>
          Since TWAP orders consist of multiple parts, prices are expected to fluctuate. However, to protect you against
          bad prices, CoW Swap will not execute your TWAP if the price dips below this percentage.
        </Trans>
      </p>
      <p>
        <Trans>
          This percentage only applies to dips; if prices are better than this percentage, CoW Swap will still execute
          your order.
        </Trans>
      </p>
    </>
  ),
  limitPriceLabel: t`Limit price (incl. costs)`,
  limitPriceTooltip: (
    <Trans>
      If CoW Swap cannot get this price or better (taking into account fees and price protection tolerance), your TWAP
      will not execute. CoW Swap will <strong>always</strong> improve on this price if possible.
    </Trans>
  ),
  minReceivedLabel: t`Minimum receive`,
  minReceivedTooltip: t`This is the minimum amount that you will receive across your entire TWAP order, assuming all parts of the order execute.`,
})

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
export function TwapConfirmModal() {
  const confirmModalConfig = getConfirmModalConfig()
  const { account } = useWalletInfo()
  const { allowsOffchainSigning } = useWalletDetails()
  const commonTradeConfirmContext = useCommonTradeConfirmContext()
  const {
    inputCurrencyAmount,
    inputCurrencyFiatAmount,
    inputCurrencyBalance,
    outputCurrencyAmount,
    outputCurrencyFiatAmount,
    outputCurrencyBalance,
    recipient,
    recipientAddress,
  } = useAdvancedOrdersDerivedState()
  // TODO: there's some overlap with what's in each hook (useTwapOrder | useScaledReceiveAmountInfo)
  const twapOrder = useTwapOrder()
  const receiveAmountInfo = useScaledReceiveAmountInfo()
  const slippage = useTwapSlippage()
  const localFormValidation = useTwapFormState()
  const tradeConfirmActions = useTradeConfirmActions()
  const createTwapOrder = useCreateTwapOrder()

  const isConfirmDisabled = !!localFormValidation

  const priceImpact = useTradePriceImpact()
  const fallbackHandlerIsNotSet = useIsFallbackHandlerRequired()

  const inputCurrencyInfo = {
    amount: inputCurrencyAmount,
    fiatAmount: inputCurrencyFiatAmount,
    balance: inputCurrencyBalance,
    label: t`Sell amount`,
  }

  const outputCurrencyInfo = {
    amount: outputCurrencyAmount,
    fiatAmount: outputCurrencyFiatAmount,
    balance: outputCurrencyBalance,
    label: t`Receive (before fees)`,
  }

  const rateInfoParams = useRateInfoParams(inputCurrencyInfo.amount, outputCurrencyInfo.amount)

  const { timeInterval, numOfParts } = twapOrder || {}

  const partDuration = timeInterval
  const totalDuration = timeInterval && numOfParts ? timeInterval * numOfParts : undefined

  return (
    <TradeConfirmModal title={CONFIRM_TITLE}>
      <TradeConfirmation
        {...commonTradeConfirmContext}
        title={CONFIRM_TITLE}
        inputCurrencyInfo={inputCurrencyInfo}
        outputCurrencyInfo={outputCurrencyInfo}
        onConfirm={() => createTwapOrder(fallbackHandlerIsNotSet)}
        onDismiss={tradeConfirmActions.onDismiss}
        isConfirmDisabled={isConfirmDisabled}
        priceImpact={priceImpact}
        buttonText={t`Place TWAP order`}
        recipient={recipient}
      >
        {(warnings) => (
          <>
            {receiveAmountInfo && numOfParts && (
              <TradeBasicConfirmDetails
                rateInfoParams={rateInfoParams}
                receiveAmountInfo={receiveAmountInfo}
                slippage={slippage}
                recipient={recipient}
                recipientAddress={recipientAddress}
                account={account}
                labelsAndTooltips={{
                  ...confirmModalConfig,
                  networkCostsSuffix: !allowsOffchainSigning ? <NetworkCostsSuffix /> : null,
                  networkCostsTooltipSuffix: !allowsOffchainSigning ? (
                    <>
                      <br />
                      <br />
                      <Trans>
                        Because you are using a smart contract wallet, you will pay a separate gas cost for signing the
                        order placement on-chain.
                      </Trans>
                    </>
                  ) : null,
                }}
              />
            )}
            <DividerHorizontal />
            <TwapConfirmDetails
              startTime={twapOrder?.startTime}
              numOfParts={numOfParts}
              partDuration={partDuration}
              totalDuration={totalDuration}
            />
            {warnings}
            <TwapFormWarnings localFormValidation={localFormValidation} isConfirmationModal />
          </>
        )}
      </TradeConfirmation>
    </TradeConfirmModal>
  )
}
