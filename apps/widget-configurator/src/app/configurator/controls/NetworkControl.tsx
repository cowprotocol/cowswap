import { ChangeEvent, Dispatch, SetStateAction } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'

export type NetworkOption = {
  chainId: SupportedChainId
  label: string
}

export const NetworkOptions: NetworkOption[] = [
  { chainId: SupportedChainId.MAINNET, label: 'Ethereum' },
  { chainId: SupportedChainId.GNOSIS_CHAIN, label: 'Gnosis Chain' },
]

export function NetworkControl({ state }: { state: [NetworkOption, Dispatch<SetStateAction<NetworkOption>>] }) {
  const [network, setNetwork] = state

  return (
    <Autocomplete
      value={network || NetworkOptions[0]}
      onChange={(event: ChangeEvent<unknown>, newValue: NetworkOption | null) => {
        setNetwork(newValue || NetworkOptions[0])
      }}
      getOptionLabel={(option: NetworkOption) => option.label}
      id="controllable-states-network"
      options={NetworkOptions}
      size="small"
      renderInput={(params) => <TextField {...params} label="Network" />}
    />
  )
}
