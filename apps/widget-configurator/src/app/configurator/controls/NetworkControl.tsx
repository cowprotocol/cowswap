import { ChangeEvent, Dispatch, SetStateAction } from 'react'

import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'

export type NetworkOption = {
  chainID: number
  label: string
}

export const NetworkOptions: NetworkOption[] = [
  { chainID: 1, label: 'Ethereum' },
  { chainID: 100, label: 'Gnosis Chain' },
]

export function NetworkControl({ state }: { state: [NetworkOption, Dispatch<SetStateAction<NetworkOption>>] }) {
  const [network, setNetwork] = state

  return (
    <Autocomplete
      value={network || NetworkOptions[0]}
      onChange={(event: ChangeEvent<unknown>, newValue: { chainID: number; label: string } | null) => {
        setNetwork(newValue || NetworkOptions[0])
      }}
      getOptionLabel={(option: { chainID: number; label: string }) => option.label}
      id="controllable-states-network"
      options={NetworkOptions}
      size="small"
      renderInput={(params) => <TextField {...params} label="Network" />}
    />
  )
}
