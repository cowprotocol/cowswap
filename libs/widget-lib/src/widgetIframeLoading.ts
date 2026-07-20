const LOADING_TIMEOUT = 30_000
const WIDGET_LOADING_ERROR_CLASS = 'cow-widget-loading-error'
const STYLE_MARKER_ATTRIBUTE = `data-${WIDGET_LOADING_ERROR_CLASS}`

interface WidgetIframeLoadingContext {
  cancelWidgetLoading(): void
  onWidgetReady(): void
}

export function widgetIframeLoading(
  container: HTMLElement,
  iframe: HTMLIFrameElement,
  setup: () => void,
  destroy: (skipIframeDestroy?: boolean) => void,
  onWidgetLoadingError?: () => void,
): WidgetIframeLoadingContext {
  const originalSrc = iframe.src

  let cancelled = false
  let timeout: number | null = null

  function onLoadingError(): void {
    onWidgetLoadingError?.()

    iframe.style.display = 'none'
    ensureLoadingErrorStyles()

    const loadingContainer = document.createElement('div')
    const reloadBtn = document.createElement('button')
    const errorText = document.createElement('p')

    reloadBtn.innerText = 'Reload'
    reloadBtn.addEventListener('click', () => {
      container.removeChild(loadingContainer)
      destroy(true)
      iframe.src = 'about:blank'
      iframe.style.display = ''

      setTimeout(() => {
        iframe.src = originalSrc
        setup()
      }, 100)
    })

    errorText.innerText = "Couldn't load the page. Please, try again later"

    loadingContainer.classList.add(WIDGET_LOADING_ERROR_CLASS)
    loadingContainer.appendChild(errorText)
    loadingContainer.appendChild(reloadBtn)

    container.appendChild(loadingContainer)
  }

  iframe.addEventListener('error', (iframeLoadingError) => {
    if (cancelled) return

    console.error('Could not load iframe', iframeLoadingError)

    onLoadingError()
  })

  timeout = window.setTimeout(() => {
    if (cancelled) return

    onLoadingError()
  }, LOADING_TIMEOUT)

  return {
    onWidgetReady() {
      if (timeout) clearTimeout(timeout)

      const loadingContainer = document.getElementsByClassName(WIDGET_LOADING_ERROR_CLASS)[0]
      if (loadingContainer) container.removeChild(loadingContainer)
    },
    cancelWidgetLoading() {
      cancelled = true
    },
  }
}

let sharedLoadingErrorStyleSheet: CSSStyleSheet | null = null

/**
 * Injects the default error styles once. Prefers a constructable stylesheet (not subject to
 * `style-src 'unsafe-inline'`); falls back to a `<style>` element on browsers that lack support.
 */
function ensureLoadingErrorStyles(): void {
  if (typeof document === 'undefined') return

  if (supportsConstructableStyleSheets()) {
    if (!sharedLoadingErrorStyleSheet) {
      sharedLoadingErrorStyleSheet = new CSSStyleSheet()
      sharedLoadingErrorStyleSheet.replaceSync(LOADING_ERROR_STYLES)
    }

    if (!document.adoptedStyleSheets.includes(sharedLoadingErrorStyleSheet)) {
      document.adoptedStyleSheets = [...document.adoptedStyleSheets, sharedLoadingErrorStyleSheet]
    }

    return
  }

  if (!document.head.querySelector(`style[${STYLE_MARKER_ATTRIBUTE}]`)) {
    const style = document.createElement('style')
    style.setAttribute(STYLE_MARKER_ATTRIBUTE, '')
    style.textContent = LOADING_ERROR_STYLES
    document.head.appendChild(style)
  }
}

function supportsConstructableStyleSheets(): boolean {
  return (
    typeof document !== 'undefined' &&
    'adoptedStyleSheets' in Document.prototype &&
    typeof CSSStyleSheet === 'function' &&
    typeof CSSStyleSheet.prototype.replaceSync === 'function'
  )
}

const LOADING_ERROR_STYLES = `
.${WIDGET_LOADING_ERROR_CLASS} {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  justify-content: center;
  text-align: center;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  min-height: 200px;
  padding: 24px;
  background: #fff5f5;
  color: #d32f2f;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  font-weight: 500;
}

.${WIDGET_LOADING_ERROR_CLASS} p {
  margin: 0;
}

.${WIDGET_LOADING_ERROR_CLASS} button {
  padding: 8px 24px;
  border-radius: 8px;
  font: inherit;
  cursor: pointer;
  border: 1px solid #d32f2f;
  background: transparent;
  color: #d32f2f;
}

.${WIDGET_LOADING_ERROR_CLASS} button:disabled {
  cursor: progress;
  opacity: 0.75;
}

.${WIDGET_LOADING_ERROR_CLASS} button:not(:disabled):hover {
  background: #d32f2f;
  color: #fff5f5;
}`
