import { ReactNode } from 'react'

import { LinkStyledButton, UI } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import styled from 'styled-components'

import { AFFILIATE_HOW_IT_WORKS_URL } from '../config/affiliateProgram.const'

const StyledLink = styled(LinkStyledButton)`
  color: var(${UI.COLOR_LINK});
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`

export function HowItWorks(): ReactNode {
  return (
    <StyledLink as="a" href={AFFILIATE_HOW_IT_WORKS_URL} target="_blank" rel="noopener noreferrer">
      <Trans>How it works.</Trans>
    </StyledLink>
  )
}
