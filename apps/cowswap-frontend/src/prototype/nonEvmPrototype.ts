import { TokenWithLogo } from '@cowprotocol/common-const'
import type { ChainInfo } from '@cowprotocol/cow-sdk'
import { RAW_PROVIDERS_FILES_PATH } from '@cowprotocol/sdk-bridging'
import type { BridgeProviderInfo, BridgeQuoteResults, QuoteBridgeRequest } from '@cowprotocol/sdk-bridging'
import type { QuoteAndPost } from '@cowprotocol/sdk-trading'

import BITCOIN_LOGO_URL from 'assets/chains/bitcoin.svg?url'
import SOLANA_LOGO_URL from 'assets/chains/solana.svg?url'

import {
  BITCOIN_CHAIN_ID,
  NON_EVM_FLIP_DISABLED_REASON,
  NON_EVM_SELL_DISABLED_REASON,
  SOLANA_CHAIN_ID,
  getNonEvmChainLabel,
  getChainType,
  isBuyOnlyChainId,
  isNonEvmChainId,
} from 'common/chains/nonEvm'
import { BITCOIN_BTC_ASSET_ID, SOLANA_SOL_ASSET_ID, getNonEvmAllowlist } from 'common/chains/nonEvmTokenAllowlist'
import { getAssetIdForSyntheticAddress, getSyntheticAddress } from 'common/tokens/nonEvmSyntheticAddress'

export const NON_EVM_PROTOTYPE_ENV_FLAG = 'REACT_APP_NON_EVM_PROTOTYPE'

export const PROTOTYPE_BRIDGE_PROVIDER_INFO: BridgeProviderInfo = {
  type: 'ReceiverAccountBridgeProvider',
  name: 'Prototype Bridge',
  logoUrl: `${RAW_PROVIDERS_FILES_PATH}/near-intents/near-intents-logo.png`,
  dappId: 'prototype-non-evm',
  website: 'https://cow.fi',
}

export const ASSET_ID_TAG_PREFIX = 'assetId:'
export const BLOCKCHAIN_TAG_PREFIX = 'blockchain:'
export const SOLANA_MINT_TAG_PREFIX = 'solanaMint:'

const PROTOTYPE_SWAP_RATE_BPS = 9_800
const PROTOTYPE_BRIDGE_FEE_BPS = 30
const PROTOTYPE_BRIDGE_SLIPPAGE_BPS = 9_900

const PROTOTYPE_NETWORK_LOGOS = {
  bitcoin: BITCOIN_LOGO_URL,
  solana: SOLANA_LOGO_URL,
}

const BITCOIN_NATIVE_ADDRESS = getSyntheticAddress(BITCOIN_CHAIN_ID, BITCOIN_BTC_ASSET_ID)
const SOLANA_NATIVE_ADDRESS = getSyntheticAddress(SOLANA_CHAIN_ID, SOLANA_SOL_ASSET_ID)

const PROTOTYPE_CHAIN_INFO: ChainInfo[] = [
  {
    id: BITCOIN_CHAIN_ID,
    label: 'Bitcoin',
    eip155Label: 'Bitcoin',
    addressPrefix: 'btc',
    contracts: {},
    docs: { name: 'Bitcoin Docs', url: 'https://bitcoin.org/en/developer-documentation' },
    isTestnet: false,
    rpcUrls: { default: { http: [] } },
    website: { name: 'Bitcoin', url: 'https://bitcoin.org' },
    nativeCurrency: {
      chainId: BITCOIN_CHAIN_ID,
      address: BITCOIN_NATIVE_ADDRESS,
      name: 'Bitcoin',
      symbol: 'BTC',
      decimals: 8,
    },
    blockExplorer: { name: 'mempool.space', url: 'https://mempool.space' },
    logo: { light: PROTOTYPE_NETWORK_LOGOS.bitcoin, dark: PROTOTYPE_NETWORK_LOGOS.bitcoin },
    color: '#f7931a',
  },
  {
    id: SOLANA_CHAIN_ID,
    label: 'Solana',
    eip155Label: 'Solana',
    addressPrefix: 'sol',
    contracts: {},
    docs: { name: 'Solana Docs', url: 'https://docs.solana.com' },
    isTestnet: false,
    rpcUrls: { default: { http: [] } },
    website: { name: 'Solana', url: 'https://solana.com' },
    nativeCurrency: {
      chainId: SOLANA_CHAIN_ID,
      address: SOLANA_NATIVE_ADDRESS,
      name: 'Solana',
      symbol: 'SOL',
      decimals: 9,
    },
    blockExplorer: { name: 'Solscan', url: 'https://solscan.io' },
    logo: { light: PROTOTYPE_NETWORK_LOGOS.solana, dark: PROTOTYPE_NETWORK_LOGOS.solana },
    color: '#14f195',
  },
]

