import { JsonRpcManager } from './JsonRpcManager'
import { CowSwapWidgetMetaData, CowSwapWidgetParams, CowSwapWidgetSettings } from './types'
import { buildTradeAmountsQuery, buildWidgetPath, buildWidgetUrl } from './urlUtils'

const COW_SWAP_WIDGET_EVENT_KEY = 'cowSwapWidget'

export type UpdateWidgetCallback = (params: CowSwapWidgetSettings) => void

export function cowSwapWidget(params: CowSwapWidgetParams, settings: CowSwapWidgetSettings): UpdateWidgetCallback {
  const { container, provider } = params
  const iframe = createIframe(params, settings)

  container.innerHTML = ''
  container.appendChild(iframe)

  const { contentWindow } = iframe

  if (!contentWindow) throw new Error('Iframe does not contain a window!')

  sendMetaData(contentWindow, params.metaData)

  if (provider) {
    const jsonRpcManager = new JsonRpcManager(contentWindow)

    jsonRpcManager.onConnect(provider)
  }

  return (params: CowSwapWidgetSettings) => updateWidget(params, contentWindow)
}

function createIframe(params: CowSwapWidgetParams, settings: CowSwapWidgetSettings): HTMLIFrameElement {
  const { width, height } = params

  const iframe = document.createElement('iframe')

  iframe.src = buildWidgetUrl(settings.urlParams)
  iframe.width = `${width}px`
  iframe.height = `${height}px`
  iframe.style.border = '0'

  return iframe
}

function updateWidget(params: CowSwapWidgetSettings, contentWindow: Window) {
  const pathname = buildWidgetPath(params.urlParams)
  const search = buildTradeAmountsQuery(params.urlParams).toString()

  contentWindow.postMessage(
    {
      key: COW_SWAP_WIDGET_EVENT_KEY,
      method: 'update',
      urlParams: {
        pathname,
        search,
      },
      appParams: params.appParams,
    },
    '*'
  )
}

function sendMetaData(contentWindow: Window, metaData: CowSwapWidgetMetaData) {
  window.addEventListener('message', (event) => {
    if (event.data.key !== COW_SWAP_WIDGET_EVENT_KEY || event.data.method !== 'activate') {
      return
    }

    contentWindow.postMessage(
      {
        key: COW_SWAP_WIDGET_EVENT_KEY,
        method: 'metaData',
        metaData,
      },
      '*'
    )
  })
}
