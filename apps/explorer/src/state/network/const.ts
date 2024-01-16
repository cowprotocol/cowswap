import { CHAIN_INFO_ARRAY } from '@cowprotocol/common-const'

export const NETWORK_PREFIXES = CHAIN_INFO_ARRAY.map((info) => info.urlAlias)
  .filter(Boolean)
  .join('|')
