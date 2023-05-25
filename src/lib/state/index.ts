import { createMulticall } from '@uniswap/redux-multicall'
import { combineReducers, createStore } from 'redux'

import price from 'legacy/state/price/reducer' // MOD

export * from 'lib/state/multicall'

const multicall = createMulticall()
const reducer = combineReducers({ [multicall.reducerPath]: multicall.reducer, price })
export const store = createStore(reducer)

export default store
