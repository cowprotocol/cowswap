import type { TokenList as UniTokenList } from '@uniswap/token-lists'

import { MAINNET_PROVIDER } from '@cowprotocol/common-const'
import { contenthashToUri, resolveENSContentHash, uriToHttp } from '@cowprotocol/common-utils'

import { validateTokenList } from '../../utils/validateTokenList'
import { TokenList, TokenListWithEnsName, TokenListWithUrl } from '../../types'
import { getIsTokenListWithUrl } from '../../utils/getIsTokenListWithUrl'

export interface TokenListResult {
  id: string
  url: string
  list: UniTokenList
}

/**
 * Refactored version of apps/cowswap-frontend/src/lib/hooks/useTokenList/fetchTokenList.ts
 */
export function fetchTokenList(list: TokenList): Promise<TokenListResult> {
  return getIsTokenListWithUrl(list) ? fetchTokenListByUrl(list) : fetchTokenListByEnsName(list)
}

async function fetchTokenListByUrl(list: TokenListWithUrl): Promise<TokenListResult> {
  return _fetchTokenList(list.id, [list.url])
}

async function fetchTokenListByEnsName(list: TokenListWithEnsName): Promise<TokenListResult> {
  const contentHashUri = await resolveENSContentHash(list.ensName, MAINNET_PROVIDER)
  const translatedUri = contenthashToUri(contentHashUri)
  const urls = uriToHttp(translatedUri)

  return _fetchTokenList(list.id, urls)
}

async function _fetchTokenList(id: string, urls: string[]): Promise<TokenListResult> {
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i]
    const isLast = i === urls.length - 1

    let response

    try {
      response = await fetch(url, { credentials: 'omit' })
    } catch (error) {
      const message = `failed to fetch list: ${url}`

      console.debug(message, error)
      if (isLast) throw new Error(message)

      continue
    }

    if (!response.ok) {
      const message = `failed to fetch list: ${url}`

      console.debug(message, response.statusText)
      if (isLast) throw new Error(message)

      continue
    }

    const json = await response.json()

    return {
      id,
      url,
      list: await validateTokenList(json),
    }
  }

  throw new Error('Unrecognized list URL protocol.')
}
