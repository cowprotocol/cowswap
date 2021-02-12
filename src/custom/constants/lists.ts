// the Uniswap Default token list lives here

// TODO: Select default list dependent on network
export const DEFAULT_TOKEN_LIST_URL = 'tokens.uniswap.eth'
export const DEFAULT_TOKEN_LIST_URL_XDAI = 'https://tokens.honeyswap.org'

export const DEFAULT_LIST_OF_LISTS: string[] = [
  DEFAULT_TOKEN_LIST_URL,
  DEFAULT_TOKEN_LIST_URL_XDAI,
  't2crtokens.eth', // kleros
  'tokens.1inch.eth', // 1inch
  'synths.snx.eth',
  'tokenlist.dharma.eth',
  'defi.cmc.eth',
  'erc20.cmc.eth',
  'stablecoin.cmc.eth',
  'tokenlist.zerion.eth',
  'tokenlist.aave.eth',
  'https://tokens.coingecko.com/uniswap/all.json',
  'https://app.tryroll.com/tokens.json',
  'https://raw.githubusercontent.com/compound-finance/token-list/master/compound.tokenlist.json',
  'https://defiprime.com/defiprime.tokenlist.json',
  'https://umaproject.org/uma.tokenlist.json'
]
