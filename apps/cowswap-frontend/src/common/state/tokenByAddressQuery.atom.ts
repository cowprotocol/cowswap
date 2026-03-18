import { TokenWithLogo, getRpcProvider } from '@cowprotocol/common-const'
import { fetchTokenFromBlockchain } from '@cowprotocol/tokens'

import { atomFamily } from 'jotai-family'
import { atomWithQuery } from 'jotai-tanstack-query'

function parseTokenKey(key: string): { chainId: number; address: string } {
  const [chainIdStr, address] = key.split('::')
  return { chainId: Number(chainIdStr), address: address ?? '' }
}

export function tokenKey(chainId: number, address: string): string {
  return `${chainId}::${address.toLowerCase()}`
}

// TODO: Maybe it's better to just create a module that stores the fetched tokens in memory.
export const tokenQueryFamily = atomFamily((key: string) =>
  atomWithQuery(() => {
    const { chainId, address } = parseTokenKey(key)

    return {
      queryKey: ['twapOrderToken', chainId, address],
      staleTime: Infinity,
      queryFn: async (): Promise<TokenWithLogo | null> => {
        const provider = getRpcProvider(chainId)

        if (!provider) return null

        // TODO M-6 COW-573
        // This flow will be reviewed and updated later, to include a wagmi alternative
        const token = await fetchTokenFromBlockchain(address, chainId, provider)

        return TokenWithLogo.fromToken(token)
      },
    }
  }),
)
