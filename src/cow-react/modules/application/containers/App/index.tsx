import { initializeAnalytics } from 'components/AmplitudeAnalytics'
import { useAnalyticsReporter } from 'components/analytics'
import TopLevelModals from 'components/TopLevelModals'
import ApeModeQueryParamReader from 'hooks/useApeModeQueryParamReader'
import ErrorBoundary from 'components/ErrorBoundary'
import Header from 'components/Header'

import DarkModeQueryParamReader from 'theme'

import URLWarning from 'components/Header/URLWarning'
import Footer from 'components/Footer'

import RedirectAnySwapAffectedUsers from '@cow/pages/error/AnySwapAffectedUsers/RedirectAnySwapAffectedUsers'
import { RoutesApp } from './RoutesApp'
import * as styledEl from './styled'
import { useInitializeUtm } from '@cow/modules/utm'

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
