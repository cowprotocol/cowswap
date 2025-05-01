/** Explorer app constants */
export const ORDER_QUERY_INTERVAL = 10000 // in ms
export const ORDERS_QUERY_INTERVAL = 30000 // in ms
export const ORDERS_HISTORY_MINUTES_AGO = 10 // in minutes
export const PENDING_ORDERS_BUFFER = 60 * 1000 //60s in ms

export const DISPLAY_TEXT_COPIED_CHECK = 1000 // in ms

// formatSmart related constants
export const LOW_PRECISION_DECIMALS = 2 // display stuff with up to 2 digits: 123.432452 => 123.43
export const MIDDLE_PRECISION_DECIMALS = 4 // display stuff with up to 4 digits: 0.8319079051029 => 0.8319
export const HIGH_PRECISION_DECIMALS = 8 // display stuff with up to 8 digits: 0.8319079051029 => 0.83190790
export const HIGH_PRECISION_SMALL_LIMIT = '0.00000001' // what is considered too small. See https://github.com/gnosis/dex-js/blob/master/src/utils/format.ts#L78-L80
export const PERCENTAGE_PRECISION = -2 // assumes 100% === 1; 1/10^-2 => 100
export const NO_ADJUSTMENT_NEEDED_PRECISION = 0 // 1.4 => 1.4

// Estimation heigh of the header + footer space
export const HEIGHT_HEADER_FOOTER = 257

export const TOKEN_SYMBOL_UNKNOWN = 'UNKNOWN'

// Routes and Links
export enum Routes {
  HOME = '/',
  APPDATA = '/appdata',
}

const GITHUB_REPOSITORY = 'cowprotocol/explorer'
export const CODE_LINK = 'https://github.com/' + GITHUB_REPOSITORY
export const RAW_CODE_LINK = 'https://raw.githubusercontent.com/' + GITHUB_REPOSITORY
export const DOCS_LINK = 'https://docs.cow.fi'
export const PROTOCOL_LINK = 'https://cow.fi/cow-protocol'
export const COWSWAP_LINK = 'https://swap.cow.fi'
export const CONTRACTS_CODE_LINK = 'https://github.com/cowprotocol/contracts'
export const DISCORD_LINK = 'https://discord.gg/cowprotocol'
export const DUNE_DASHBOARD_LINK = 'https://dune.com/cowprotocol/cowswap'
export const TWITTER_LINK = 'https://twitter.com/CoWSwap'
export const COWWIKI_LINK = 'https://en.wikipedia.org/wiki/Coincidence_of_wants'
export const GNOSIS_FORUM_ROADTODECENT_LINK = 'https://forum.gnosis.io/t/gpv2-road-to-decentralization/1245'

export const APP_TITLE = 'CoW Protocol Explorer'

export const SPECIAL_ADDRESSES: { [key: string]: string } = {
  '0xa03be496e67ec29bc62f01a428683d7f9c204930': 'Solver Rewards Safe',
  '0xca771eda0c70aa7d053ab1b25004559b918fe662': 'CoW DAO',
}

export const TAB_QUERY_PARAM_KEY = 'tab'
