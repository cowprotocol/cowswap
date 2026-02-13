import { ReactNode } from 'react'

import { Trans } from '@lingui/react/macro'

import { HowItWorks } from './HowItWorks'

interface TraderIneligibleProps {
  incomingCode?: string
}

export function TraderIneligible(props: TraderIneligibleProps): ReactNode {
  const { incomingCode } = props

  return (
    <>
      {incomingCode ? (
        <>
          <Trans>
            The code <strong>{incomingCode}</strong> from your link wasn't applied because this wallet has already
            traded on CoW Swap.
          </Trans>{' '}
          <Trans>Referral rewards are for new wallets only.</Trans>{' '}
        </>
      ) : (
        <>
          <Trans>
            This wallet has already traded on CoW Swap. <br /> Referral rewards are for new wallets only.
          </Trans>{' '}
        </>
      )}
      <HowItWorks />
    </>
  )
}
