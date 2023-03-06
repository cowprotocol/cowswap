import { createSlice } from '@reduxjs/toolkit'
import { ConnectionType } from '@cow/modules/wallet'

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
  },
}

const connectionSlice = createSlice({
  name: '@cow/modules/wallet/web3-react/utils/connection',
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
