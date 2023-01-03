import Dexie from 'dexie'

export const DB_NAME = 'COW_TOKENS_LISTS'
export const DB_VERSION = 1

export const tokensListDB = new Dexie(DB_NAME)
