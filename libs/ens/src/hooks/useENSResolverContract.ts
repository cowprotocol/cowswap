import useSWR from 'swr'
import { getContract } from '@cowprotocol/common-utils'
import { EnsPublicResolver, EnsPublicResolverAbi } from '@cowprotocol/abis'
import { useWalletChainId, useWalletProvider } from '@cowprotocol/wallet-provider'

export function useENSResolverContract(address: string | undefined): EnsPublicResolver | undefined {
  const provider = useWalletProvider()
  const chainId = useWalletChainId()

  const { data } = useSWR(['useENSResolverContract', provider, chainId, address], () => {
    if (!chainId || !provider || !address) return undefined

    return getContract(address, EnsPublicResolverAbi, provider) as EnsPublicResolver
  })

  return data
}
