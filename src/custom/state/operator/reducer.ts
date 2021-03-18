import { createReducer } from '@reduxjs/toolkit'
import { updateTip, clearTip, Tip } from './actions'

export interface TipObject {
  token: string // token address
  tip: Tip
}

// {token address => TipObject} mapping
export type TipsMap = Record<string, TipObject>

export interface OperatorState {
  readonly tipsMap: Partial<TipsMap>
}

export const EMPTY_FEE = {
  feeAsCurrency: undefined,
  minimalFee: '0',
  feeRatio: 0
}

const initialState: OperatorState = {
  tipsMap: {}
}

export default createReducer(initialState, builder =>
  builder
    .addCase(updateTip, (state, action) => {
      const { token, tip } = action.payload
      state.tipsMap[token] = { tip, token }
    })
    .addCase(clearTip, (state, action) => {
      const { token } = action.payload
      delete state.tipsMap[token]
    })
)
