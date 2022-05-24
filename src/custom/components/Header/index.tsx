import { useState, useEffect } from 'react'
import { SupportedChainId as ChainId } from 'constants/chains'
// import { ExternalLink } from 'theme'
import { useHistory } from 'react-router-dom'

import HeaderMod, {
  Title as TitleMod,
  HeaderLinks as HeaderLinksMod,
  HeaderRow,
  HeaderControls as HeaderControlsUni,
  BalanceText as BalanceTextUni,
  HeaderElement,
  AccountElement as AccountElementUni,
  // HeaderElementWrap,
  StyledNavLink as StyledNavLinkUni,
  StyledMenuButton,
  HeaderFrame,
  UNIWrapper,
} from './HeaderMod'
import MenuDropdown from 'components/MenuDropdown'
import { MenuTitle, MenuSection } from 'components/MenuDropdown/styled'
import styled from 'styled-components/macro'
import { useActiveWeb3React } from 'hooks/web3'
import { useNativeCurrencyBalances } from 'state/wallet/hooks'
import {
  AMOUNT_PRECISION,
  DUNE_DASHBOARD_LINK,
  CONTRACTS_CODE_LINK,
  DOCS_LINK,
  DISCORD_LINK,
  TWITTER_LINK,
} from 'constants/index'
import { ExternalLink } from 'theme/components'
import { useDarkModeManager } from 'state/user/hooks'
import { darken } from 'polished'
// import TwitterImage from 'assets/cow-swap/twitter.svg'
import OrdersPanel from 'components/OrdersPanel'

import { supportedChainId } from 'utils/supportedChainId'
import { formatSmart } from 'utils/format'
import Web3Status from 'components/Web3Status'
import NetworkSelector from 'components/Header/NetworkSelector'
import IMAGE_DOCS from 'assets/cow-swap/doc.svg'
import IMAGE_INFO from 'assets/cow-swap/info.svg'
import IMAGE_CODE from 'assets/cow-swap/code.svg'
import IMAGE_DISCORD from 'assets/cow-swap/discord.svg'
import IMAGE_TWITTER from 'assets/cow-swap/twitter.svg'
import IMAGE_PIE from 'assets/cow-swap/pie.svg'
import IMAGE_SLICER from 'assets/cow-swap/ninja-cow.png'
import IMAGE_GAME from 'assets/cow-swap/game.gif'
import IMAGE_MOON from 'assets/cow-swap/moon.svg'
import IMAGE_SUN from 'assets/cow-swap/sun.svg'
import SVG from 'react-inlinesvg'

//import { useUserHasAvailableClaim } from 'state/claim/hooks'

// import Modal from 'components/Modal'
// import ClaimModal from 'components/claim/ClaimModal'
import CowBalanceButton from 'components/CowBalanceButton'
import { transparentize } from 'polished'

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

export const StyledNavLink = styled(StyledNavLinkUni)`
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
  font-weight: 500;
  padding: 0 6px 0 12px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    overflow: hidden;
    max-width: 100px;
    text-overflow: ellipsis;
  `};

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

    ${({ theme }) => theme.mediaWidth.upToMedium`
      flex-direction: initial;
      align-items: inherit;
    `};
  }

  ${StyledMenuButton} {
    margin-left: 0.5rem;
    padding: 0;
    height: 38px;
    width: 38px;
  }
`

export const HeaderModWrapper = styled(HeaderMod)``

const Title = styled(TitleMod)`
  margin: 0;
  text-decoration: none;
  color: ${({ theme }) => theme.text1};
