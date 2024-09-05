import { ReactNode } from 'react'

import { latest } from '@cowprotocol/app-data'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

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

export interface HookDappBase {
  name: string
  descriptionShort?: string
  description?: string
  type: HookDappType
  version: string
  website: string
  image: string
}

export interface HookDappInternal extends HookDappBase {
  type: HookDappType.INTERNAL
  component: (props: HookDappProps) => ReactNode
}

export interface HookDappIframe extends HookDappBase {
  type: HookDappType.IFRAME
  url: string
}

export type HookDapp = HookDappInternal | HookDappIframe

export interface CowHookDetails<DappType = HookDapp> {
  uuid: string
  hook: CowHook
  dapp: DappType
}

export interface CowHookDetailsSerialized extends CowHookDetails<HookDappBase> {}

export type CowHookCreation = Omit<CowHookDetails, 'uuid' | 'dapp'>

export type AddHook = (hookToAdd: CowHookCreation) => CowHookDetailsSerialized
export type RemoveHook = (uuid: string, isPreHook: boolean) => void

export interface HookDappContext {
  chainId: SupportedChainId
  account?: string
  addHook: AddHook
  close: Command
}

export interface HookDappProps {
  isPreHook: boolean
  dapp: HookDapp
  context: HookDappContext
}
