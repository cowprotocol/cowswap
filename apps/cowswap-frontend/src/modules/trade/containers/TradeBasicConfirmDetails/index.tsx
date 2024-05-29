import React, { Dispatch, ReactNode, SetStateAction } from 'react'

import { CowSwapWidgetAppParams } from '@cowprotocol/widget-lib'
import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { useUsdAmount } from 'modules/usdAmount'

import { usePrice } from 'common/hooks/usePrice'
import { PercentDisplay } from 'common/pure/PercentDisplay'
import { RateInfoParams } from 'common/pure/RateInfo'

import { LimitPriceRow } from './LimitPriceRow'
import * as styledEl from './styled'

import { getDirectedReceiveAmounts } from '../../hooks/useReceiveAmountInfo'
import { ReviewOrderModalAmountRow } from '../../pure/ReviewOrderModalAmountRow'
import { ReceiveAmountInfo } from '../../types'

type Props = {
  numOfParts: number
  receiveAmountInfo: ReceiveAmountInfo
  rateInfoParams: RateInfoParams
  // TODO: Add maxSendAmount when using component in swap/limit BUY orders
  minReceiveAmount: Nullish<CurrencyAmount<Currency>>
  isInvertedState: [boolean, Dispatch<SetStateAction<boolean>>]
  slippage: Percent
  additionalProps?: AdditionalProps
  widgetParams: Partial<CowSwapWidgetAppParams>
}

type AdditionalProps = {
  priceLabel?: ReactNode
  minReceivedLabel?: ReactNode
  minReceivedTooltip?: ReactNode
  limitPriceLabel?: ReactNode
  limitPriceTooltip?: ReactNode
  slippageLabel?: ReactNode
  slippageTooltip?: ReactNode
}

export function TradeBasicConfirmDetails(props: Props) {
  const {
    numOfParts,
    rateInfoParams,
    minReceiveAmount,
    isInvertedState,
    slippage,
    additionalProps,
    receiveAmountInfo,
    widgetParams,
  } = props
  const { inputCurrencyAmount } = rateInfoParams
  const { amountAfterFees, networkFeeAmount } = getDirectedReceiveAmounts(receiveAmountInfo)
  const {
    costs: {
      partnerFee: { amount: partnerFeeAmount },
    },
  } = receiveAmountInfo

  const priceLabel = additionalProps?.priceLabel || 'Price'
  const minReceivedLabel = additionalProps?.minReceivedLabel || 'Min received (incl. costs)'
  const minReceivedTooltip = additionalProps?.minReceivedTooltip || 'This is the minimum amount that you will receive.'

  const amountAfterFeesFull = amountAfterFees.multiply(numOfParts)

  const partnerFeeUsd = useUsdAmount(partnerFeeAmount).value
  const minReceivedUsd = useUsdAmount(minReceiveAmount).value
  const amountAfterFeesUsd = useUsdAmount(amountAfterFeesFull).value
  const networkFeeAmountUsd = useUsdAmount(networkFeeAmount).value

  // Limit price is the same for all parts
  const limitPrice = usePrice(inputCurrencyAmount, minReceiveAmount)

  return (
    <styledEl.Wrapper>
      {/* Price */}
      <styledEl.StyledRateInfo
        label={priceLabel}
        stylized={true}
        rateInfoParams={rateInfoParams}
        isInvertedState={isInvertedState}
      />

      <ReviewOrderModalAmountRow
        withTimelineDot={true}
        amount={networkFeeAmount}
        fiatAmount={networkFeeAmountUsd}
        tooltip={'TODO'}
        label="Network costs (est.)"
      />

      <ReviewOrderModalAmountRow
        withTimelineDot={true}
        amount={partnerFeeAmount}
        fiatAmount={partnerFeeUsd}
        tooltip={widgetParams.content?.feeTooltipMarkdown || 'TODO'}
        label="Total fee"
      />

      <ReviewOrderModalAmountRow
        highlighted={true}
        amount={amountAfterFeesFull}
        fiatAmount={amountAfterFeesUsd}
        tooltip={'TODO'}
        label="Expected to receive"
      />

      {/* Slippage */}
      <ReviewOrderModalAmountRow
        withTimelineDot={true}
        tooltip={additionalProps?.slippageTooltip}
        label={additionalProps?.slippageLabel}
      >
        <PercentDisplay percent={+slippage.toFixed(2)} />
      </ReviewOrderModalAmountRow>

      {/* Limit Price */}
      <LimitPriceRow price={limitPrice} isInvertedState={isInvertedState} {...additionalProps} />

      {/* Min received */}
      <ReviewOrderModalAmountRow
        highlighted={true}
        amount={minReceiveAmount}
        fiatAmount={minReceivedUsd}
        tooltip={minReceivedTooltip}
        label={minReceivedLabel}
      />
    </styledEl.Wrapper>
  )
}
