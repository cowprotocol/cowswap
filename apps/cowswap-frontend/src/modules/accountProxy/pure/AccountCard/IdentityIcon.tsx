import { ReactNode } from 'react'

import SVG from 'react-inlinesvg'

import { IdentityIconStyled } from './styled'

interface IdentityIconProps {
  icon?: string
  className?: string
}

export function IdentityIcon({ icon, className }: IdentityIconProps): ReactNode {
  return <IdentityIconStyled className={className}>{icon && <SVG src={icon} />}</IdentityIconStyled>
}
