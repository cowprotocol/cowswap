import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { SupportedChainId as ChainId, SupportedChainId } from '@cowprotocol/cow-sdk'

import SVG from 'react-inlinesvg'
import { useNavigate } from 'react-router-dom'

import { toggleDarkModeAnalytics } from 'legacy/components/analytics'
import CowBalanceButton from 'legacy/components/CowBalanceButton'
import NetworkSelector from 'legacy/components/Header/NetworkSelector'
import { LargeAndUp, upToLarge, upToMedium, upToSmall, useMediaQuery } from 'legacy/hooks/useMediaQuery'
import { useDarkModeManager } from 'legacy/state/user/hooks'
import { cowSwapLogo } from 'legacy/theme/cowSwapAssets'
import { supportedChainId } from 'legacy/utils/supportedChainId'
import { addBodyClass, removeBodyClass } from 'legacy/utils/toggleBodyClass'

import { OrdersPanel } from 'modules/account/containers/OrdersPanel'
import { MainMenuContext, useMenuItems } from 'modules/mainMenu'
import { MenuTree } from 'modules/mainMenu/pure/MenuTree'
import { useSwapRawState } from 'modules/swap/hooks/useSwapRawState'
import { useNativeCurrencyBalances } from 'modules/tokens/hooks/useCurrencyBalance'
import { useTradeState } from 'modules/trade/hooks/useTradeState'
import { getDefaultTradeRawState } from 'modules/trade/types/TradeRawState'
import { useWalletInfo, Web3Status } from 'modules/wallet'

import { TokenAmount } from 'common/pure/TokenAmount'
import { Routes } from 'constants/routes'

import MobileMenuIcon from './MobileMenuIcon'
import {
  AccountElement,
  BalanceText,
  HeaderControls,
  HeaderElement,
  HeaderModWrapper,
  HeaderRow,
  LogoImage,
  Title,
  UniIcon,
  Wrapper,
} from './styled'

// Assets

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

  const menuItems = useMenuItems()

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

    // When network was changed - use the default trade state
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
          <MenuTree items={menuItems} isMobileMenuOpen={isMobileMenuOpen} context={menuContext} />
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
