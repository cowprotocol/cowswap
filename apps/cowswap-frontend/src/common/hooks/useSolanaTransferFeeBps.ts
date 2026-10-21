import { RPC_URLS, SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'
import { isSolanaAddress, isSolanaChain, SupportedChainId } from '@cowprotocol/cow-sdk'

import { useAppKitConnection } from '@reown/appkit-adapter-solana/react'
import { Connection, PublicKey } from '@solana/web3.js'
import useSWR from 'swr'

import { getSolanaTransferFeeBps } from 'common/services/solanaTransferFee/getSolanaTransferFeeBps'

export function useSolanaTransferFeeBps(
  chainId: SupportedChainId,
  tokenAddress: string | undefined,
): number | null | undefined {
  const { connection } = useAppKitConnection()

  const { data } = useSWR(
    isSolanaChain(chainId) && tokenAddress && isSolanaAddress(tokenAddress)
      ? [chainId, tokenAddress, 'useSolanaTransferFeeBps']
      : null,
    ([, mint]) => getSolanaTransferFeeBps(connection ?? getFallbackConnection(), new PublicKey(mint)),
    SWR_NO_REFRESH_OPTIONS,
  )

  return data
}

let fallbackConnection: Connection | undefined

// Quotes are fetched without a connected wallet too, and then AppKit has no Solana connection to share
function getFallbackConnection(): Connection {
  fallbackConnection ??= new Connection(RPC_URLS[SupportedChainId.SOLANA], 'confirmed')

  return fallbackConnection
}
