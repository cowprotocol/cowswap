import { ListSourceConfig, ListSourceConfigWithUrl } from '../types'

export const getIsTokenListWithUrl = (tokenList: ListSourceConfig): tokenList is ListSourceConfigWithUrl =>
  'url' in tokenList