const prototypeTokensByChainId = new Map<number, TokenWithLogo[]>()
const prototypeTokenByAddressKey = new Map<string, TokenWithLogo>()

function makeAddressKey(chainId: number, address: string): string {
  return `${chainId}:${address}`.toLowerCase()
}

function registerPrototypeToken(token: TokenWithLogo): TokenWithLogo {
  prototypeTokenByAddressKey.set(makeAddressKey(token.chainId, token.address), token)

  const existing = prototypeTokensByChainId.get(token.chainId) ?? []
  prototypeTokensByChainId.set(token.chainId, [...existing, token])

  return token
}

function getAssetIdTag(assetId: string): string {
  return `${ASSET_ID_TAG_PREFIX}${assetId}`
}

function getSolanaMintTag(mint: string): string {
  return `${SOLANA_MINT_TAG_PREFIX}${mint}`
}

function getBlockchainTag(chainId: number): string {
  const chainType = getChainType(chainId)

  if (chainType === 'bitcoin') return `${BLOCKCHAIN_TAG_PREFIX}btc`
  if (chainType === 'solana') return `${BLOCKCHAIN_TAG_PREFIX}sol`

  return `${BLOCKCHAIN_TAG_PREFIX}evm`
}

function normalizeLogoUrl(logoUrl: string | undefined): string | undefined {
  if (!logoUrl) return undefined
  if (logoUrl.startsWith('data:')) return logoUrl
  if (logoUrl.includes('://')) return logoUrl

  if (typeof window !== 'undefined' && window.location?.origin) {
    return new URL(logoUrl, window.location.origin).toString()
  }

  return logoUrl
}

function buildPrototypeTokens(): void {
  if (prototypeTokensByChainId.size > 0) return

  for (const chainInfo of PROTOTYPE_CHAIN_INFO) {
    const allowlist = getNonEvmAllowlist(chainInfo.id)
    if (!allowlist) continue

    for (const tokenDef of allowlist.tokens) {
      const syntheticAddress = getSyntheticAddress(chainInfo.id, tokenDef.assetId)
      const tags = [getAssetIdTag(tokenDef.assetId), getBlockchainTag(chainInfo.id)]

      if (tokenDef.solanaMint && getChainType(chainInfo.id) === 'solana') {
        tags.push(getSolanaMintTag(tokenDef.solanaMint))
      }

      const token = TokenWithLogo.fromToken(
        {
          chainId: chainInfo.id,
          address: syntheticAddress,
          decimals: tokenDef.decimals,
          symbol: tokenDef.symbol,
          name: tokenDef.name,
          tags,
        },
        normalizeLogoUrl(tokenDef.logoUrl),
      )

      registerPrototypeToken(token)
    }
  }
}

function applyBps(amount: bigint, bps: number): bigint {
  return (amount * BigInt(bps)) / 10_000n
}

function nowInSeconds(): number {
  return Math.floor(Date.now() / 1_000)
}

export function isNonEvmPrototypeEnabled(): boolean {
  const value = process.env[NON_EVM_PROTOTYPE_ENV_FLAG]

  // Prototype is enabled by default for now; allow explicit opt-out via env.
  if (value == null) return true

  return value === '1' || value === 'true'
}

export function getPrototypeNonEvmNetworks(): ChainInfo[] {
  return PROTOTYPE_CHAIN_INFO
}

export function getPrototypeNonEvmTokens(chainId: number | undefined | null): TokenWithLogo[] | undefined {
  if (!chainId || !isNonEvmChainId(chainId)) return undefined

  buildPrototypeTokens()

  return prototypeTokensByChainId.get(chainId)
}

export function findPrototypeToken(chainId: number, address: string | undefined | null): TokenWithLogo | undefined {
  if (!address) return undefined

  buildPrototypeTokens()

  return prototypeTokenByAddressKey.get(makeAddressKey(chainId, address))
}

export function getAssetIdFromTokenTags(tags: string[] | undefined | null): string | undefined {
  if (!tags) return undefined

  const assetTag = tags.find((tag) => tag.startsWith(ASSET_ID_TAG_PREFIX))

  return assetTag?.slice(ASSET_ID_TAG_PREFIX.length)
}

