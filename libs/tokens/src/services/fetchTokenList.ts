import { MAINNET_PROVIDER } from '@cowprotocol/common-const'
import { contenthashToUri, parseENSAddress, resolveENSContentHash, uriToHttp } from '@cowprotocol/common-utils'

import { ListSourceConfig, ListState } from '../types'
import { validateTokenList } from '../utils/validateTokenList'

/**
 * Refactored version of apps/cowswap-frontend/src/lib/hooks/useTokenList/fetchTokenList.ts
 */
export function fetchTokenList(list: ListSourceConfig): Promise<ListState> {
  const isEnsSource = parseENSAddress(list.source)
  return isEnsSource ? fetchTokenListByEnsName(list) : fetchTokenListByUrl(list)
}

async function fetchTokenListByUrl(list: ListSourceConfig): Promise<ListState> {
  return _fetchTokenList(list.source, [list.source]).then((result) => {
    return {
      ...result,
      priority: list.priority,
      source: list.source,
    }
  })
}

async function fetchTokenListByEnsName(list: ListSourceConfig): Promise<ListState> {
  const contentHashUri = await resolveENSContentHash(list.source, MAINNET_PROVIDER)
  const translatedUri = contenthashToUri(contentHashUri)
  const urls = uriToHttp(translatedUri)

  return _fetchTokenList(list.source, urls).then((result) => {
    return {
      ...result,
      priority: list.priority,
      source: list.source,
    }
  })
}

async function _fetchTokenList(source: string, urls: string[]): Promise<ListState> {
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
      source,
      list: await validateTokenList(json),
    }
  }

  throw new Error('Unrecognized list URL protocol.')
}
