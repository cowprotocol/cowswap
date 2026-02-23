import { ReactNode } from 'react'

import { Trans } from '@lingui/react/macro'

import { HowItWorks } from './HowItWorks'

export function TraderIneligible(): ReactNode {
  return (
    <>
      <Trans>
        This wallet has already traded on CoW Swap. <br /> Referral rewards are for new wallets only.
      </Trans>{' '}
      <HowItWorks />
    </>
  )
}
