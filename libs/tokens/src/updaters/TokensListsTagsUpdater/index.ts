import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { StatusColorVariant } from '@cowprotocol/ui'

import { useAllListsList } from '../../hooks/lists/useAllListsList'
import { tokenListsTagsAtom } from '../../state/tokenLists/tokenListsTagsAtom'
import { TokenListTags } from '../../types'

// The list of tag names that we want to support from tokenlists
const ALLOWED_TOKENLIST_TAGS = ['circle']

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function TokensListsTagsUpdater() {
  const tokenLists = useAllListsList()
  const setTokenListTags = useSetAtom(tokenListsTagsAtom)

  useEffect(() => {
    // Build a map of allowed tag information from all token lists
    const tokenListTags: TokenListTags = {}

    // Process all loaded token lists
    for (const { list } of tokenLists) {
      // Check if the list has tag definitions
      if (!list.tags) {
        continue
      }

      // Process each allowed tag
      for (const tagId of ALLOWED_TOKENLIST_TAGS) {
        const tagInfo = list.tags[tagId]
        if (!tagInfo) {
          continue
        }

        // We found a tag definition in a token list, store it with a generated ID
        tokenListTags[tagId] = {
          id: tagId,
          name: tagInfo.name,
          description: tagInfo.description,
          color: StatusColorVariant.Info, // Default color for tokenlist tags
        }
      }
    }

    setTokenListTags(tokenListTags)
  }, [tokenLists, setTokenListTags])

  return null
}
