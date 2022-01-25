import { useState, useEffect } from 'react'
import { SupportedChainId as ChainId } from 'constants/chains'
import { ExternalLink } from 'theme'
import { useHistory, useLocation } from 'react-router-dom'

import HeaderMod, {
  Title,
  HeaderLinks,
  HeaderRow,
  HeaderControls as HeaderControlsUni,
  BalanceText as BalanceTextUni,
  HeaderElement,
  AccountElement,
  HeaderElementWrap,
  StyledNavLink as StyledNavLinkUni,
  StyledMenuButton,
  HeaderFrame,
  UNIWrapper,
} from './HeaderMod'
import Menu from 'components/Menu'
import { Moon, Sun } from 'react-feather'
import styled from 'styled-components/macro'
import { useActiveWeb3React } from 'hooks/web3'
import { useETHBalances } from 'state/wallet/hooks'
import { AMOUNT_PRECISION } from 'constants/index'
import { useDarkModeManager } from 'state/user/hooks'
import { darken } from 'polished'
import TwitterImage from 'assets/cow-swap/twitter.svg'
import OrdersPanel from 'components/OrdersPanel'
import { ApplicationModal } from 'state/application/reducer'

import { supportedChainId } from 'utils/supportedChainId'
import { formatSmart } from 'utils/format'
import Web3Status from 'components/Web3Status'
import NetworkSelector from 'components/Header/NetworkSelector'
import SVG from 'react-inlinesvg'
import {
  useModalOpen,
  /*useShowClaimPopup,*/
  // useToggleSelfClaimModal
} from 'state/application/hooks'
//import { useUserHasAvailableClaim } from 'state/claim/hooks'

import Modal from 'components/Modal'
// import ClaimModal from 'components/claim/ClaimModal'
import UniBalanceContent from 'components/Header/UniBalanceContent'
import CowClaimButton from 'components/CowClaimButton'
import { IS_CLAIMING_ENABLED } from 'pages/Claim/const'

export const NETWORK_LABELS: { [chainId in ChainId]?: string } = {
  [ChainId.RINKEBY]: 'Rinkeby',
  // [ChainId.ROPSTEN]: 'Ropsten',
  // [ChainId.GOERLI]: 'Görli',
  // [ChainId.KOVAN]: 'Kovan',
  [ChainId.XDAI]: 'Gnosis Chain',
}

const CHAIN_CURRENCY_LABELS: { [chainId in ChainId]?: string } = {
  [ChainId.XDAI]: 'xDAI',
}

export interface LinkType {
  id: number
  title: string
  path: string
}

const StyledNavLink = styled(StyledNavLinkUni)`
  transition: color 0.15s ease-in-out;
  color: ${({ theme }) => darken(0.3, theme.text1)};

  &:first-of-type {
    margin: 0 12px 0 0;
  }

  &:hover,
  &:focus {
    color: ${({ theme }) => theme.text1};
  }
`

const BalanceText = styled(BalanceTextUni)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
  `};
`

const HeaderControls = styled(HeaderControlsUni)`
  justify-content: flex-end;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    max-width: 100%;
    padding: 0;
    height: auto;
    width: 100%;
  `};
`
export const Wrapper = styled.div`
  width: 100%;

  ${HeaderFrame} {
    padding: 16px;
    grid-template-columns: auto auto;
    grid-gap: 16px;

    ${({ theme }) => theme.mediaWidth.upToExtraSmall`
      padding: 10px;
    `}
  }

  ${HeaderElement} {
    ${({ theme }) => theme.mediaWidth.upToSmall`
      width: 100%;
    `};
  }

  ${StyledMenuButton} {
    margin-left: 0.5rem;
    padding: 0;
    height: 38px;
    width: 38px;
  }
`

export const HeaderModWrapper = styled(HeaderMod)`
  ${Title} {
    margin: 0;
    text-decoration: none;
    color: ${({ theme }) => theme.text1};
  }

  ${HeaderLinks} {
    margin: 5px 0 0 0;
  }
`

export const TwitterLink = styled(StyledMenuButton)`
  > a {
    ${({ theme }) => theme.cursor};
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
  }

  > a > svg {
    width: 100%;
    height: 100%;
    object-fit: contain;
    border: 0;
    display: flex;
    margin: 0;
    padding: 0;
    stroke: transparent;
  }

  > a > svg > path {
    fill: ${({ theme }) => theme.text1};
  }

  > a:hover > svg > path {
    fill: ${({ theme }) => theme.primary1};
  }
