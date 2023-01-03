import Dexie from 'dexie'

export const DB_NAME = 'COW_TOKENS_LISTS'
export const DB_VERSION = 1

export const tokensListDB = new Dexie(DB_NAME)

export function tokensSchemaId(chainId: number): string {
  return `tokens_${chainId}`
}

export const LISTS_VERSION_SCHEMA_ID = 'listsVersions'
