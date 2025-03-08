import { TokenInfo } from '@cowprotocol/types'

import { BridgeProvider, ChainInfo } from './types'

export const testBridgeProvider: BridgeProvider = {
  async getNetworks() {
    return testNetworks
  },
  async getTokens(chainId: number) {
    return testTokens[chainId] || null
  },
}

const testNetworks: ChainInfo[] = [
  {
    id: 56,
    name: 'Binance Smart Chain',
    nativeCurrency: {
      address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeee',
      chainId: 56,
      decimals: 18,
      symbol: 'BNB',
      name: 'BNB',
      logoURI: 'https://icons.llamao.fi/icons/chains/rsz_binance.jpg',
    },
    isEvmChain: true,
    blockExplorer: 'https://bscscan.com/',
    logoUrl: 'https://icons.llamao.fi/icons/chains/rsz_binance.jpg',
    mainColor: '#F0B90B',
  },
  {
    id: 43114,
    name: 'Avalanche',
    nativeCurrency: {
      address: '0x1e2f9e10d02a6b8f8f69fcbf515e75039d2ea30d',
      chainId: 43114,
      decimals: 18,
      symbol: 'AVAX',
      name: 'Avalanche',
      logoURI: 'https://icons.llamao.fi/icons/chains/rsz_avalanche.jpg',
    },
    isEvmChain: true,
    blockExplorer: 'https://cchain.explorer.avax.network/',
    logoUrl: 'https://icons.llamao.fi/icons/chains/rsz_avalanche.jpg',
    mainColor: '#fa4040',
  },
]

