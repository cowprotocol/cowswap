import { ReactNode, useState } from 'react'

import * as styledEl from './styled'

import { ToggleArrow } from '../ToggleArrow'

type AccordionBannerProps = {
  children: ReactNode
  title: ReactNode
}

export function AccordionBanner(props: AccordionBannerProps): ReactNode {
  const { children, title } = props
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  return (
    <styledEl.DropdownWrapper>
      <styledEl.DropdownHeader isOpened={isDropdownOpen} onClick={(): void => setIsDropdownOpen((prev) => !prev)}>
        {title}
        <styledEl.ArrowWrapper>
          <ToggleArrow size={10} isOpen={isDropdownOpen} />
        </styledEl.ArrowWrapper>
      </styledEl.DropdownHeader>
      {isDropdownOpen ? children : null}
    </styledEl.DropdownWrapper>
  )
}
