import React, { Dispatch, ReactNode, SetStateAction } from 'react'

import { TokenAmount } from '@cowprotocol/ui'
import { CowSwapWidgetAppParams } from '@cowprotocol/widget-lib'
import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { useUsdAmount } from 'modules/usdAmount'

import { usePrice } from 'common/hooks/usePrice'
import { RateInfoParams } from 'common/pure/RateInfo'

import { LimitPriceRow } from './LimitPriceRow'
import { SlippageRow } from './SlippageRow'
import * as styledEl from './styled'

import { ConfirmDetailsItem } from '../../pure/ConfirmDetailsItem'
import { ReviewOrderModalAmountRow } from '../../pure/ReviewOrderModalAmountRow'
import { RowPartnerFee } from '../../pure/RowPartnerFee'
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
  const { networkFeeAmount, partnerFeeAmount, amountAfterFees } = receiveAmountInfo

  const priceLabel = additionalProps?.priceLabel || 'Price'
  const minReceivedLabel = additionalProps?.minReceivedLabel || 'Min received (incl. costs)'
  const minReceivedTooltip = additionalProps?.minReceivedTooltip || 'This is the minimum amount that you will receive.'

  const amountAfterFeesFull = amountAfterFees.multiply(numOfParts)

  const partnerFeeUsd = useUsdAmount(partnerFeeAmount).value
  const minReceivedUsd = useUsdAmount(minReceiveAmount).value
  const amountAfterFeesUsd = useUsdAmount(amountAfterFeesFull).value

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

      {/*TODO: display the fee in buy token currency*/}
      <ConfirmDetailsItem label="Network costs (est.)" tooltip="TODO" withTimelineDot={true} labelOpacity>
        <TokenAmount amount={networkFeeAmount} tokenSymbol={networkFeeAmount?.currency} />
      </ConfirmDetailsItem>

      <ConfirmDetailsItem withTimelineDot={true}>
        <RowPartnerFee
          partnerFee={widgetParams.partnerFee}
          feeAmount={partnerFeeAmount}
          feeInFiat={partnerFeeUsd}
          label={'Total fee'}
          marginBottom={0}
          tooltipMarkdown={widgetParams.content?.feeTooltipMarkdown}
        />
      </ConfirmDetailsItem>

      <ReviewOrderModalAmountRow
        highlighted={true}
        amount={amountAfterFeesFull}
        fiatAmount={amountAfterFeesUsd}
        tooltip={'TODO'}
        label="Expected to receive"
      />

      {/* Slippage */}
      <SlippageRow slippage={slippage} {...additionalProps} />

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