export function getSolanaMintFromTokenTags(tags: string[] | undefined | null): string | undefined {
  if (!tags) return undefined

  const mintTag = tags.find((tag) => tag.startsWith(SOLANA_MINT_TAG_PREFIX))

  return mintTag?.slice(SOLANA_MINT_TAG_PREFIX.length)
}

export function getPrototypeAssetIdForAddress(chainId: number, address: string | undefined | null): string | undefined {
  const token = findPrototypeToken(chainId, address)
  if (token) {
    return getAssetIdFromTokenTags(token.tags)
  }

  return getAssetIdForSyntheticAddress(chainId, address)
}

export function isPrototypeNonEvmDestination(chainId: number | undefined | null): boolean {
  return isNonEvmPrototypeEnabled() && typeof chainId === 'number' && isNonEvmChainId(chainId)
}

export function getPrototypeSellDisabledReason(chainId: number): string | undefined {
  if (!isBuyOnlyChainId(chainId)) return undefined

  const label = getNonEvmChainLabel(chainId)
  return label ? `Swap from ${label} not supported.` : NON_EVM_SELL_DISABLED_REASON
}

export function getPrototypeFlipDisabledReason(chainId: number | undefined | null): string | undefined {
  return isPrototypeNonEvmDestination(chainId) ? NON_EVM_FLIP_DISABLED_REASON : undefined
}

export function buildPrototypeQuotes(quoteParams: QuoteBridgeRequest): {
  quote: QuoteAndPost
  bridgeQuote: BridgeQuoteResults
} {
  const sellAmount = BigInt(quoteParams.amount)
  const validFor = quoteParams.validFor ?? 1_800
  const validTo = nowInSeconds() + validFor
  const expiration = validTo * 1_000

  // Treat the swap step as converting sell token to an intermediate token on the sell chain.
  const swapBuyAmount = applyBps(sellAmount, PROTOTYPE_SWAP_RATE_BPS)
  const feeAmount = sellAmount - swapBuyAmount

  const bridgeFeeAmount = applyBps(swapBuyAmount, PROTOTYPE_BRIDGE_FEE_BPS)
  const bridgeBeforeFeeBuyAmount = swapBuyAmount
  const bridgeAfterFeeBuyAmount = bridgeBeforeFeeBuyAmount - bridgeFeeAmount
  const bridgeAfterSlippageBuyAmount = applyBps(bridgeAfterFeeBuyAmount, PROTOTYPE_BRIDGE_SLIPPAGE_BPS)

  const quote: QuoteAndPost = {
    quoteResults: {
      quoteResponse: {
        quote: {
          sellToken: quoteParams.sellTokenAddress,
          buyToken: quoteParams.sellTokenAddress,
          kind: quoteParams.kind,
          sellAmount: sellAmount.toString(),
          buyAmount: swapBuyAmount.toString(),
          feeAmount: feeAmount.toString(),
          validTo,
        },
        // The quote expiration is expected to be a millisecond timestamp or ISO date.
        expiration,
      },
      tradeParameters: {
        validFor,
      },
      amountsAndCosts: {
        afterPartnerFees: {
          sellAmount,
          buyAmount: swapBuyAmount,
        },
        afterSlippage: {
          sellAmount,
          buyAmount: swapBuyAmount,
        },
      },
    } as unknown as QuoteAndPost['quoteResults'],
    postSwapOrderFromQuote: async () => {
      throw new Error('Non-EVM prototype mode: execution is disabled')
    },
  }

  const bridgeQuote: BridgeQuoteResults = {
    providerInfo: PROTOTYPE_BRIDGE_PROVIDER_INFO,
    expectedFillTimeSeconds: 600,
    bridgeReceiverOverride: quoteParams.receiver ?? null,
    tradeParameters: {
      sellTokenAddress: quoteParams.sellTokenAddress,
      sellTokenChainId: quoteParams.sellTokenChainId,
      buyTokenAddress: quoteParams.buyTokenAddress,
      buyTokenChainId: quoteParams.buyTokenChainId,
      receiver: quoteParams.receiver,
      validFor,
    },
    amountsAndCosts: {
      beforeFee: {
        sellAmount: swapBuyAmount,
        buyAmount: bridgeBeforeFeeBuyAmount,
      },
      costs: {
        bridgingFee: {
          amountInSellCurrency: bridgeFeeAmount,
          amountInBuyCurrency: bridgeFeeAmount,
        },
      },
      afterSlippage: {
        sellAmount: swapBuyAmount,
        buyAmount: bridgeAfterSlippageBuyAmount,
      },
    },
  } as BridgeQuoteResults

  return { quote, bridgeQuote }
}
