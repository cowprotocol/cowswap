import { WIDGET_IFRAME_ALLOW, WIDGET_IFRAME_REFERRER_POLICY, WIDGET_IFRAME_SANDBOX } from './cowSwapWidget.constants'
import { WidgetMethodsEmit } from './types'
import { widgetIframeTransport } from './widgetIframeTransport'

const IFRAME_LOADING_TIMEOUT = 30_000 // 30 sec
/** After the probe iframe document loads, wait this long for READY before treating the probe as failed. */
const PROBE_READY_WAIT_TIMEOUT = 10_000 // 10 sec
const WIDGET_TRANSPORT_KEY = 'cowSwapWidget'
const WIDGET_LOAD_RETRY = 'WIDGET_LOAD_RETRY'

const RELOAD_BUTTON_CLASS = 'reloadButton'
const RETRY_BUTTON_LABEL = 'Retry'
const RETRY_BUTTON_LOADING_LABEL = 'Loading...'

type IframeLoadingState = { cancelWidgetLoading: () => void; onWidgetReady: () => void }
type WindowListener = (event: MessageEvent) => void

function isWidgetLoadRetryMessage(data: unknown): boolean {
  return (
    typeof data === 'object' &&
    data !== null &&
    'key' in data &&
    data.key === WIDGET_TRANSPORT_KEY &&
    'method' in data &&
    data.method === WIDGET_LOAD_RETRY
  )
}

// eslint-disable-next-line max-lines-per-function
export function widgetIframeLoading(
  iframe: HTMLIFrameElement,
  onWidgetLoadingError?: () => void,
  customErrorStyles?: string,
): IframeLoadingState {
  const originalSrc = iframe.src
  const widgetOrigin = new URL(originalSrc).origin

  let cancelled = false
  let isLoaded = false
  let loadingTimeoutID = 0
  let tempIframe: HTMLIFrameElement | null = null
  let checkIfCowSwapLoadsTimeoutID = 0
  let activeProbeReadyListener: WindowListener | null = null
  let isCheckingIfCowSwapLoads = false

  function cleanUpLoadCheck(isChecking = false): void {
    clearTimeout(checkIfCowSwapLoadsTimeoutID)
    isCheckingIfCowSwapLoads = isChecking

    if (activeProbeReadyListener) {
      window.removeEventListener('message', activeProbeReadyListener)
      activeProbeReadyListener = null
    }

    if (tempIframe) {
      tempIframe.remove()
      tempIframe = null
    }
  }

  function showErrorDocument(emitEvent = false): void {
    if (cancelled || isLoaded) return

    clearTimeout(loadingTimeoutID)

    iframe.srcdoc = buildErrorDocument(customErrorStyles)

    if (emitEvent && onWidgetLoadingError) onWidgetLoadingError()
  }

  function startLoadingTimeout(): void {
    clearTimeout(loadingTimeoutID)

    loadingTimeoutID = window.setTimeout(() => showErrorDocument(true), IFRAME_LOADING_TIMEOUT)
  }

  function completeCleanUpLoadCheck(succeeded: boolean): void {
    if (!isCheckingIfCowSwapLoads) return

    cleanUpLoadCheck()

    if (cancelled || isLoaded) return

    if (succeeded) {
      // `srcdoc` takes precedence over `src`, so it must be removed to load the widget again
      iframe.removeAttribute('srcdoc')
      iframe.src = originalSrc
      startLoadingTimeout()
      return
    }

    // Reset the error document
    showErrorDocument(!iframe.hasAttribute('srcdoc'))
  }

  function checkIfCowSwapLoads(): void {
    if (cancelled || isLoaded || isCheckingIfCowSwapLoads) return

    cleanUpLoadCheck(true)

    tempIframe = document.createElement('iframe')
    tempIframe.setAttribute('sandbox', iframe.getAttribute('sandbox') ?? WIDGET_IFRAME_SANDBOX)
    tempIframe.referrerPolicy = iframe.referrerPolicy || WIDGET_IFRAME_REFERRER_POLICY
    tempIframe.allow = iframe.allow || WIDGET_IFRAME_ALLOW
    tempIframe.style.cssText = 'position:absolute;width:0;height:0;border:0;visibility:hidden'
    document.body.appendChild(tempIframe)

    const iframeContentWindow = tempIframe.contentWindow

    if (!iframeContentWindow) {
      completeCleanUpLoadCheck(false)
      return
    }

    tempIframe.addEventListener('error', () => {
      completeCleanUpLoadCheck(false)
    })

    tempIframe.addEventListener('load', () => {
      // Browsers might just fire `load` event instead of `error`, so we wait briefly for READY:
      clearTimeout(checkIfCowSwapLoadsTimeoutID)
      checkIfCowSwapLoadsTimeoutID = window.setTimeout(() => {
        completeCleanUpLoadCheck(false)
      }, PROBE_READY_WAIT_TIMEOUT)
    })

    tempIframe.src = originalSrc

    activeProbeReadyListener = widgetIframeTransport.listenToMessageFromWindow(
      window,
      iframeContentWindow,
      WidgetMethodsEmit.READY,
      () => completeCleanUpLoadCheck(true),
      widgetOrigin,
    )

    // Fallback when the probe navigation never fires `load` (rare).
    checkIfCowSwapLoadsTimeoutID = window.setTimeout(() => {
      completeCleanUpLoadCheck(false)
    }, IFRAME_LOADING_TIMEOUT)
  }

  function onRetryMessage(event: MessageEvent): void {
    if (cancelled || isLoaded || isCheckingIfCowSwapLoads) return
    if (event.source !== iframe.contentWindow) return
    if (!isWidgetLoadRetryMessage(event.data)) return

    checkIfCowSwapLoads()
  }

  iframe.addEventListener('error', (iframeLoadingError) => {
    if (cancelled) return

    console.error('Could not load iframe', iframeLoadingError)

    showErrorDocument(true)
  })

  window.addEventListener('message', onRetryMessage)

  startLoadingTimeout()

  return {
    cancelWidgetLoading() {
      cancelled = true
      clearTimeout(loadingTimeoutID)
      cleanUpLoadCheck()
      window.removeEventListener('message', onRetryMessage)
    },
    onWidgetReady() {
      isLoaded = true
      clearTimeout(loadingTimeoutID)
    },
  }
}

