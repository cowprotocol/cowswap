import { RAW_CODE_LINK } from '@cowprotocol/common-const'
import { TokenList, TokenListsByNetwork } from '../types'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

const COW_DAO_LIST: TokenList = { id: 'hc_zMahDEXc_WMKgPAUpK', url: 'https://files.cow.fi/tokens/CowSwap.json' }
const COW_COINGECKO_LIST: TokenList = { id: 'yi4K5DrkWkF3oiWweRjt3', url: 'https://files.cow.fi/tokens/CoinGecko.json' }

const COMPOUND_LIST: TokenList = {
  id: 'uJcgDR4A3MLQTrDsO34bA',
  url: 'https://raw.githubusercontent.com/compound-finance/token-list/master/compound.tokenlist.json',
}
const AAVE_LIST: TokenList = { id: 'ePv0T2u5t0omW7HjPxGCL', url: 'tokenlist.aave.eth' }
const SYNTHETIX_LIST: TokenList = { id: 'vcO-K1VshU97uUeao5p_i', url: 'synths.snx.eth' }
const WRAPPED_LIST: TokenList = { id: 'pBJ4ZL5jeZ0DcLw4S-_85', url: 'wrapped.tokensoft.eth' }
const SET_LIST: TokenList = {
  id: '4nKiWPc0hM6NgkZgTUnsy',
  url: 'https://raw.githubusercontent.com/SetProtocol/uniswap-tokenlist/main/set.tokenlist.json',
}
const OPYN_LIST: TokenList = {
  id: '5anQfdMTp5WyI2jklNvFB',
  url: 'https://raw.githubusercontent.com/opynfinance/opyn-tokenlist/master/opyn-squeeth-tokenlist.json',
}
const ROLL_LIST: TokenList = { id: 'YBalvtWm1YVzQoe8J2AJa', url: 'https://app.tryroll.com/tokens.json' }
const CMC_ALL_LIST: TokenList = { id: 'Pl-AdOGqGki43XDf7EoGV', url: 'defi.cmc.eth' }
const CMC_STABLECOIN: TokenList = { id: 'JXGSqoOJDDY9hsY0Zn-Ue', url: 'stablecoin.cmc.eth' }
const KLEROS_LIST: TokenList = { id: 'bffPi82n3c4zBzAbUQiV7', url: 't2crtokens.eth' }

const GOERLI_LIST: TokenList = {
  id: 'VZ--hetNymtoeZ5QUVhRT',
  url: RAW_CODE_LINK + '/develop/apps/cowswap-frontend/src/tokens/goerli-token-list.json',
}

const HONEY_SWAP_XDAI: TokenList = { id: 'hMVOQpr3d-b-lCpYDDyIM', url: 'https://tokens.honeyswap.org' }

export const BA_LIST =
  'https://raw.githubusercontent.com/The-Blockchain-Association/sec-notice-list/master/ba-sec-list.json'

export const DEFAULT_TOKENS_LISTS: TokenListsByNetwork = {
  [SupportedChainId.MAINNET]: [
    COW_DAO_LIST,
    COW_COINGECKO_LIST,
    COMPOUND_LIST,
    AAVE_LIST,
    SYNTHETIX_LIST,
    WRAPPED_LIST,
    SET_LIST,
    OPYN_LIST,
    ROLL_LIST,
    CMC_ALL_LIST,
    CMC_STABLECOIN,
    KLEROS_LIST,
  ],
  [SupportedChainId.GOERLI]: [GOERLI_LIST, COMPOUND_LIST],
  [SupportedChainId.GNOSIS_CHAIN]: [COW_DAO_LIST, HONEY_SWAP_XDAI],
}

export const DEFAULT_ACTIVE_TOKENS_LISTS: Record<SupportedChainId, ReadonlyArray<string>> = {
  [SupportedChainId.MAINNET]: [COW_DAO_LIST.id, COW_COINGECKO_LIST.id],
  [SupportedChainId.GNOSIS_CHAIN]: [COW_DAO_LIST.id, HONEY_SWAP_XDAI.id],
  [SupportedChainId.GOERLI]: [COW_DAO_LIST.id, GOERLI_LIST.id],
}
