import { createReducer } from '@reduxjs/toolkit'
import { setSafeInfo } from './actions'
import { SafeInfoResponse } from '@gnosis.pm/safe-service-client'

export type GnosisSafeState = {
  safeInfo: SafeInfoResponse | undefined
}

export const initialState: GnosisSafeState = {
  safeInfo: undefined,
}

export default createReducer(initialState, (builder) =>
  builder.addCase(setSafeInfo, (state, { payload }) => {
    state.safeInfo = payload
  })
)
