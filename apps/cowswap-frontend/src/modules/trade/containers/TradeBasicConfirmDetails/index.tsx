import { ReactNode, useMemo, useState } from 'react'

import { PercentDisplay } from '@cowprotocol/ui'
import { Percent } from '@uniswap/sdk-core'

import { t } from '@lingui/core/macro'
import { Nullish } from 'types'

import { useUsdAmount } from 'modules/usdAmount'

import { RateInfoParams, RateInfo } from 'common/pure/RateInfo'

import { LimitPriceRow } from './LimitPriceRow'
import * as styledEl from './styled'

import { RecipientRow } from '../../pure/RecipientRow'
import { ReviewOrderModalAmountRow } from '../../pure/ReviewOrderModalAmountRow'
import { DividerHorizontal } from '../../pure/Row/styled'
import { ReceiveAmountInfo } from '../../types'
import { getLimitPriceFromReceiveAmount } from '../../utils/getLimitPriceFromReceiveAmount'
import { getOrderTypeReceiveAmounts } from '../../utils/getOrderTypeReceiveAmounts'
import { TradeFeesAndCosts } from '../TradeFeesAndCosts'

type Props = {
  receiveAmountInfo: ReceiveAmountInfo
  rateInfoParams: RateInfoParams
  slippage: Percent
  labelsAndTooltips?: LabelsAndTooltips
  children?: ReactNode
  recipient: Nullish<string>
  recipientAddress: Nullish<string>
  account: Nullish<string>
  hideLimitPrice?: boolean
  hideUsdValues?: boolean
  withTimelineDot?: boolean
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

function getLabelsAndTooltipsWithDefaults(labelsAndTooltips: LabelsAndTooltips | undefined): LabelsAndTooltips {
  const priceLabel = labelsAndTooltips?.priceLabel || t`Price`
  const minReceivedLabel = labelsAndTooltips?.minReceivedLabel || t`Min received (incl. costs)`
  const expectReceiveLabel = labelsAndTooltips?.expectReceiveLabel || t`Expected to receive`
  const minReceivedTooltip =
    labelsAndTooltips?.minReceivedTooltip || t`This is the minimum amount that you will receive.`
  const slippageLabel = labelsAndTooltips?.slippageLabel || t`Slippage tolerance`

  return {
    ...labelsAndTooltips,
    priceLabel,
    minReceivedLabel,
    expectReceiveLabel,
    minReceivedTooltip,
    slippageLabel,
  }
}

export function TradeBasicConfirmDetails(props: Props): ReactNode {
  const {
    rateInfoParams,
    slippage,
    labelsAndTooltips,
    receiveAmountInfo,
    hideLimitPrice,
    hideUsdValues,
    withTimelineDot = true,
    children,
  } = props
  const isInvertedState = useState(false)
  const { amountAfterFees, amountAfterSlippage } = getOrderTypeReceiveAmounts(receiveAmountInfo)
  const { networkCostsSuffix, networkCostsTooltipSuffix } = labelsAndTooltips || {}

  const { priceLabel, minReceivedLabel, expectReceiveLabel, minReceivedTooltip, slippageTooltip, slippageLabel } =
    getLabelsAndTooltipsWithDefaults(labelsAndTooltips)

  const amountAfterSlippageUsd = useUsdAmount(hideUsdValues ? null : amountAfterSlippage).value
  const amountAfterFeesUsd = useUsdAmount(hideUsdValues ? null : amountAfterFees).value

  // Limit price is the same for all parts
  const limitPrice = useMemo(() => getLimitPriceFromReceiveAmount(receiveAmountInfo), [receiveAmountInfo])

  return (
    <styledEl.Wrapper>
      {/* Price */}
      <styledEl.RateInfoWrapper>
        <RateInfo
          stylized
          label={priceLabel}
          rateInfoParams={rateInfoParams}
          isInvertedState={isInvertedState}
          fontBold
          fontSize={13}
        />
      </styledEl.RateInfoWrapper>
      <TradeFeesAndCosts
        receiveAmountInfo={receiveAmountInfo}
        withTimelineDot={withTimelineDot}
        networkCostsSuffix={networkCostsSuffix}
        networkCostsTooltipSuffix={networkCostsTooltipSuffix}
      />
      <ReviewOrderModalAmountRow
        highlighted
        amount={amountAfterFees}
        fiatAmount={amountAfterFeesUsd}
        label={expectReceiveLabel}
      />
      <DividerHorizontal />
      {/* Slippage */}
      {
        <ReviewOrderModalAmountRow withTimelineDot={withTimelineDot} tooltip={slippageTooltip} label={slippageLabel}>
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
      <RecipientRow
        chainId={rateInfoParams.chainId}
        recipient={props.recipient}
        recipientAddress={props.recipientAddress}
        account={props.account}
      />
      {children}
    </styledEl.Wrapper>
  )
}
