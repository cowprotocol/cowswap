import { AddressKey } from '@cowprotocol/cow-sdk'

import { TokenErc20 } from '@gnosis.pm/dex-js'

import { getParsedAccount } from './solanaRpc'

const TOKEN_METADATA_EXTENSION = 'tokenMetadata'

interface ParsedMintExtension {
  extension?: string
  state?: { name?: string; symbol?: string }
}

interface ParsedMintInfo {
  decimals?: number
  /** Token-2022 only; classic SPL mints carry no extensions. */
  extensions?: ParsedMintExtension[]
}

/**
 * Resolves a mint, or `null` when the chain has nothing usable for it.
 *
 * Decimals are read off the mint account for mints the Solana token list does not carry — without
 * them an order's amounts cannot be formatted at all. A Token-2022 mint also carries its name and
 * symbol inline, in the `tokenMetadata` extension of that same account, so they cost no extra
 * request. A classic SPL mint keeps them in a separate Metaplex account that this does not read,
 * so those fall back to a shortened mint.
 *
 * Rejects rather than returning `null` on a transport failure, so the caller can tell "no such mint"
 * from "the request did not get through" and retry only the latter.
 */
export async function getSplTokenInfo(mint: AddressKey): Promise<TokenErc20 | null> {
  const parsed = await getParsedAccount<ParsedMintInfo>(mint)
  const decimals = parsed?.info?.decimals

  // Not a mint account, or an endpoint that parsed it into something unexpected.
  if (typeof decimals !== 'number') return null

  const shortened = `${mint.slice(0, 4)}…${mint.slice(-4)}`

  return { address: mint, decimals, ...readNameAndSymbol(parsed?.info, shortened) }
}

function readNameAndSymbol(info: ParsedMintInfo | undefined, fallback: string): { name: string; symbol: string } {
  const state = info?.extensions?.find(({ extension }) => extension === TOKEN_METADATA_EXTENSION)?.state

  // `||` rather than `??`: the extension is free-form, so an empty string is as unusable as absent.
  return { name: state?.name || fallback, symbol: state?.symbol || fallback }
}
