import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
import { Routes } from '@cow/constants/routes'
import { useNavigate } from 'react-router-dom'
import { useDarkModeManager } from 'state/user/hooks'
import { useMediaQuery, upToSmall, upToMedium, upToLarge, LargeAndUp } from 'hooks/useMediaQuery'

import { supportedChainId } from 'utils/supportedChainId'
import { addBodyClass, removeBodyClass } from 'utils/toggleBodyClass'

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
  HeaderRow,
} from './styled'

import MobileMenuIcon from './MobileMenuIcon'
import { useWalletInfo, Web3Status } from '@cow/modules/wallet'
import { OrdersPanel } from '@cow/modules/account/containers/OrdersPanel'
import NetworkSelector from 'components/Header/NetworkSelector'
import CowBalanceButton from 'components/CowBalanceButton'
import SVG from 'react-inlinesvg'
import { cowSwapLogo } from 'theme/cowSwapAssets'

// Assets
import { toggleDarkModeAnalytics } from 'components/analytics'
import { useTradeState } from '@cow/modules/trade/hooks/useTradeState'
import { MAIN_MENU, MainMenuContext } from '@cow/modules/mainMenu'
import { MenuTree } from '@cow/modules/mainMenu/pure/MenuTree'
import { getDefaultTradeRawState } from '@cow/modules/trade/types/TradeRawState'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { TokenAmount } from '@cow/common/pure/TokenAmount'
import { useNativeCurrencyBalances } from '@cow/modules/tokens/hooks/useCurrencyBalance'
import { useSwapRawState } from '@cow/modules/swap/hooks/useSwapRawState'

const CHAIN_CURRENCY_LABELS: { [chainId in ChainId]?: string } = {
  [ChainId.GNOSIS_CHAIN]: 'xDAI',
}

export default function Header() {
  const { account, chainId: connectedChainId } = useWalletInfo()
  const chainId = supportedChainId(connectedChainId)

  const userEthBalance = useNativeCurrencyBalances(account ? [account] : [])?.[account ?? '']
  const nativeToken = chainId && (CHAIN_CURRENCY_LABELS[chainId] || 'ETH')
  const [darkMode, toggleDarkModeAux] = useDarkModeManager()
  const toggleDarkMode = useCallback(() => {
    toggleDarkModeAnalytics(!darkMode)
    toggleDarkModeAux()
  }, [toggleDarkModeAux, darkMode])
  const swapRawState = useSwapRawState()
  const { state: tradeState } = useTradeState()

  const [isOrdersPanelOpen, setIsOrdersPanelOpen] = useState<boolean>(false)
  const handleOpenOrdersPanel = () => {
    account && setIsOrdersPanelOpen(true)
  }
  const handleCloseOrdersPanel = () => {
    setIsOrdersPanelOpen(false)
    !isOrdersPanelOpen && removeBodyClass('noScroll')
  }

  const navigate = useNavigate()
  const handleBalanceButtonClick = () => navigate('/account')
  const isUpToLarge = useMediaQuery(upToLarge)
  const isUpToMedium = useMediaQuery(upToMedium)
  const isUpToSmall = useMediaQuery(upToSmall)
  const isLargeAndUp = useMediaQuery(LargeAndUp)

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const handleMobileMenuOnClick = useCallback(() => {
    isUpToLarge && setIsMobileMenuOpen(!isMobileMenuOpen)
  }, [isUpToLarge, isMobileMenuOpen])

  const tradeMenuContext = useMemo(() => {
    const state = tradeState || swapRawState
    const defaultTradeState = getDefaultTradeRawState(chainId || state.chainId || SupportedChainId.MAINNET)
    const networkWasChanged = chainId && state.chainId && chainId !== state.chainId

    // When network was changed - use the deafult trade state
    const inputCurrencyId =
      (networkWasChanged
        ? defaultTradeState.inputCurrencyId
        : state.inputCurrencyId || defaultTradeState.inputCurrencyId) || undefined
    const outputCurrencyId =
      (networkWasChanged
        ? defaultTradeState.outputCurrencyId
        : state.outputCurrencyId || defaultTradeState.outputCurrencyId) || undefined

    return {
      inputCurrencyId,
      outputCurrencyId,
      chainId: defaultTradeState.chainId?.toString(),
    }
  }, [chainId, tradeState, swapRawState])

  const menuContext: MainMenuContext = {
    darkMode,
    toggleDarkMode,
    handleMobileMenuOnClick,
    tradeContext: tradeMenuContext,
  }

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
              <LogoImage isMobileMenuOpen={isMobileMenuOpen}>
                <SVG src={cowSwapLogo(darkMode)} />
              </LogoImage>
            </UniIcon>
          </Title>
          <MenuTree items={MAIN_MENU} isMobileMenuOpen={isMobileMenuOpen} context={menuContext} />
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
              {account && userEthBalance && chainId && (
                <BalanceText>
                  <TokenAmount amount={userEthBalance} tokenSymbol={{ symbol: nativeToken }} />
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
