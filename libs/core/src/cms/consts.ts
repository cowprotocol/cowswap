import ms from 'ms.macro'

import type { RestrictedTokenList } from './types'

export const DEFAULT_CMS_REQUEST_TTL = ms`1h`

export const ONDO_TOKEN_LIST_URL =
  'https://raw.githubusercontent.com/ondoprotocol/cowswap-global-markets-token-list/refs/heads/main/tokenlist.json'

export const ONDO_RESTRICTED_COUNTRIES = [
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
  restrictedCountries: [...ONDO_RESTRICTED_COUNTRIES],
}
