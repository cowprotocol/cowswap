import BITCOIN_LOGO_URL from 'assets/chains/bitcoin.svg?url'
import SOLANA_LOGO_URL from 'assets/chains/solana.svg?url'
import BOME_LOGO_URL from 'assets/tokens/solana/bome.png?url'
import LOUD_LOGO_URL from 'assets/tokens/solana/loud.png?url'
import MELANIA_LOGO_URL from 'assets/tokens/solana/melania.png?url'
import PUBLIC_LOGO_URL from 'assets/tokens/solana/public.png?url'
import SPX_LOGO_URL from 'assets/tokens/solana/spx.png?url'
import SUSDC_LOGO_URL from 'assets/tokens/solana/susdc.png?url'
import TRUMP_LOGO_URL from 'assets/tokens/solana/trump.png?url'
import TURBO_LOGO_URL from 'assets/tokens/solana/turbo.png?url'
import USDC_LOGO_URL from 'assets/tokens/solana/usdc.png?url'
import USDT_LOGO_URL from 'assets/tokens/solana/usdt.png?url'
import WIF_LOGO_URL from 'assets/tokens/solana/wif.png?url'
import XBTC_LOGO_URL from 'assets/tokens/solana/xbtc.png?url'
import ZEC_LOGO_URL from 'assets/tokens/solana/zec.png?url'

import { BITCOIN_CHAIN_ID, SOLANA_CHAIN_ID, getChainType } from './nonEvm'

export interface NonEvmTokenDefinition {
  assetId: string
  symbol: string
  name: string
  decimals: number
  solanaMint?: string
  logoUrl?: string
}

export interface NonEvmAllowlistConfig {
  chainId: number
  chainType: 'bitcoin' | 'solana'
  emptyStateMessage: string
  tokens: NonEvmTokenDefinition[]
}

export const BITCOIN_BTC_ASSET_ID = 'btc-native'
export const SOLANA_SOL_ASSET_ID = 'nep141:sol.omft.near'
export const SOLANA_USDC_ASSET_ID = 'nep141:sol-5ce3bf3a31af18be40ba30f721101b4341690186.omft.near'

const BITCOIN_BTC_LOGO = BITCOIN_LOGO_URL
const SOLANA_SOL_LOGO = SOLANA_LOGO_URL

const BITCOIN_ALLOWLIST: NonEvmAllowlistConfig = {
  chainId: BITCOIN_CHAIN_ID,
  chainType: 'bitcoin',
  emptyStateMessage: 'Only BTC supported on Bitcoin',
  tokens: [
    {
      assetId: BITCOIN_BTC_ASSET_ID,
      symbol: 'BTC',
      name: 'Bitcoin',
      decimals: 8,
      logoUrl: BITCOIN_BTC_LOGO,
    },
  ],
}

