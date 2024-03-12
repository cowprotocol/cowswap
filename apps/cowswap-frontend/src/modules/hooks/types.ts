import { ReactNode } from 'react'

export enum HookDappType {
  INTERNAL = 'INTERNAL',
  IFRAME = 'IFRAME',
}

export type HookDapp = HookDappInternal | HookDappIframe

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
