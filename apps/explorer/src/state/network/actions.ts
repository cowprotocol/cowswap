import { Network } from 'types'
import { Actions } from 'state'

export type ActionTypes = 'SET_NETWORK'

export type SetNetworkType = Actions<ActionTypes, { networkId: Network }>

export const setNetwork = (networkId: Network): SetNetworkType => ({
  type: 'SET_NETWORK',
  payload: { networkId },
})
