/* eslint-disable no-restricted-globals */

import Dexie from 'dexie'

enum SupportedChainId {
  MAINNET = 1,
  GOERLI = 5,
  GNOSIS_CHAIN = 100,
}

const DB_NAME = 'COW_TOKENS_LISTS'
const DB_VERSION = 1

const db = new Dexie(DB_NAME)

const EVENTS: { [key: string]: any } = {
  INIT: initChainId,
}

type ListsConfig = {
  [key in SupportedChainId]: { url: string; isActive: boolean }[]
}

interface RawToken {
  symbol: string
  name: string
  address: string
  logoURL: string
  decimals: number
  chainId: number
}

interface TokensListConfig {
  name: string
  timestamp: string
  version: {
    patch: number
    minor: number
    major: number
  }
  logoURL: string
  keywords: string[]
  tokens: RawToken[]
}

self.addEventListener(
  'message',
  function ({ data }) {
    const handler = EVENTS[data?.event]

    if (handler) handler(data?.data)
  },
  false
)

initDB()

/* ****************************************** */

async function initChainId(chainId: SupportedChainId) {
  if (!(chainId in SupportedChainId)) return

  const listsMap = await getTokensLists()
  const lists = listsMap[chainId].filter((item) => item.isActive)
  const results = await Promise.all(lists.map(({ url }) => loadTokensList(url)))

  const allTokens = results
    .map(({ tokens }) => {
      return tokens.filter((item) => item.chainId === chainId).map(({ chainId, ...rest }) => rest)
    })
    .flat()

  // TODO: update only when version changed
  await db.table(chainId.toString()).bulkPut(allTokens)

  self.postMessage({ event: 'TOKENS_LOADED', data: chainId })
}

async function getTokensLists(): Promise<ListsConfig> {
  return fetch('/workers/tokensList/lists.json').then((res) => res.json())
}

async function loadTokensList(url: string): Promise<TokensListConfig> {
  return fetch(url).then((res) => res.json())
}

function initDB() {
  db.version(DB_VERSION).stores(
    Object.values(SupportedChainId).reduce((acc, chainId) => {
      acc[chainId.toString()] = '++address,name,symbol,decimals,logoURI'

      return acc
    }, {} as { [key: string]: string })
  )
}
