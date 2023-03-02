import React, { useMemo, useState } from 'react'
import { InfoIcon } from 'components/InfoIcon'
import * as styledEl from './styled'
import styled from 'styled-components/macro'
import { TradeFlowContext } from '@cow/modules/limitOrders/services/tradeFlow'
import { isAddress, shortenAddress } from 'utils'
import { RateInfoParams } from '@cow/common/pure/RateInfo'
import { LimitOrdersSettingsState } from '@cow/modules/limitOrders/state/limitOrdersSettingsAtom'
import { calculateLimitOrdersDeadline } from '@cow/modules/limitOrders/utils/calculateLimitOrdersDeadline'
import SVG from 'react-inlinesvg'
import ArrowDownImage from 'assets/cow-swap/arrowDownRight.svg'
import QuestionHelper from 'components/QuestionHelper'
import { ExecutionPriceTooltip } from '@cow/modules/limitOrders/pure/ExecutionPriceTooltip'
import { ExecutionPrice } from '@cow/modules/limitOrders/pure/ExecutionPrice'
import { Currency, Price } from '@uniswap/sdk-core'
import { LimitRateState } from '@cow/modules/limitOrders/state/limitRateAtom'
import { formatInputAmount } from '@cow/utils/amountFormat'

const Wrapper = styled.div`
  font-size: 13px;
  font-weight: 400;
  color: ${({ theme }) => theme.text1};
  padding: 8px;
`

const ArrowDownRight = styled.div`
  display: flex;
  opacity: 0.3;
  margin: 0 3px 0 0;
`
export interface LimitOrdersDetailsProps {
  rateInfoParams: RateInfoParams
  tradeContext: TradeFlowContext
  settingsState: LimitOrdersSettingsState
  executionPrice: Price<Currency, Currency> | null
  limitRateState: LimitRateState
}

const dateTimeFormat: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
}

export function LimitOrdersDetails(props: LimitOrdersDetailsProps) {
  const { executionPrice, tradeContext, settingsState, rateInfoParams, limitRateState } = props
  const { account, recipient, recipientAddressOrName } = tradeContext.postOrderParams
  const { feeAmount, activeRate } = limitRateState

  const validTo = calculateLimitOrdersDeadline(settingsState)
  const expiryDate = new Date(validTo * 1000)
  const isInversedState = useState(false)
  const [isInversed] = isInversedState

  const displayedRate = useMemo(() => {
    if (!activeRate) return ''
    const rate = isInversed ? activeRate.invert() : activeRate

    return formatInputAmount(rate)
  }, [isInversed, activeRate])

  return (
    <Wrapper>
      <styledEl.DetailsRow>
        <styledEl.StyledRateInfo isInversedState={isInversedState} rateInfoParams={rateInfoParams} />
      </styledEl.DetailsRow>

      <styledEl.DetailsRow>
        <div>
          <span>
            <ArrowDownRight>
              <SVG src={ArrowDownImage} />
            </ArrowDownRight>
            <p>est. execution price</p>{' '}
            <QuestionHelper
              text={
                <ExecutionPriceTooltip
                  isInversed={isInversed}
                  feeAmount={feeAmount}
                  displayedRate={displayedRate}
                  executionPrice={executionPrice}
                />
              }
            />
          </span>
        </div>
        <div>{executionPrice && <ExecutionPrice executionPrice={executionPrice} isInversed={isInversed} />}</div>
      </styledEl.DetailsRow>

      <styledEl.DetailsRow>
        <div>
          <span>
            <p>Order expires</p>
          </span>
          <InfoIcon
            content={
              "If your order has not been filled by this date & time, it will expire. Don't worry - expirations and order placement are free on CoW Swap!"
            }
          />
        </div>
        <div>
          <span>{expiryDate.toLocaleString(undefined, dateTimeFormat)}</span>
        </div>
      </styledEl.DetailsRow>
      {/* <styledEl.DetailsRow>
        <div>
          <span>Protection from MEV</span>
          <InfoIcon
            content={
              'On CoW Swap, your limit orders - just like market orders - are protected from MEV by default! So there’s no need to worry about MEV attacks like frontrunning or sandwiching.'
            }
          />
        </div>
        <div>
          <span>Active</span>
        </div>
      </styledEl.DetailsRow> */}
      {/* <styledEl.DetailsRow>
        <div>
          <span>Order type</span>{' '}
          <InfoIcon
            content={
              'This order will either be filled completely or not filled. (Support for partially fillable orders is coming soon!)'
            }
          />
        </div>
        <div>
          <span>Fill or kill</span>
        </div>
      </styledEl.DetailsRow> */}
      {recipientAddressOrName && recipient !== account && (
        <styledEl.DetailsRow>
          <div>
            <span>Recipient</span>{' '}
            <InfoIcon
              content={
                'The tokens received from this order will automatically be sent to this address. No need to do a second transaction!'
              }
            />
          </div>
          <div>
            <span title={recipientAddressOrName}>
              {isAddress(recipientAddressOrName) ? shortenAddress(recipientAddressOrName) : recipientAddressOrName}
            </span>
          </div>
        </styledEl.DetailsRow>
      )}
    </Wrapper>
  )
}
