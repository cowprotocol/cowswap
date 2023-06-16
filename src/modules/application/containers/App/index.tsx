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
import { useIsStandaloneWidget } from 'modules/widget'

import RedirectAnySwapAffectedUsers from 'pages/error/AnySwapAffectedUsers/RedirectAnySwapAffectedUsers'

import { RoutesApp } from './RoutesApp'
import * as styledEl from './styled'

export function App() {
  initializeAnalytics()
  useAnalyticsReporter()
  useInitializeUtm()
  const isTandaloneWidget = useIsStandaloneWidget()

  return (
    <ErrorBoundary>
      <RedirectAnySwapAffectedUsers />
      <DarkModeQueryParamReader />
      <ApeModeQueryParamReader />
      <styledEl.AppWrapper>
        {!isTandaloneWidget && (
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
        {!isTandaloneWidget && (
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
