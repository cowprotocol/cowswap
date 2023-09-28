import { TokenList, TokenListWithUrl } from '../types'

export const getIsTokenListWithUrl = (tokenList: TokenList): tokenList is TokenListWithUrl => 'url' in tokenList
