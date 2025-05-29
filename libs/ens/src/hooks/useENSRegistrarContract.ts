import { EnsAbi, EnsRegistrar } from '@cowprotocol/abis'
import { SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'
import { getContract } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletChainId, useWalletProvider } from '@cowprotocol/wallet-provider'

import useSWR from 'swr'

const ENS_REGISTRAR_ADDRESSES: Record<SupportedChainId, string | null> = {
  [SupportedChainId.MAINNET]: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
  [SupportedChainId.GNOSIS_CHAIN]: null,
  [SupportedChainId.SEPOLIA]: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
  [SupportedChainId.ARBITRUM_ONE]: null,
  [SupportedChainId.BASE]: null,
  [SupportedChainId.POLYGON]: null,
  [SupportedChainId.AVALANCHE]: null,
  // TODO: use mainnet registrar for all chains https://docs.ens.domains/learn/deployments, which means being connected to mainnet additionally to the other chain
}

export function useENSRegistrarContract(): EnsRegistrar | undefined {
  const provider = useWalletProvider()
  const chainId = useWalletChainId()

  const { data } = useSWR(
    provider && chainId ? ['useENSRegistrarContract', provider, chainId] : null,
    ([, _provider, _chainId]) => {
      const address = ENS_REGISTRAR_ADDRESSES[_chainId as SupportedChainId]

      if (!address) return undefined

      return getContract(address, EnsAbi, _provider) as EnsRegistrar
    },
    SWR_NO_REFRESH_OPTIONS,
  )

  return data
}
