import { useCombinedActiveList } from 'state/lists/hooks'
import { useTokensFromMap } from 'hooks/Tokens'
import { useUpdateAtom } from 'jotai/utils'
import { tokensByAddressAtom, tokensBySymbolAtom } from '@cow/modules/tokensList/tokensListAtom'
import { useEffect } from 'react'
import { Token } from '@uniswap/sdk-core'

export function TokensListUpdater() {
  const allTokens = useCombinedActiveList()
  const tokensFromMap = useTokensFromMap(allTokens, true)
  const updateTokensByAddress = useUpdateAtom(tokensByAddressAtom)
  const updateTokensBySymbol = useUpdateAtom(tokensBySymbolAtom)

  useEffect(() => {
    updateTokensByAddress(tokensFromMap)
    updateTokensBySymbol(
      Object.keys(tokensFromMap).reduce((acc, key) => {
        const val = tokensFromMap[key]
        const symbol = (val.symbol || '').toLowerCase()

        acc[symbol] = acc[symbol] || []
        acc[symbol].push(val)

        return acc
      }, {} as { [symbol: string]: Token[] })
    )
  }, [tokensFromMap, updateTokensByAddress, updateTokensBySymbol])

  return null
}
