import { ReactNode } from 'react'

import { SummaryInnerRow } from '../styled'

interface FromToSectionProps {
  kind: string
  from: ReactNode
  to: ReactNode
}

export function FromToSection({ kind, from, to }: FromToSectionProps): ReactNode {
  return (
    <>
      <SummaryInnerRow>
        <b>From{kind === 'buy' && ' at most'}</b>
        <i>{from}</i>
      </SummaryInnerRow>
      <SummaryInnerRow>
        <b>To{kind === 'sell' && ' at least'}</b>
        <i>{to}</i>
      </SummaryInnerRow>
    </>
  )
}