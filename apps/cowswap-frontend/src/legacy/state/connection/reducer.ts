import { ConnectionType } from '@cowprotocol/wallet'

import { createSlice } from '@reduxjs/toolkit'

export interface ConnectionState {
  errorByConnectionType: Record<ConnectionType, string | undefined>
}

export const initialState: ConnectionState = {
  errorByConnectionType: Object.keys(ConnectionType).reduce((acc, key) => {
    acc[key as ConnectionType] = undefined
    return acc
  }, {} as Record<ConnectionType, undefined>),
}

const connectionSlice = createSlice({
  name: 'wallet-connection',
  initialState,
  reducers: {
    updateConnectionError(
      state,
      { payload: { connectionType, error } }: { payload: { connectionType: ConnectionType; error: string | undefined } }
    ) {
      state.errorByConnectionType[connectionType] = error
    },
  },
})

export const { updateConnectionError } = connectionSlice.actions
export default connectionSlice.reducer
