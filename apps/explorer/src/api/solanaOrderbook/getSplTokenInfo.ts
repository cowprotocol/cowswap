import { RPC_URLS } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { TokenErc20 } from '@gnosis.pm/dex-js'

/**
 * Decimals for mints the Solana token list does not carry, read off the mint account itself.
 * Without them an order's amounts cannot be formatted at all. Name and symbol live in Metaplex
 * metadata rather than the mint, so they stand in as a shortened mint.
 */

const SOLANA_RPC_URL = RPC_URLS[SupportedChainId.SOLANA]

interface GetAccountInfoResult {
  value?: { data?: { parsed?: { info?: { decimals?: number } } } }
}

interface RpcResponse<T> {
  result?: T
  error?: { message?: string }
}

/**
 * Resolves a mint, or `null` when the chain has nothing usable for it.
 *
 * Rejects rather than returning `null` on a transport failure, so the caller can tell "no such mint"
 * from "the request did not get through" and retry only the latter.
 */
export async function getSplTokenInfo(mint: string): Promise<TokenErc20 | null> {
  const response = await fetch(SOLANA_RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'getAccountInfo',
      params: [mint, { encoding: 'jsonParsed' }],
    }),
  })

  if (!response.ok) {
    throw new Error(`Solana RPC getAccountInfo responded ${response.status}`)
  }

  const { result }: RpcResponse<GetAccountInfoResult> = await response.json()
  const decimals = result?.value?.data?.parsed?.info?.decimals

  // Not a mint account, or an endpoint that parsed it into something unexpected.
  if (typeof decimals !== 'number') return null

  const shortened = `${mint.slice(0, 4)}…${mint.slice(-4)}`

  return { address: mint, decimals, symbol: shortened, name: shortened }
}
