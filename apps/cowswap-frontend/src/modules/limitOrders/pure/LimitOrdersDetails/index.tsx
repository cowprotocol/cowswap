import React, { useMemo, useState } from 'react'

import ArrowDownImage from '@cowprotocol/assets/cow-swap/arrowDownRight.svg'
import { DEFAULT_DATE_FORMAT } from '@cowprotocol/common-const'
import { formatInputAmount, isSellOrder } from '@cowprotocol/common-utils'
import { InfoTooltip, HelpTooltip, TokenAmount } from '@cowprotocol/ui'
import { Currency, Price } from '@uniswap/sdk-core'

import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

import {
  ReceiveAmountInfo,
  RecipientRow,
  ReceiveAmountTitle,
  DividerHorizontal,
  getDirectedReceiveAmounts,
} from 'modules/trade'

import { ordersTableFeatures } from 'common/constants/featureFlags'
import { ExecutionPrice } from 'common/pure/ExecutionPrice'

import * as styledEl from './styled'

import { TradeRates } from '../../containers/TradeRates'
import { TradeFlowContext } from '../../services/types'
import { LimitOrdersSettingsState } from '../../state/limitOrdersSettingsAtom'
import { LimitRateState } from '../../state/limitRateAtom'
import { PartiallyFillableOverrideDispatcherType } from '../../state/partiallyFillableOverride'
import { calculateLimitOrdersDeadline } from '../../utils/calculateLimitOrdersDeadline'
import { ExecutionPriceTooltip } from '../ExecutionPriceTooltip'
import { OrderType } from '../OrderType'

const Wrapper = styled.div`
  font-size: 13px;
  font-weight: 400;
  color: inherit;
  gap: 10px;
`

const ArrowDownRight = styled.div`
  display: flex;
  opacity: 0.3;
  margin: 0 3px 0 0;
  color: inherit;
`
export interface LimitOrdersDetailsProps {
  tradeContext: TradeFlowContext
  settingsState: LimitOrdersSettingsState
  executionPrice: Price<Currency, Currency> | null
  limitRateState: LimitRateState
  partiallyFillableOverride: PartiallyFillableOverrideDispatcherType
  receiveAmountInfo: ReceiveAmountInfo | null
}

export function LimitOrdersDetails(props: LimitOrdersDetailsProps) {
  const { executionPrice, tradeContext, receiveAmountInfo, settingsState, limitRateState, partiallyFillableOverride } =
    props
  const { account, recipient, recipientAddressOrName, partiallyFillable, kind } = tradeContext.postOrderParams
  const { feeAmount, activeRate, marketRate } = limitRateState

  const validTo = calculateLimitOrdersDeadline(settingsState, tradeContext.quoteState)
  const isInvertedState = useState(false)

  const expiryDate = new Date(validTo * 1000)
  const isSell = isSellOrder(kind)
  const [isInverted] = isInvertedState

  const displayedRate = useMemo(() => {
    if (!activeRate) return ''
    const rate = isInverted ? activeRate.invert() : activeRate

    return formatInputAmount(rate)
  }, [isInverted, activeRate])

  const receiveAmounts = receiveAmountInfo && getDirectedReceiveAmounts(receiveAmountInfo)

  return (
    <Wrapper>
      <TradeRates open receiveAmountInfo={receiveAmountInfo}>
        {receiveAmounts && (
          <styledEl.DetailsRow>
            <ReceiveAmountTitle>{isSell ? 'Expected to receive' : 'Expected to sell'}</ReceiveAmountTitle>
            <div>
              <b>
                <TokenAmount
                  amount={receiveAmounts.amountAfterFees}
                  tokenSymbol={receiveAmounts.amountAfterFees.currency}
                  defaultValue="0"
                />
              </b>
            </div>
          </styledEl.DetailsRow>
        )}
        <DividerHorizontal />
        {ordersTableFeatures.DISPLAY_EXECUTION_TIME && executionPrice && (
          <styledEl.DetailsRow>
            <div>
              <span>
                <ArrowDownRight>
                  <SVG src={ArrowDownImage} />
                </ArrowDownRight>
                <p>order executes at</p>{' '}
                <HelpTooltip
                  text={
                    <ExecutionPriceTooltip
                      isInverted={isInverted}
                      feeAmount={feeAmount}
                      marketRate={marketRate}
                      displayedRate={displayedRate}
                      executionPrice={executionPrice}
                    />
                  }
                />
              </span>
            </div>
            <div>
              <ExecutionPrice executionPrice={executionPrice} isInverted={isInverted} />
            </div>
          </styledEl.DetailsRow>
        )}

        <styledEl.DetailsRow>
          <div>
            <span>
              <p>Order expires</p>
            </span>
            <InfoTooltip
              content={
                "If your order has not been filled by this date & time, it will expire. Don't worry - expirations and order placement are free on CoW Swap!"
              }
            />
          </div>
          <div>
            <span>{expiryDate.toLocaleString(undefined, DEFAULT_DATE_FORMAT)}</span>
          </div>
        </styledEl.DetailsRow>
        <OrderType isPartiallyFillable={partiallyFillable} partiallyFillableOverride={partiallyFillableOverride} />
        <RecipientRow recipient={recipient} account={account} recipientAddressOrName={recipientAddressOrName} />
      </TradeRates>
    </Wrapper>
  )
}
