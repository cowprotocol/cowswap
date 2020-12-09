import { createReducer } from '@reduxjs/toolkit'
import { updateTip, clearTip, Tip, Order, addPendingOrder } from './actions'

export interface TipObject {
  token: string // token address
  tip: Tip
}

// {token address => TipObject} mapping
export type TipsMap = Record<string, TipObject>

export interface OperatorState {
  readonly pendingOrders: Order[]
  readonly pastOrders: Order[]
  readonly tipsMap: Partial<TipsMap>
}

const initialState: OperatorState = {
  pendingOrders: [],
  pastOrders: [],
  tipsMap: {}
}

export default createReducer(initialState, builder =>
  builder
    .addCase(addPendingOrder, (state, action) => {
      console.log('TODO: Add pending orders', action)
    })
    .addCase(updateTip, (state, action) => {
      const { token, tip } = action.payload
      state.tipsMap[token] = { tip, token }
    })
    .addCase(clearTip, (state, action) => {
      const { token } = action.payload
      delete state.tipsMap[token]
    })
)
