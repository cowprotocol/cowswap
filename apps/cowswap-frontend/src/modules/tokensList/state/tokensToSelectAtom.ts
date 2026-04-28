import { atom } from 'jotai'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { getAddressKey, AddressKey } from '@cowprotocol/cow-sdk'
import {
  allActiveTokensAtom,
  environmentAtom,
  favoriteTokensListAtom,
  listsStatesMapAtom,
  TokenListsState,
} from '@cowprotocol/tokens'

import { Field } from 'legacy/state/types'

import { selectTokenWidgetAtom } from './selectTokenWidgetAtom'

type TokensToSelectPerField = Record<Field.INPUT | Field.OUTPUT, TokenWithLogo[]>

export const tokensToSelectAtomPerField = atom(async (get): Promise<TokensToSelectPerField> => {
  const allActive = await get(allActiveTokensAtom)
  const favoriteTokens = get(favoriteTokensListAtom)
  const listsStatesMap = await get(listsStatesMapAtom)
  const { sellSelectedLists, buySelectedLists, hideFavoriteTokens } = get(environmentAtom)

  return {
    [Field.INPUT]: getTokensBySelectedLists(
      allActive.tokens,
      listsStatesMap,
      sellSelectedLists,
      favoriteTokens,
      hideFavoriteTokens,
    ),
    [Field.OUTPUT]: getTokensBySelectedLists(
      allActive.tokens,
      listsStatesMap,
      buySelectedLists,
      favoriteTokens,
      hideFavoriteTokens,
    ),
  }
})

export const tokensToSelectAtom = atom(async (get) => {
  const { field } = get(selectTokenWidgetAtom)
  const tokensPerField = await get(tokensToSelectAtomPerField)

  return tokensPerField[field === Field.INPUT ? Field.INPUT : Field.OUTPUT]
})

function getTokensBySelectedLists(
  allTokens: TokenWithLogo[],
  listsStatesMap: TokenListsState,
  selectedLists: string[] | undefined,
  favoriteTokens: TokenWithLogo[],
  hideFavoriteTokens: boolean | undefined,
): TokenWithLogo[] {
  /**
   * Widget-specific feature.
   * Widget integrator might want to limit tokens available to select depending on the token position - sell or buy.
   */
  if (!selectedLists?.length) {
    return allTokens
  }

  const availableTokens = Object.values(listsStatesMap).reduce<Set<AddressKey>>((acc, state) => {
    if (selectedLists.includes(state.source.toLowerCase())) {
      state.list.tokens.forEach((token) => {
        acc.add(getAddressKey(token.address))
      })
    }

    return acc
  }, new Set())

  const favoriteTokenAddresses = hideFavoriteTokens
    ? null
    : new Set(favoriteTokens.map((token) => getAddressKey(token.address)))

  return allTokens.filter((token) => {
    const tokenAddress = getAddressKey(token.address)

    return availableTokens.has(tokenAddress) || !!favoriteTokenAddresses?.has(tokenAddress)
  })
}
