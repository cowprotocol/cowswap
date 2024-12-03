import type { ReactNode } from 'react'

import {
  CowHook,
  CowHookCreation,
  HookDappOrderParams,
  CoWHookDappActions,
  HookDappContext as GenericHookDappContext,
  HookDappBase,
  HookDappType,
} from '@cowprotocol/hook-dapp-lib'
import type { Signer } from '@ethersproject/abstract-signer'

export type { CowHook, CowHookCreation, HookDappOrderParams }

export interface HookDappInternal extends HookDappBase {
  type: HookDappType.INTERNAL
  component: (props: HookDappProps) => ReactNode
}

export interface HookDappIframe extends HookDappBase {
  type: HookDappType.IFRAME
  url: string
}

export type HookDapp = HookDappInternal | HookDappIframe

export type AddHook = CoWHookDappActions['addHook']
export type EditHook = CoWHookDappActions['editHook']
export type RemoveHook = (uuid: string) => void

export interface HookDappContext extends GenericHookDappContext {
  addHook: AddHook
  editHook: EditHook
  setSellToken(tokenAddress: string): void
  setBuyToken(tokenAddress: string): void
  signer?: Signer
}

export interface HookDappProps {
  dapp: HookDapp
  context: HookDappContext
}
