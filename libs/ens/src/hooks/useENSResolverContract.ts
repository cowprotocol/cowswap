import { EnsPublicResolver, EnsPublicResolverAbi } from '@cowprotocol/abis'
import { SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'
import { getContract } from '@cowprotocol/common-utils'
import { useWalletChainId, useWalletProvider } from '@cowprotocol/wallet-provider'

import useSWR from 'swr'

export function useENSResolverContract(address: string | undefined): EnsPublicResolver | undefined {
  const provider = useWalletProvider()
  const chainId = useWalletChainId()

  const { data } = useSWR(
    ['useENSResolverContract', provider, chainId, address],
    () => {
      if (!chainId || !provider || !address) return undefined

      return getContract(address, EnsPublicResolverAbi, provider) as EnsPublicResolver
    },
    SWR_NO_REFRESH_OPTIONS
  )

  return data
}
