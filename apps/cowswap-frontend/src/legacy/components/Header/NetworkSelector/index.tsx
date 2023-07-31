import { useRef } from 'react'

import { useWeb3React } from '@web3-react/core'

import { Trans } from '@lingui/macro'
import { transparentize, darken } from 'polished'
import { AlertTriangle, ChevronDown } from 'react-feather'
import styled from 'styled-components/macro'

import { getChainInfo } from 'legacy/constants/chainInfo'
import { useMediaQuery, upToMedium } from 'legacy/hooks/useMediaQuery'
import { useCloseModal, useModalIsOpen, useOpenModal, useToggleModal } from 'legacy/state/application/hooks'
import { ApplicationModal } from 'legacy/state/application/reducer'
import { MEDIA_WIDTHS } from 'legacy/theme'

import { useWalletInfo } from 'modules/wallet'
import { getIsTallyWallet } from 'modules/wallet/api/utils/connection'

import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'
import { useIsSmartContractWallet } from 'common/hooks/useIsSmartContractWallet'
import { useOnSelectNetwork } from 'common/hooks/useOnSelectNetwork'
import { NetworksList } from 'common/pure/NetworksList'

const FlyoutHeader = styled.div`
  color: ${({ theme }) => theme.text1};
  font-weight: 400;
`

const FlyoutMenu = styled.div`
  position: absolute;
  width: 272px;
  z-index: 99;
  padding-top: 10px;
  top: 38px;
  right: 0;

  ${({ theme }) => theme.mediaWidth.upToSmall`
      width: 100%;
      left: 0;
      top: 58px;
    `};
`

const FlyoutMenuContents = styled.div`
  align-items: flex-start;
  background-color: ${({ theme }) => theme.bg1};
  border: 1px solid ${({ theme }) => theme.bg0};
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  font-size: 16px;
  overflow: auto;
  min-width: 175px;
  z-index: 99;
  padding: 16px;
  border: 1px solid ${({ theme }) => transparentize(0.6, theme.white)};

  ${({ theme }) => theme.mediaWidth.upToSmall`
      top: 50px;
      box-shadow: 0 0 0 100vh ${({ theme }) => transparentize(0.1, theme.black)}};
    `};

  & > *:not(:last-child) {
    margin-bottom: 5px;
  }
`
const SelectorLabel = styled.div`
  display: none;
  flex: 1 1 auto;
  margin: 0 2px 0 0;

  ${({ theme }) => theme.mediaWidth.upToMedium`
      display: none;
    `};

  @media screen and (min-width: ${MEDIA_WIDTHS.upToSmall}px) {
    display: block;
    margin-right: 4px;
  }
`
const SelectorControls = styled.div<{ isChainIdUnsupported: boolean }>`
  align-items: center;
  color: ${({ theme }) => theme.text1};
  display: flex;
  font-weight: 500;
  justify-content: space-between;

  :focus {
    background-color: ${({ theme }) => darken(0.1, theme.red1)};
  }

  border-radius: 21px;
  border: 2px solid transparent;
  padding: 6px;
  transition: border 0.2s ease-in-out;
  background: transparent;

  > img {
    width: 24px;
    height: 24px;
    object-fit: contain;
    margin: 0 6px 0 0;
  }

  &:hover {
    border: 2px solid ${({ theme }) => transparentize(0.7, theme.text1)};
  }

  ${({ isChainIdUnsupported, theme }) =>
    isChainIdUnsupported &&
    `
      color: ${theme.danger}!important;
      background: ${transparentize(0.85, theme.danger)}!important;
      border: 2px solid ${transparentize(0.5, theme.danger)}!important;
    `}
`
const SelectorLogo = styled.img<{ interactive?: boolean }>`
  width: 24px;
  height: 24px;
  margin-right: ${({ interactive }) => (interactive ? 8 : 0)}px;
  @media screen and (min-width: ${MEDIA_WIDTHS.upToSmall}px) {
    margin-right: 8px;
  }
`
const SelectorWrapper = styled.div`
  display: flex;
  cursor: pointer;

  @media screen and (min-width: ${MEDIA_WIDTHS.upToSmall}px) {
    position: relative;
  }
`
const StyledChevronDown = styled(ChevronDown)`
  width: 16px;
`
const NetworkIcon = styled(AlertTriangle)`
  margin-left: 0.25rem;
  margin-right: 0.25rem;
  width: 16px;
  height: 16px;
`
const NetworkAlertLabel = styled.div`
  flex: 1 1 auto;
  display: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0 0.5rem 0 0.4rem;
  font-size: 1rem;
  width: fit-content;
  font-weight: 500;

  @media screen and (min-width: ${MEDIA_WIDTHS.upToSmall}px) {
    display: block;
  }
`

export function NetworkSelector() {
  const { provider } = useWeb3React()
  const { chainId } = useWalletInfo()
  const node = useRef<HTMLDivElement>(null)
  const isOpen = useModalIsOpen(ApplicationModal.NETWORK_SELECTOR)
  const openModal = useOpenModal(ApplicationModal.NETWORK_SELECTOR)
  const closeModal = useCloseModal(ApplicationModal.NETWORK_SELECTOR)
  const toggleModal = useToggleModal(ApplicationModal.NETWORK_SELECTOR)
  const isSmartContractWallet = useIsSmartContractWallet()
  const isTallyWallet = getIsTallyWallet(provider?.provider)
  const isChainIdUnsupported = useIsProviderNetworkUnsupported()

  const info = getChainInfo(chainId)

  const onSelectChain = useOnSelectNetwork()

  // Mod: Detect viewport changes and set isUpToMedium
  const isUpToMedium = useMediaQuery(upToMedium)

  if (!chainId || !provider || isSmartContractWallet || isTallyWallet) {
    return null
  }

  return (
    <SelectorWrapper
      ref={node}
      onMouseEnter={!isUpToMedium ? openModal : undefined}
      onMouseLeave={!isUpToMedium ? closeModal : undefined}
      onClick={isUpToMedium ? toggleModal : undefined}
    >
      <SelectorControls isChainIdUnsupported={isChainIdUnsupported}>
        {!isChainIdUnsupported ? (
          <>
            <SelectorLogo src={info?.logoUrl} />
            <SelectorLabel>{info?.label}</SelectorLabel>
            <StyledChevronDown />
          </>
        ) : (
          <>
            <NetworkIcon />
            <NetworkAlertLabel>Switch Network</NetworkAlertLabel>
            <StyledChevronDown />
          </>
        )}
      </SelectorControls>
      {isOpen && (
        <FlyoutMenu>
          <FlyoutMenuContents>
            <FlyoutHeader>
              <Trans>Select a network</Trans>
            </FlyoutHeader>
            <NetworksList currentChainId={isChainIdUnsupported ? null : chainId} onSelectChain={onSelectChain} />
          </FlyoutMenuContents>
        </FlyoutMenu>
      )}
    </SelectorWrapper>
  )
}