/**
 * Escapes `<` so integrator CSS cannot break out of the inline `<style>` element.
 */
function sanitizeInlineStyle(css: string): string {
  return css.replace(/</g, '\\3C ')
}

/**
 * HTML document displayed inside the iframe (via `srcdoc`) when the widget fails to load.
 * Rendering the error inside the iframe keeps the DOM structure and iframe attributes/styles
 * set by the integrator intact.
 *
 * Retry and loading UI are handled by an inline script inside the error document, because the
 * parent cannot reliably access the iframe DOM at load time in every browser.
 */
// eslint-disable-next-line max-lines-per-function
function buildErrorDocument(customErrorStyles?: string): string {
  const integratorStyles = customErrorStyles ? `<style>${sanitizeInlineStyle(customErrorStyles)}</style>` : ''

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <style>
      html, body { margin: 0; padding: 0; width: 100%; height: 100%; }

      p { margin: 0 }

      :root {
        --c-background: #fff5f5;
        --c-text: #d32f2f;

        --button-border: 1px solid var(--c-text);
        --button-background: transparent;
        --button-color: var(--c-text);

        --button-disabled-border: 1px solid var(--c-text);
        --button-disabled-background: transparent;
        --button-disabled-color: var(--c-text);

        --button-hover-border: 1px solid var(--c-text);
        --button-hover-background: var(--c-text);
        --button-hover-color: var(--c-background);
      }

      .errorContent {
        display: flex;
        flex-direction: column;
        gap: 16px;
        align-items: center;
        justify-content: center;
        text-align: center;
        width: 100%;
        height: 100%;
        padding: 24px;
        box-sizing: border-box;
        background: var(--c-background);
        color: var(--c-text);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 14px;
        line-height: 1.5;
        font-weight: 500;
      }

      .${RELOAD_BUTTON_CLASS} {
        padding: 8px 24px;
        border-radius: 8px;
        font: inherit;
        cursor: pointer;
        border: var(--button-border);
        background: var(--button-background);
        color: var(--button-color);
      }

      .${RELOAD_BUTTON_CLASS}:disabled {
        border: var(--button-disabled-border);
        background: var(--button-disabled-background);
        color: var(--button-disabled-color);
        cursor: progress;
        opacity: 0.75;
      }

      .${RELOAD_BUTTON_CLASS}:not(:disabled):hover {
        border: var(--button-hover-border);
        background: var(--button-hover-background);
        color: var(--button-hover-color);
      }
    </style>
    ${integratorStyles}
  </head>
  <body>
    <div class="errorContent">
      <p>Couldn't load the page. Please, try again later.</p>

      <button type="button" class="${RELOAD_BUTTON_CLASS}">${RETRY_BUTTON_LABEL}</button>
    </div>
    <script>
      document.addEventListener('DOMContentLoaded', () => {
        const button = document.querySelector('.${RELOAD_BUTTON_CLASS}');

        if (!button) return;

        button.addEventListener('click', () => {
          button.disabled = true;
          button.textContent = '${RETRY_BUTTON_LOADING_LABEL}';
          window.parent.postMessage({ key: '${WIDGET_TRANSPORT_KEY}', method: '${WIDGET_LOAD_RETRY}' }, '*');
        });
      });
    </script>
  </body>
</html>`
}