const SOLANA_ALLOWLIST: NonEvmAllowlistConfig = {
  chainId: SOLANA_CHAIN_ID,
  chainType: 'solana',
  emptyStateMessage: 'Solana tokens supported by NEAR Intents are available',
  tokens: [
    {
      assetId: SOLANA_SOL_ASSET_ID,
      symbol: 'SOL',
      name: 'Solana',
      decimals: 9,
      solanaMint: 'So11111111111111111111111111111111111111112',
      logoUrl: SOLANA_SOL_LOGO,
    },
    {
      assetId: 'nep141:sol-b9c68f94ec8fd160137af8cdfe5e61cd68e2afba.omft.near',
      symbol: '$WIF',
      name: '$WIF',
      decimals: 6,
      solanaMint: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
      logoUrl: WIF_LOGO_URL,
    },
    {
      assetId: 'nep141:sol-57d087fd8c460f612f8701f5499ad8b2eec5ab68.omft.near',
      symbol: 'BOME',
      name: 'BOME',
      decimals: 6,
      solanaMint: 'ukHH6c7mMyiWCf1b9pnWe25TSpkDDt3H5pQZgZ74J82',
      logoUrl: BOME_LOGO_URL,
    },
    {
      assetId: 'nep141:sol-bb27241c87aa401cc963c360c175dd7ca7035873.omft.near',
      symbol: 'LOUD',
      name: 'LOUD',
      decimals: 6,
      solanaMint: 'EJZJpNa4tDZ3kYdcRZgaAtaKm3fLJ5akmyPkCaKmfWvd',
      logoUrl: LOUD_LOGO_URL,
    },
    {
      assetId: 'nep141:sol-d600e625449a4d9380eaf5e3265e54c90d34e260.omft.near',
      symbol: 'MELANIA',
      name: 'MELANIA',
      decimals: 6,
      solanaMint: 'FUAfBo2jgks6gB4Z4LfZkqSZgzNucisEHqnNebaRxM1P',
      logoUrl: MELANIA_LOGO_URL,
    },
    {
      assetId: 'nep141:sol-1f00bb36e75cfc8e1274c1507cc3054f5b3f3ce1.omft.near',
      symbol: 'PUBLIC',
      name: 'PUBLIC',
      decimals: 9,
      logoUrl: PUBLIC_LOGO_URL,
    },
    {
      assetId: 'nep141:sol-c634d063ceff771aff0c972ec396fd915a6bbd0e.omft.near',
      symbol: 'SPX',
      name: 'SPX',
      decimals: 8,
      solanaMint: 'J3NKxxXZcnNiMjKw9hYb2K4LUxgwB6t1FtPtQVsv3KFr',
      logoUrl: SPX_LOGO_URL,
    },
    {
      assetId: 'nep141:sol-c58e6539c2f2e097c251f8edf11f9c03e581f8d4.omft.near',
      symbol: 'TRUMP',
      name: 'TRUMP',
      decimals: 6,
      solanaMint: '6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN',
      logoUrl: TRUMP_LOGO_URL,
    },
    {
      assetId: 'nep141:sol-df27d7abcc1c656d4ac3b1399bbfbba1994e6d8c.omft.near',
      symbol: 'TURBO',
      name: 'TURBO',
      decimals: 8,
      solanaMint: '2Dyzu65QA9zdX1UeE7Gx71k7fiwyUK6sZdrvJ7auq5wm',
      logoUrl: TURBO_LOGO_URL,
    },
    {
      assetId: SOLANA_USDC_ASSET_ID,
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      solanaMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      logoUrl: USDC_LOGO_URL,
    },
    {
      assetId: 'nep141:sol-c800a4bd850783ccb82c2b2c7e84175443606352.omft.near',
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
      solanaMint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
      logoUrl: USDT_LOGO_URL,
    },
    {
      assetId: '1cs_v1:sol:spl:A7bdiYdS5GjqGFtxf17ppRHtDKPkkRqbKtR27dxvQXaS',
      symbol: 'ZEC',
      name: 'ZEC',
      decimals: 8,
      solanaMint: 'A7bdiYdS5GjqGFtxf17ppRHtDKPkkRqbKtR27dxvQXaS',
      logoUrl: ZEC_LOGO_URL,
    },
    {
      assetId: 'nep141:sol-2dc7b64e5dd3c717fc85abaf51cdcd4b18687f09.omft.near',
      symbol: 'sUSDC',
      name: 'sUSDC',
      decimals: 6,
      solanaMint: '2PoF4iP6H5CNHE6eYqedrXmtbeRroh3SuQdiDgVumqm9',
      logoUrl: SUSDC_LOGO_URL,
    },
    {
      assetId: 'nep141:sol-91914f13d3b54f8126a2824d71632d4b078d7403.omft.near',
      symbol: 'xBTC',
      name: 'xBTC',
      decimals: 8,
      solanaMint: 'CtzPWv73Sn1dMGVU3ZtLv9yWSyUAanBni19YWDaznnkn',
      logoUrl: XBTC_LOGO_URL,
    },
  ],
}

export const NON_EVM_ALLOWLIST_BY_CHAIN_ID: Record<number, NonEvmAllowlistConfig> = {
  [BITCOIN_CHAIN_ID]: BITCOIN_ALLOWLIST,
  [SOLANA_CHAIN_ID]: SOLANA_ALLOWLIST,
}

export function getNonEvmAllowlist(chainId: number | undefined | null): NonEvmAllowlistConfig | undefined {
  if (typeof chainId !== 'number') return undefined

  return NON_EVM_ALLOWLIST_BY_CHAIN_ID[chainId]
}

export function getNonEvmEmptyStateMessage(chainId: number | undefined | null): string | undefined {
  const config = getNonEvmAllowlist(chainId)

  return config?.emptyStateMessage
}

export function isAllowlistedNonEvmAsset(chainId: number, assetId: string): boolean {
  const config = getNonEvmAllowlist(chainId)
  if (!config) return false

  return config.tokens.some((token) => token.assetId === assetId)
}

export function getNonEvmChainTypeForAllowlist(chainId: number): 'bitcoin' | 'solana' | undefined {
  const chainType = getChainType(chainId)

  return chainType === 'bitcoin' || chainType === 'solana' ? chainType : undefined
}
