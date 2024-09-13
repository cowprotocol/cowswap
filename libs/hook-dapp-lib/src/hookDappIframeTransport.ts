import { IframeTransport } from '@cowprotocol/iframe-transport'

import { CowHookCreation, CowHookDetails, HookDappContext } from './types'

export enum CoWHookDappEvents {
  ACTIVATE = 'ACTIVATE',
  CONTEXT_UPDATE = 'CONTEXT_UPDATE',
  ADD_HOOK = 'ADD_HOOK',
  EDIT_HOOK = 'EDIT_HOOK',
}

export interface HookDappEventsPayloadMap {
  [CoWHookDappEvents.ACTIVATE]: void
  [CoWHookDappEvents.CONTEXT_UPDATE]: HookDappContext
  [CoWHookDappEvents.ADD_HOOK]: CowHookCreation
  [CoWHookDappEvents.EDIT_HOOK]: CowHookDetails
}

export const hookDappIframeTransport = new IframeTransport<HookDappEventsPayloadMap>('cowSwapHookDapp')
