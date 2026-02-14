import { ReactNode } from 'react'

import { Trans } from '@lingui/react/macro'

import { HowItWorksLink } from './shared'

import { AFFILIATE_HOW_IT_WORKS_URL } from '../config/affiliateProgram.const'

export interface TraderReferralCodeIneligibleCopyProps {
  incomingCode?: string
}

export function TraderReferralCodeHowItWorksLink(): ReactNode {
  return (
    <HowItWorksLink as="a" href={AFFILIATE_HOW_IT_WORKS_URL} target="_blank" rel="noopener noreferrer">
      <Trans>How it works.</Trans>
    </HowItWorksLink>
  )
}

export function TraderReferralCodeIneligibleCopy(props: TraderReferralCodeIneligibleCopyProps): ReactNode {
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
      <TraderReferralCodeHowItWorksLink />
    </>
  )
}
