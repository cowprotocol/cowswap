import { createMulticall } from '@uniswap/redux-multicall'
import { combineReducers, createStore } from 'redux'

import price from 'state/price/reducer' // MOD

export * from '@src/lib/state/multicall'

const multicall = createMulticall()
const reducer = combineReducers({ [multicall.reducerPath]: multicall.reducer, price })
export const store = createStore(reducer)

export default store
