import React from 'react'
import { InfoIcon } from 'components/InfoIcon'
import * as styledEl from './styled'
import styled from 'styled-components/macro'
import { TradeFlowContext } from '@cow/modules/limitOrders/services/tradeFlow'
import { isAddress, shortenAddress } from 'utils'
import { ActiveRateDisplay } from '@cow/modules/limitOrders/hooks/useActiveRateDisplay'

const Wrapper = styled.div`
  margin: 10px 0;
`
export interface LimitOrdersDetailsProps {
  activeRateDisplay: ActiveRateDisplay
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
        <styledEl.StyledRateInfo activeRateDisplay={props.activeRateDisplay} />
      </styledEl.DetailsRow>
      <styledEl.DetailsRow>
        <div>
          <span>Expiry</span> <InfoIcon content={'Expiry info TODO'} />
        </div>
        <div>
          <span>{expiryDate.toLocaleString(undefined, dateTimeFormat)}</span>
        </div>
      </styledEl.DetailsRow>
      <styledEl.DetailsRow>
        <div>
          <span>MEV protection</span> <InfoIcon content={'MEV protection info TODO'} />
        </div>
        <div>
          <span>{/*TODO*/}Active</span>
        </div>
      </styledEl.DetailsRow>
      <styledEl.DetailsRow>
        <div>
          <span>Order type</span> <InfoIcon content={'Order type info TODO'} />
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
