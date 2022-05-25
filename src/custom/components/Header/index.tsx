import { useState, useEffect } from 'react'
import { SupportedChainId as ChainId } from 'constants/chains'
import { useHistory } from 'react-router-dom'
import { useActiveWeb3React } from 'hooks/web3'
import { useNativeCurrencyBalances } from 'state/wallet/hooks'
import { useDarkModeManager } from 'state/user/hooks'
import {
  AMOUNT_PRECISION,
  DUNE_DASHBOARD_LINK,
  CONTRACTS_CODE_LINK,
  DOCS_LINK,
  DISCORD_LINK,
  TWITTER_LINK,
} from 'constants/index'
import { supportedChainId } from 'utils/supportedChainId'
import { formatSmart } from 'utils/format'
import SVG from 'react-inlinesvg'

// Components
import { ExternalLink } from 'theme/components'
import { HeaderRow, HeaderElement } from './HeaderMod'
import {
  Wrapper,
  Title,
  LogoImage,
  HeaderLinks,
  HeaderModWrapper,
  UniIcon,
  StyledNavLink,
  AccountElement,
  BalanceText,
  HeaderControls,
  VCowWrapper,
} from './styled'
import MenuDropdown from 'components/MenuDropdown'
import { MenuTitle, MenuSection } from 'components/MenuDropdown/styled'
import Web3Status from 'components/Web3Status'
import OrdersPanel from 'components/OrdersPanel'
import NetworkSelector from 'components/Header/NetworkSelector'
import CowBalanceButton from 'components/CowBalanceButton'

// Assets
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
