import { getContract } from '@cowprotocol/common-utils'
import { ENS_REGISTRAR_ADDRESSES } from '@cowprotocol/common-const'
import { EnsAbi, EnsRegistrar } from '@cowprotocol/abis'
import { useWeb3React } from '@web3-react/core'
import useSWR from 'swr'
import type { JsonRpcProvider } from '@ethersproject/providers'
import { SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'

export function useENSRegistrarContract(): EnsRegistrar | undefined {
  const { provider, chainId } = useWeb3React()

  const { data } = useSWR(
    ['useENSRegistrarContract', provider, chainId],
    () => {
      if (!chainId || !provider) return undefined

      const address = ENS_REGISTRAR_ADDRESSES[chainId]

      if (!address) return undefined

      return getContract(address, EnsAbi, provider as JsonRpcProvider) as EnsRegistrar
    },
    SWR_NO_REFRESH_OPTIONS
  )

  return data
}
