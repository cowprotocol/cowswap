import React, { useState, useCallback, useEffect } from 'react'

import { CHAIN_INFO } from '@cowprotocol/common-const'

import { MenuTree } from '../../components/common/MenuDropdown/MenuTree'
import { Header as GenericHeader } from '../../components/layout/GenericLayout/Header'
import { NetworkSelector } from '../../components/NetworkSelector'
import { useMediaBreakpoint } from '../../hooks/useMediaBreakPoint'
import { useNetworkId } from '../../state/network'
import { addBodyClass, removeBodyClass } from '../../utils/toggleBodyClass'
import { FlexWrap } from '../pages/styled'


export const Header: React.FC = () => {
  const isMobile = useMediaBreakpoint(['xs', 'sm'])
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Toggle the 'noScroll' class on body, whenever the mobile menu or orders panel is open.
  // This removes the inner scrollbar on the page body, to prevent showing double scrollbars.
  useEffect(() => {
    isMobileMenuOpen ? addBodyClass('noScroll') : removeBodyClass('noScroll')
  }, [isMobileMenuOpen, isMobile])

  const handleMobileMenuOnClick = useCallback(() => {
    isMobile && setMobileMenuOpen((isMobileMenuOpen) => !isMobileMenuOpen)
  }, [isMobile])

  const networkId = useNetworkId()
  if (!networkId) {
    return null
  }

  const prefixNetwork = CHAIN_INFO[networkId].urlAlias

  return (
    <GenericHeader
      logoAlt="CoW Protocol Explorer"
      linkTo={`/${prefixNetwork || ''}`}
      onClickOptional={isMobileMenuOpen ? handleMobileMenuOnClick : undefined}
    >
      <NetworkSelector networkId={networkId} />
      <FlexWrap grow={1}>
        <MenuTree
          isMobile={isMobile}
          isMobileMenuOpen={isMobileMenuOpen}
          handleMobileMenuOnClick={handleMobileMenuOnClick}
        />
      </FlexWrap>
    </GenericHeader>
  )
}
