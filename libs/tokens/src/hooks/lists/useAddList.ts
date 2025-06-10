import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { environmentAtom } from '../../state/environmentAtom'
import { addListAtom } from '../../state/tokenLists/tokenListsActionsAtom'
import { listsStatesByChainAtom } from '../../state/tokenLists/tokenListsStateAtom'
import { ListState } from '../../types'

const TOKEN_LISTS_CONTENT_LIMIT = 5000

function getTokenListsStateCount(states: ListState[]): number {
  return states
    .map((item) => (item ? item.list.tokens.length : 0))
    .flat()
    .reduce((acc, count) => acc + count, 0)
}

function getTokenListsLimitError(currentStateCount: number, updateCount: number): string {
  return `
Cannot add token list.
Token lists content limit exceeded: ${TOKEN_LISTS_CONTENT_LIMIT}.
Current tokens count: ${currentStateCount}.
Tokens in update: ${updateCount}.
  `
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useAddList(onAddList: (source: string) => void) {
  const { chainId } = useAtomValue(environmentAtom)
  const listsStatesByChain = useAtomValue(listsStatesByChainAtom)
  const addList = useSetAtom(addListAtom)

  return useCallback(
    (state: ListState) => {
      const currentStateCount = getTokenListsStateCount(Object.values(listsStatesByChain[chainId] || {}))
      const updateCount = getTokenListsStateCount([state])
      const totalCount = currentStateCount + updateCount

      // Due to localStorage limit, we need to limit the amount of tokens we can store
      if (totalCount > TOKEN_LISTS_CONTENT_LIMIT) {
        throw new Error(getTokenListsLimitError(currentStateCount, updateCount))
      }

      addList(state)
      onAddList(state.source)
    },
    [addList, listsStatesByChain, chainId, onAddList],
  )
}
