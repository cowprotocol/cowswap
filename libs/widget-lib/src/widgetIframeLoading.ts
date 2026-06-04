const IFRAME_LOADING_TIMEOUT = 30_000 // 30 sec

const RELOAD_BUTTON_CLASS = 'coWWidgetContentReloadButton'

type IframeLoadingState = { cancelWidgetLoading: () => void; onWidgetReady: () => void }

export function widgetIframeLoading(
  iframe: HTMLIFrameElement,
  onWidgetLoadingError?: () => void,
  customErrorStyles?: string,
): IframeLoadingState {
  const originalSrc = iframe.src

  let cancelled = false
  let isLoaded = false
  let loadingTimeout: ReturnType<typeof setTimeout> | undefined

  function onIframeLoadingError(): void {
    iframe.srcdoc = ERROR_DOCUMENT
    onWidgetLoadingError?.()
  }

  function startLoadingTimeout(): void {
    clearTimeout(loadingTimeout)

    loadingTimeout = setTimeout(() => {
      if (cancelled || isLoaded) return

      onIframeLoadingError()
    }, IFRAME_LOADING_TIMEOUT)
  }

  function retryWidgetLoading(): void {
    if (cancelled || isLoaded) return

    // `srcdoc` takes precedence over `src`, so it must be removed to load the widget again
    iframe.removeAttribute('srcdoc')
    iframe.src = originalSrc

    startLoadingTimeout()
  }

  /**
   * Once the error document is loaded, attaches the retry handler and integrator styles.
   * The widget itself is cross-origin, so `contentDocument` is null and this is a no-op for it.
   */
  function onIframeLoad(): void {
    if (cancelled) return

    const errorDocument = iframe.contentDocument
    const reloadButton = errorDocument?.querySelector(`.${RELOAD_BUTTON_CLASS}`)

    if (!errorDocument || !reloadButton) return

    reloadButton.addEventListener('click', retryWidgetLoading)

    if (customErrorStyles) {
      const customStylesEl = errorDocument.createElement('style')

      // textContent is not parsed as HTML, so the styles cannot break out of the <style> element
      customStylesEl.textContent = customErrorStyles
      errorDocument.head.appendChild(customStylesEl)
    }
  }

  iframe.addEventListener('error', (iframeLoadingError) => {
    if (cancelled) return

    console.error('Could not load iframe', iframeLoadingError)

    onIframeLoadingError()
  })

  iframe.addEventListener('load', onIframeLoad)

  startLoadingTimeout()

  return {
    cancelWidgetLoading() {
      cancelled = true
      clearTimeout(loadingTimeout)
      iframe.removeEventListener('load', onIframeLoad)
    },
    onWidgetReady() {
      isLoaded = true
      clearTimeout(loadingTimeout)
    },
  }
}

/**
 * A static HTML document displayed inside the iframe (via `srcdoc`) when the widget fails to load.
 * Rendering the error inside the iframe keeps the DOM structure and iframe attributes/styles
 * set by the integrator intact.
 *
 * The document is intentionally static (no interpolation) to rule out HTML injection.
 * Since the iframe sandbox includes `allow-same-origin` and `srcdoc` documents inherit the parent
 * origin, the parent script wires the retry button and custom styles directly via DOM access.
 */
const ERROR_DOCUMENT = `<!DOCTYPE html>
<html lang="en">
  <head>
    <style>
      html, body { margin: 0; padding: 0; width: 100%; height: 100%; }
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

        background: #fff5f5;
        color: #d32f2f;

        border: 1px solid #f5c2c7;
        border-radius: 12px;

        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 14px;
        line-height: 1.5;
        font-weight: 500;
      }
      .${RELOAD_BUTTON_CLASS} {
        padding: 8px 24px;
        border: 1px solid #d32f2f;
        border-radius: 8px;
        background: transparent;
        color: #d32f2f;
        font: inherit;
        cursor: pointer;
      }
      .${RELOAD_BUTTON_CLASS}:hover {
        background: #d32f2f;
        color: #fff5f5;
      }
    </style>
  </head>
  <body>
    <div class="errorContent">
      <span>Couldn't load the widget. Please try again later.</span>

      <button class="${RELOAD_BUTTON_CLASS}">Retry</button>
    </div>
  </body>
</html>`
