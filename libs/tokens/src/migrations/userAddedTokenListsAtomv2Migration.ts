import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { ListsSourcesByNetwork } from '../types'

/**
 * Context: https://github.com/cowprotocol/cowswap/pull/3881#issuecomment-1953522918
 * In v2 atom we added excessive data to the atom, which is not needed and causes localStorage to be bloated.
 * To not loose user-added token lists, we need to migrate the data to a new atom version.
 */
export function userAddedTokenListsAtomv2Migration() {
  try {
    const v2StateRaw = localStorage.getItem('userAddedTokenListsAtom:v2')
    if (!v2StateRaw) return

    const v2State = JSON.parse(v2StateRaw) as ListsSourcesByNetwork

    // Remove excessive data
    Object.keys(v2State).forEach((chainId) => {
      const state = v2State[chainId as unknown as SupportedChainId]

      state.forEach((list) => {
        delete (list as never)['list']
      })
    })

    // Save the new state
    localStorage.setItem('userAddedTokenListsAtom:v3', JSON.stringify(v2State))
  } catch (e) {
    console.error('userAddedTokenListsAtomv2Migration failed', e)
  }

  // Remove the old state
  localStorage.removeItem('userAddedTokenListsAtom:v2')
}
