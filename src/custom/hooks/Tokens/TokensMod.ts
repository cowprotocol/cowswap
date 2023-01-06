/* import { useWeb3React } from '@web3-react/core'
import { getChainInfo } from '@src/constants/chainInfo'
import { SupportedChainId } from 'constants/chains'
import { useCurrencyFromMap, useTokenFromMapOrNetwork } from 'lib/hooks/useCurrency'
import { getTokenFilter } from 'lib/hooks/useTokenList/filtering'
import { useMemo } from 'react'
import { isL2ChainId } from 'utils/chains'

import { useAllLists, useCombinedActiveList, useInactiveListUrls } from 'state/lists/hooks'
import { WrappedTokenInfo } from 'state/lists/wrappedTokenInfo'
import { useUserAddedTokens } from 'state/user/hooks' */

// MOD imports
import { useAtomValue } from 'jotai/utils'
import { tokensByAddressAtom } from '@cow/modules/tokensList/tokensListAtom'
import { Token } from '@uniswap/sdk-core'

export * from '@src/hooks/Tokens'

export function useAllTokens(): { [address: string]: Token } {
  return useAtomValue(tokensByAddressAtom)
}
