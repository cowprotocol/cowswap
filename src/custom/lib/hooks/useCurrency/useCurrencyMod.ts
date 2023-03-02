import { Currency /*, Token*/ } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import useNativeCurrency from 'lib/hooks/useNativeCurrency'
import { useMemo } from 'react'

import { TOKEN_SHORTHANDS } from 'constants/tokens'
import { supportedChainId } from 'utils/supportedChainId'
import { TokenMap, useTokenFromMapOrNetwork } from '@src/lib/hooks/useCurrency'
import { isChainAllowed } from '@cow/modules/wallet/web3-react/connection'
import { useWalletInfo } from '@cow/modules/wallet'

/**
 * Returns a Currency from the currencyId.
 * Returns null if currency is loading or null was passed.
 * Returns undefined if currencyId is invalid or token does not exist.
 */
export function useCurrencyFromMap(tokens: TokenMap, currencyId?: string | null): Currency | null | undefined {
  const nativeCurrency = useNativeCurrency()
  const { connector } = useWeb3React()
  const { chainId } = useWalletInfo()
  const isNative = Boolean(nativeCurrency && ['ETH', 'XDAI'].includes(currencyId?.toUpperCase() || '')) // MOD!!
  const shorthandMatchAddress = useMemo(() => {
    const chain = supportedChainId(chainId)
    return chain && currencyId ? TOKEN_SHORTHANDS[currencyId.toUpperCase()]?.[chain] : undefined
  }, [chainId, currencyId])

  const token = useTokenFromMapOrNetwork(tokens, isNative ? undefined : shorthandMatchAddress ?? currencyId)

  const chainAllowed = chainId && isChainAllowed(connector, chainId)
  if (currencyId === null || currencyId === undefined || !chainAllowed) return null

  // this case so we use our builtin wrapped token instead of wrapped tokens on token lists
  const wrappedNative = nativeCurrency?.wrapped
  if (wrappedNative?.address?.toUpperCase() === currencyId?.toUpperCase()) return wrappedNative

  return isNative ? nativeCurrency : token
}
