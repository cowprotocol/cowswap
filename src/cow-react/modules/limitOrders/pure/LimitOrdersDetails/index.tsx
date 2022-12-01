import React from 'react'
import { InfoIcon } from 'components/InfoIcon'
import * as styledEl from './styled'
import styled from 'styled-components/macro'
import { TradeFlowContext } from '@cow/modules/limitOrders/services/tradeFlow'
import { isAddress, shortenAddress } from 'utils'
import { RateInfoParams } from '@cow/common/pure/RateInfo'

const Wrapper = styled.div`
  margin: 10px 0;
`
export interface LimitOrdersDetailsProps {
  rateInfoParams: RateInfoParams
  tradeContext: TradeFlowContext
}

const dateTimeFormat: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
}

export function LimitOrdersDetails(props: LimitOrdersDetailsProps) {
  const { account, validTo, recipient, recipientAddressOrName } = props.tradeContext.postOrderParams
  const expiryDate = new Date(validTo * 1000)

  return (
    <Wrapper>
      <styledEl.DetailsRow>
        <styledEl.StyledRateInfo rateInfoParams={props.rateInfoParams} />
      </styledEl.DetailsRow>
      <styledEl.DetailsRow>
        <div>
          <span>Expiry</span>
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
      <styledEl.DetailsRow>
        <div>
          <span>MEV protection</span>
          <InfoIcon
            content={
              'On CoW Swap, your limit orders - just like market orders - are protected from MEV by default! So there’s no need to worry about MEV attacks like frontrunning or sandwiching.'
            }
          />
        </div>
        <div>
          <span>Active</span>
        </div>
      </styledEl.DetailsRow>
      <styledEl.DetailsRow>
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
      </styledEl.DetailsRow>
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
