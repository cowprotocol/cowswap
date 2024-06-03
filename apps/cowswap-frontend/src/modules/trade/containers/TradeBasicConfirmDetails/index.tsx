import React, { Dispatch, ReactNode, SetStateAction, useMemo } from 'react'

import { CowSwapWidgetAppParams } from '@cowprotocol/widget-lib'
import { Percent, Price } from '@uniswap/sdk-core'

import { useUsdAmount } from 'modules/usdAmount'

import { PercentDisplay } from 'common/pure/PercentDisplay'
import { RateInfoParams } from 'common/pure/RateInfo'

import { LimitPriceRow } from './LimitPriceRow'
import * as styledEl from './styled'

import { ReviewOrderModalAmountRow } from '../../pure/ReviewOrderModalAmountRow'
import { DividerHorizontal } from '../../pure/Row/styled'
import { ReceiveAmountInfo } from '../../types'
import { getDirectedReceiveAmounts } from '../../utils/getReceiveAmountInfo'
import { TradeFeesAndCosts } from '../TradeFeesAndCosts'

type Props = {
  receiveAmountInfo: ReceiveAmountInfo
  rateInfoParams: RateInfoParams
  isInvertedState: [boolean, Dispatch<SetStateAction<boolean>>]
  slippage: Percent
  widgetParams: Partial<CowSwapWidgetAppParams>
  labelsAndTooltips?: LabelsAndTooltips
  hideLimitPrice?: boolean
  hideUsdValues?: boolean
  withTimelineDot?: boolean
}

type LabelsAndTooltips = {
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
    rateInfoParams,
    isInvertedState,
    slippage,
    labelsAndTooltips,
    receiveAmountInfo,
    widgetParams,
    hideLimitPrice,
    hideUsdValues,
    withTimelineDot = true,
  } = props
  const { amountAfterFees, amountAfterSlippage } = getDirectedReceiveAmounts(receiveAmountInfo)

  const priceLabel = labelsAndTooltips?.priceLabel || 'Price'
  const minReceivedLabel = labelsAndTooltips?.minReceivedLabel || 'Min received (incl. costs)'
  const minReceivedTooltip =
    labelsAndTooltips?.minReceivedTooltip || 'This is the minimum amount that you will receive.'
  const slippageTooltip = labelsAndTooltips?.slippageTooltip
  const slippageLabel = labelsAndTooltips?.slippageLabel || 'Slippage tolerance'

  const amountAfterSlippageUsd = useUsdAmount(hideUsdValues ? null : amountAfterSlippage).value
  const amountAfterFeesUsd = useUsdAmount(hideUsdValues ? null : amountAfterFees).value

  // Limit price is the same for all parts
  const limitPrice = useMemo(() => {
    const { afterNetworkCosts, afterSlippage } = receiveAmountInfo

    return new Price({
      quoteAmount: afterSlippage.buyAmount,
      baseAmount: afterNetworkCosts.sellAmount,
    })
  }, [receiveAmountInfo])

  return (
    <styledEl.Wrapper>
      {/* Price */}
      <styledEl.StyledRateInfo
        label={priceLabel}
        stylized={true}
        rateInfoParams={rateInfoParams}
        isInvertedState={isInvertedState}
      />

      <TradeFeesAndCosts
        receiveAmountInfo={receiveAmountInfo}
        widgetParams={widgetParams}
        withTimelineDot={withTimelineDot}
      />

      <ReviewOrderModalAmountRow
        highlighted={true}
        amount={amountAfterFees}
        fiatAmount={amountAfterFeesUsd}
        label="Expected to receive"
      />

      <DividerHorizontal />

      {/* Slippage */}
      {
        <ReviewOrderModalAmountRow withTimelineDot={withTimelineDot} tooltip={slippageTooltip} label={slippageLabel}>
          <PercentDisplay percent={+slippage.toFixed(2)} />
        </ReviewOrderModalAmountRow>
      }

      {/* Min received */}
      <ReviewOrderModalAmountRow
        highlighted={true}
        amount={amountAfterSlippage}
        fiatAmount={amountAfterSlippageUsd}
        tooltip={minReceivedTooltip}
        label={minReceivedLabel}
      />

      {/* Limit Price */}
      {!hideLimitPrice && (
        <LimitPriceRow
          price={limitPrice}
          isInvertedState={isInvertedState}
          limitPriceTooltip={labelsAndTooltips?.limitPriceTooltip}
          limitPriceLabel={labelsAndTooltips?.limitPriceLabel}
        />
      )}
    </styledEl.Wrapper>
  )
}
