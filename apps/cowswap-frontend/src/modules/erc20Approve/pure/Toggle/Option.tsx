import { ReactNode } from 'react'

import * as styledEl from './styled'

export function Option({
  title,
  children,
  onClick,
  isActive,
}: {
  title: string
  children: ReactNode
  onClick: () => void
  isActive?: boolean
}): ReactNode {
  return (
    <styledEl.OptionWrapper isActive={isActive} onClick={onClick} aria-pressed={isActive}>
      <styledEl.OptionTitle>{title}</styledEl.OptionTitle>
      {children}
    </styledEl.OptionWrapper>
  )
}
