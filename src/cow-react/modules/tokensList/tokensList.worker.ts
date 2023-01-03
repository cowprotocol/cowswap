/* eslint-disable no-restricted-globals */

import type { SupportedChainId } from '@cowprotocol/cow-sdk'
import { TokensListConfig, TokensListsByChainId, TokensListsWorkerEvents } from './types'
import { DB_VERSION, tokensListDB } from './tokensList.db'

const supportedChains = [1, 5, 100]

const EVENTS: { [key in TokensListsWorkerEvents]: any } = {
  [TokensListsWorkerEvents.NETWORK_CHANGED]: initChainId,
}

self.addEventListener(
  'message',
  function ({ data }) {
    const handler = EVENTS[data?.event as TokensListsWorkerEvents]

    if (handler) handler(data?.data)
  },
  false
)

initDB()

/* ****************************************** */

async function initChainId(chainId: SupportedChainId) {
  if (!supportedChains.includes(chainId)) return

  const listsMap = await getTokensLists()
  const lists = listsMap[chainId].filter((item) => item.isActive)
  const results = await Promise.all(lists.map(({ url }) => loadTokensList(url)))

  const allTokens = results
    .map(({ tokens }) => {
      return tokens.filter((item) => item.chainId === chainId).map(({ chainId, ...rest }) => rest)
    })
    .flat()

  // TODO: update only when version changed
  await tokensListDB.table(chainId.toString()).bulkPut(allTokens)

  self.postMessage({ event: TokensListsWorkerEvents.NETWORK_CHANGED, data: chainId })
}

async function getTokensLists(): Promise<TokensListsByChainId> {
  return fetch('/workers/tokensList/lists.json').then((res) => res.json())
}

async function loadTokensList(url: string): Promise<TokensListConfig> {
  return fetch(url).then((res) => res.json())
}

function initDB() {
  tokensListDB.version(DB_VERSION).stores(
    supportedChains.reduce((acc, chainId) => {
      acc[chainId.toString()] = '++address,name,symbol,decimals,logoURI'

      return acc
    }, {} as { [key: string]: string })
  )
}
