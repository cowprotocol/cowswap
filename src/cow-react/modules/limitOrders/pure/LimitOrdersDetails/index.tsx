import React from 'react'
import { InfoIcon } from 'components/InfoIcon'
import * as styledEl from './styled'
import { TradeFlowContext } from '@cow/modules/limitOrders/services/tradeFlow'
import { Currency, CurrencyAmount, Fraction } from '@uniswap/sdk-core'
import { formatSmartAmount } from 'utils/format'
import { isAddress, shortenAddress } from 'utils'

export interface LimitOrdersDetailsProps {
  activeRate: Fraction
  activeRateFiatAmount: CurrencyAmount<Currency> | null
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
  const { account, sellToken, buyToken, validTo, recipient, recipientAddressOrName } =
    props.tradeContext.postOrderParams
  const expiryDate = new Date(validTo * 1000)

  return (
    <div>
      <styledEl.DetailsRow>
        <div>
          <span>Limit Price</span> <InfoIcon content={'Limit price info TODO'} />
        </div>
        <div>
          <span title={props.activeRate.toSignificant(18)}>
            1 {sellToken.symbol} ={props.activeRate.toSignificant(6)} {buyToken.symbol}
          </span>
          <br />
          <span title={props.activeRateFiatAmount?.toExact() + ' ' + buyToken.symbol}>
            (~${formatSmartAmount(props.activeRateFiatAmount)})
          </span>
        </div>
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
