import { initializeAnalytics } from 'legacy/components/AmplitudeAnalytics'
import { useAnalyticsReporter } from 'legacy/components/analytics'
import TopLevelModals from 'legacy/components/TopLevelModals'
import ApeModeQueryParamReader from 'legacy/hooks/useApeModeQueryParamReader'
import ErrorBoundary from 'legacy/components/ErrorBoundary'
import Header from 'legacy/components/Header'

import DarkModeQueryParamReader from 'legacy/theme'

import URLWarning from 'legacy/components/Header/URLWarning'
import Footer from 'legacy/components/Footer'

import RedirectAnySwapAffectedUsers from 'pages/error/AnySwapAffectedUsers/RedirectAnySwapAffectedUsers'
import { RoutesApp } from './RoutesApp'
import * as styledEl from './styled'
import { useInitializeUtm } from 'modules/utm'

export function App() {
  initializeAnalytics()
  useAnalyticsReporter()
  useInitializeUtm()

  return (
    <ErrorBoundary>
      <RedirectAnySwapAffectedUsers />
      <DarkModeQueryParamReader />
      <ApeModeQueryParamReader />
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
        <styledEl.FooterWrapper>
          <Footer />
        </styledEl.FooterWrapper>
      </styledEl.AppWrapper>
    </ErrorBoundary>
  )
}
