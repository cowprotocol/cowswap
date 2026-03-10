import { ReactNode } from 'react'

import { Trans } from '@lingui/react/macro'

import { AffiliateInlineLink } from './shared'

import { AFFILIATE_HOW_IT_WORKS_URL } from '../config/affiliateProgram.const'

export function HowItWorks(): ReactNode {
  return (
    <AffiliateInlineLink href={AFFILIATE_HOW_IT_WORKS_URL} target="_blank" rel="noopener noreferrer">
      <Trans>See how it works.</Trans>
    </AffiliateInlineLink>
  )
}
