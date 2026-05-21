import { getParentOrigin, WidgetEthereumProvider } from '@cowprotocol/iframe-transport'

import { CoWHookDappEvents, hookDappIframeTransport } from './hookDappIframeTransport'
import { CowHookCreation, CoWHookDappActions, CowHookDetails, HookDappContext, TokenData } from './types'

export interface CoWHookDappHandler {
  actions: CoWHookDappActions
  provider: WidgetEthereumProvider
}

interface CoWHookDappInit {
  onContext(context: HookDappContext): void
}

export function initCoWHookDapp({ onContext }: CoWHookDappInit): CoWHookDappHandler {
  const parent = window.parent
  const parentOrigin = getParentOrigin()
  const provider = new WidgetEthereumProvider({ targetOrigin: parentOrigin })
  const actions = getCoWHookDappActions(parent, parentOrigin)

  hookDappIframeTransport.listenToMessageFromWindow(
    window,
    parent,
    CoWHookDappEvents.CONTEXT_UPDATE,
    onContext,
    parentOrigin,
  )

  hookDappIframeTransport.postMessageToWindow(parent, CoWHookDappEvents.ACTIVATE, void 0, parentOrigin)

  return { actions, provider }
}

function getCoWHookDappActions(parent: Window, parentOrigin: string | undefined): CoWHookDappActions {
  return {
    addHook(payload: CowHookCreation) {
      hookDappIframeTransport.postMessageToWindow(parent, CoWHookDappEvents.ADD_HOOK, payload, parentOrigin)
    },
    editHook(payload: CowHookDetails) {
      hookDappIframeTransport.postMessageToWindow(parent, CoWHookDappEvents.EDIT_HOOK, payload, parentOrigin)
    },
    setSellToken(token: TokenData) {
      hookDappIframeTransport.postMessageToWindow(parent, CoWHookDappEvents.SET_SELL_TOKEN, token, parentOrigin)
    },
    setBuyToken(token: TokenData) {
      hookDappIframeTransport.postMessageToWindow(parent, CoWHookDappEvents.SET_BUY_TOKEN, token, parentOrigin)
    },
  }
}
