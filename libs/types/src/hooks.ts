import { ReactNode } from 'react'

import { latest } from '@cowprotocol/app-data'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Command } from './common'

interface HookInfoPayload {
  hookDetails: CowHookDetails
  isPreHook: boolean
}

export type OnAddedHookPayload = HookInfoPayload
export type OnRemovedPayload = HookInfoPayload

export type CowHook = latest.CoWHook

export enum HookDappType {
  INTERNAL = 'INTERNAL',
  IFRAME = 'IFRAME',
}

export type HookDapp = HookDappInternal | HookDappIframe

export interface CowHookDetails {
  uuid: string
  hook: CowHook
  dapp: HookDapp
  outputTokens?: CurrencyAmount<Currency>[]
}

export type CowHookCreation = Omit<CowHookDetails, 'uuid'>

export interface HookDappBase {
  name: string
  description: string
  type: HookDappType
  version: string
  image: string
}

export interface HookDappInternal extends HookDappBase {
  type: HookDappType.INTERNAL
  path: string
  component: ReactNode
}

export interface HookDappIframe extends HookDappBase {
  type: HookDappType.IFRAME
  url: string
}

export type AddHook = (hookToAdd: CowHookCreation, isPreHook: boolean) => CowHookDetails
export type RemoveHook = (uuid: string, isPreHook: boolean) => void

export interface HookDappContext {
  chainId: SupportedChainId
  account?: string
  addHook: AddHook
  close: Command
}
