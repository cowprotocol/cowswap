import { CHAIN_INFO_ARRAY } from '@cowprotocol/common-const'

export const NETWORKS_PREFIXES = CHAIN_INFO_ARRAY.map((info) => info.urlAlias)
  .filter(Boolean)
  .join('|')
