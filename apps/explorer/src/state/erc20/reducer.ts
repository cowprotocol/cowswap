import { buildErc20Key, Erc20State } from '.'
import { ReducerActionType } from './actions'

export function reducer(state: Erc20State, action: ReducerActionType): Erc20State {
  switch (action.type) {
    case 'SAVE_MULTIPLE_ERC20': {
      // Clone current state
      const map = new Map(state)

      const { erc20s, networkId } = action.payload

      erc20s.forEach((erc20) => {
        const key = buildErc20Key(networkId, erc20.address)
        const existing = map.get(key) || {}
        // merge existing erc20 info, if any
        map.set(key, { ...existing, ...erc20 })
      })

      return map
    }
    default:
      return state
  }
}
