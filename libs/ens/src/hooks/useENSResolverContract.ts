import { getContract } from '@cowprotocol/common-utils'
import { EnsPublicResolver, EnsPublicResolverAbi } from '@cowprotocol/abis'
import { useWeb3React } from '@web3-react/core'
import useSWR from 'swr'
import { SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'

export function useENSResolverContract(address: string | undefined): EnsPublicResolver | undefined {
  const { provider, chainId } = useWeb3React()

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
