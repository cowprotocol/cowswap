import { TokenErc20 } from '@gnosis.pm/dex-js'

import { Network } from 'types'

export type Erc20State = Map<string, TokenErc20>

// TODO: load initial state from local storage
export const INITIAL_ERC20_STATE: Erc20State = new Map<string, TokenErc20>()

export function buildErc20Key(networkId: Network, address: string): string {
  return `${networkId}|${address}`
}

export * from './reducer'
export * from './actions'
export * from './hooks'