`

export const HeaderLinks = styled(HeaderLinksMod)`
  margin: 5px 0 0 0;

  ${({ theme }) => theme.mediaWidth.upToLarge`
    display: none;
  `};
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

  ${({ theme }) => theme.mediaWidth.upToMedium`
    background: ${({ theme }) => `url(${theme.logo.srcIcon}) no-repeat left/contain`};
    height: 34px;
  `}

  > svg {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`

export const UniIcon = styled.div`
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

const AccountElement = styled(AccountElementUni)<{ active: boolean }>`
  background-color: ${({ theme, active }) => (!active ? theme.bg1 : theme.bg4)};
  border-radius: 21px;
  border: 1px solid transparent;
  transition: border 0.2s ease-in-out;
  pointer-events: auto;

  &:hover,
  &:focus {
    border: 1px solid ${({ theme }) => transparentize(0.4, theme.text1)};
  }

  ${BalanceText} {
    min-width: initial;
  }
`

export default function Header() {
  const { account, chainId: connectedChainId } = useActiveWeb3React()
  const chainId = supportedChainId(connectedChainId)

  const userEthBalance = useNativeCurrencyBalances(account ? [account] : [])?.[account ?? '']
  const nativeToken = chainId && (CHAIN_CURRENCY_LABELS[chainId] || 'ETH')
  const [darkMode, toggleDarkMode] = useDarkModeManager()

  const [isOrdersPanelOpen, setIsOrdersPanelOpen] = useState<boolean>(false)
  const closeOrdersPanel = () => setIsOrdersPanelOpen(false)
  const openOrdersPanel = () => setIsOrdersPanelOpen(true)

  const history = useHistory()
  const handleBalanceButtonClick = () => history.push('/account')

  // Toggle the 'noScroll' class on body, whenever the orders panel is open.
  // This removes the inner scrollbar on the page body, to prevent showing double scrollbars.
  useEffect(() => {
    isOrdersPanelOpen ? document.body.classList.add('noScroll') : document.body.classList.remove('noScroll')
  }, [isOrdersPanelOpen])

  // const close = useToggleModal(ApplicationModal.MENU)

  return (
    <Wrapper>
      <HeaderModWrapper>
        <HeaderRow>
          <Title href=".">
            <UniIcon>
              <LogoImage />
            </UniIcon>
          </Title>
          <HeaderLinks>
            <StyledNavLink to="/swap">Swap</StyledNavLink>
            <StyledNavLink to="/account">Account</StyledNavLink>
            <StyledNavLink to="/faq">FAQ</StyledNavLink>
            <MenuDropdown title="More">
              <MenuSection>
                <MenuTitle>Overview</MenuTitle>
                <ExternalLink href={DOCS_LINK}>
                  <SVG src={IMAGE_DOCS} description="Docs icon" /> Documentation
                </ExternalLink>
                <StyledNavLink to="/about">
                  <SVG src={IMAGE_INFO} description="About icon" /> About
                </StyledNavLink>
                <ExternalLink href={DUNE_DASHBOARD_LINK}>
                  <SVG src={IMAGE_PIE} description="Pie chart icon" /> Statistics
                </ExternalLink>
                <ExternalLink href={CONTRACTS_CODE_LINK}>
                  <SVG src={IMAGE_CODE} description="Code icon" /> Contract
                </ExternalLink>
              </MenuSection>

              <MenuSection>
                <MenuTitle>Community</MenuTitle>
                <ExternalLink href={DISCORD_LINK}>
                  <SVG src={IMAGE_DISCORD} description="Discord icon" /> Discord
                </ExternalLink>
                <ExternalLink href={TWITTER_LINK}>
                  <SVG src={IMAGE_TWITTER} description="Twitter icon" /> Twitter
                </ExternalLink>
              </MenuSection>

              <MenuSection>
                <MenuTitle>Other</MenuTitle>
                <button onClick={() => toggleDarkMode()}>
                  {darkMode ? (
                    <>
                      <SVG src={IMAGE_SUN} description="Sun light mode icon" /> Light
                    </>
                  ) : (
                    <>
                      <SVG src={IMAGE_MOON} description="Moon dark mode icon" /> Dark
                    </>
                  )}{' '}
                  Mode
                </button>
                <StyledNavLink to="/play/cow-runner">
                  <img src={IMAGE_GAME} alt="Running COW" /> CoW Runner
                </StyledNavLink>
                <StyledNavLink to="/play/mev-slicer">
                  <img src={IMAGE_SLICER} alt="COW Ninja" /> MEV Slicer
                </StyledNavLink>
              </MenuSection>
            </MenuDropdown>
          </HeaderLinks>
        </HeaderRow>

        <HeaderControls>
          <HeaderElement>
            <NetworkSelector />
          </HeaderElement>
          <HeaderElement>
            <VCowWrapper>
              <CowBalanceButton onClick={handleBalanceButtonClick} account={account} chainId={chainId} />
            </VCowWrapper>

            <AccountElement active={!!account} onClick={openOrdersPanel}>
              {account && userEthBalance && (
                <BalanceText>
                  {formatSmart(userEthBalance, AMOUNT_PRECISION) || '0'} {nativeToken}
                </BalanceText>
              )}
              <Web3Status />
            </AccountElement>
          </HeaderElement>
        </HeaderControls>
        {isOrdersPanelOpen && <OrdersPanel closeOrdersPanel={closeOrdersPanel} />}
      </HeaderModWrapper>
    </Wrapper>
  )
}
