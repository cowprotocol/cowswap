import { EnsAbi, EnsRegistrar } from '@cowprotocol/abis'
import { ENS_REGISTRAR_ADDRESSES } from '@cowprotocol/common-const'
import { getContract } from '@cowprotocol/common-utils'
import { useWalletChainId, useWalletProvider } from '@cowprotocol/wallet-provider'

import useSWR from 'swr'

export function useENSRegistrarContract(): EnsRegistrar | undefined {
  const provider = useWalletProvider()
  const chainId = useWalletChainId()

  const { data } = useSWR(['useENSRegistrarContract', provider, chainId], () => {
    if (!chainId || !provider) return undefined

    const address = ENS_REGISTRAR_ADDRESSES[chainId]

    if (!address) return undefined

    return getContract(address, EnsAbi, provider) as EnsRegistrar
  })

  return data
}
