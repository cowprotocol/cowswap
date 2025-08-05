import type { RequestArguments } from '@web3-react/types'

import type EventEmitter from 'eventemitter3'

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
export type EIP1193Provider = EventEmitter & {
  isConnected?: () => boolean
  request<T>(args: RequestArguments): Promise<T>
}

export interface EIP6963AnnounceProviderEvent extends CustomEvent {
  type: 'eip6963:announceProvider'
  detail: EIP6963ProviderDetail
}
