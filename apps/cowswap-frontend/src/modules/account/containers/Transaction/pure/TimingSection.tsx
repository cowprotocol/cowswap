import { ReactNode } from 'react'

import { SummaryInnerRow } from '../styled'

interface TimingSectionProps {
  fulfillmentTime: string | undefined
  validTo: string | undefined
  isCancelled: boolean
  isExpired: boolean
}

export function TimingSection({
  fulfillmentTime,
  validTo,
  isCancelled,
  isExpired,
}: TimingSectionProps): ReactNode {
  return (
    <SummaryInnerRow isCancelled={isCancelled} isExpired={isExpired}>
      {fulfillmentTime ? (
        <>
          <b>Filled on</b>
          <i>{fulfillmentTime}</i>
        </>
      ) : (
        <>
          <b>Valid to</b>
          <i>{validTo}</i>
        </>
      )}
    </SummaryInnerRow>
  )
}