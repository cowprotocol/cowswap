import type { ReactNode } from 'react'

import { Trans } from '@lingui/react/macro'

import * as styledEl from './AffiliateTermsFaqLinks.styled'

import { AFFILIATE_HOW_IT_WORKS_URL, AFFILIATE_TERMS_URL } from '../../config/affiliateProgram.const'

export interface AffiliateTermsFaqLinksProps {
  align?: 'inline' | 'center'
}

export function AffiliateTermsFaqLinks({ align = 'inline' }: AffiliateTermsFaqLinksProps): ReactNode {
  return (
    <styledEl.LinksRow $align={align}>
      <styledEl.FooterLink href={AFFILIATE_TERMS_URL} target="_blank">
        <Trans>Terms</Trans>
      </styledEl.FooterLink>
      <styledEl.Separator>•</styledEl.Separator>
      <styledEl.FooterLink href={AFFILIATE_HOW_IT_WORKS_URL} target="_blank">
        <Trans>How it works</Trans>
      </styledEl.FooterLink>
    </styledEl.LinksRow>
  )
}
