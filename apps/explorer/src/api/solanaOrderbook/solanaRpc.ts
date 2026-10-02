import { RPC_URLS } from '@cowprotocol/common-const'
import { AddressKey, SupportedChainId } from '@cowprotocol/cow-sdk'

const SOLANA_RPC_URL = RPC_URLS[SupportedChainId.SOLANA]

export interface ParsedAccount<TInfo> {
  /** `mint` for a mint account, `account` for an SPL token account. */
  type?: string
  info?: TInfo
}

interface GetAccountInfoResult<TInfo> {
  value?: { data?: { parsed?: ParsedAccount<TInfo> } } | null
}

interface RpcResponse<T> {
  result?: T
  error?: { message?: string }
}

/** @see {@link solanaRpcCall} for the failure contract. */
export async function getParsedAccount<TInfo>(address: AddressKey): Promise<ParsedAccount<TInfo> | undefined> {
  const result = await solanaRpcCall<GetAccountInfoResult<TInfo>>('getAccountInfo', [
    address,
    { encoding: 'jsonParsed' },
  ])

  return result?.value?.data?.parsed
}

/**
 * Rejects rather than resolving empty on a transport failure, so callers can tell "the chain has
 * nothing for this address" from "the request did not get through" and retry only the latter.
 */
async function solanaRpcCall<T>(method: string, params: unknown[]): Promise<T | undefined> {
  const response = await fetch(SOLANA_RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  })

  if (!response.ok) {
    throw new Error(`Solana RPC ${method} responded ${response.status}`)
  }

  const { result }: RpcResponse<T> = await response.json()

  return result
}
