import { useAtomValue } from 'jotai'
import { useState } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { useAdvancedOrdersDerivedState } from 'modules/advancedOrders'
import { TradeConfirmation, TradeConfirmModal, useTradeConfirmActions, useTradePriceImpact } from 'modules/trade'
import { TradeBasicConfirmDetails } from 'modules/trade/containers/TradeBasicConfirmDetails'
import { NoImpactWarning } from 'modules/trade/pure/NoImpactWarning'
import { DividerHorizontal } from 'modules/trade/pure/Row/styled'
import { PRICE_UPDATE_INTERVAL } from 'modules/tradeQuote/hooks/useTradeQuotePolling'

import { useRateInfoParams } from 'common/hooks/useRateInfoParams'

import { TwapConfirmDetails } from './TwapConfirmDetails'

import { useCreateTwapOrder } from '../../hooks/useCreateTwapOrder'
import { useIsFallbackHandlerRequired } from '../../hooks/useFallbackHandlerVerification'
import { useTwapFormState } from '../../hooks/useTwapFormState'
import { useTwapWarningsContext } from '../../hooks/useTwapWarningsContext'
import { partsStateAtom } from '../../state/partsStateAtom'
import { twapOrderAtom } from '../../state/twapOrderAtom'
import { twapOrderSlippageAtom } from '../../state/twapOrdersSettingsAtom'
import { TwapFormWarnings } from '../TwapFormWarnings'

const CONFIRM_TITLE = 'TWAP'

export function TwapConfirmModal() {
  const { account } = useWalletInfo()
  const {
    inputCurrencyAmount,
    inputCurrencyFiatAmount,
    inputCurrencyBalance,
    outputCurrencyAmount,
    outputCurrencyFiatAmount,
    outputCurrencyBalance,
    recipient,
  } = useAdvancedOrdersDerivedState()
  // TODO: there's some overlap with what's in each atom
  const twapOrder = useAtomValue(twapOrderAtom)
  const slippage = useAtomValue(twapOrderSlippageAtom)
  const partsState = useAtomValue(partsStateAtom)
  const { showPriceImpactWarning } = useTwapWarningsContext()
  const localFormValidation = useTwapFormState()
  const tradeConfirmActions = useTradeConfirmActions()
  const createTwapOrder = useCreateTwapOrder()

  const isInvertedState = useState(false)

  const isConfirmDisabled = !!localFormValidation

  const priceImpact = useTradePriceImpact()
  const fallbackHandlerIsNotSet = useIsFallbackHandlerRequired()

  const inputCurrencyInfo = {
    amount: inputCurrencyAmount,
    fiatAmount: inputCurrencyFiatAmount,
    balance: inputCurrencyBalance,
    label: 'Sell amount',
  }

  const outputCurrencyInfo = {
    amount: outputCurrencyAmount,
    fiatAmount: outputCurrencyFiatAmount,
    balance: outputCurrencyBalance,
    label: 'Estimated receive amount',
  }

  const rateInfoParams = useRateInfoParams(inputCurrencyInfo.amount, outputCurrencyInfo.amount)

  // This already takes into account the full order
  const minReceivedAmount = twapOrder?.buyAmount

  const { timeInterval, numOfParts } = twapOrder || {}

  const partDuration = timeInterval
  const totalDuration = timeInterval && numOfParts ? timeInterval * numOfParts : undefined

  return (
    <TradeConfirmModal title={CONFIRM_TITLE}>
      <TradeConfirmation
        title={CONFIRM_TITLE}
        account={account}
        inputCurrencyInfo={inputCurrencyInfo}
        outputCurrencyInfo={outputCurrencyInfo}
        onConfirm={() => createTwapOrder(fallbackHandlerIsNotSet)}
        onDismiss={tradeConfirmActions.onDismiss}
        isConfirmDisabled={isConfirmDisabled}
        priceImpact={priceImpact}
        buttonText={'Place TWAP order'}
        refreshInterval={PRICE_UPDATE_INTERVAL}
        recipient={recipient}
      >
        <>
          <TradeBasicConfirmDetails
            rateInfoParams={rateInfoParams}
            minReceiveAmount={minReceivedAmount}
            isInvertedState={isInvertedState}
            slippage={slippage}
            additionalProps={{
              priceLabel: 'Rate (incl. costs)',
              slippageLabel: 'Price protection',
              slippageTooltip: (
                <>
                  <p>
                    Since TWAP orders consist of multiple parts, prices are expected to fluctuate. However, to protect
                    you against bad prices, CoW Swap will not execute your TWAP if the price dips below this percentage.
                  </p>
                  <p>
                    This percentage only applies to dips; if prices are better than this percentage, CoW Swap will still
                    execute your order.
                  </p>
                </>
              ),
              limitPriceLabel: 'Limit price',
              limitPriceTooltip: (
                <>
                  If CoW Swap cannot get this price or better (taking into account fees and price protection tolerance),
                  your TWAP will not execute. CoW Swap will <strong>always</strong> improve on this price if possible.
                </>
              ),
              minReceivedLabel: 'Minimum receive',
              minReceivedTooltip:
                'This is the minimum amount that you will receive across your entire TWAP order, assuming all parts of the order execute.',
            }}
          />
          <DividerHorizontal />
          <TwapConfirmDetails
            startTime={twapOrder?.startTime}
            partDuration={partDuration}
            partsState={partsState}
            totalDuration={totalDuration}
          />
          {showPriceImpactWarning && <NoImpactWarning withoutAccepting={true} isAccepted={true} />}
          <TwapFormWarnings localFormValidation={localFormValidation} isConfirmationModal />
        </>
      </TradeConfirmation>
    </TradeConfirmModal>
  )
}
