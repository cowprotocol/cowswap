import { ReactNode, useEffect, useRef, type MouseEvent } from 'react'

import { getChainInfo } from '@cowprotocol/common-const'
import { useAvailableChains } from '@cowprotocol/common-hooks'
import { useOnClickOutside } from '@cowprotocol/common-hooks'
import { useMediaQuery } from '@cowprotocol/common-hooks'
import { addBodyClass, removeBodyClass } from '@cowprotocol/common-utils'
import { Media } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Trans, useLingui } from '@lingui/react/macro'

import { useModalIsOpen, useToggleModal } from 'legacy/state/application/hooks'
import { ApplicationModal } from 'legacy/state/application/reducer'
import { useIsDarkMode } from 'legacy/state/user/hooks'

import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'
import { useOnSelectNetwork } from 'common/hooks/useOnSelectNetwork'
import { useShouldHideNetworkSelector } from 'common/hooks/useShouldHideNetworkSelector'
import { NetworksList } from 'common/pure/NetworksList'

import * as styledEl from './NetworkSelector.styled'

export function NetworkSelector(): ReactNode {
  const { chainId } = useWalletInfo()
  const node = useRef<HTMLDivElement>(null)
  const nodeMobile = useRef<HTMLDivElement>(null)
  const nodeSelector = useRef<HTMLDivElement>(null)
  const isOpen = useModalIsOpen(ApplicationModal.NETWORK_SELECTOR)
  const toggleModal = useToggleModal(ApplicationModal.NETWORK_SELECTOR)
  const isChainIdUnsupported = useIsProviderNetworkUnsupported()
  const info = getChainInfo(chainId)
  const isUpToMedium = useMediaQuery(Media.upToMedium(false))
  const shouldHideNetworkSelector = useShouldHideNetworkSelector()
  useOnClickOutside(isUpToMedium ? [nodeMobile, nodeSelector] : [node], () => {
    if (isOpen) {
      toggleModal()
    }
  })

  const onSelectChain = useOnSelectNetwork()
  const isDarkMode = useIsDarkMode()
  const logoUrl = isDarkMode ? info.logo.dark : info.logo.light

  const availableChains = useAvailableChains()
  const { t } = useLingui()

  const handleClose = (event: MouseEvent<HTMLButtonElement>): void => {
    event.stopPropagation()
    if (isOpen) {
      toggleModal()
    }
  }

  useNetworkSelectorBodyScrollLock({ isOpen, isUpToMedium, shouldHideNetworkSelector })

  if (shouldHideNetworkSelector) {
    return null
  }

  return (
    <styledEl.SelectorWrapper ref={node} onClick={toggleModal}>
      <styledEl.SelectorControls ref={nodeSelector} isChainIdUnsupported={isChainIdUnsupported} isOpen={isOpen}>
        {!isChainIdUnsupported ? (
          <>
            <styledEl.SelectorLogo src={logoUrl} />
            <styledEl.SelectorLabel>{info?.label}</styledEl.SelectorLabel>
            <styledEl.StyledChevronDown isOpen={isOpen} />
          </>
        ) : (
          <>
            <styledEl.NetworkIcon />
            <styledEl.NetworkAlertLabel>
              <Trans>Switch Network</Trans>
            </styledEl.NetworkAlertLabel>
            <styledEl.StyledChevronDown isOpen={isOpen} />
          </>
        )}
      </styledEl.SelectorControls>
      {isOpen && (
        <styledEl.FlyoutMenu>
          <styledEl.FlyoutMenuContents ref={nodeMobile}>
            <styledEl.FlyoutMenuScrollable>
              <styledEl.FlyoutHeader>
                <styledEl.FlyoutHeaderTitle>
                  <Trans>Select a network</Trans>
                </styledEl.FlyoutHeaderTitle>
                <styledEl.CloseButton type="button" aria-label={t`Close`} onClick={handleClose}>
                  <styledEl.CloseIcon aria-hidden="true" />
                </styledEl.CloseButton>
              </styledEl.FlyoutHeader>
              <NetworksList
                currentChainId={isChainIdUnsupported ? null : chainId}
                isDarkMode={isDarkMode}
                onSelectChain={onSelectChain}
                availableChains={availableChains}
              />
            </styledEl.FlyoutMenuScrollable>
          </styledEl.FlyoutMenuContents>
        </styledEl.FlyoutMenu>
      )}
    </styledEl.SelectorWrapper>
  )
}

function useNetworkSelectorBodyScrollLock({
  isOpen,
  isUpToMedium,
  shouldHideNetworkSelector,
}: {
  isOpen: boolean
  isUpToMedium: boolean
  shouldHideNetworkSelector: boolean
}): void {
  useEffect(() => {
    if (!isOpen || !isUpToMedium || shouldHideNetworkSelector) {
      removeBodyClass('noScroll')
      return
    }
    addBodyClass('noScroll')
    return () => removeBodyClass('noScroll')
  }, [isOpen, isUpToMedium, shouldHideNetworkSelector])
}
