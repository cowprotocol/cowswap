import React from 'react'
import { InfoIcon } from 'components/InfoIcon'
import * as styledEl from './styled'
import { TradeFlowContext } from '@cow/modules/limitOrders/services/tradeFlow'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { formatSmartAmount } from 'utils/format'

export interface LimitOrdersDetailsProps {
  activeRate: string
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
  const { sellToken, buyToken, validTo } = props.tradeContext.postOrderParams
  const expiryDate = new Date(validTo)

  return (
    <div>
      <styledEl.DetailsRow>
        <div>
          <span>Limit Price</span> <InfoIcon content={'Limit price info TODO'} />
        </div>
        <div>
          <span>
            1 {sellToken.symbol} = {props.activeRate} {buyToken.symbol}
          </span>
          <br />
          <span>(~${formatSmartAmount(props.activeRateFiatAmount)})</span>
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
    </div>
  )
}
