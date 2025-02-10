import { SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'
import { useWalletProvider } from '@cowprotocol/wallet-provider'

import useSWR, { SWRResponse } from 'swr'

import { useWalletInfo } from '../hooks'

export type WalletCapabilities = {
  atomicBatch?: { supported: boolean }
}

export function useWalletCapabilities(): SWRResponse<WalletCapabilities | undefined> {
  const provider = useWalletProvider()
  const { chainId, account } = useWalletInfo()

  return useSWR(
    provider && account && chainId ? [provider, account, chainId] : null,
    ([provider, account, chainId]) => {
      return provider
        .send('wallet_getCapabilities', [account])
        .then((result: { [chainIdHex: string]: WalletCapabilities }) => {
          if (!result) return undefined

          const chainIdHex = '0x' + (+chainId).toString(16)

          return result[chainIdHex]
        })
        .catch((error) => {
          console.error('Error fetching wallet capabilities', error)

          return undefined
        })
    },
    SWR_NO_REFRESH_OPTIONS,
  )
}
