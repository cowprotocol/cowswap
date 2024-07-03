import React, { Dispatch, ReactNode, SetStateAction, useMemo } from 'react'

import { PercentDisplay } from '@cowprotocol/ui'
import { CowSwapWidgetAppParams } from '@cowprotocol/widget-lib'
import { Percent, Price } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { useUsdAmount } from 'modules/usdAmount'

import { RateInfoParams } from 'common/pure/RateInfo'

import { LimitPriceRow } from './LimitPriceRow'
import * as styledEl from './styled'

import { RecipientRow } from '../../pure/RecipientRow'
import { ReviewOrderModalAmountRow } from '../../pure/ReviewOrderModalAmountRow'
import { DividerHorizontal } from '../../pure/Row/styled'
import { ReceiveAmountInfo } from '../../types'
import { getOrderTypeReceiveAmounts } from '../../utils/getReceiveAmountInfo'
import { TradeFeesAndCosts } from '../TradeFeesAndCosts'

type Props = {
  receiveAmountInfo: ReceiveAmountInfo
  rateInfoParams: RateInfoParams
  isInvertedState: [boolean, Dispatch<SetStateAction<boolean>>]
  slippage: Percent
  widgetParams: Partial<CowSwapWidgetAppParams>
  labelsAndTooltips?: LabelsAndTooltips
  children?: ReactNode
  recipient?: Nullish<string>
  account: Nullish<string>
  hideLimitPrice?: boolean
  hideUsdValues?: boolean
  withTimelineDot?: boolean
  alwaysRow?: boolean
}

type LabelsAndTooltips = {
  priceLabel?: ReactNode
  expectReceiveLabel?: ReactNode
  minReceivedLabel?: ReactNode
  minReceivedTooltip?: ReactNode
  limitPriceLabel?: ReactNode
  limitPriceTooltip?: ReactNode
  slippageLabel?: ReactNode
  slippageTooltip?: ReactNode
  networkCostsSuffix?: ReactNode
  networkCostsTooltipSuffix?: ReactNode
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
    alwaysRow,
    children,
    recipient,
    account,
  } = props
  const { amountAfterFees, amountAfterSlippage } = getOrderTypeReceiveAmounts(receiveAmountInfo)
  const { networkCostsSuffix, networkCostsTooltipSuffix } = labelsAndTooltips || {}

  const priceLabel = labelsAndTooltips?.priceLabel || 'Price'
  const minReceivedLabel = labelsAndTooltips?.minReceivedLabel || 'Min received (incl. costs)'
  const expectReceiveLabel = labelsAndTooltips?.expectReceiveLabel || 'Expected to receive'
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
        alwaysRow={alwaysRow}
        networkCostsSuffix={networkCostsSuffix}
        networkCostsTooltipSuffix={networkCostsTooltipSuffix}
      />

      <ReviewOrderModalAmountRow
        highlighted={true}
        amount={amountAfterFees}
        fiatAmount={amountAfterFeesUsd}
        alwaysRow={alwaysRow}
        label={expectReceiveLabel}
      />

      <DividerHorizontal />

      {/* Slippage */}
      {
        <ReviewOrderModalAmountRow
          withTimelineDot={withTimelineDot}
          tooltip={slippageTooltip}
          label={slippageLabel}
          alwaysRow={alwaysRow}
        >
          <PercentDisplay percent={slippage.toFixed(2)} />
        </ReviewOrderModalAmountRow>
      }

      {/* Min received */}
      <ReviewOrderModalAmountRow
        highlighted={true}
        amount={amountAfterSlippage}
        fiatAmount={amountAfterSlippageUsd}
        tooltip={minReceivedTooltip}
        label={minReceivedLabel}
        alwaysRow={alwaysRow}
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

      {/*Recipient*/}
      <RecipientRow chainId={rateInfoParams.chainId} recipient={recipient} account={account} />
      {children}
    </styledEl.Wrapper>
  )
}
