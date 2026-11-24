import { RPC_URLS } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { useAppKitConnection } from '@reown/appkit-adapter-solana/react'
import { Connection } from '@solana/web3.js'

let fallbackConnection: Connection | undefined

/**
 * AppKit shares a connection only once its Solana adapter is live, which a read path rendered before
 * that — or without a connected wallet at all — cannot wait for. Sending still needs AppKit's own
 * connection, so this is for reads.
 */
export function useSolanaConnection(): Connection {
  const { connection } = useAppKitConnection()

  if (connection) return connection

  fallbackConnection ??= new Connection(RPC_URLS[SupportedChainId.SOLANA], 'confirmed')

  return fallbackConnection
}
