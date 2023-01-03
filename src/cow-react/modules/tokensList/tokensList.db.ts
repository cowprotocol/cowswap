import Dexie from 'dexie'
import { supportedChains, TokenDto } from '@cow/modules/tokensList/types'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

export const DB_NAME = 'COW_TOKENS_LISTS'
export const DB_VERSION = 1

export const tokensListDB = new Dexie(DB_NAME)

export function tokensSchemaId(chainId: number): string {
  return `tokens_${chainId}`
}

export const LISTS_VERSION_SCHEMA_ID = 'listsVersions'

export function initTokensListsDB() {
  const version = tokensListDB.version(DB_VERSION)
  const tokensSchemas = supportedChains.reduce((acc, chainId) => {
    acc[tokensSchemaId(chainId)] = '++address,name,symbol,decimals,logoURI'

    return acc
  }, {} as { [key: string]: string })

  version.stores({
    ...tokensSchemas,
    [LISTS_VERSION_SCHEMA_ID]: '++name,chainId,version',
  })
}

export async function getTokensListFromDB(chainId: SupportedChainId): Promise<TokenDto[]> {
  const table = tokensListDB.table(tokensSchemaId(chainId))

  return table.toArray()
}
