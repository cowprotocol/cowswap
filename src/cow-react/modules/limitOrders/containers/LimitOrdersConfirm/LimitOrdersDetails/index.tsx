import React from 'react'
import { InfoIcon } from 'components/InfoIcon'
import * as styledEl from './styled'

export interface LimitOrdersDetailsProps {
  a: number
}

export function LimitOrdersDetails(props: LimitOrdersDetailsProps) {
  const { a } = props

  return (
    <div>
      <styledEl.DetailsRow>
        <div>
          <span>Limit Price</span> <InfoIcon content={'Limit price info TODO'} />
        </div>
        <div>
          <span>1 COW = 0.15 DAI</span>
          <span>(~$0.1295)</span>
        </div>
      </styledEl.DetailsRow>
      <styledEl.DetailsRow>
        <div>
          <span>Expiry</span> <InfoIcon content={'Expiry info TODO'} />
        </div>
        <div>
          <span>1 hour</span>
          <span>(Sep 23, 7:34 PM)</span>
        </div>
      </styledEl.DetailsRow>
      <styledEl.DetailsRow>
        <div>
          <span>MEW protection</span> <InfoIcon content={'MEW protection info TODO'} />
        </div>
        <div>
          <span>Active</span>
        </div>
      </styledEl.DetailsRow>
      <styledEl.DetailsRow>
        <div>
          <span>Order type</span> <InfoIcon content={'Order type info TODO'} />
        </div>
        <div>
          <span>Fill or kill</span>
        </div>
      </styledEl.DetailsRow>
    </div>
  )
}
