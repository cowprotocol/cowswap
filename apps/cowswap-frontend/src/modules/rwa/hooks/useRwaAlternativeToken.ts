import { useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { getCurrencyAddress } from '@cowprotocol/common-utils'
import { getAddressKey } from '@cowprotocol/cow-sdk'
import { Currency } from '@cowprotocol/currency'
import { ListState, RWA_TOKENS_LIST_SOURCES, useAllListsList } from '@cowprotocol/tokens'
import { TokenInfo } from '@cowprotocol/types'

import { Nullish } from 'types'

import { getRwaAlternativeTokensByAddress, getRwaAssetPairs } from '../utils/getRwaAssetPairs'

const [ONDO_TOKENS_LIST_SOURCE, XSTOCKS_TOKENS_LIST_SOURCE] = RWA_TOKENS_LIST_SOURCES

/**
 * Given a currency, returns its RWA counterpart on the other platform (Ondo <-> xStocks), if one exists.
 */
export function useRwaAlternativeToken(currency: Nullish<Currency>): TokenWithLogo | undefined {
  const lists = useAllListsList()

  // `useAllListsList()` returns a new array on every unrelated list update (any list loading/enabling, not just
  // these two), so depending on it directly would recompute — and refetch the alt quote — far more often than the
  // RWA lists actually change. Depend on the two specific list objects instead; they're only replaced when Ondo or
  // xStocks itself reloads.
  const ondoList = lists.find((list) => list.source === ONDO_TOKENS_LIST_SOURCE)
  const xstocksList = lists.find((list) => list.source === XSTOCKS_TOKENS_LIST_SOURCE)

  const alternativesByAddress = useMemo(() => {
    const rwaLists = [ondoList, xstocksList].filter((list): list is ListState => !!list)

    return getRwaAlternativeTokensByAddress(getRwaAssetPairs(rwaLists))
  }, [ondoList, xstocksList])

  return useMemo(() => {
    if (!currency) return undefined

    const key = `${currency.chainId}:${getAddressKey(getCurrencyAddress(currency))}`
    const alternative = alternativesByAddress[key]

    return alternative ? TokenWithLogo.fromToken(alternative as TokenInfo, alternative.logoURI) : undefined
  }, [alternativesByAddress, currency])
}
