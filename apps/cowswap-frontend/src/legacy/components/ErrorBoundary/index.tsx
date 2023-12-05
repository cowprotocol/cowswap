import React, { ErrorInfo, PropsWithChildren } from 'react'

import { sendError } from '@cowprotocol/analytics'
import { isInjectedWidget } from '@cowprotocol/common-utils'

import * as Sentry from '@sentry/react'
import styled from 'styled-components/macro'

import { ChunkLoadError } from 'legacy/components/ErrorBoundary/ChunkLoadError'
import { ErrorWithStackTrace } from 'legacy/components/ErrorBoundary/ErrorWithStackTrace'
import Footer from 'legacy/components/Footer'
import { HeaderRow, LogoImage, UniIcon } from 'legacy/components/Header/styled'
import { MEDIA_WIDTHS } from 'legacy/theme'

import { Page } from 'modules/application/pure/Page'

import { Routes } from 'common/constants/routes'

type ErrorBoundaryState = {
  error: Error | null
}

const AppWrapper = styled.div`
  display: flex;
  flex-flow: column;
  align-items: center;
  min-height: 100vh;
  overflow-x: hidden;
  color: inherit;

  &:after {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    filter: blur(20px);
    backdrop-filter: blur(20px);
    background-image: ${({ theme }) => theme.body.background};
    transition: 0.5s;
    z-index: -1;
  }
`

const Wrapper = styled(Page)`
  display: flex;
  flex-direction: column;
  width: 100vw;
  max-width: 60vw;
  margin: 120px 0;
  position: relative;
  z-index: 2;

  @media screen and (max-width: ${MEDIA_WIDTHS.upToSmall}px) {
    max-width: 95vw;
    margin: 0 0 80px;
  }
`

const HeaderWrapper = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  width: 100%;
  justify-content: space-between;
  position: fixed;
  top: 0;
  z-index: 2;
  padding: 16px;
  @media screen and (max-width: ${MEDIA_WIDTHS.upToSmall}px) {
    position: relative;
  }
`
const FooterWrapper = styled(HeaderWrapper)`
  z-index: 1;
  flex-grow: 1;
  width: 100%;
  position: relative;
  top: auto;
`

async function updateServiceWorker(): Promise<ServiceWorkerRegistration> {
  const ready = await navigator.serviceWorker.ready
  // the return type of update is incorrectly typed as Promise<void>. See
  // https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/update
  return ready.update() as unknown as Promise<ServiceWorkerRegistration>
}

export default class ErrorBoundary extends React.Component<PropsWithChildren, ErrorBoundaryState> {
  constructor(props: PropsWithChildren) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    updateServiceWorker()
      .then(async (registration) => {
        // We want to refresh only if we detect a new service worker is waiting to be activated.
        // See details about it: https://developers.google.com/web/fundamentals/primers/service-workers/lifecycle
        if (registration?.waiting) {
          await registration.unregister()

          // Makes Workbox call skipWaiting(). For more info on skipWaiting see: https://developer.chrome.com/docs/workbox/handling-service-worker-updates/
          registration.waiting.postMessage({ type: 'SKIP_WAITING' })

          // Once the service worker is unregistered, we can reload the page to let
          // the browser download a fresh copy of our app (invalidating the cache)
          window.location.reload()
        }
      })
      .catch((error) => {
        console.error('Failed to update service worker', error)
      })
    return { error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    sendError(error, errorInfo)
  }

  render() {
    return (
      <Sentry.ErrorBoundary
        showDialog={false}
        fallback={({ error: sentryError }) => {
          document.body.classList.remove('noScroll')
          const { error: localError } = this.state
          const error = localError || sentryError

          const isChunkLoadError =
            error?.name === 'ChunkLoadError' || error?.message.includes('Failed to fetch dynamically imported module')

          return (
            <AppWrapper>
              {!isInjectedWidget() && (
                <HeaderWrapper>
                  <HeaderRow marginRight="0">
                    <a href={Routes.HOME}>
                      <UniIcon>
                        <LogoImage />
                      </UniIcon>
                    </a>
                  </HeaderRow>
                </HeaderWrapper>
              )}

              <Wrapper>{isChunkLoadError ? <ChunkLoadError /> : <ErrorWithStackTrace error={error} />}</Wrapper>
              <FooterWrapper>
                <Footer />
              </FooterWrapper>
            </AppWrapper>
          )
        }}
      >
        {this.props.children}
      </Sentry.ErrorBoundary>
    )
  }
}
