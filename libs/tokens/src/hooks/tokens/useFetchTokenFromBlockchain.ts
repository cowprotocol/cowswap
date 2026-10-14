import { useCallback } from 'react'

import { useConfig } from 'wagmi'

import { isAddress } from '@cowprotocol/common-utils'
import { isSolanaAddress, isSolanaChain, SupportedChainId } from '@cowprotocol/cow-sdk'
import { TokenInfo } from '@cowprotocol/types'

import { useAppKitConnection } from '@reown/appkit-adapter-solana/react'

import { fetchSolanaTokenFromBlockchain } from '../../utils/fetchSolanaTokenFromBlockchain'
import { fetchTokenFromBlockchain } from '../../utils/fetchTokenFromBlockchain'

export type FetchTokenFromBlockchain = (address: string, chainId: SupportedChainId) => Promise<TokenInfo | null>

/**
 * Resolves to null when the address is not valid for the chain, or the Solana connection is not ready yet
 */
export function useFetchTokenFromBlockchain(): FetchTokenFromBlockchain {
  const config = useConfig()
  const { connection } = useAppKitConnection()

  return useCallback(
    async (address: string, chainId: SupportedChainId) => {
      if (isSolanaChain(chainId)) {
        if (!connection || !isSolanaAddress(address)) return null

        return fetchSolanaTokenFromBlockchain(address, chainId, connection)
      }

      if (!isAddress(address)) return null

      return fetchTokenFromBlockchain(address, chainId, config)
    },
    [config, connection],
  )
}
