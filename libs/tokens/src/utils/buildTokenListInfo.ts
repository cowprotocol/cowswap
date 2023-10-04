import { TokenListInfo } from '../types'
import { TokenListResult } from '../services/fetchTokenList'

export function buildTokenListInfo(val: TokenListResult): TokenListInfo {
  const { major, minor, patch } = val.list.version

  return {
    id: val.id,
    source: val.source,
    name: val.list.name,
    timestamp: val.list.timestamp,
    version: `v${major}.${minor}.${patch}`,
    logoUrl: val.list.logoURI,
    tokensCount: val.list.tokens.length,
  }
}
