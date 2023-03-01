import { createSlice } from '@reduxjs/toolkit'
import { ConnectionType } from '@cow/modules/wallet/api/utils/connections'

export interface ConnectionState {
  errorByConnectionType: Record<ConnectionType, string | undefined>
}

export const initialState: ConnectionState = {
  errorByConnectionType: {
    [ConnectionType.INJECTED]: undefined,
    [ConnectionType.FORTMATIC]: undefined,
    [ConnectionType.WALLET_CONNECT]: undefined,
    [ConnectionType.COINBASE_WALLET]: undefined,
    [ConnectionType.NETWORK]: undefined,
    [ConnectionType.GNOSIS_SAFE]: undefined,
    [ConnectionType.ZENGO]: undefined,
    [ConnectionType.AMBIRE]: undefined,
    [ConnectionType.ALPHA_WALLET]: undefined,
    [ConnectionType.TALLY_WALLET]: undefined,
  },
}

const connectionSlice = createSlice({
  name: 'connection',
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
