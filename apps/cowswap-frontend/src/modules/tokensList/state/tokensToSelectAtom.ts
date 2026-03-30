import { atom } from 'jotai'

import { getAddressKey, AddressKey } from '@cowprotocol/cow-sdk'
import { allActiveTokensAtom, environmentAtom, listsStatesMapAtom } from '@cowprotocol/tokens'

import { Field } from 'legacy/state/types'

import { selectTokenWidgetAtom } from './selectTokenWidgetAtom'

export const tokensToSelectAtom = atom(async (get) => {
  const { field } = get(selectTokenWidgetAtom)
  const allActive = await get(allActiveTokensAtom)
  const listsStatesMap = await get(listsStatesMapAtom)
  const { sellSelectedLists, buySelectedLists } = get(environmentAtom)

  /**
   * Widget-specific feature.
   * Widget integrator might want to limit tokens available to select depending on the token position - sell or buy.
   */
  const selectedLists = field === Field.INPUT ? sellSelectedLists : buySelectedLists

  if (selectedLists?.length) {
    const availableTokens = Object.values(listsStatesMap).reduce<Set<AddressKey>>((acc, state) => {
      if (selectedLists.includes(state.source)) {
        state.list.tokens.forEach((token) => {
          acc.add(getAddressKey(token.address))
        })
      }

      return acc
    }, new Set())

    return allActive.tokens.filter((token) => availableTokens.has(getAddressKey(token.address)))
  }

  return allActive.tokens
})
