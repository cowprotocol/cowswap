import { EnsPublicResolver, EnsPublicResolverAbi } from '@cowprotocol/abis'
import { getContract } from '@cowprotocol/common-utils'
import { useWeb3React } from '@web3-react/core'

import useSWR from 'swr'

export function useENSResolverContract(address: string | undefined): EnsPublicResolver | undefined {
  const { provider, chainId } = useWeb3React()

  const { data } = useSWR(['useENSResolverContract', provider, chainId, address], () => {
    if (!chainId || !provider || !address) return undefined

    return getContract(address, EnsPublicResolverAbi, provider) as EnsPublicResolver
  })

  return data
}
