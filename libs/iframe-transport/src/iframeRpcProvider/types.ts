import { Command } from '@cowprotocol/types'

import EventEmitter from 'eventemitter3'

interface RequestArguments {
  readonly method: string
  readonly params?: readonly unknown[] | object
}

export interface EIP6963ProviderInfo {
  uuid: string
  name: string
  icon: string
  rdns: string
}

// https://eips.ethereum.org/EIPS/eip-6963
export interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo
  provider: EIP1193Provider
}

// https://eips.ethereum.org/EIPS/eip-1193
type EIP1193Provider = EventEmitter & {
  isConnected?: () => boolean
  request<T>(args: RequestArguments): Promise<T>
  enable?: Command
}

export interface EIP6963AnnounceProviderEvent extends CustomEvent {
  type: 'eip6963:announceProvider'
  detail: EIP6963ProviderDetail
}
