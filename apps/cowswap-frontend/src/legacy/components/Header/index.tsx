import React, { useCallback, useMemo, useState } from 'react'

import { toggleDarkModeAnalytics } from '@cowprotocol/analytics'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import SVG from 'react-inlinesvg'
import { useNavigate } from 'react-router-dom'

import CowBalanceButton from 'legacy/components/CowBalanceButton'
import { NetworkSelector } from 'legacy/components/Header/NetworkSelector'
import { upToLarge, upToSmall, useMediaQuery } from 'legacy/hooks/useMediaQuery'
import { useDarkModeManager } from 'legacy/state/user/hooks'
import { cowSwapLogo } from 'legacy/theme/cowSwapAssets'

import { useInjectedWidgetParams } from 'modules/injectedWidget'
import { MainMenuContext } from 'modules/mainMenu'
import { MenuTree } from 'modules/mainMenu/pure/MenuTree'
import { useSwapRawState } from 'modules/swap/hooks/useSwapRawState'
import { useTradeState } from 'modules/trade/hooks/useTradeState'
import { getDefaultTradeRawState } from 'modules/trade/types/TradeRawState'

import { Routes } from 'common/constants/routes'
import { useCategorizeRecentActivity } from 'common/hooks/useCategorizeRecentActivity'
import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'

import { AccountElement } from './AccountElement'
import MobileMenuIcon from './MobileMenuIcon'
import {
  CustomLogoImg,
  HeaderControls,
  HeaderElement,
  HeaderModWrapper,
  HeaderRow,
  LogoImage,
  Title,
  UniIcon,
  Wrapper,
} from './styled'

export default function Header() {
  const { account, chainId } = useWalletInfo()
  const injectedWidgetParams = useInjectedWidgetParams()
  const isChainIdUnsupported = useIsProviderNetworkUnsupported()
  const { pendingActivity } = useCategorizeRecentActivity()
  const [darkMode, toggleDarkModeAux] = useDarkModeManager()
  const toggleDarkMode = useCallback(() => {
    toggleDarkModeAnalytics(!darkMode)
    toggleDarkModeAux()
  }, [toggleDarkModeAux, darkMode])
  const swapRawState = useSwapRawState()
  const { state: tradeState } = useTradeState()

  const navigate = useNavigate()

  const isUpToLarge = useMediaQuery(upToLarge)
  const isUpToSmall = useMediaQuery(upToSmall)

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

  return (
    <Wrapper isMobileMenuOpen={isMobileMenuOpen}>
      <HeaderModWrapper>
        <HeaderRow>
          {!injectedWidgetParams.hideLogo && (
            <Title href={Routes.HOME} isMobileMenuOpen={isMobileMenuOpen}>
              <UniIcon>
                <LogoImage isMobileMenuOpen={isMobileMenuOpen}>
                  {injectedWidgetParams.logoUrl ? (
                    <CustomLogoImg src={injectedWidgetParams.logoUrl} alt="Logo" />
                  ) : (
                    <SVG src={cowSwapLogo(darkMode)} />
                  )}
                </LogoImage>
              </UniIcon>
            </Title>
          )}
          {<MenuTree isMobileMenuOpen={isMobileMenuOpen} context={menuContext} />}
        </HeaderRow>

        <HeaderControls>
          {!injectedWidgetParams.hideNetworkSelector && <NetworkSelector />}

          <HeaderElement>
            {!isChainIdUnsupported && (
              <CowBalanceButton
                onClick={() => navigate('/account')}
                account={account}
                chainId={chainId}
                isUpToSmall={isUpToSmall}
              />
            )}

            <AccountElement pendingActivities={pendingActivity} />
          </HeaderElement>
        </HeaderControls>

        {isUpToLarge && <MobileMenuIcon isMobileMenuOpen={isMobileMenuOpen} onClick={handleMobileMenuOnClick} />}
      </HeaderModWrapper>
    </Wrapper>
  )
}
