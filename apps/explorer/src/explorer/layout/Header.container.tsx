import React, { useState, useCallback } from 'react'

import { CHAIN_INFO } from '@cowprotocol/common-const'
import { useBodyScrollbarLocker, useMediaQuery } from '@cowprotocol/common-hooks'
import { Media } from '@cowprotocol/ui'

import { MenuTree } from '../../components/common/MenuDropdown/MenuTree'
import { Header as GenericHeader } from '../../components/layout/GenericLayout/Header'
import { NetworkSelector } from '../../components/NetworkSelector/NetworkSelector.container'
import { useNetworkId } from '../../state/network'
import { FlexWrap } from '../pages/styled'

export const Header: React.FC = () => {
  const isMobile = useMediaQuery(Media.upToSmall(false))
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false)

  useBodyScrollbarLocker(isMobileMenuOpen)

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