const testTokens: Record<number, TokenInfo[] | undefined> = {
  56: [
    {
      address: '0x53e562b9b7e5e94b81f10e96ee70ad06df3d2657',
      chainId: 56,
      decimals: 18,
      symbol: 'BABY',
      name: 'BabySwap Token',
      logoURI: 'https://tokens.1inch.io/0x53e562b9b7e5e94b81f10e96ee70ad06df3d2657.png',
    },
    {
      address: '0x9c65ab58d8d978db963e63f2bfb7121627e3a739',
      chainId: 56,
      decimals: 18,
      symbol: 'MDX',
      name: 'MDX Token',
      logoURI: 'https://tokens.1inch.io/0x9c65ab58d8d978db963e63f2bfb7121627e3a739.png',
    },
    {
      address: '0x7bd6fabd64813c48545c9c0e312a0099d9be2540',
      chainId: 56,
      decimals: 18,
      symbol: 'ELON',
      name: 'Dogelon Mars',
      logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/9436.png',
    },
    {
      address: '0xa64455a4553c9034236734faddaddbb64ace4cc7',
      chainId: 56,
      decimals: 8,
      symbol: 'SANTOS',
      name: 'FC Santos Fan Token',
      logoURI: 'https://tokens.1inch.io/0xa64455a4553c9034236734faddaddbb64ace4cc7.png',
    },
    {
      address: '0x6bff4fb161347ad7de4a625ae5aa3a1ca7077819',
      chainId: 56,
      decimals: 18,
      symbol: 'ADX',
      name: 'AdEx Network',
      logoURI: 'https://tokens.1inch.io/0x6bff4fb161347ad7de4a625ae5aa3a1ca7077819.png',
    },
    {
      address: '0x68e374f856bf25468d365e539b700b648bf94b67',
      chainId: 56,
      decimals: 18,
      symbol: 'MIST',
      name: 'Mist',
      logoURI: 'https://tokens.1inch.io/0x68e374f856bf25468d365e539b700b648bf94b67.png',
    },
    {
      address: '0xa2120b9e674d3fc3875f415a7df52e382f141225',
      chainId: 56,
      decimals: 18,
      symbol: 'ATA',
      name: 'Automata',
      logoURI: 'https://tokens.1inch.io/0xa2120b9e674d3fc3875f415a7df52e382f141225.png',
    },
    {
      address: '0x5f4bde007dc06b867f86ebfe4802e34a1ffeed63',
      chainId: 56,
      decimals: 18,
      symbol: 'HIGH',
      name: 'Highstreet Token',
      logoURI: 'https://tokens.1inch.io/0x5f4bde007dc06b867f86ebfe4802e34a1ffeed63.png',
    },
    {
      address: '0x8263cd1601fe73c066bf49cc09841f35348e3be0',
      chainId: 56,
      decimals: 18,
      symbol: 'ALU',
      name: 'Altura',
      logoURI: 'https://tokens.1inch.io/0x8263cd1601fe73c066bf49cc09841f35348e3be0.png',
    },
    {
      address: '0xac51066d7bec65dc4589368da368b212745d63e8',
      chainId: 56,
      decimals: 6,
      symbol: 'ALICE',
      name: 'ALICE',
      logoURI: 'https://tokens.1inch.io/0xac51066d7bec65dc4589368da368b212745d63e8.png',
    },
  ],
  43114: [
    {
      address: '0x2b2c81e08f1af8835a78bb2a90ae924ace0ea4be',
      chainId: 43114,
      decimals: 18,
      symbol: 'sAVAX',
      name: 'Staked AVAX',
      logoURI: 'https://tokens.1inch.io/0x2b2c81e08f1af8835a78bb2a90ae924ace0ea4be.png',
    },
    {
      address: '0xd24c2ad096400b6fbcd2ad8b24e7acbc21a1da64',
      chainId: 43114,
      decimals: 18,
      symbol: 'FRAX',
      name: 'Frax',
      logoURI: 'https://tokens.1inch.io/0x853d955acef822db058eb8505911ed77f175b99e.png',
    },
    {
      address: '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7',
      chainId: 43114,
      decimals: 6,
      symbol: 'USDt',
      name: 'TetherToken',
      logoURI: 'https://tokens.1inch.io/0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7.png',
    },
    {
      address: '0x75739a693459f33b1fbcc02099eea3ebcf150cbe',
      chainId: 43114,
      decimals: 18,
      symbol: 'TIC',
      name: 'ElasticSwap Tic Token',
      logoURI: 'https://tokens.1inch.io/0x75739a693459f33b1fbcc02099eea3ebcf150cbe.png',
    },
    {
      address: '0xab592d197acc575d16c3346f4eb70c703f308d1e',
      chainId: 43114,
      decimals: 18,
      symbol: 'FEED',
      name: 'chikn feed',
      logoURI: 'https://tokens.1inch.io/0xab592d197acc575d16c3346f4eb70c703f308d1e.png',
    },
    {
      address: '0xbf1230bb63bfd7f5d628ab7b543bcefa8a24b81b',
      chainId: 43114,
      decimals: 18,
      symbol: 'CHRO',
      name: 'Chronicum',
      logoURI: 'https://tokens.1inch.io/0xbf1230bb63bfd7f5d628ab7b543bcefa8a24b81b.png',
    },
    {
      address: '0xfc6da929c031162841370af240dec19099861d3b',
      chainId: 43114,
      decimals: 18,
      symbol: 'DOMI',
      name: 'Domi',
      logoURI: 'https://tokens.1inch.io/0xfc6da929c031162841370af240dec19099861d3b.png',
    },
    {
      address: '0xf14f4ce569cb3679e99d5059909e23b07bd2f387',
      chainId: 43114,
      decimals: 18,
      symbol: 'NXUSD',
      name: 'NXUSD',
      logoURI: 'https://tokens.1inch.io/0xf14f4ce569cb3679e99d5059909e23b07bd2f387.png',
    },
    {
      address: '0xed2b42d3c9c6e97e11755bb37df29b6375ede3eb',
      chainId: 43114,
      decimals: 18,
      symbol: 'HON',
      name: 'HonToken',
      logoURI: 'https://tokens.1inch.io/0xed2b42d3c9c6e97e11755bb37df29b6375ede3eb.png',
    },
    {
      address: '0xc17c30e98541188614df99239cabd40280810ca3',
      chainId: 43114,
      decimals: 18,
      symbol: 'RISE',
      name: 'EverRise',
      logoURI: 'https://tokens.1inch.io/0xc17c30e98541188614df99239cabd40280810ca3.png',
    },
  ],
}
