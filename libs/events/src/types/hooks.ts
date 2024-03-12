import { PermitHookData } from '@cowprotocol/permit-utils'

interface HookInfoPayload {
  hook: PermitHookData
  isPreHook: boolean
}

export type OnAddedHookPayload = HookInfoPayload
export type OnRemovedPayload = HookInfoPayload
