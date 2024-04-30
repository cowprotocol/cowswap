import React, { useMemo, useState } from 'react'

import ArrowDownImage from '@cowprotocol/assets/cow-swap/arrowDownRight.svg'
import { DEFAULT_DATE_FORMAT } from '@cowprotocol/common-const'
import { formatInputAmount } from '@cowprotocol/common-utils'
import { InfoTooltip, HelpTooltip } from '@cowprotocol/ui'
import { Currency, Price } from '@uniswap/sdk-core'

import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'


import { ExecutionPriceTooltip } from 'modules/limitOrders/pure/ExecutionPriceTooltip'
import { OrderType } from 'modules/limitOrders/pure/OrderType'
import { TradeFlowContext } from 'modules/limitOrders/services/types'
import { LimitOrdersSettingsState } from 'modules/limitOrders/state/limitOrdersSettingsAtom'
import { LimitRateState } from 'modules/limitOrders/state/limitRateAtom'
import { PartiallyFillableOverrideDispatcherType } from 'modules/limitOrders/state/partiallyFillableOverride'
import { calculateLimitOrdersDeadline } from 'modules/limitOrders/utils/calculateLimitOrdersDeadline'
import { RecipientRow } from 'modules/trade'

import { ordersTableFeatures } from 'common/constants/featureFlags'
import { ExecutionPrice } from 'common/pure/ExecutionPrice'
import { RateInfoParams } from 'common/pure/RateInfo'

import * as styledEl from './styled'

const Wrapper = styled.div`
  font-size: 13px;
  font-weight: 400;
  color: inherit;
  padding: 8px;
  gap: 10px;
`

const ArrowDownRight = styled.div`
  display: flex;
  opacity: 0.3;
  margin: 0 3px 0 0;
  color: inherit;
`
export interface LimitOrdersDetailsProps {
  rateInfoParams: RateInfoParams
  tradeContext: TradeFlowContext
  settingsState: LimitOrdersSettingsState
  executionPrice: Price<Currency, Currency> | null
  limitRateState: LimitRateState
  partiallyFillableOverride: PartiallyFillableOverrideDispatcherType
}

export function LimitOrdersDetails(props: LimitOrdersDetailsProps) {
  const { executionPrice, tradeContext, settingsState, rateInfoParams, limitRateState, partiallyFillableOverride } =
    props
  const { account, recipient, recipientAddressOrName, partiallyFillable } = tradeContext.postOrderParams
  const { feeAmount, activeRate, marketRate } = limitRateState

  const validTo = calculateLimitOrdersDeadline(settingsState, tradeContext.quoteState)
  const expiryDate = new Date(validTo * 1000)
  const isInvertedState = useState(false)
  const [isInverted] = isInvertedState

  const displayedRate = useMemo(() => {
    if (!activeRate) return ''
    const rate = isInverted ? activeRate.invert() : activeRate

    return formatInputAmount(rate)
  }, [isInverted, activeRate])

  return (
    <Wrapper>
      <styledEl.DetailsRow>
        <styledEl.StyledRateInfo isInvertedState={isInvertedState} rateInfoParams={rateInfoParams} />
      </styledEl.DetailsRow>

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
    </Wrapper>
  )
}
