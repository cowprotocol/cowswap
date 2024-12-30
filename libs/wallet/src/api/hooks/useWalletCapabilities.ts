import { SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'
import { useWalletProvider } from '@cowprotocol/wallet-provider'

import { useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react'
import useSWR from 'swr'

export type WalletCapabilities = {
  atomicBatch?: { supported: boolean }
}

export function useWalletCapabilities(): WalletCapabilities | undefined {
  const provider = useWalletProvider()
  const { address: account } = useAppKitAccount()
  const { chainId } = useAppKitNetwork()

  return useSWR(
    provider && account && chainId ? [provider, account, chainId] : null,
    ([provider, account, chainId]) => {
      return provider
        .send('wallet_getCapabilities', [account])
        .then((result: { [chainIdHex: string]: WalletCapabilities }) => {
          const chainIdHex = '0x' + (+chainId).toString(16)

          return result[chainIdHex]
        })
    },
    SWR_NO_REFRESH_OPTIONS,
  ).data
}
