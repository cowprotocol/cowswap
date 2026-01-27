import { ReactNode } from 'react'

import { Trans } from '@lingui/react/macro'

export interface ReferralIneligibleCopyProps {
  incomingCode?: string
  howItWorksLink: ReactNode
}

export function ReferralIneligibleCopy(props: ReferralIneligibleCopyProps): ReactNode {
  const { incomingCode, howItWorksLink } = props

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
          <Trans>This wallet has already traded on CoW Swap. Referral rewards are for new wallets only.</Trans>{' '}
        </>
      )}
      {howItWorksLink}
    </>
  )
}
