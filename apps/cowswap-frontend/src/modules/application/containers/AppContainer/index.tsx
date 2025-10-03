import { ReactNode, useMemo, useState } from 'react'

import { initPixelAnalytics, useAnalyticsReporter, useCowAnalytics, WebVitalsAnalytics } from '@cowprotocol/analytics'
import { useFeatureFlags, useMediaQuery } from '@cowprotocol/common-hooks'
import { isInjectedWidget } from '@cowprotocol/common-utils'
import { Footer, Media } from '@cowprotocol/ui'
import { useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

import Snowfall from 'react-snowfall'

import { URLWarning } from 'legacy/components/Header/URLWarning'
import { useDarkModeManager } from 'legacy/state/user/hooks'

import { OrdersPanel } from 'modules/account'
import { useInjectedWidgetMetaData } from 'modules/injectedWidget'
import { useInitializeUtm } from 'modules/utm'

import { CoWAmmBanner } from 'common/containers/CoWAmmBanner'
import { InvalidLocalTimeWarning } from 'common/containers/InvalidLocalTimeWarning'
import { useCustomTheme } from 'common/hooks/useCustomTheme'
import { useGetMarketDimension } from 'common/hooks/useGetMarketDimension'

import { PageBackgroundContext, PageBackgroundVariant } from '../../contexts/PageBackgroundContext'
import { ADDITIONAL_FOOTER_CONTENT, PRODUCT_VARIANT } from '../App/menuConsts'
import * as styledEl from '../App/styled'
import { AppMenu } from '../AppMenu'
import { NetworkAndAccountControls } from '../NetworkAndAccountControls'

// Initialize static analytics instance
const pixel = initPixelAnalytics()

interface AppContainerProps {
  children: ReactNode | ReactNode[]
}

export function AppContainer({ children }: AppContainerProps): ReactNode {
  const { chainId, account } = useWalletInfo()
  const { walletName } = useWalletDetails()
  const cowAnalytics = useCowAnalytics()
  const webVitals = useMemo(() => new WebVitalsAnalytics(cowAnalytics), [cowAnalytics])

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
  const [pageBackgroundVariant, setPageBackgroundVariant] = useState<PageBackgroundVariant>('default')
  const [pageScene, setPageScene] = useState<ReactNode | null>(null)

  const isMobile = useMediaQuery(Media.upToMedium(false))

  const customTheme = useCustomTheme()
  const pageBackgroundValue = useMemo(
    () => ({
      variant: pageBackgroundVariant,
      setVariant: setPageBackgroundVariant,
      scene: pageScene,
      setScene: setPageScene,
    }),
    [pageBackgroundVariant, pageScene],
  )

  const networkAndAccountControls = <NetworkAndAccountControls />

  const isChristmasTheme = customTheme === 'darkChristmas' || customTheme === 'lightChristmas'

  return (
    <PageBackgroundContext.Provider value={pageBackgroundValue}>
      <styledEl.AppWrapper>
        <URLWarning />
        <InvalidLocalTimeWarning />

        <OrdersPanel />

        <AppMenu>{networkAndAccountControls}</AppMenu>

        {isYieldEnabled && <CoWAmmBanner />}

        <styledEl.BodyWrapper customTheme={customTheme} backgroundVariant={pageBackgroundVariant}>
          {children}
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
          <styledEl.FooterSlot>
            {pageScene && <styledEl.SceneContainer>{pageScene}</styledEl.SceneContainer>}
            <Footer productVariant={PRODUCT_VARIANT} additionalFooterContent={ADDITIONAL_FOOTER_CONTENT} hasTouchFooter />
          </styledEl.FooterSlot>
        )}

        {/* Render MobileHeaderControls outside of MenuBar on mobile */}
        {isMobile && !isInjectedWidgetMode && networkAndAccountControls}
      </styledEl.AppWrapper>
    </PageBackgroundContext.Provider>
  )
}
