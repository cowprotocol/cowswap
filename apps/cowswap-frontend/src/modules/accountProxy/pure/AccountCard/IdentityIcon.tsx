import { ReactNode } from 'react'

import { UI } from '@cowprotocol/ui'

import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

const IdentityIconStyled = styled.div`
  width: 70px;
  height: 70px;
  border-radius: 70px;
  background: var(${UI.COLOR_TEXT_OPACITY_10});
  display: flex;
  align-items: center;
  justify-content: center;

  > svg,
  > img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    padding: 25%;
    fill: var(${UI.COLOR_TEXT_OPACITY_70});
  }
`

interface IdentityIconProps {
  icon?: string
  className?: string
}

export function IdentityIcon({ icon, className }: IdentityIconProps): ReactNode {
  return <IdentityIconStyled className={className}>{icon && <SVG src={icon} />}</IdentityIconStyled>
}
