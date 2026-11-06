import { erc20Abi, getAddress } from 'viem'

import { EVM_NATIVE_CURRENCY_ADDRESS, areAddressesEqual, getAddressKey } from '@cowprotocol/cow-sdk'

import { getEvmChainInfo, getPublicClient } from '@/shared/lib/chain'

export interface TokenMetadata {
  chainId: number
  address: string
  symbol: string
  decimals: number
}

/** Keyed by `getAddressKey(address)`, tokens whose metadata can't be read are left out */
export type TokensMetadataMap = Record<string, TokenMetadata>

export async function readTokensMetadata(chainId: number, addresses: string[]): Promise<TokensMetadataMap> {
  const client = getPublicClient(chainId)
  const nativeCurrency = getEvmChainInfo(chainId)?.nativeCurrency
  const result: TokensMetadataMap = {}
  const erc20Addresses: `0x${string}`[] = []

  for (const address of new Set(addresses.map(getAddressKey))) {
    if (areAddressesEqual(address, EVM_NATIVE_CURRENCY_ADDRESS)) {
      if (nativeCurrency) {
        result[address] = { chainId, address, symbol: nativeCurrency.symbol ?? '', decimals: nativeCurrency.decimals }
      }
    } else {
      erc20Addresses.push(getAddress(address))
    }
  }

  if (!client || !erc20Addresses.length) return result

  const responses = await client.multicall({
    contracts: erc20Addresses.flatMap((address) => [
      { address, abi: erc20Abi, functionName: 'symbol' } as const,
      { address, abi: erc20Abi, functionName: 'decimals' } as const,
    ]),
  })

  erc20Addresses.forEach((address, index) => {
    const symbol = responses[index * 2]
    const decimals = responses[index * 2 + 1]

    if (symbol?.status !== 'success' || decimals?.status !== 'success') return

    result[getAddressKey(address)] = {
      chainId,
      address,
      symbol: String(symbol.result),
      decimals: Number(decimals.result),
    }
  })

  return result
}
