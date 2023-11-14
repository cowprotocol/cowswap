import { TradeType, TokenList } from '@cowprotocol/widget-lib'

export const TRADE_MODES = [TradeType.SWAP, TradeType.LIMIT, TradeType.ADVANCED]

// Sourced from https://tokenlists.org/
export const TOKEN_LISTS: TokenList[] = [
  { name: 'CoW Protocol', url: 'https://files.cow.fi/tokens/CowSwap.json' },
  { name: '1inch', url: 'https://tokens.1inch.eth.link' },
  { name: 'Aave Token List', url: 'https://tokenlist.aave.eth.link' },
  { name: 'Agora dataFi Tokens', url: 'https://datafi.theagora.eth.link' },
  {
    name: 'BA ERC20 SEC Action',
    url: 'https://raw.githubusercontent.com/The-Blockchain-Association/sec-notice-list/master/ba-sec-list.json',
  },
  { name: 'CMC DeFi', url: 'https://defi.cmc.eth.link' },
  { name: 'CMC Stablecoin', url: 'https://stablecoin.cmc.eth.link' },
  { name: 'CMC200 ERC20', url: 'https://erc20.cmc.eth.link' },
  { name: 'CompliFi Originals', url: 'https://compli.fi/complifi.tokenlist.json' },
  { name: 'CoinGecko', url: 'https://tokens.coingecko.com/uniswap/all.json' },
  { name: 'CoinGecko DeFi 100', url: 'https://www.coingecko.com/tokens_list/uniswap/defi_100/v_0_0_0.json' },
  {
    name: 'Compound',
    url: 'https://raw.githubusercontent.com/compound-finance/token-list/master/compound.tokenlist.json',
  },
  { name: 'Defiprime', url: 'https://defiprime.com/defiprime.tokenlist.json' },
  {
    name: 'DFO Flexible Org',
    url: 'https://raw.githubusercontent.com/b-u-i-d-l/bazar-tokens-list/master/dist/decentralizedFlexibleOrganizations.json',
  },
  { name: 'Dharma Token List', url: 'https://tokenlist.dharma.eth.link' },
  { name: 'Furucombo', url: 'https://cdn.furucombo.app/furucombo.tokenlist.json' },
  { name: 'Gemini Token List', url: 'https://www.gemini.com/uniswap/manifest.json' },
  { name: 'Kleros Tokens', url: 'https://t2crtokens.eth.link' },
  { name: 'Kyber', url: 'https://api.kyber.network/tokenlist' },
  { name: 'Messari Verified', url: 'https://messari.io/tokenlist/messari-verified' },
  { name: 'MyCrypto', url: 'https://uniswap.mycryptoapi.com/' },
  {
    name: 'Opyn Token List',
    url: 'https://raw.githubusercontent.com/opynfinance/opyn-tokenlist/master/opyn-v1.tokenlist.json',
  },
  { name: 'Superchain Token List', url: 'https://static.optimism.io/optimism.tokenlist.json' },
  { name: 'Roll Social Money', url: 'https://app.tryroll.com/tokens.json' },
  { name: 'Set', url: 'https://raw.githubusercontent.com/SetProtocol/uniswap-tokenlist/main/set.tokenlist.json' },
  { name: 'Synthetix', url: 'https://synths.snx.eth.link' },
  { name: 'Testnet Token List', url: 'https://testnet.tokenlist.eth.link' },
  { name: 'Token Name Service', url: 'https://list.tkn.eth.link' },
  { name: 'Uniswap Labs Default', url: 'https://gateway.ipfs.io/ipns/tokens.uniswap.org' },
  {
    name: 'Uniswap Token Pairs',
    url: 'https://raw.githubusercontent.com/jab416171/uniswap-pairtokens/master/uniswap_pair_tokens.json',
  },
  { name: 'UMA', url: 'https://umaproject.org/uma.tokenlist.json' },
  { name: 'Wrapped Tokens', url: 'https://wrapped.tokensoft.eth.link' },
  { name: 'Yearn', url: 'https://yearn.science/static/tokenlist.json' },
  { name: 'Zapper Token List', url: 'https://zapper.fi/api/token-list' },
  { name: 'Zerion', url: 'https://tokenlist.zerion.eth.link' },
]
