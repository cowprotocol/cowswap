import { useAtomValue } from 'jotai'

import { tokenListsTagsAtom } from '../../state/tokenLists/tokenListsTagsAtom'
import { TokenListTags } from '../../types'

export function useTokenListsTags(): TokenListTags {
  return useAtomValue(tokenListsTagsAtom)
}
