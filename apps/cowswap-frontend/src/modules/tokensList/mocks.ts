import { TokenWithLogo } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { ListState } from '@cowprotocol/tokens'

export const allTokensMock: TokenWithLogo[] = [
  {
    name: 'Gnosis',
    chainId: SupportedChainId.SEPOLIA,
    symbol: 'GNO',
    decimals: 18,
    address: '0x02abbdbaaa7b1bb64b5c878f7ac17f8dda169532',
    logoURI:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6810e776880C02933D47DB1b9fc05908e5386b96/logo.png',
  },
  {
    name: 'Basic Attention Token',
    chainId: SupportedChainId.SEPOLIA,
    symbol: 'BAT',
    decimals: 18,
    address: '0x70cBa46d2e933030E2f274AE58c951C800548AeF',
    logoURI:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x0D8775F648430679A709E98d2b0Cb6250d2887EF/logo.png',
  },
  {
    name: 'CoW Protocol Token',
    chainId: SupportedChainId.SEPOLIA,
    symbol: 'COW',
    decimals: 18,
    address: '0x91056D4A53E1faa1A84306D4deAEc71085394bC8',
    logoURI: 'https://gnosis.mypinata.cloud/ipfs/Qme9B6jRpGtZsRFcPjHvA5T4ugFuL4c3SzWfxyMPa59AMo',
  },
  {
    name: 'USD Coin',
    chainId: SupportedChainId.SEPOLIA,
    symbol: 'USDC',
    decimals: 6,
    address: '0xD87Ba7A50B2E7E660f678A895E4B72E7CB4CCd9C',
    logoURI:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
  },
  {
    name: 'DAI',
    chainId: SupportedChainId.SEPOLIA,
    symbol: 'DAI',
    decimals: 18,
    address: '0xdc31Ee1784292379Fbb2964b3B9C4124D8F89C60',
    logoURI:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png',
  },
  {
    name: '0x',
    chainId: SupportedChainId.SEPOLIA,
    symbol: 'ZRX',
    decimals: 18,
    address: '0xe4E81Fa6B16327D4B78CFEB83AAdE04bA7075165',
    logoURI:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xE41d2489571d322189246DaFA5ebDe1F4699F498/logo.png',
  },
].map((item) => new TokenWithLogo(item.logoURI, item.chainId, item.address, item.decimals, item.symbol, item.name))

export const favoriteTokensMock: TokenWithLogo[] = [
  {
    name: 'Basic Attention Token',
    chainId: SupportedChainId.SEPOLIA,
    symbol: 'BAT',
    decimals: 18,
    address: '0x70cBa46d2e933030E2f274AE58c951C800548AeF',
    logoURI:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x0D8775F648430679A709E98d2b0Cb6250d2887EF/logo.png',
  },
  {
    name: 'Polymath Network',
    chainId: SupportedChainId.SEPOLIA,
    symbol: 'POLY',
    decimals: 18,
    address: '0x9e32c0EfF886B6Ccae99350Fd5e7002dCED55F15',
    logoURI: 'https://assets.coingecko.com/coins/images/2784/thumb/inKkF01.png?1605007034',
  },
].map((item) => new TokenWithLogo(item.logoURI, item.chainId, item.address, item.decimals, item.symbol, item.name))

export const customTokensMock: TokenWithLogo[] = [
  {
    name: 'Tether USD',
    chainId: SupportedChainId.SEPOLIA,
    symbol: 'USDT',
    decimals: 6,
    address: '0x7b77F953e703E80CD97F6911385c0b1ceabC96Bc',
    logoURI: undefined,
  },
  {
    name: 'Euro Coin',
    chainId: SupportedChainId.SEPOLIA,
    symbol: 'EUROC',
    decimals: 6,
    address: '0x1aBaEA1f7C830bD89Acc67eC4af516284b1bC33c',
    logoURI:
      'https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/ethereum/assets/0x1aBaEA1f7C830bD89Acc67eC4af516284b1bC33c/logo.png',
  },
].map((item) => new TokenWithLogo(item.logoURI, item.chainId, item.address, item.decimals, item.symbol, item.name))

export const listsMock: ListState[] = [
  {
    source:
      'https://tokenlists.org/token-list?url=https://raw.githubusercontent.com/cowprotocol/token-lists/main/src/public/CowSwapSepolia.json',
    list: {
      name: 'CowSwap Sepolia',
      logoURI: 'https://gnosis.mypinata.cloud/ipfs/Qme9B6jRpGtZsRFcPjHvA5T4ugFuL4c3SzWfxyMPa59AMo',
      // TODO: Replace any with proper type definitions
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tokens: [1, 2, 3, 4, 5, 6, 7] as any[],
      version: { major: 0, minor: 0, patch: 1 },
      timestamp: '',
    },
  },
  {
    source:
      'https://tokenlists.org/token-list?url=https://raw.githubusercontent.com/compound-finance/token-list/master/compound.tokenlist.json',
    list: {
      name: 'Compound',
      logoURI: 'https://raw.githubusercontent.com/compound-finance/token-list/master/assets/compound-interface.svg',
      // TODO: Replace any with proper type definitions
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tokens: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16] as any[],
      version: { major: 0, minor: 2, patch: 1 },
      timestamp: '',
    },
  },
]

export const importListsMock: ListState = {
  source: 'https://files.cow.fi/tokens/CowSwap.json',
  list: {
    name: 'CoW Swap',
    logoURI: 'https://raw.githubusercontent.com/cowprotocol/token-lists/main/src/public/images/list-logo.png',
    // TODO: Replace any with proper type definitions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tokens: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] as any[],
    version: { major: 1, minor: 0, patch: 5 },
    timestamp: '',
  },
}
