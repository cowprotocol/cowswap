const IFRAME_LOADING_TIMEOUT = 30_000 // 30 sec

const ERROR_EL_STYLES = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',

  width: '100%',
  height: '100%',

  padding: '24px',
  boxSizing: 'border-box',

  background: '#fff5f5',
  color: '#d32f2f',

  border: '1px solid #f5c2c7',
  borderRadius: '12px',

  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontSize: '14px',
  lineHeight: '1.5',
  fontWeight: '500',
}

type IframeLoadingState = { cancelWidgetLoading: () => void; onWidgetReady: () => void }

export function widgetIframeLoading(
  container: HTMLElement,
  iframe: HTMLIFrameElement,
  onWidgetLoadingError?: () => void,
): IframeLoadingState {
  let cancelled = false

  function onIframeLoadingError(): void {
    const errorContent = document.createElement('div')

    errorContent.textContent = `Couldn't load the widget. Please try again later.`

    Object.assign(errorContent.style, ERROR_EL_STYLES)

    container.innerHTML = ''
    container.appendChild(errorContent)
    onWidgetLoadingError?.()
  }

  iframe.addEventListener('error', (iframeLoadingError) => {
    if (cancelled) return

    console.error('Could not load iframe', iframeLoadingError)

    onIframeLoadingError()
  })

  let isLoaded = false

  setTimeout(() => {
    if (cancelled) return

    if (!isLoaded) {
      onIframeLoadingError()
    }
  }, IFRAME_LOADING_TIMEOUT)

  return {
    cancelWidgetLoading() {
      cancelled = true
    },
    onWidgetReady() {
      isLoaded = true
    },
  }
}
