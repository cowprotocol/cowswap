import { ReactNode, useMemo, useRef, type MouseEvent } from 'react'

import { getChainInfo } from '@cowprotocol/common-const'
import { useAvailableChains, useBodyScrollbarLocker, useMediaQuery, useOnClickOutside } from '@cowprotocol/common-hooks'
import { Media } from '@cowprotocol/ui'
import { useIsCoinbaseWallet, useWalletSupportedChainIds, useWalletInfo } from '@cowprotocol/wallet'

import { Trans, useLingui } from '@lingui/react/macro'

import { useModalIsOpen, useToggleModal } from 'legacy/state/application/hooks'
import { ApplicationModal } from 'legacy/state/application/reducer'
import { useIsDarkMode } from 'legacy/state/user/hooks'

import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'
import { useOnSelectNetwork } from 'common/hooks/useOnSelectNetwork'
import { useShouldHideNetworkSelector } from 'common/hooks/useShouldHideNetworkSelector'
import { NetworksList } from 'common/pure/NetworksList'

import * as styledEl from './NetworkSelector.styled'

type OnSelectNetwork = ReturnType<typeof useOnSelectNetwork>
type OnSelectNetworkTarget = Parameters<OnSelectNetwork>[0]

const stopPropagation = (event: MouseEvent<HTMLDivElement>): void => {
  event.stopPropagation()
}

const createCloseHandler =
  (isOpen: boolean, toggleModal: () => void) =>
  (event: MouseEvent<HTMLButtonElement>): void => {
    event.stopPropagation()
    if (isOpen) {
      toggleModal()
    }
  }

const createSelectHandler =
  (isOpen: boolean, toggleModal: () => void, onSelectChain: OnSelectNetwork) =>
  (targetChainId: OnSelectNetworkTarget): void => {
    if (isOpen) {
      toggleModal()
    }
    void onSelectChain(targetChainId, true)
  }

function useDisabledChainIds(availableChains: number[]): Set<number> | undefined {
  const isCoinbaseWallet = useIsCoinbaseWallet()
  const walletSupportedChainIds = useWalletSupportedChainIds()
  // Coinbase SCW doesn't exist on unsupported chains — show them as disabled
  return useMemo(
    () =>
      isCoinbaseWallet && walletSupportedChainIds
        ? new Set(availableChains.filter((id) => !walletSupportedChainIds.has(id)))
        : undefined,
    [isCoinbaseWallet, walletSupportedChainIds, availableChains],
  )
}

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

  useBodyScrollbarLocker(isOpen && !shouldHideNetworkSelector, Media.upToMedium(false))

  const onSelectChain = useOnSelectNetwork()
  const isDarkMode = useIsDarkMode()
  const logoUrl = isDarkMode ? info.logo.dark : info.logo.light
  const availableChains = useAvailableChains()
  const disabledChainIds = useDisabledChainIds(availableChains)
  const { t } = useLingui()

  const handleClose = createCloseHandler(isOpen, toggleModal)
  const handleSelectChain = createSelectHandler(isOpen, toggleModal, onSelectChain)

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
          <styledEl.FlyoutMenuContents ref={nodeMobile} onClick={stopPropagation}>
            <styledEl.FlyoutMenuScrollable>
              <styledEl.FlyoutHeader>
                <styledEl.FlyoutHeaderTitle>
                  <Trans>Select a network</Trans>
                </styledEl.FlyoutHeaderTitle>
                <styledEl.CloseButton type="button" aria-label={t`Close`} onClick={handleClose}>
                  <styledEl.CloseIcon aria-hidden="true" />
                </styledEl.CloseButton>
              </styledEl.FlyoutHeader>
              <styledEl.FlayoutMenuList>
                <NetworksList
                  currentChainId={isChainIdUnsupported ? null : chainId}
                  isDarkMode={isDarkMode}
                  onSelectChain={handleSelectChain}
                  availableChains={availableChains}
                  disabledChainIds={disabledChainIds}
                />
              </styledEl.FlayoutMenuList>
            </styledEl.FlyoutMenuScrollable>
          </styledEl.FlyoutMenuContents>
        </styledEl.FlyoutMenu>
      )}
    </styledEl.SelectorWrapper>
  )
}
