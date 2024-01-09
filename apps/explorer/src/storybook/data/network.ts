import { Network } from 'types'
import { NetworkMap } from './types'

export const networkIds = Object.values(Network).filter(Number.isInteger) as Network[]

export const networkMap = Object.entries(Network).reduce<NetworkMap>((acc, [key, val]) => {
  if (!Number.isInteger(val) || typeof val !== 'number') return acc
  acc[key] = val
  return acc
}, {} as NetworkMap)

export const defaultNetworkId = Network.MAINNET
