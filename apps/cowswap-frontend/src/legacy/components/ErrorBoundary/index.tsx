import React, { ErrorInfo, PropsWithChildren } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { isInjectedWidget } from '@cowprotocol/common-utils'
import { MEDIA_WIDTHS } from '@cowprotocol/ui'

import * as Sentry from '@sentry/react'
import styled from 'styled-components/macro'

import { ChunkLoadError } from 'legacy/components/ErrorBoundary/ChunkLoadError'
import { ErrorWithStackTrace } from 'legacy/components/ErrorBoundary/ErrorWithStackTrace'
import { HeaderRow, LogoImage, UniIcon } from 'legacy/components/Header/styled'

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
  background: inherit;
`

const Wrapper = styled(Page)`
  display: flex;
  flex-direction: column;
  width: 100vw;
  max-width: 60vw;
  margin: 120px 0;
  position: relative;
  z-index: 2;
  box-shadow: none;

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

async function updateServiceWorker(): Promise<ServiceWorkerRegistration> {
  const ready = await navigator.serviceWorker.ready
  // the return type of update is incorrectly typed as Promise<void>. See
  // https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/update
  return (await ready.update()) as unknown as Promise<ServiceWorkerRegistration>
}

interface ErrorBoundaryProps extends PropsWithChildren {
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

class ErrorBoundaryComponent extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
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

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.props.onError?.(error, errorInfo)
  }

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  render() {
    return (
      <Sentry.ErrorBoundary
        showDialog={false}
        // TODO: Extract nested component outside render function
        // eslint-disable-next-line react/no-unstable-nested-components
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
            </AppWrapper>
          )
        }}
      >
        {this.props.children}
      </Sentry.ErrorBoundary>
    )
  }
}

// HOC to inject analytics into error boundary
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function ErrorBoundary(props: PropsWithChildren) {
  const cowAnalytics = useCowAnalytics()

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    cowAnalytics.sendError(error, errorInfo.toString())
  }

  return <ErrorBoundaryComponent {...props} onError={handleError} />
}
