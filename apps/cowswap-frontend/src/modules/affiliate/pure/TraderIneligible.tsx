import { ReactNode } from 'react'

import { Trans } from '@lingui/react/macro'

import { HowItWorks } from './HowItWorks'

interface TraderIneligibleProps {
  refCode?: string
}

export function TraderIneligible(props: TraderIneligibleProps): ReactNode {
  const { refCode } = props

  return (
    <>
      {refCode ? (
        <>
          <Trans>
            The code <strong>{refCode}</strong> from your link wasn't applied because this wallet has already traded on
            CoW Swap.
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
