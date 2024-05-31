import React, { Dispatch, ReactNode, SetStateAction } from 'react'

import { CowSwapWidgetAppParams } from '@cowprotocol/widget-lib'
import { Percent } from '@uniswap/sdk-core'

import { useUsdAmount } from 'modules/usdAmount'

import { PercentDisplay } from 'common/pure/PercentDisplay'
import { RateInfoParams } from 'common/pure/RateInfo'

import { LimitPriceRow } from './LimitPriceRow'
import * as styledEl from './styled'

import { ReviewOrderModalAmountRow } from '../../pure/ReviewOrderModalAmountRow'
import { ReceiveAmountInfo } from '../../types'
import { getDirectedReceiveAmounts } from '../../utils/getReceiveAmountInfo'

type Props = {
  numOfParts: number
  receiveAmountInfo: ReceiveAmountInfo
  rateInfoParams: RateInfoParams
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
  const { numOfParts, rateInfoParams, isInvertedState, slippage, additionalProps, receiveAmountInfo, widgetParams } =
    props
  const { networkFeeAmount, amountAfterFees, amountAfterSlippage } = getDirectedReceiveAmounts(receiveAmountInfo)
  const {
    costs: {
      partnerFee: { amount: partnerFeeAmount },
    },
  } = receiveAmountInfo

  const priceLabel = additionalProps?.priceLabel || 'Price'
  const minReceivedLabel = additionalProps?.minReceivedLabel || 'Min received (incl. costs)'
  const minReceivedTooltip = additionalProps?.minReceivedTooltip || 'This is the minimum amount that you will receive.'

  const amountAfterFeesFull = amountAfterFees.multiply(numOfParts)
  const amountAfterSlippageFull = amountAfterSlippage.multiply(numOfParts)

  const partnerFeeUsd = useUsdAmount(partnerFeeAmount).value
  const amountAfterSlippageUsd = useUsdAmount(amountAfterSlippageFull).value
  const amountAfterFeesUsd = useUsdAmount(amountAfterFeesFull).value
  const networkFeeAmountUsd = useUsdAmount(networkFeeAmount).value

  // Limit price is the same for all parts
  const limitPrice = receiveAmountInfo.quotePrice

  return (
    <styledEl.Wrapper>
      {/* Price */}
      <styledEl.StyledRateInfo
        label={priceLabel}
        stylized={true}
        rateInfoParams={rateInfoParams}
        isInvertedState={isInvertedState}
      />

      {networkFeeAmount.greaterThan(0) && (
        <ReviewOrderModalAmountRow
          withTimelineDot={true}
          amount={networkFeeAmount}
          fiatAmount={networkFeeAmountUsd}
          tooltip={'TODO'}
          label="Network costs (est.)"
        />
      )}

      {partnerFeeAmount.greaterThan(0) && (
        <ReviewOrderModalAmountRow
          withTimelineDot={true}
          amount={partnerFeeAmount}
          fiatAmount={partnerFeeUsd}
          tooltip={widgetParams.content?.feeTooltipMarkdown || 'TODO'}
          label="Total fee"
        />
      )}

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
        amount={amountAfterSlippageFull}
        fiatAmount={amountAfterSlippageUsd}
        tooltip={minReceivedTooltip}
        label={minReceivedLabel}
      />
    </styledEl.Wrapper>
  )
}
