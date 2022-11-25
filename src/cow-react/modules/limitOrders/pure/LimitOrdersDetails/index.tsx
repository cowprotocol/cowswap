import React from 'react'
import { InfoIcon } from 'components/InfoIcon'
import * as styledEl from './styled'
import { TradeFlowContext } from '@cow/modules/limitOrders/services/tradeFlow'
import { isAddress, shortenAddress } from 'utils'
import { RateInfoParams } from '@cow/common/pure/RateInfo'

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
    <div>
      <styledEl.DetailsRow>
        <styledEl.StyledRateInfo rateInfoParams={props.rateInfoParams} />
      </styledEl.DetailsRow>
      <styledEl.DetailsRow>
        <div>
          <span>Expiry</span> <InfoIcon content={'Expiry info TODO'} />
        </div>
        <div>
          <span>({expiryDate.toLocaleString(undefined, dateTimeFormat)})</span>
        </div>
      </styledEl.DetailsRow>
      <styledEl.DetailsRow>
        <div>
          <span>MEW protection</span> <InfoIcon content={'MEW protection info TODO'} />
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
    </div>
  )
}
