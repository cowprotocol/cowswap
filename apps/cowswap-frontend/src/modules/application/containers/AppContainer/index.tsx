import { ReactNode } from 'react'

import { initPixelAnalytics, useAnalyticsReporter, useCowAnalytics, WebVitalsAnalytics } from '@cowprotocol/analytics'
import { useFeatureFlags, useMediaQuery } from '@cowprotocol/common-hooks'
import { isInjectedWidget } from '@cowprotocol/common-utils'
import { Footer, Media } from '@cowprotocol/ui'
import { useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

import Snowfall from 'react-snowfall'

import { AccountElement } from 'legacy/components/Header/AccountElement'
import { NetworkSelector } from 'legacy/components/Header/NetworkSelector'
import { HeaderControls, HeaderElement } from 'legacy/components/Header/styled'
import { URLWarning } from 'legacy/components/Header/URLWarning'
import { TopLevelModals } from 'legacy/components/TopLevelModals'
import { useDarkModeManager } from 'legacy/state/user/hooks'

import { OrdersPanel } from 'modules/account'
import { useInjectedWidgetMetaData, useInjectedWidgetParams } from 'modules/injectedWidget'
import { useInitializeUtm } from 'modules/utm'

import { CoWAmmBanner } from 'common/containers/CoWAmmBanner'
import { InvalidLocalTimeWarning } from 'common/containers/InvalidLocalTimeWarning'
import { useCategorizeRecentActivity } from 'common/hooks/useCategorizeRecentActivity'
import { useCustomTheme } from 'common/hooks/useCustomTheme'
import { useGetMarketDimension } from 'common/hooks/useGetMarketDimension'

import { ADDITIONAL_FOOTER_CONTENT, PRODUCT_VARIANT } from '../App/menuConsts'
import { RoutesApp } from '../App/RoutesApp'
import * as styledEl from '../App/styled'
import { AppMenu } from '../AppMenu'

// Initialize static analytics instance
const pixel = initPixelAnalytics()

export function AppContainer(): ReactNode {
  const { chainId, account } = useWalletInfo()
  const { walletName } = useWalletDetails()
  const cowAnalytics = useCowAnalytics()
  const webVitals = new WebVitalsAnalytics(cowAnalytics)

  useAnalyticsReporter({
    account,
    chainId,
    walletName,
    cowAnalytics,
    pixelAnalytics: pixel,
    webVitalsAnalytics: webVitals,
    marketDimension: useGetMarketDimension() || undefined,
    injectedWidgetAppId: useInjectedWidgetMetaData()?.appCode,
  })

  useInitializeUtm()

  const { isYieldEnabled } = useFeatureFlags()
  const isInjectedWidgetMode = isInjectedWidget()
  const [darkMode] = useDarkModeManager()

  const { hideNetworkSelector } = useInjectedWidgetParams()
  const { pendingActivity } = useCategorizeRecentActivity()
  const isMobile = useMediaQuery(Media.upToMedium(false))

  const customTheme = useCustomTheme()

  const persistentAdditionalContent = (
    <HeaderControls>
      {!hideNetworkSelector && <NetworkSelector />}
      <HeaderElement>
        <AccountElement pendingActivities={pendingActivity} />
      </HeaderElement>
    </HeaderControls>
  )

  const isChristmasTheme = customTheme === 'darkChristmas' || customTheme === 'lightChristmas'

  return (
    <styledEl.AppWrapper>
      <URLWarning />
      <InvalidLocalTimeWarning />

      <OrdersPanel />

      <AppMenu>{persistentAdditionalContent}</AppMenu>

      {isYieldEnabled && <CoWAmmBanner />}

      <styledEl.BodyWrapper customTheme={customTheme}>
        <TopLevelModals />
        <RoutesApp />
        <styledEl.Marginer />
      </styledEl.BodyWrapper>

      {!isInjectedWidgetMode && isChristmasTheme && (
        <Snowfall
          style={{
            position: 'fixed',
            width: '100vw',
            height: '100vh',
            zIndex: 3,
            pointerEvents: 'none',
            top: 0,
            left: 0,
          }}
          snowflakeCount={isMobile ? 25 : darkMode ? 75 : 200}
          radius={[0.5, 2.0]}
          speed={[0.5, 2.0]}
          wind={[-0.5, 1.0]}
        />
      )}

      {!isInjectedWidgetMode && (
        <Footer productVariant={PRODUCT_VARIANT} additionalFooterContent={ADDITIONAL_FOOTER_CONTENT} hasTouchFooter />
      )}

      {/* Render MobileHeaderControls outside of MenuBar on mobile */}
      {isMobile && !isInjectedWidgetMode && persistentAdditionalContent}
    </styledEl.AppWrapper>
  )
}
