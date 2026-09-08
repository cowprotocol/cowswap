import ms from 'ms.macro'

import type { RestrictedTokenList } from './types'

export const DEFAULT_CMS_REQUEST_TTL = ms`1h`

export const ONDO_TOKEN_LIST_URL =
  'https://raw.githubusercontent.com/ondoprotocol/cowswap-global-markets-token-list/cf97552db394cc10bffab7ac942805a89a882039/tokenlist.json'

export const RESERVE_PROTOCOL_BNB_TOKEN_LIST_URL =
  'https://raw.githubusercontent.com/reserve-protocol/dtf-interface/1dbc095c95210f3342278acb8b865763a4d7d443/packages/dtf-catalog/tokenlists/index-dtf/restricted/bnb.tokenlist.json'

export const RESTRICTED_COUNTRIES = [
  'AF',
  'DZ',
  'BY',
  'CA',
  'CN',
  'CU',
  'KP',
  'ER',
  'IR',
  'LY',
  'MM',
  'MA',
  'NP',
  'RU',
  'SO',
  'SS',
  'SD',
  'SY',
  'US',
  'VE',
  'AT',
  'BE',
  'BG',
  'HR',
  'CY',
  'CZ',
  'DK',
  'EE',
  'FI',
  'FR',
  'DE',
  'GR',
  'HU',
  'IE',
  'IT',
  'LV',
  'LT',
  'LU',
  'MT',
  'NL',
  'PL',
  'PT',
  'RO',
  'SK',
  'SI',
  'ES',
  'SE',
  'IS',
  'LI',
  'NO',
] as const

export const ONDO_FALLBACK_TOKEN_LIST: RestrictedTokenList = {
  name: 'Ondo Tokenized Stocks List',
  tokenListUrl: ONDO_TOKEN_LIST_URL,
  restrictedCountries: [...RESTRICTED_COUNTRIES],
} as const

export const XStocks_FALLBACK_TOKEN_LIST: RestrictedTokenList = {
  name: 'xStocks Token List',
  tokenListUrl:
    'https://raw.githubusercontent.com/backed-fi/cowswap-xstocks-tokenlist/ca393f14a21111d32b0092f9800f91135a590fff/tokenlist.json',
  restrictedCountries: [...RESTRICTED_COUNTRIES],
} as const

export const RESERVE_PROTOCOL_BNB_FALLBACK_TOKEN_LIST: RestrictedTokenList = {
  name: 'Reserve Protocol BNB Token List',
  tokenListUrl: RESERVE_PROTOCOL_BNB_TOKEN_LIST_URL,
  restrictedCountries: [...RESTRICTED_COUNTRIES],
} as const

export const COINBASE_TOKENIZED_STOCKS_FALLBACK_TOKEN_LIST: RestrictedTokenList = {
  name: 'Coinbase Tokenized Stocks List',
  tokenListUrl:
    'https://raw.githubusercontent.com/afahdenCB/coinbase-tokenized-stocks/e02f8a02bc76dd756f4e9388c21c8302be1a6509/CowSwap.json',
  restrictedCountries: [...RESTRICTED_COUNTRIES],
} as const
