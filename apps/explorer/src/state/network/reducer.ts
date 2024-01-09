import { Network } from 'types'
import { SetNetworkType } from './actions'

export type ReducerActionType = SetNetworkType

export function reducer(state: Network | null, action: ReducerActionType): Network | null {
  switch (action.type) {
    case 'SET_NETWORK': {
      const { networkId } = action.payload
      return networkId
    }
    default: {
      return state
    }
  }
}
