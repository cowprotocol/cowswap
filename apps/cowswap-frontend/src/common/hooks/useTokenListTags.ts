import { useMemo } from 'react'

import { useAllListsList } from '@cowprotocol/tokens'
import { StatusColorVariant } from '@cowprotocol/ui'

export interface TagInfo {
  id: string
  name: string
  description: string
  icon?: string
  color?: StatusColorVariant
}

export type TokenListTags = Record<string, TagInfo>

// The list of tag names that we want to support from tokenlists
const ALLOWED_TOKENLIST_TAGS = ['circle']

export function useTokenListTags(): TokenListTags {
  const tokenLists = useAllListsList()

  return useMemo(() => {
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

    return tokenListTags
  }, [tokenLists])
}
