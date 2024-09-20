import { IframeTransport } from '@cowprotocol/iframe-transport'

import { CowHookCreation, CowHookDetails, HookDappContext, TokenData } from './types'

export enum CoWHookDappEvents {
  ACTIVATE = 'ACTIVATE',
  CONTEXT_UPDATE = 'CONTEXT_UPDATE',
  ADD_HOOK = 'ADD_HOOK',
  EDIT_HOOK = 'EDIT_HOOK',
  SET_SELL_TOKEN = 'SET_SELL_TOKEN',
  SET_BUY_TOKEN = 'SET_BUY_TOKEN',
}

export interface HookDappEventsPayloadMap {
  [CoWHookDappEvents.ACTIVATE]: void
  [CoWHookDappEvents.CONTEXT_UPDATE]: HookDappContext
  [CoWHookDappEvents.ADD_HOOK]: CowHookCreation
  [CoWHookDappEvents.EDIT_HOOK]: CowHookDetails
  [CoWHookDappEvents.SET_SELL_TOKEN]: TokenData
  [CoWHookDappEvents.SET_BUY_TOKEN]: TokenData
}

export const hookDappIframeTransport = new IframeTransport<HookDappEventsPayloadMap>('cowSwapHookDapp')
