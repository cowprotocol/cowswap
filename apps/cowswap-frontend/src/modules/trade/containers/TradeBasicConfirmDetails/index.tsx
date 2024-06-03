import React, { Dispatch, ReactNode, SetStateAction, useMemo } from 'react'

import { bpsToPercent, formatPercent } from '@cowprotocol/common-utils'
import { CowSwapWidgetAppParams } from '@cowprotocol/widget-lib'
import { Percent, Price } from '@uniswap/sdk-core'

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
      partnerFee: { amount: partnerFeeAmount, bps: partnerFeeBps },
    },
  } = receiveAmountInfo

  const priceLabel = additionalProps?.priceLabel || 'Price'
  const minReceivedLabel = additionalProps?.minReceivedLabel || 'Min received (incl. costs)'
  const minReceivedTooltip = additionalProps?.minReceivedTooltip || 'This is the minimum amount that you will receive.'

  const amountAfterFeesFull = amountAfterFees.multiply(numOfParts)
  const amountAfterSlippageFull = amountAfterSlippage.multiply(numOfParts)

  console.log('SSSSS', partnerFeeAmount.toExact())
  const partnerFeeUsd = useUsdAmount(partnerFeeAmount).value
  const amountAfterSlippageUsd = useUsdAmount(amountAfterSlippageFull).value
  const amountAfterFeesUsd = useUsdAmount(amountAfterFeesFull).value
  const networkFeeAmountUsd = useUsdAmount(networkFeeAmount).value

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

      {networkFeeAmount.greaterThan(0) && (
        <ReviewOrderModalAmountRow
          withTimelineDot={true}
          amount={networkFeeAmount}
          fiatAmount={networkFeeAmountUsd}
          tooltip={
            <>
              This is the cost of settling your order on-chain, including gas and any LP fees.
              <br />
              CoW Swap will try to lower this cost where possible.
            </>
          }
          label="Network costs (est.)"
        />
      )}

      {partnerFeeAmount.greaterThan(0) && (
        <ReviewOrderModalAmountRow
          withTimelineDot={true}
          amount={partnerFeeAmount}
          fiatAmount={partnerFeeUsd}
          tooltip={
            widgetParams.content?.feeTooltipMarkdown || (
              <>
                This fee helps pay for maintenance & improvements to the swap experience.
                <br />
                <br />
                The fee is {partnerFeeBps} BPS ({formatPercent(bpsToPercent(partnerFeeBps))}%), applied only if the
                trade is executed.
              </>
            )
          }
          label="Total fee"
        />
      )}

      <ReviewOrderModalAmountRow
        highlighted={true}
        amount={amountAfterFeesFull}
        fiatAmount={amountAfterFeesUsd}
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

      {/* Min received */}
      <ReviewOrderModalAmountRow
        highlighted={true}
        amount={amountAfterSlippageFull}
        fiatAmount={amountAfterSlippageUsd}
        tooltip={minReceivedTooltip}
        label={minReceivedLabel}
      />

      {/* Limit Price */}
      <LimitPriceRow price={limitPrice} isInvertedState={isInvertedState} {...additionalProps} />
    </styledEl.Wrapper>
  )
}
