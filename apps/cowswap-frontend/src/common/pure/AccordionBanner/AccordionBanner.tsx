import { ReactNode, useState } from 'react'

import { BannerIcon, getStatusColorEnums, StatusColorVariant } from '@cowprotocol/ui'

import * as styledEl from './styled'

import { ToggleArrow } from '../ToggleArrow'

type AccordionBannerProps = {
  children: ReactNode
  title: ReactNode
  bannerType?: StatusColorVariant
  accordionPadding?: string
  className?: string
}

export function AccordionBanner(props: AccordionBannerProps): ReactNode {
  const { children, title, bannerType = StatusColorVariant.Info, accordionPadding = '0', className } = props
  const colorEnums = getStatusColorEnums(bannerType)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  return (
    <styledEl.AccordionWrapper className={className} accordionPadding={accordionPadding} colorEnums={colorEnums}>
      <styledEl.AccordionHeader
        colorEnums={colorEnums}
        isOpened={isDropdownOpen}
        onClick={(): void => setIsDropdownOpen((prev) => !prev)}
      >
        <BannerIcon bannerType={bannerType} colorEnums={colorEnums} iconPadding={'0'} />
        {title}
        <styledEl.ArrowWrapper>
          <ToggleArrow size={10} isOpen={isDropdownOpen} />
        </styledEl.ArrowWrapper>
      </styledEl.AccordionHeader>
      {isDropdownOpen ? children : null}
    </styledEl.AccordionWrapper>
  )
}
