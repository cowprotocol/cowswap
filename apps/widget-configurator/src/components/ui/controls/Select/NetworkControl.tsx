import type { Dispatch, ReactNode, SetStateAction } from 'react'

import { CHAIN_INFO } from '@cowprotocol/common-const'
import { isChainDeprecated, SupportedChainId } from '@cowprotocol/cow-sdk'

import { SelectInput } from './SelectInput'

export type NetworkOption = {
  chainId: SupportedChainId
  label: string
}

export const NetworkOptions: NetworkOption[] = Object.keys(CHAIN_INFO).map<NetworkOption>((key) => {
  const chainId = +key as SupportedChainId
  return { chainId, label: CHAIN_INFO[chainId].label }
})

const DEFAULT_CHAIN_ID = NetworkOptions[0].chainId

const LABEL = 'Network'

export const getNetworkOption = (chainId: SupportedChainId): NetworkOption | undefined =>
  NetworkOptions.find((item) => item.chainId === chainId)

export interface NetworkControlProps {
  standaloneMode: boolean
  state: [NetworkOption, Dispatch<SetStateAction<NetworkOption>>]
  availableChains: SupportedChainId[]
}

export function NetworkControl({ state, standaloneMode, availableChains }: NetworkControlProps): ReactNode {
  const [network, setNetwork] = state

  const switchNetwork = (chainId: number): void => {
    const targetChainId = chainId || DEFAULT_CHAIN_ID
    const targetNetwork = getNetworkOption(targetChainId)

    if (targetNetwork) {
      setNetwork(targetNetwork)
    }
  }

  return (
    <SelectInput
      id="controllable-states-network"
      name="chainId"
      label={LABEL}
      value={network?.chainId || DEFAULT_CHAIN_ID}
      disabled={standaloneMode}
      options={availableChains
        .map((chainId) => {
          const option = NetworkOptions.find((o) => o.chainId === chainId)
          if (!option) return null

          return {
            label: `${option.label}${isChainDeprecated(chainId) ? ' (deprecated)' : ''}`,
            value: option.chainId,
          }
        })
        .filter((option): option is { label: string; value: SupportedChainId } => option !== null)}
      onChange={(_, value) => {
        if (value === '' || Array.isArray(value)) return
        switchNetwork(value as number)
      }}
    />
  )
}
