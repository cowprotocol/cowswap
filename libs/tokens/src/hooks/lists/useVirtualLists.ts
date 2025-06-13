import { useAtomValue } from 'jotai'

import { virtualListsStateAtom } from '../../state/tokenLists/tokenListsStateAtom'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useVirtualLists() {
  return useAtomValue(virtualListsStateAtom)
}
