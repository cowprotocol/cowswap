/* eslint-disable no-restricted-globals */

import type { SupportedChainId } from '@cowprotocol/cow-sdk'
import { supportedChains, TokenDto, TokensListConfig, TokensListsWorkerEvents, TokensListVersion } from './types'
import { initTokensListsDB, LISTS_VERSION_SCHEMA_ID, tokensListDB, tokensSchemaId } from './tokensList.db'
import listsConfig from './listsConfig.json'

const EVENTS: { [key in TokensListsWorkerEvents]: any } = {
  [TokensListsWorkerEvents.NETWORK_CHANGED]: updateTokensForChainId,
}

self.addEventListener(
  'message',
  function ({ data }) {
    const handler = EVENTS[data?.event as TokensListsWorkerEvents]

    if (handler) handler(data?.data)
  },
  false
)

initTokensListsDB()

/* ****************************************** */

async function updateTokensForChainId(chainId: SupportedChainId) {
  if (!supportedChains.includes(chainId)) return

  const listsUrls = listsConfig[chainId].filter((item) => item.isActive).map(({ url }) => url)
  const listsInfo = await Promise.all(listsUrls.map(loadTokensList))
  const allTokens = (await Promise.all(listsInfo.map((config) => processTokensListConfig(chainId, config)))).flat()

  if (allTokens.length) {
    await tokensListDB.table(tokensSchemaId(chainId)).bulkPut(allTokens)
    console.debug(`Updated tokens lists for chainId: ${chainId}:`, allTokens)
  }

  self.postMessage({ event: TokensListsWorkerEvents.NETWORK_CHANGED, data: chainId })
}

async function loadTokensList(url: string): Promise<TokensListConfig> {
  return fetch(url).then((res) => res.json())
}

async function processTokensListConfig(
  chainId: SupportedChainId,
  { tokens, version, name }: TokensListConfig
): Promise<TokenDto[]> {
  const versionString = tokensListVersionToString(version)
  const table = tokensListDB.table(LISTS_VERSION_SCHEMA_ID)
  const versionInfo = await table.get(name)

  // Skip tokens update when version isn't changed
  if (versionInfo && versionInfo.version === versionString) {
    return []
  }

  await table.put({ name, chainId, version: versionString })

  return tokens.filter((item) => item.chainId === chainId).map(({ chainId, ...rest }) => rest)
}

function tokensListVersionToString(version: TokensListVersion): string {
  return [version.major, version.minor, version.patch].join('.')
}
