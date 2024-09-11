import type { ReactNode } from 'react'

import type { latest } from '@cowprotocol/app-data'
import type { SupportedChainId } from '@cowprotocol/cow-sdk'
import type { Signer } from '@ethersproject/abstract-signer'
import type { Command } from '@cowprotocol/types'

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
  description?: ReactNode | string
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
  receiverOverride?: string
}

export interface CowHookDetailsSerialized extends CowHookDetails<HookDappBase> {}

export type CowHookCreation = Omit<CowHookDetails, 'uuid' | 'dapp'>

export type AddHook = (hookToAdd: CowHookCreation) => CowHookDetailsSerialized
export type EditHook = (uuid: string, update: CowHook, isPreHook: boolean) => void
export type RemoveHook = (uuid: string, isPreHook: boolean) => void

export interface HookDappOrderParams {
  validTo: number
  sellTokenAddress: string
  buyTokenAddress: string
}

export interface HookDappContext {
  chainId: SupportedChainId
  account?: string
  orderParams: HookDappOrderParams | null
  addHook: AddHook
  editHook: EditHook
  close: Command
  hookToEdit?: CowHookDetailsSerialized
  signer?: Signer
}

export interface HookDappProps {
  isPreHook: boolean
  dapp: HookDapp
  context: HookDappContext
}