`

export const LogoImage = styled.div`
  width: 190px;
  height: 48px;
  background: ${({ theme }) => `url(${theme.logo.src}) no-repeat center/contain`};
  margin: 0 32px 0 0;
  position: relative;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 160px;
  `}

  ${({ theme }) => theme.mediaWidth.upToVerySmall`
    background: ${({ theme }) => `url(${theme.logo.srcIcon}) no-repeat left/contain`};
    height: 34px;
  `}

  > svg {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`

const UniIcon = styled.div`
  display: flex;
  position: relative;
  transition: transform 0.3s ease;

  &:hover {
    transform: rotate(-5deg);
  }
`

const VCowWrapper = styled(UNIWrapper)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
  `}
`

export default function Header() {
  const location = useLocation()
  const isClaimPage = location.pathname === '/claim'

  const { account, chainId: connectedChainId } = useActiveWeb3React()
  const chainId = supportedChainId(connectedChainId)

  const userEthBalance = useETHBalances(account ? [account] : [])?.[account ?? '']
  const nativeToken = chainId && (CHAIN_CURRENCY_LABELS[chainId] || 'ETH')
  const [darkMode, toggleDarkMode] = useDarkModeManager()

  // const toggleClaimModal = useToggleSelfClaimModal()
  // const availableClaim: boolean = useUserHasAvailableClaim(account)
  const [showUniBalanceModal, setShowUniBalanceModal] = useState(false)
  // const showClaimPopup = useShowClaimPopup()

  const [isOrdersPanelOpen, setIsOrdersPanelOpen] = useState<boolean>(false)
  const closeOrdersPanel = () => setIsOrdersPanelOpen(false)
  const openOrdersPanel = () => setIsOrdersPanelOpen(true)
  const isMenuOpen = useModalOpen(ApplicationModal.MENU)

  const history = useHistory()
  const handleOnClickClaim = () => history.push('/claim')

  // Toggle the 'noScroll' class on body, whenever the orders panel or flyout menu is open.
  // This removes the inner scrollbar on the page body, to prevent showing double scrollbars.
  useEffect(() => {
    isOrdersPanelOpen || isMenuOpen
      ? document.body.classList.add('noScroll')
      : document.body.classList.remove('noScroll')
  }, [isOrdersPanelOpen, isMenuOpen])

  return (
    <Wrapper>
      <HeaderModWrapper>
        <HeaderRow marginRight="0">
          <Modal isOpen={showUniBalanceModal} onDismiss={() => setShowUniBalanceModal(false)}>
            <UniBalanceContent setShowUniBalanceModal={setShowUniBalanceModal} />
          </Modal>
          <Title href=".">
            <UniIcon>
              <LogoImage />
            </UniIcon>
          </Title>
          <HeaderLinks>
            <StyledNavLink to="/swap">Swap</StyledNavLink>
            <StyledNavLink to="/profile">Profile</StyledNavLink>
          </HeaderLinks>
        </HeaderRow>

        <HeaderControls>
          <HeaderElement>
            <NetworkSelector />
          </HeaderElement>
          <HeaderElement>
            {IS_CLAIMING_ENABLED && (
              <VCowWrapper>
                <CowClaimButton isClaimPage={isClaimPage} account={account} handleOnClickClaim={handleOnClickClaim} />
              </VCowWrapper>
            )}

            <AccountElement active={!!account} style={{ pointerEvents: 'auto' }}>
              {account && userEthBalance && (
                <BalanceText style={{ flexShrink: 0, userSelect: 'none' }} pl="0.75rem" pr="0.5rem" fontWeight={500}>
                  {formatSmart(userEthBalance, AMOUNT_PRECISION) || '0'} {nativeToken}
                </BalanceText>
              )}
              <Web3Status openOrdersPanel={openOrdersPanel} />
            </AccountElement>
          </HeaderElement>
          <HeaderElementWrap>
            <TwitterLink>
              <ExternalLink href="https://twitter.com/mevprotection">
                <SVG src={TwitterImage} description="Follow CowSwap on Twitter!" />
              </ExternalLink>
            </TwitterLink>
            <StyledMenuButton onClick={() => toggleDarkMode()}>
              {darkMode ? <Moon size={20} /> : <Sun size={20} />}
            </StyledMenuButton>
          </HeaderElementWrap>
          <Menu isClaimPage={isClaimPage} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        </HeaderControls>
        {isOrdersPanelOpen && <OrdersPanel closeOrdersPanel={closeOrdersPanel} />}
      </HeaderModWrapper>
    </Wrapper>
  )
}
