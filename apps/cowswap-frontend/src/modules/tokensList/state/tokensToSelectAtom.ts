import { atom } from 'jotai'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { getAddressKey, AddressKey } from '@cowprotocol/cow-sdk'
import { allActiveTokensAtom, environmentAtom, listsStatesMapAtom, TokenListsState } from '@cowprotocol/tokens'

import { Field } from 'legacy/state/types'

import { selectTokenWidgetAtom } from './selectTokenWidgetAtom'

type TokensToSelectPerField = Record<Field.INPUT | Field.OUTPUT, TokenWithLogo[]>

export const tokensToSelectAtomPerField = atom(async (get): Promise<TokensToSelectPerField> => {
  const allActive = await get(allActiveTokensAtom)
  const listsStatesMap = await get(listsStatesMapAtom)
  const { sellSelectedLists, buySelectedLists } = get(environmentAtom)

  return {
    [Field.INPUT]: getTokensBySelectedLists(allActive.tokens, listsStatesMap, sellSelectedLists),
    [Field.OUTPUT]: getTokensBySelectedLists(allActive.tokens, listsStatesMap, buySelectedLists),
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

  return allTokens.filter((token) => availableTokens.has(getAddressKey(token.address)))
}
