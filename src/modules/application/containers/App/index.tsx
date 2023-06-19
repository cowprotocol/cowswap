import { initializeAnalytics } from 'legacy/components/AmplitudeAnalytics'
import { useAnalyticsReporter } from 'legacy/components/analytics'
import ErrorBoundary from 'legacy/components/ErrorBoundary'
import Footer from 'legacy/components/Footer'
import Header from 'legacy/components/Header'
import URLWarning from 'legacy/components/Header/URLWarning'
import TopLevelModals from 'legacy/components/TopLevelModals'
import ApeModeQueryParamReader from 'legacy/hooks/useApeModeQueryParamReader'
import DarkModeQueryParamReader from 'legacy/theme'

import { useInitializeUtm } from 'modules/utm'
import { isStandaloneWidget } from 'modules/widget'

import RedirectAnySwapAffectedUsers from 'pages/error/AnySwapAffectedUsers/RedirectAnySwapAffectedUsers'

import { RoutesApp } from './RoutesApp'
import * as styledEl from './styled'

export function App() {
  initializeAnalytics()
  useAnalyticsReporter()
  useInitializeUtm()
  const isTandaloneWidgetMode = isStandaloneWidget()

  return (
    <ErrorBoundary>
      <RedirectAnySwapAffectedUsers />
      <DarkModeQueryParamReader />
      <ApeModeQueryParamReader />
      <styledEl.AppWrapper>
        {!isTandaloneWidgetMode && (
          <>
            <URLWarning />
            <styledEl.HeaderWrapper>
              <Header />
            </styledEl.HeaderWrapper>
          </>
        )}
        <styledEl.BodyWrapper>
          <TopLevelModals />
          <RoutesApp />
          <styledEl.Marginer />
        </styledEl.BodyWrapper>
        {!isTandaloneWidgetMode && (
          <>
            <styledEl.FooterWrapper>
              <Footer />
            </styledEl.FooterWrapper>
          </>
        )}
      </styledEl.AppWrapper>
    </ErrorBoundary>
  )
}
