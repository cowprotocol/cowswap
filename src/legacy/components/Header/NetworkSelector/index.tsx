import { useEffect, useMemo, useRef } from 'react'

import { useWeb3React } from '@web3-react/core'

import { Trans } from '@lingui/macro'
import { transparentize, darken } from 'polished'
import { ChevronDown } from 'react-feather'
import { useLocation } from 'react-router-dom'
import styled from 'styled-components/macro'

import { getChainInfo } from 'legacy/constants/chainInfo'
import { useMediaQuery, upToMedium } from 'legacy/hooks/useMediaQuery'
import { useCloseModal, useModalIsOpen, useOpenModal, useToggleModal } from 'legacy/state/application/hooks'
import { ApplicationModal } from 'legacy/state/application/reducer'
import { MEDIA_WIDTHS } from 'legacy/theme'

import { useWalletInfo } from 'modules/wallet'
import { getIsTallyWallet } from 'modules/wallet/api/utils/connection'

import { useIsSmartContractWallet } from 'common/hooks/useIsSmartContractWallet'
import { useOnSelectNetwork } from 'common/hooks/useOnSelectNetwork'
import { NetworksList } from 'common/pure/NetworksList'
import { getCurrentChainIdFromUrl } from 'utils/getCurrentChainIdFromUrl'

import { useLegacySetChainIdToUrl } from '../../../../common/hooks/useLegacySetChainIdToUrl'

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
    margin-right: 8px;
  }
`
const SelectorControls = styled.div`
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
  width: 12px;
`

export function NetworkSelector() {
  const { provider } = useWeb3React()
  const { chainId, account } = useWalletInfo()
  const { search } = useLocation()
  const urlChainId = useMemo(() => getCurrentChainIdFromUrl(), [search])
  const node = useRef<HTMLDivElement>(null)
  const isOpen = useModalIsOpen(ApplicationModal.NETWORK_SELECTOR)
  const openModal = useOpenModal(ApplicationModal.NETWORK_SELECTOR)
  const closeModal = useCloseModal(ApplicationModal.NETWORK_SELECTOR)
  const toggleModal = useToggleModal(ApplicationModal.NETWORK_SELECTOR)
  const isSmartContractWallet = useIsSmartContractWallet()
  const isTallyWallet = getIsTallyWallet(provider?.provider)

  const setChainIdToUrl = useLegacySetChainIdToUrl()

  const info = getChainInfo(chainId)

  const { onSelectChain, isSwitching } = useOnSelectNetwork()

  useEffect(() => {
    if (isSwitching.current) {
      // if wallet switching is in progress, avoid triggering it again
      return
    }
    if (account && chainId && chainId !== urlChainId) {
      // if wallet is connected and chainId already set, keep the url param in sync
      setChainIdToUrl(chainId)
    } else if (urlChainId && chainId && urlChainId !== chainId) {
      // if chain and url chainId are both set and differ, try to update chainid
      onSelectChain(urlChainId, true).catch(() => {
        // we want app network <-> chainId param to be in sync, so if user changes the network by changing the URL
        // but the request fails, revert the URL back to current chainId
        setChainIdToUrl(chainId)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, chainId, setChainIdToUrl, onSelectChain, urlChainId])

  // set chain parameter on initial load if not there
  useEffect(() => {
    if (chainId && !urlChainId) {
      setChainIdToUrl(chainId)
    }
  }, [chainId, setChainIdToUrl, urlChainId])

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
      <SelectorControls>
        <SelectorLogo src={info?.logoUrl} />
        <SelectorLabel>{info?.label}</SelectorLabel>
        <StyledChevronDown />
      </SelectorControls>
      {isOpen && (
        <FlyoutMenu>
          <FlyoutMenuContents>
            <FlyoutHeader>
              <Trans>Select a network</Trans>
            </FlyoutHeader>
            <NetworksList currentChainId={chainId} onSelectChain={onSelectChain} />
          </FlyoutMenuContents>
        </FlyoutMenu>
      )}
    </SelectorWrapper>
  )
}
