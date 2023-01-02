/* eslint-disable no-restricted-globals */
/* eslint-disable no-restricted-imports */

import 'https://unpkg.com/dexie@latest/dist/dexie.js'

const Dexie = self.Dexie
const supportedChains = [1, 5, 100]
const DB_NAME = 'COW_TOKENS_LISTS'
const DB_VERSION = 1

const db = new Dexie(DB_NAME)

const EVENTS = {
  INIT: initChainId,
}

initDB()

self.addEventListener(
  'message',
  function ({ data }) {
    const handler = EVENTS[data?.event]

    if (handler) handler(data?.data)
  },
  false
)

/* ****************************************** */

async function initChainId(chainId) {
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
  await db[chainId].bulkPut(allTokens)

  self.postMessage({ event: 'TOKENS_LOADED', data: chainId })
}

async function getTokensLists() {
  return fetch('/workers/tokensList/lists.json').then((res) => res.json())
}

async function loadTokensList(url) {
  return fetch(url).then((res) => res.json())
}

function initDB() {
  db.version(DB_VERSION).stores(
    supportedChains.reduce((acc, chainId) => {
      acc[chainId] = '++address,name,symbol,decimals,logoURI'

      return acc
    }, {})
  )
}
