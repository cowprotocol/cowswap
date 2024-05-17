import { Dispatch, SetStateAction } from 'react'

import { CHAIN_INFO } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'

export type NetworkOption = {
  chainId: SupportedChainId
  label: string
}

export const NetworkOptions: NetworkOption[] = Object.keys(CHAIN_INFO).map<NetworkOption>((key) => {
  const chainId = key as unknown as SupportedChainId
  return ({ chainId, label: CHAIN_INFO[chainId].label })
})

const DEFAULT_CHAIN_ID = NetworkOptions[0].chainId

const LABEL = 'Network'

export const getNetworkOption = (chainId: SupportedChainId) => NetworkOptions.find((item) => item.chainId === chainId)

export function NetworkControl({
  state,
  standaloneMode,
}: {
  standaloneMode: boolean
  state: [NetworkOption, Dispatch<SetStateAction<NetworkOption>>]
}) {
  const [network, setNetwork] = state

  const switchNetwork = (chainId: number) => {
    const targetChainId = chainId || DEFAULT_CHAIN_ID
    const targetNetwork = getNetworkOption(targetChainId)

    if (targetNetwork) {
      setNetwork(targetNetwork)
    }
  }

  return (
    <FormControl sx={{ width: '100%' }} disabled={standaloneMode}>
      <InputLabel>{LABEL}</InputLabel>
      <Select
        id="controllable-states-network"
        value={network?.chainId || DEFAULT_CHAIN_ID}
        onChange={(event) => switchNetwork(event.target.value as number)}
        autoWidth
        label={LABEL}
        disabled={standaloneMode}
        size="small"
      >
        {NetworkOptions.map((option) => (
          <MenuItem key={option.chainId} value={option.chainId}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
