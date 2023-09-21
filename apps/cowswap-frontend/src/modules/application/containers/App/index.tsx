import { isInjectedWidget } from '@cowprotocol/common-utils'

import { initializeAnalytics } from 'legacy/components/AmplitudeAnalytics'
import ErrorBoundary from 'legacy/components/ErrorBoundary'
import Footer from 'legacy/components/Footer'
import Header from 'legacy/components/Header'
import URLWarning from 'legacy/components/Header/URLWarning'
import TopLevelModals from 'legacy/components/TopLevelModals'
import DarkModeQueryParamReader from 'legacy/theme'

import { useInitializeUtm } from 'modules/utm'

import RedirectAnySwapAffectedUsers from 'pages/error/AnySwapAffectedUsers/RedirectAnySwapAffectedUsers'

import { RoutesApp } from './RoutesApp'
import * as styledEl from './styled'

import { useAnalyticsReporter } from '../../../../common/hooks/useAnalyticsReporter'

export function App() {
  initializeAnalytics()
  useAnalyticsReporter()
  useInitializeUtm()

  const isInjectedWidgetMode = isInjectedWidget()

  return (
    <ErrorBoundary>
      <RedirectAnySwapAffectedUsers />
      <DarkModeQueryParamReader />

      <styledEl.AppWrapper>
        <URLWarning />
        <styledEl.HeaderWrapper>
          <Header />
        </styledEl.HeaderWrapper>
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
          </styledEl.FooterWrapper>
        )}
      </styledEl.AppWrapper>
    </ErrorBoundary>
  )
}
