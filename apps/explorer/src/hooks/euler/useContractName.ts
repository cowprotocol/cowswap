import { AddressKey } from '@cowprotocol/cow-sdk'

import useSWR from 'swr'

import { ERC20_ABI } from './abis'
import { getPublicClient } from './client'

import { useEvmNetworkId } from '../../state/network/hooks'

export function useContractName(address: AddressKey): string | undefined {
  const chainId = useEvmNetworkId()

  const { data } = useSWR<string>(
    chainId && address ? `contract-name:${chainId}:${address}` : null,
    () => {
      if (!chainId || !address) throw new Error('missing chainId or address')
      return getPublicClient(chainId).readContract({
        address: address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'name',
      }) as Promise<string>
    },
    { onError: () => undefined },
  )

  return data
}
