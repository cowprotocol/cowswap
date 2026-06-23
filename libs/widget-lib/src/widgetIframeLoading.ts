const LOADING_TIMEOUT = 5_000
const WIDGET_LOADING_ERROR_CLASS = 'cow-widget-loading-error'

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

  let loaded = false
  let cancelled = false
  let timeout: number | null = null

  function onLoadingError(): void {
    onWidgetLoadingError?.()

    const loadingContainer = document.createElement('div')
    const reloadBtn = document.createElement('button')
    const errorText = document.createElement('p')

    reloadBtn.innerText = 'Reload'
    reloadBtn.addEventListener('click', () => {
      container.removeChild(loadingContainer)
      destroy(true)
      iframe.src = 'about:blank'

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
    if (cancelled || loaded) return

    console.error('Could not load iframe', iframeLoadingError)

    onLoadingError()
  })

  timeout = window.setTimeout(() => {
    if (cancelled) return

    onLoadingError()
  }, LOADING_TIMEOUT)

  return {
    onWidgetReady() {
      loaded = true
      if (timeout) clearTimeout(timeout)
    },
    cancelWidgetLoading() {
      cancelled = true
    },
  }
}
