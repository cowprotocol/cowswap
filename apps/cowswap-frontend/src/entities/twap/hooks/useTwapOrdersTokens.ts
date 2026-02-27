import { atom } from 'jotai'
import { getTokensListFromOrders } from 'modules/orders'
import { twapOrdersListAtom } from '../index'
import { loadable } from 'jotai/utils'
import { walletInfoAtom } from '@cowprotocol/wallet'
import { addUserTokenAtom } from '../../../../../../libs/tokens/src/state/tokens/userAddedTokensAtom'
import { tokensByAddressAtom } from '../../../../../../libs/tokens/src/state/tokens/allTokensAtom'
import { TokenWithLogo } from '@cowprotocol/common-const'
import { fetchTokenFromBlockchain } from '@cowprotocol/tokens'
import { isTruthy } from '@cowprotocol/common-utils'
import { getTokenFromMapping } from 'utils/orderUtils/getTokenFromMapping'
import { _fetchTokens } from 'modules/orders/hooks/useTokensForOrdersList'

export const updateUserTokensForTwapOrdersAsyncAtom = atom(null, async (get, set) => {
  const allTokensPromise = get(tokensByAddressAtom)

  const allTokens = (await allTokensPromise).tokens

  const allTwapOrders = get(twapOrdersListAtom)
  const tokensToFetch = getTokensListFromOrders(allTwapOrders)
  const { chainId, provider } = get(walletInfoAtom)

  // TODO M-6 COW-573
  // This flow will be reviewed and updated later, to include a wagmi alternative

  const getToken = async (address: string, signal?: AbortSignal) => {
    if (signal?.aborted) return null
    if (!provider) return null
    const token = await fetchTokenFromBlockchain(address, chainId, provider).then(TokenWithLogo.fromToken)
    return signal?.aborted ? null : token
  }

  // if (signal?.aborted) return allTokensRef.current

  const tokensNotAlreadyFetched = tokensToFetch.reduce<string[]>((acc, token) => {
    const tokenLowercase = token.toLowerCase()

    if (!getTokenFromMapping(tokenLowercase, chainId, allTokens)) {
      acc.push(tokenLowercase)
    }
    return acc
  }, [])

  const fetchedTokens = await _fetchTokens(tokensNotAlreadyFetched, getToken/*, signal*/)

  // if (signal?.aborted) return allTokens

  // Add fetched tokens to the user-added tokens store to avoid re-fetching them
  const tokensToAdd = Object.values(fetchedTokens).filter(isTruthy)

  if (tokensToAdd.length > 0) {
    // FIXME: this might be a cause of the problem when we get listed tokens as user-added tokens
    // Since we use allTokensRef which is not a part of the hooks deps, there might be a race condition
    console.log('Add missing tokens from orders as user-added: ', tokensToAdd)
    set(addUserTokenAtom, tokensToAdd)
  }

  // Merge fetched tokens with what's currently loaded
  return { ...allTokens, ...fetchedTokens }
})

/*
// TODO: Update to simply call the updater and then return its value or return twapOrdersListAtom
export function useTwapOrdersTokens(): TokensByAddress | undefined {
  const allTwapOrders = useAtomValue(twapOrdersListAtom)

  const getTokensForOrdersList = useTokensForOrdersList()

  const tokensToFetch = useMemo(() => {
    return getTokensListFromOrders(allTwapOrders)
  }, [allTwapOrders])

  return useAsyncMemo(() => getTokensForOrdersList(tokensToFetch), [getTokensForOrdersList, tokensToFetch])
}
*/

// TODO: Review this
