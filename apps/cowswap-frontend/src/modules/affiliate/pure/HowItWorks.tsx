import { ReactNode } from 'react'

import { Trans } from '@lingui/react/macro'

import { AffiliateInlineLink } from './shared'

import { AFFILIATE_HOW_IT_WORKS_URL } from '../config/affiliateProgram.const'

interface HowItWorksProps {
  onClick?: () => void
}

export function HowItWorks({ onClick }: HowItWorksProps): ReactNode {
  return (
    <AffiliateInlineLink
      href={AFFILIATE_HOW_IT_WORKS_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClickOptional={onClick}
    >
      <Trans>See how it works.</Trans>
    </AffiliateInlineLink>
  )
}
