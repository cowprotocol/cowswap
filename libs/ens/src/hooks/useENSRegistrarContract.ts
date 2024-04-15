import useSWR from 'swr'
import { getContract } from '@cowprotocol/common-utils'
import { ENS_REGISTRAR_ADDRESSES } from '@cowprotocol/common-const'
import { EnsAbi, EnsRegistrar } from '@cowprotocol/abis'
import { useWalletChainId, useWalletProvider } from '@cowprotocol/wallet-provider'

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
