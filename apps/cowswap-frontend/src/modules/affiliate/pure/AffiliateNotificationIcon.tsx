import { ReactNode } from 'react'

import styled from 'styled-components/macro'

import iconMooEarnSrc from '../assets/moo-earn-icon.svg'

const Icon = styled.img`
  display: block;
  width: 32px;
  height: 32px;
  border-radius: 50%;
`

export function AffiliateNotificationIcon(): ReactNode {
  return <Icon src={iconMooEarnSrc} alt="" aria-hidden />
}
