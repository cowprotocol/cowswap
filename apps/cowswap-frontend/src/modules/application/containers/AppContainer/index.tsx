import { type CSSProperties, type ReactNode, useCallback, useMemo, useState } from 'react'

import { initPixelAnalytics, useAnalyticsReporter, useCowAnalytics, WebVitalsAnalytics } from '@cowprotocol/analytics'
import { useFeatureFlags, useMediaQuery } from '@cowprotocol/common-hooks'
import { isInjectedWidget } from '@cowprotocol/common-utils'
import { ClosableBanner, Footer, Media } from '@cowprotocol/ui'
import { useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

import Snowfall from 'react-snowfall'

import { URLWarning } from 'legacy/components/Header/URLWarning'
import { useDarkModeManager } from 'legacy/state/user/hooks'

import { OrdersPanel } from 'modules/account'
import { useInjectedWidgetMetaData } from 'modules/injectedWidget'
import { useInitializeUtm } from 'modules/utm'

import { BANNER_IDS } from 'common/constants/banners'
import { CoWAmmBanner } from 'common/containers/CoWAmmBanner'
import { InvalidLocalTimeWarning } from 'common/containers/InvalidLocalTimeWarning'
import { useCustomTheme } from 'common/hooks/useCustomTheme'
import { useGetMarketDimension } from 'common/hooks/useGetMarketDimension'

import { PageBackgroundContext, PageBackgroundVariant } from '../../contexts/PageBackgroundContext'
import { CowSpeechBubble } from '../App/CowSpeechBubble'
import { ADDITIONAL_FOOTER_CONTENT, PRODUCT_VARIANT } from '../App/menuConsts'
import * as styledEl from '../App/styled'
import { isChristmasTheme as isChristmasThemeHelper } from '../App/styled'
import { AppMenu } from '../AppMenu'
import { NetworkAndAccountControls } from '../NetworkAndAccountControls'

// Initialize static analytics instance
const pixel = initPixelAnalytics()

type CustomThemeKey = ReturnType<typeof useCustomTheme>

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
  const isChristmasTheme = isChristmasThemeHelper(customTheme)
  const shouldRenderCowSpeechBubble = shouldDisplayCowSpeechBubble({
    isInjectedWidgetMode,
    pageScene,
    pageBackgroundVariant,
    customTheme,
    isChristmasTheme,
  })
  const showSnowfall = !isInjectedWidgetMode && isChristmasTheme

  return (
    <PageBackgroundContext.Provider value={pageBackgroundValue}>
      <styledEl.AppWrapper>
        <URLWarning />
        <InvalidLocalTimeWarning />

        <OrdersPanel />

        <AppMenu customTheme={customTheme}>{networkAndAccountControls}</AppMenu>

        {isYieldEnabled && <CoWAmmBanner />}

        <styledEl.BodyWrapper customTheme={customTheme} backgroundVariant={pageBackgroundVariant}>
          {children}
          <styledEl.Marginer />
        </styledEl.BodyWrapper>

        <SnowfallOverlay show={showSnowfall} isMobile={isMobile} darkMode={darkMode} />
        <FooterSection
          show={!isInjectedWidgetMode}
          showCowSpeechBubble={shouldRenderCowSpeechBubble}
          pageScene={pageScene}
        />

        {/* Render MobileHeaderControls outside of MenuBar on mobile */}
        {isMobile && !isInjectedWidgetMode && networkAndAccountControls}
      </styledEl.AppWrapper>
    </PageBackgroundContext.Provider>
  )
}

interface CowSpeechBubbleVisibilityParams {
  isInjectedWidgetMode: boolean
  pageScene: ReactNode | null
  pageBackgroundVariant: PageBackgroundVariant
  customTheme: CustomThemeKey
  isChristmasTheme: boolean
}

function shouldDisplayCowSpeechBubble({
  isInjectedWidgetMode,
  pageScene,
  pageBackgroundVariant,
  customTheme,
  isChristmasTheme,
}: CowSpeechBubbleVisibilityParams): boolean {
  return (
    !isInjectedWidgetMode &&
    !pageScene &&
    pageBackgroundVariant !== 'nocows' &&
    customTheme !== 'darkHalloween' &&
    !isChristmasTheme
  )
}

interface SnowfallOverlayProps {
  show: boolean
  isMobile: boolean
  darkMode: boolean
}

function SnowfallOverlay({ show, isMobile, darkMode }: SnowfallOverlayProps): ReactNode {
  if (!show) {
    return null
  }

  const snowflakeCount = isMobile ? 25 : darkMode ? 75 : 200

  return (
    <Snowfall
      style={SNOWFALL_STYLE}
      snowflakeCount={snowflakeCount}
      radius={[0.5, 2.0]}
      speed={[0.5, 2.0]}
      wind={[-0.5, 1.0]}
    />
  )
}

const SNOWFALL_STYLE: CSSProperties = {
  position: 'fixed',
  width: '100vw',
  height: '100vh',
  zIndex: 3,
  pointerEvents: 'none',
  top: 0,
  left: 0,
}

function CowSpeechBubbleBanner(): ReactNode {
  const callback = useCallback((close: () => void) => <CowSpeechBubble show onClose={close} />, [])

  return <ClosableBanner storageKey={BANNER_IDS.HIRING_SPEECH_BUBBLE} callback={callback} />
}

interface FooterSectionProps {
  show: boolean
  showCowSpeechBubble: boolean
  pageScene: ReactNode | null
}

function FooterSection({ show, showCowSpeechBubble, pageScene }: FooterSectionProps): ReactNode {
  if (!show) {
    return null
  }

  return (
    <styledEl.FooterSlot>
      {showCowSpeechBubble && <CowSpeechBubbleBanner />}
      {pageScene && <styledEl.SceneContainer>{pageScene}</styledEl.SceneContainer>}
      <Footer productVariant={PRODUCT_VARIANT} additionalFooterContent={ADDITIONAL_FOOTER_CONTENT} hasTouchFooter />
    </styledEl.FooterSlot>
  )
}
