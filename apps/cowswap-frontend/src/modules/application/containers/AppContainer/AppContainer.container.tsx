import { type ReactNode, useMemo, useState } from 'react'

import { initPixelAnalytics, useAnalyticsReporter, useCowAnalytics, WebVitalsAnalytics } from '@cowprotocol/analytics'
import { useFeatureFlags, useMediaQuery } from '@cowprotocol/common-hooks'
import { isInjectedWidget } from '@cowprotocol/common-utils'
import type { NotificationModel } from '@cowprotocol/core'
import { Footer, Media } from '@cowprotocol/ui'
import { useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

import { URLWarning } from 'legacy/components/Header/URLWarning'
import { useDarkModeManager } from 'legacy/state/user/hooks'

import { OrdersPanel } from 'modules/account'
import { AffiliateTraderModal } from 'modules/affiliate'
import { useInjectedWidgetMetaData } from 'modules/injectedWidget'
import { useSpeechBubbleNotification } from 'modules/notifications'
import { useInitializeUtm } from 'modules/utm'

import { CoWAmmBanner } from 'common/containers/CoWAmmBanner'
import { InvalidLocalTimeWarning } from 'common/containers/InvalidLocalTimeWarning'
import { useCustomTheme } from 'common/hooks/useCustomTheme'
import { useGetMarketDimension } from 'common/hooks/useGetMarketDimension'

import { CowSpeechBubbleHiringBanner } from './CowSpeechBubble/CowSpeechBubbleHiringBanner'
import { CowSpeechBubbleNotificationBanner } from './CowSpeechBubble/CowSpeechBubbleNotificationBanner'
import { SnowfallOverlay } from './SnowfallOverlay.pure'

import { PageBackgroundContext, PageBackgroundVariant } from '../../contexts/PageBackgroundContext'
import { ADDITIONAL_FOOTER_CONTENT, PRODUCT_VARIANT } from '../App/menuConsts'
import * as styledEl from '../App/styled'
import { isChristmasTheme as isChristmasThemeHelper } from '../App/styled'
import { AppMenu } from '../AppMenu'
import { NetworkAndAccountControls } from '../NetworkAndAccountControls/NetworkAndAccountControls.container'

// Initialize static analytics instance
const pixel = initPixelAnalytics()

interface AppContainerProps {
  children: ReactNode | ReactNode[]
}

interface CowSpeechBubbleVisibilityParams {
  isInjectedWidgetMode: boolean
  pageScene: ReactNode | null
  pageBackgroundVariant: PageBackgroundVariant
  customTheme: CustomThemeKey
  isChristmasTheme: boolean
}

type CustomThemeKey = ReturnType<typeof useCustomTheme>

interface FooterSectionProps {
  show: boolean
  showCowSpeechBubble: boolean
  currentNotification: NotificationModel | null
  onDismissNotification: () => void
  pageScene: ReactNode | null
}

export function AppContainer({ children }: AppContainerProps): ReactNode {
  const { chainId, account } = useWalletInfo()
  const { walletName } = useWalletDetails()
  const cowAnalytics = useCowAnalytics()
  const webVitals = useMemo(() => new WebVitalsAnalytics(cowAnalytics), [cowAnalytics])
  const { isYieldEnabled, isAffiliateProgramEnabled } = useFeatureFlags()

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
  const { currentNotification, dismiss } = useSpeechBubbleNotification()
  const hasActiveSpeechBubbleNotification = shouldRenderCowSpeechBubble && Boolean(currentNotification)
  const showSnowfall = !isInjectedWidgetMode && isChristmasTheme

  return (
    <PageBackgroundContext.Provider value={pageBackgroundValue}>
      <styledEl.AppWrapper>
        <URLWarning />
        <InvalidLocalTimeWarning />

        <OrdersPanel />

        <AppMenu customTheme={customTheme}>{networkAndAccountControls}</AppMenu>

        {isYieldEnabled && <CoWAmmBanner />}

        <styledEl.BodyWrapper
          customTheme={customTheme}
          backgroundVariant={pageBackgroundVariant}
          $hasActiveSpeechBubbleNotification={hasActiveSpeechBubbleNotification}
        >
          {children}
          <styledEl.Marginer />
        </styledEl.BodyWrapper>

        <SnowfallOverlay show={showSnowfall} isMobile={isMobile} darkMode={darkMode} />
        <FooterSection
          show={!isInjectedWidgetMode}
          showCowSpeechBubble={shouldRenderCowSpeechBubble}
          currentNotification={currentNotification}
          onDismissNotification={dismiss}
          pageScene={pageScene}
        />

        {/* Render MobileHeaderControls outside of MenuBar on mobile */}
        {isMobile && !isInjectedWidgetMode && networkAndAccountControls}
        {isAffiliateProgramEnabled && <AffiliateTraderModal />}
      </styledEl.AppWrapper>
    </PageBackgroundContext.Provider>
  )
}

function FooterSection({
  show,
  showCowSpeechBubble,
  currentNotification,
  onDismissNotification,
  pageScene,
}: FooterSectionProps): ReactNode {
  if (!show) {
    return null
  }

  const bubbleElement: ReactNode = showCowSpeechBubble ? (
    currentNotification ? (
      <CowSpeechBubbleNotificationBanner currentNotification={currentNotification} onClose={onDismissNotification} />
    ) : (
      <CowSpeechBubbleHiringBanner />
    )
  ) : null

  return (
    <styledEl.FooterSlot>
      {bubbleElement}
      {pageScene && <styledEl.SceneContainer>{pageScene}</styledEl.SceneContainer>}
      <Footer productVariant={PRODUCT_VARIANT} additionalFooterContent={ADDITIONAL_FOOTER_CONTENT} hasTouchFooter />
    </styledEl.FooterSlot>
  )
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
