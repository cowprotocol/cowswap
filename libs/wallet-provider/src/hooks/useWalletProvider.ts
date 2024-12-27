import { SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'
import { Web3Provider, ExternalProvider } from '@ethersproject/providers'

import { useAppKitNetwork, useAppKitProvider } from '@reown/appkit/react'
import useSWR from 'swr'

export function useWalletProvider(): Web3Provider | undefined {
  const { walletProvider } = useAppKitProvider('eip155')
  const { chainId } = useAppKitNetwork()

  return useSWR(
    walletProvider ? [walletProvider, chainId] : null,
    ([walletProvider, chainId]) => {
      return new Web3Provider(walletProvider as ExternalProvider, chainId)
    },
    SWR_NO_REFRESH_OPTIONS,
  ).data
}
