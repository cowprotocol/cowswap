import { WidgetEthereumProvider } from '@cowprotocol/iframe-transport'

import { CoWHookDappEvents, hookDappIframeTransport } from './hookDappIframeTransport'
import { CowHookCreation, CoWHookDappActions, CowHookDetails, HookDappContext, TokenData } from './types'

interface CoWHookDappInit {
  onContext(context: HookDappContext): void
}

export interface CoWHookDappHandler {
  actions: CoWHookDappActions
  provider: WidgetEthereumProvider
}

export function initCoWHookDapp({ onContext }: CoWHookDappInit): CoWHookDappHandler {
  const parent = window.parent
  const provider = new WidgetEthereumProvider()
  const actions = getCoWHookDappActions()

  hookDappIframeTransport.listenToMessageFromWindow(window, CoWHookDappEvents.CONTEXT_UPDATE, onContext)

  hookDappIframeTransport.postMessageToWindow(parent, CoWHookDappEvents.ACTIVATE, void 0)

  return { actions, provider }
}

function getCoWHookDappActions(): CoWHookDappActions {
  return {
    addHook(payload: CowHookCreation) {
      hookDappIframeTransport.postMessageToWindow(parent, CoWHookDappEvents.ADD_HOOK, payload)
    },
    editHook(payload: CowHookDetails) {
      hookDappIframeTransport.postMessageToWindow(parent, CoWHookDappEvents.EDIT_HOOK, payload)
    },
    setSellToken(token: TokenData) {
      hookDappIframeTransport.postMessageToWindow(parent, CoWHookDappEvents.SET_SELL_TOKEN, token)
    },
    setBuyToken(token: TokenData) {
      hookDappIframeTransport.postMessageToWindow(parent, CoWHookDappEvents.SET_BUY_TOKEN, token)
    },
  }
}
