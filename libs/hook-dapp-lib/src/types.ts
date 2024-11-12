import type { ReactNode } from 'react'

import { HookDappType, HookDappWalletCompatibility } from './consts'

export interface CowHook {
  target: string
  callData: string
  gasLimit: string
  dappId: string
}

export interface HookDappConditions {
  position?: 'post' | 'pre'
  walletCompatibility?: HookDappWalletCompatibility[]
  supportedNetworks?: number[]
}

export interface CowHookCreation {
  hook: Omit<CowHook, 'dappId'>
  recipientOverride?: string
}

export interface TokenData {
  address: string
}

export interface CowHookDetails extends CowHookCreation {
  hook: CowHook
  uuid: string
}

export interface CowHookToEdit extends CowHookCreation {
  uuid: string
}

export interface CoWHookDappActions {
  addHook(payload: CowHookCreation): void
  editHook(payload: CowHookToEdit): void
  setSellToken(token: TokenData): void
  setBuyToken(token: TokenData): void
}

export interface HookDappOrderParams {
  kind: 'buy' | 'sell'
  validTo: number
  sellTokenAddress: string
  buyTokenAddress: string
  receiver: string
  sellAmount: string
  buyAmount: string
}

export interface HookDappContext {
  chainId: number
  account?: string
  orderParams: HookDappOrderParams | null
  hookToEdit?: CowHookDetails
  isSmartContract: boolean | undefined
  isPreHook: boolean
  isDarkMode: boolean
  // { [address: string]: { [token: string]: balanceDiff: string } }
  // example: { '0x123': { '0x456': '100', '0xabc': '-100' } }
  balancesDiff: Record<string, Record<string, string>>
}

export interface HookDappBase {
  id: string
  name: string
  descriptionShort?: string
  description?: ReactNode | string
  type: HookDappType
  version: string
  website: string
  image: string
  conditions?: HookDappConditions
}
