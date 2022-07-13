import { useState, useEffect, useCallback } from 'react'
import { SupportedChainId as ChainId } from 'constants/chains'
import { Routes } from 'constants/routes'
import { useHistory } from 'react-router-dom'
import { useActiveWeb3React } from 'hooks/web3'
import { useNativeCurrencyBalances } from 'state/wallet/hooks'
import { useDarkModeManager } from 'state/user/hooks'
import { useMediaQuery, upToSmall, upToMedium, upToLarge, LargeAndUp } from 'hooks/useMediaQuery'
import { AMOUNT_PRECISION } from 'constants/index'

import { supportedChainId } from 'utils/supportedChainId'
import { formatSmart } from 'utils/format'
import { addBodyClass, removeBodyClass } from 'utils/toggleBodyClass'

// Components
import { HeaderRow } from './HeaderMod'
import {
  Wrapper,
  Title,
  LogoImage,
  HeaderModWrapper,
  UniIcon,
  AccountElement,
  BalanceText,
  HeaderControls,
  HeaderElement,
} from './styled'
import { MenuTree } from './MenuTree'
import MobileMenuIcon from './MobileMenuIcon'
import Web3Status from 'components/Web3Status'
import OrdersPanel from 'components/OrdersPanel'
import NetworkSelector from 'components/Header/NetworkSelector'
import CowBalanceButton from 'components/CowBalanceButton'

// Assets
import { toggleDarkModeAnalytics } from 'utils/analytics'

export const NETWORK_LABELS: { [chainId in ChainId]?: string } = {
  [ChainId.RINKEBY]: 'Rinkeby',
  // [ChainId.ROPSTEN]: 'Ropsten',
  // [ChainId.GOERLI]: 'Görli',
  // [ChainId.KOVAN]: 'Kovan',
  [ChainId.GNOSIS_CHAIN]: 'Gnosis Chain',
}

const CHAIN_CURRENCY_LABELS: { [chainId in ChainId]?: string } = {
  [ChainId.GNOSIS_CHAIN]: 'xDAI',
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
  const [darkMode, toggleDarkModeAux] = useDarkModeManager()
  const toggleDarkMode = useCallback(() => {
    toggleDarkModeAnalytics(!darkMode)
    toggleDarkModeAux()
  }, [toggleDarkModeAux, darkMode])

  const [isOrdersPanelOpen, setIsOrdersPanelOpen] = useState<boolean>(false)
  const handleOpenOrdersPanel = () => {
    account && setIsOrdersPanelOpen(true)
  }
  const handleCloseOrdersPanel = () => {
    setIsOrdersPanelOpen(false)
    !isOrdersPanelOpen && removeBodyClass('noScroll')
  }

  const history = useHistory()
  const handleBalanceButtonClick = () => history.push('/account')
  const isUpToLarge = useMediaQuery(upToLarge)
  const isUpToMedium = useMediaQuery(upToMedium)
  const isUpToSmall = useMediaQuery(upToSmall)
  const isLargeAndUp = useMediaQuery(LargeAndUp)

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const handleMobileMenuOnClick = useCallback(() => {
    isUpToLarge && setIsMobileMenuOpen(!isMobileMenuOpen)
  }, [isUpToLarge, isMobileMenuOpen])

  // Toggle the 'noScroll' class on body, whenever the mobile menu or orders panel is open.
  // This removes the inner scrollbar on the page body, to prevent showing double scrollbars.
  useEffect(() => {
    isMobileMenuOpen || isOrdersPanelOpen ? addBodyClass('noScroll') : removeBodyClass('noScroll')
  }, [isOrdersPanelOpen, isMobileMenuOpen, isUpToLarge, isUpToMedium, isUpToSmall, isLargeAndUp])

  return (
    <Wrapper isMobileMenuOpen={isMobileMenuOpen}>
      <HeaderModWrapper>
        <HeaderRow>
          <Title href={Routes.HOME} isMobileMenuOpen={isMobileMenuOpen}>
            <UniIcon>
              <LogoImage isMobileMenuOpen={isMobileMenuOpen} />
            </UniIcon>
          </Title>
          <MenuTree
            isMobileMenuOpen={isMobileMenuOpen}
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
            handleMobileMenuOnClick={handleMobileMenuOnClick}
          />
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

            <AccountElement active={!!account} onClick={handleOpenOrdersPanel}>
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
        {isOrdersPanelOpen && <OrdersPanel handleCloseOrdersPanel={handleCloseOrdersPanel} />}
      </HeaderModWrapper>
    </Wrapper>
  )
}
