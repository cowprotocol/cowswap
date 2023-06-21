import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from './consts'
import { JsonRpcManager } from './JsonRpcManager'
import { CowSwapWidgetParams, CowSwapWidgetUrlParams } from './types'
import { buildTradeAmountsQuery, buildWidgetPath, buildWidgetUrl } from './utils'

const COW_SWAP_WIDGET_KEY = '@cowprotocol/widget-lib'

type UpdateWidgetCallback = (params: CowSwapWidgetUrlParams) => void

export function cowSwapWidget(params: CowSwapWidgetParams): UpdateWidgetCallback {
  const { container, provider } = params
  const iframe = createIframe(params)

  container.innerHTML = ''
  container.appendChild(iframe)

  const { contentWindow } = iframe

  if (!contentWindow) throw new Error('Iframe does not contain a window!')

  if (provider) {
    const jsonRpcManager = new JsonRpcManager(contentWindow)

    jsonRpcManager.onConnect(provider)
  }

  return (params: CowSwapWidgetUrlParams) => updateWidget(params, contentWindow)
}

function updateWidget(params: CowSwapWidgetUrlParams, contentWindow: Window) {
  const pathname = buildWidgetPath(params)
  const search = buildTradeAmountsQuery(params).toString()

  contentWindow.postMessage(
    {
      key: COW_SWAP_WIDGET_KEY,
      pathname,
      search,
    },
    '*'
  )
}

function createIframe(params: CowSwapWidgetParams): HTMLIFrameElement {
  const { width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT } = params

  const iframe = document.createElement('iframe')

  iframe.src = buildWidgetUrl(params.urlParams ?? {})
  iframe.width = `${width}px`
  iframe.height = `${height}px`
  iframe.style.border = '0'

  return iframe
}
