import { useState, useEffect, useCallback, useMemo } from 'react'
import { SupportedChainId as ChainId } from 'constants/chains'
import { Routes } from 'constants/routes'
import { useHistory } from 'react-router-dom'
import { useActiveWeb3React } from 'hooks/web3'
import { useNativeCurrencyBalances } from 'state/wallet/hooks'
import { useDarkModeManager } from 'state/user/hooks'
import { useMediaQuery, upToSmall, upToLarge } from 'hooks/useMediaQuery'
import { AMOUNT_PRECISION } from 'constants/index'
import { MAIN_MENU, MAIN_MENU_TYPE } from 'constants/mainMenu'
import { supportedChainId } from 'utils/supportedChainId'
import { formatSmart } from 'utils/format'
import { toggleBodyClass } from 'utils/toggleBodyClass'
import SVG from 'react-inlinesvg'

// Components
import { ExternalLink } from 'theme/components'
import { HeaderRow } from './HeaderMod'
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
  HeaderElement,
} from './styled'
import MobileMenuIcon from './MobileMenuIcon'
import MenuDropdown from 'components/MenuDropdown'
import { MenuTitle, MenuSection } from 'components/MenuDropdown/styled'
import Web3Status from 'components/Web3Status'
import OrdersPanel from 'components/OrdersPanel'
import NetworkSelector from 'components/Header/NetworkSelector'
import CowBalanceButton from 'components/CowBalanceButton'

// Assets
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
  const isUpToLarge = useMediaQuery(upToLarge)
  const isUpToSmall = useMediaQuery(upToSmall)

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const handleMobileMenuOnClick = useCallback(
    () => isUpToLarge && setIsMobileMenuOpen(!isMobileMenuOpen),
    [isUpToLarge, isMobileMenuOpen]
  )

  // Toggle the 'noScroll' class on body, whenever the orders panel is open.
  // This removes the inner scrollbar on the page body, to prevent showing double scrollbars.
  useEffect(() => {
    isOrdersPanelOpen ? toggleBodyClass('noScroll', true) : toggleBodyClass('noScroll', false)
    isUpToLarge && isMobileMenuOpen ? toggleBodyClass('noScroll', true) : toggleBodyClass('noScroll', false)
  }, [isOrdersPanelOpen, isMobileMenuOpen, isUpToLarge])

  const getMainMenu = useMemo(
    () =>
      MAIN_MENU.map(({ title, url, externalURL, items }: MAIN_MENU_TYPE, index) =>
        !items && !externalURL && url ? (
          <StyledNavLink key={index} to={url} onClick={handleMobileMenuOnClick}>
            {title}
          </StyledNavLink>
        ) : !items && externalURL && url ? (
          <ExternalLink key={index} href={url} onClickOptional={handleMobileMenuOnClick}>
            {title}
          </ExternalLink>
        ) : items ? (
          <MenuDropdown key={index} title={title}>
            {items.map(({ sectionTitle, links }, index) => {
              return (
                <MenuSection key={index}>
                  <MenuTitle>{sectionTitle}</MenuTitle>
                  {links.map(({ title, url, externalURL, icon, iconSVG, action }, index) => {
                    return action && action === 'setColorMode' ? (
                      <button
                        key={index}
                        onClick={() => {
                          toggleDarkMode()
                          handleMobileMenuOnClick()
                        }}
                      >
                        <SVG
                          src={darkMode ? IMAGE_SUN : IMAGE_MOON}
                          description={`${darkMode ? 'Sun/light mode' : 'Moon/dark'} mode icon`}
                        />{' '}
                        {darkMode ? 'Light' : 'Dark'} Mode
                      </button>
                    ) : !externalURL && url ? (
                      <StyledNavLink key={index} to={url} onClick={handleMobileMenuOnClick}>
                        {iconSVG ? (
                          <SVG src={iconSVG} description={`${title} icon`} />
                        ) : icon ? (
                          <img src={icon} alt={`${title} icon`} />
                        ) : null}{' '}
                        {title}
                      </StyledNavLink>
                    ) : url ? (
                      <ExternalLink key={index} href={url} onClickOptional={handleMobileMenuOnClick}>
                        {iconSVG ? (
                          <SVG src={iconSVG} description={`${title} icon`} />
                        ) : icon ? (
                          <img src={icon} alt={`${title} icon`} />
                        ) : null}{' '}
                        {title}
                      </ExternalLink>
                    ) : null
                  })}
                </MenuSection>
              )
            })}
          </MenuDropdown>
        ) : null
      ),
    [darkMode, handleMobileMenuOnClick, toggleDarkMode]
  )

  return (
    <Wrapper>
      <HeaderModWrapper>
        <HeaderRow>
          <Title href={Routes.HOME} isMobileMenuOpen={isMobileMenuOpen}>
            <UniIcon>
              <LogoImage isMobileMenuOpen={isMobileMenuOpen} />
            </UniIcon>
          </Title>
          <HeaderLinks isMobileMenuOpen={isMobileMenuOpen}>{getMainMenu}</HeaderLinks>
        </HeaderRow>

        <HeaderControls>
          <NetworkSelector />

          <HeaderElement>
            <CowBalanceButton
              onClick={handleBalanceButtonClick}
              account={account}
              chainId={chainId}
              isUpToSmall={isUpToSmall}
            />

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

        {isUpToLarge && <MobileMenuIcon isMobileMenuOpen={isMobileMenuOpen} onClick={handleMobileMenuOnClick} />}
        {isOrdersPanelOpen && <OrdersPanel closeOrdersPanel={closeOrdersPanel} />}
      </HeaderModWrapper>
    </Wrapper>
  )
}
