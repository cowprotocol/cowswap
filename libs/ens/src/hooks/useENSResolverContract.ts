import { EnsPublicResolver, EnsPublicResolverAbi } from '@cowprotocol/abis'
import { SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'
import { getContract } from '@cowprotocol/common-utils'
import { useWalletChainId, useWalletProvider } from '@cowprotocol/wallet-provider'

import useSWR from 'swr'

export function useENSResolverContract(address: string | undefined): EnsPublicResolver | undefined {
  // TODO M-6 COW-573
  // This flow will be reviewed and updated later, to include a wagmi alternative
  const provider = useWalletProvider()
  const chainId = useWalletChainId()

  const { data } = useSWR(
    provider && chainId && address ? ['useENSResolverContract', provider, chainId, address] : null,
    ([, _provider, , _address]) => {
      return getContract(_address, EnsPublicResolverAbi, _provider) as EnsPublicResolver
    },
    SWR_NO_REFRESH_OPTIONS,
  )

  return data
}
