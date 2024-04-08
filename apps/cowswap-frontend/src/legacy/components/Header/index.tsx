import React, { useCallback, useMemo, useState } from 'react'

import { toggleDarkModeAnalytics } from '@cowprotocol/analytics'
import { CHRISTMAS_THEME_ENABLED } from '@cowprotocol/common-const'
import { addBodyClass, removeBodyClass } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import SVG from 'react-inlinesvg'
import { useNavigate } from 'react-router-dom'

import CowBalanceButton from 'legacy/components/CowBalanceButton'
import { NetworkSelector } from 'legacy/components/Header/NetworkSelector'
import { upToLarge, upToExtraSmall, useMediaQuery, upToTiny } from 'legacy/hooks/useMediaQuery'
import { useDarkModeManager } from 'legacy/state/user/hooks'
import { cowSwapLogo, cowSwapIcon, winterThemeHat } from 'legacy/theme/cowSwapAssets'

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
  HeaderControls,
  HeaderElement,
  HeaderModWrapper,
  HeaderRow,
  LogoImage,
  WinterHat,
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
  const isUpToExtraSmall = useMediaQuery(upToExtraSmall)
  const isUpToTiny = useMediaQuery(upToTiny)

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const handleMobileMenuOnClick = useCallback(() => {
    if (isUpToLarge) {
      setIsMobileMenuOpen(!isMobileMenuOpen)

      if (!isMobileMenuOpen) {
        addBodyClass('noScroll')
      } else {
        removeBodyClass('noScroll')
      }
    }
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
                  <SVG src={isUpToExtraSmall ? cowSwapIcon(darkMode) : cowSwapLogo(darkMode)} />
                </LogoImage>

                {/* WINTER THEME ONLY */}
                {CHRISTMAS_THEME_ENABLED && (
                  <WinterHat>
                    <SVG src={winterThemeHat(darkMode)} />
                  </WinterHat>
                )}
                {/* WINTER THEME ONLY */}
              </UniIcon>
            </Title>
          )}
          {
            <MenuTree
              isMobileMenuOpen={isMobileMenuOpen}
              context={menuContext}
              handleMobileMenuOnClick={handleMobileMenuOnClick}
            />
          }
        </HeaderRow>

        <HeaderControls>
          {!injectedWidgetParams.hideNetworkSelector && <NetworkSelector />}

          <HeaderElement>
            {!isChainIdUnsupported && (isMobileMenuOpen || !isUpToLarge || isUpToTiny) && (
              <CowBalanceButton
                onClick={() => {
                  navigate('/account')
                  handleMobileMenuOnClick()
                }}
                account={account}
                chainId={chainId}
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
