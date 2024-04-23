import { CHRISTMAS_THEME_ENABLED } from '@cowprotocol/common-const'
import { isInjectedWidget } from '@cowprotocol/common-utils'

import ErrorBoundary from 'legacy/components/ErrorBoundary'
import Footer from 'legacy/components/Footer'
import Header from 'legacy/components/Header'
import { URLWarning } from 'legacy/components/Header/URLWarning'
import TopLevelModals from 'legacy/components/TopLevelModals'
import DarkModeQueryParamReader from 'legacy/theme'

import { OrdersPanel } from 'modules/account'
import { useInitializeUtm } from 'modules/utm'
import { WinterFooter } from 'modules/winterEdition'

import { InvalidLocalTimeWarning } from 'common/containers/InvalidLocalTimeWarning'
import { useAnalyticsReporter } from 'common/hooks/useAnalyticsReporter'
import RedirectAnySwapAffectedUsers from 'pages/error/AnySwapAffectedUsers/RedirectAnySwapAffectedUsers'

import { RoutesApp } from './RoutesApp'
import * as styledEl from './styled'

export function App() {
  useAnalyticsReporter()
  useInitializeUtm()

  const isInjectedWidgetMode = isInjectedWidget()

  return (
    <ErrorBoundary>
      <RedirectAnySwapAffectedUsers />
      <DarkModeQueryParamReader />

      <styledEl.AppWrapper>
        <URLWarning />
        <InvalidLocalTimeWarning />

        <OrdersPanel />

        {/* Hide header for injected widget mode */}
        {!isInjectedWidgetMode && (
          <styledEl.HeaderWrapper>
            <Header />
          </styledEl.HeaderWrapper>
        )}

        <styledEl.BodyWrapper>
          <TopLevelModals />
          <RoutesApp />
          <styledEl.Marginer />
        </styledEl.BodyWrapper>

        {isInjectedWidgetMode ? (
          <styledEl.MarginerBottom></styledEl.MarginerBottom>
        ) : (
          <styledEl.FooterWrapper>
            <Footer />
            {CHRISTMAS_THEME_ENABLED && <WinterFooter />} {/* Winter Themed Footer */}
          </styledEl.FooterWrapper>
        )}
      </styledEl.AppWrapper>
    </ErrorBoundary>
  )
}
