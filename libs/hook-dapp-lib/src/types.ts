import type { SupportedChainId } from '@cowprotocol/cow-sdk'

export interface CowHook {
  target: string
  callData: string
  gasLimit: string
}

export interface CowHookCreation {
  hook: CowHook
  recipientOverride?: string
}

export interface TokenData {
  address: string
}

export interface CowHookDetails extends CowHookCreation {
  uuid: string
}

export interface CoWHookDappActions {
  addHook(payload: CowHookCreation): void
  editHook(payload: CowHookDetails): void
  setSellToken(token: TokenData): void
  setBuyToken(token: TokenData): void
}

export interface HookDappOrderParams {
  validTo: number
  sellTokenAddress: string
  buyTokenAddress: string
}

export interface HookDappContext {
  chainId: SupportedChainId
  account?: string
  orderParams: HookDappOrderParams | null
  hookToEdit?: CowHookDetails
  isSmartContract: boolean | undefined
  isPreHook: boolean
  isDarkMode: boolean
}
