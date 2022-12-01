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

// TODO: apply design
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
          {/*TODO HIDDEN: <InfoIcon content={'Expiry info TODO'} />*/}
        </div>
        <div>
          <span>{expiryDate.toLocaleString(undefined, dateTimeFormat)}</span>
        </div>
      </styledEl.DetailsRow>
      <styledEl.DetailsRow>
        <div>
          <span>MEV protection</span>
          {/*TODO HIDDEN: <InfoIcon content={'MEV protection info TODO'} />*/}
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
          <span>{/*TODO*/}Fill or kill</span>
        </div>
      </styledEl.DetailsRow>
      {recipientAddressOrName && recipient !== account && (
        <styledEl.DetailsRow>
          <div>
            <span>Recipient</span> <InfoIcon content={'Recipient info TODO'} />
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
