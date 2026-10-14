import { isAddress } from 'viem'

import { isSupportedChain } from '@cowprotocol/cow-sdk'

import type { RwaAsset, RwaRegistry, RwaToken, RwaTradingTime } from './types'

const TRADING_TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d UTC$/

/** Must match `ALLOWED_ISSUERS` in `scripts/updateRegistry.mjs`, which skips the tokens of other issuers */
const ALLOWED_ISSUERS: readonly string[] = ['Ondo', 'xStocks']

export function validateRegistry(registry: RwaRegistry): string[] {
  const errors: string[] = []
  const tickers = new Set<string>()
  const coingeckoIds = new Set<string>()

  if (Number.isNaN(Date.parse(registry.lastModificationTime))) errors.push('lastModificationTime: invalid date')

  registry.assets.forEach((asset, index) => {
    if (tickers.has(asset.ticker)) errors.push(`assets[${index}].ticker: duplicate "${asset.ticker}"`)
    if (asset.coingeckoId && coingeckoIds.has(asset.coingeckoId)) {
      errors.push(`assets[${index}].coingeckoId: duplicate "${asset.coingeckoId}"`)
    }
    tickers.add(asset.ticker)
    coingeckoIds.add(asset.coingeckoId)

    errors.push(...validateAsset(asset, `assets[${index}]`))
  })

  return errors
}

function isHttpsUrl(value: string): boolean {
  return URL.canParse(value) && new URL(value).protocol === 'https:'
}

function isValidTradingTime(tradingTime: RwaTradingTime | undefined): boolean {
  return !tradingTime || (TRADING_TIME_REGEX.test(tradingTime.start) && TRADING_TIME_REGEX.test(tradingTime.end))
}

function validateAsset(asset: RwaAsset, path: string): string[] {
  const errors: string[] = []

  if (!/^[A-Z0-9.]+$/.test(asset.ticker)) errors.push(`${path}.ticker: must be uppercase, got "${asset.ticker}"`)

  errors.push(...validateRequiredStrings(asset, path))

  if (asset.type !== 'stock' && asset.type !== 'index') errors.push(`${path}.type: must be "stock" or "index"`)
  if (!Number.isInteger(asset.priority) || asset.priority < 0 || asset.priority > 10) {
    errors.push(`${path}.priority: must be an integer from 0 to 10`)
  }

  if (!isValidTradingTime(asset.allowedTradingTime)) {
    errors.push(`${path}.allowedTradingTime: start/end must be "HH:mm UTC"`)
  }

  if (!asset.tokens.length) errors.push(`${path}.tokens: at least one token is required`)

  asset.tokens.forEach((token, index) => errors.push(...validateToken(token, `${path}.tokens[${index}]`)))

  return errors
}

function validateRequiredStrings(asset: RwaAsset, path: string): string[] {
  const errors: string[] = []

  if (!asset.title) errors.push(`${path}.title: required`)
  if (!asset.coingeckoId) errors.push(`${path}.coingeckoId: required`)
  if (asset.logoUrl !== undefined && !isHttpsUrl(asset.logoUrl)) errors.push(`${path}.logoUrl: must be an https URL`)

  return errors
}

function validateToken(token: RwaToken, path: string): string[] {
  const errors: string[] = []

  if (!isSupportedChain(token.chainId)) errors.push(`${path}.chainId: unsupported chain ${token.chainId}`)
  if (!isAddress(token.address)) errors.push(`${path}.address: invalid address ${token.address}`)
  if (!token.symbol) errors.push(`${path}.symbol: required`)
  if (!token.name) errors.push(`${path}.name: required`)
  if (!token.issuer) {
    errors.push(`${path}.issuer: required`)
  } else if (!ALLOWED_ISSUERS.includes(token.issuer)) {
    errors.push(`${path}.issuer: "${token.issuer}" is not an allowed issuer (${ALLOWED_ISSUERS.join(', ')})`)
  }
  if (!Number.isInteger(token.decimals) || token.decimals < 0) errors.push(`${path}.decimals: invalid`)

  return errors
}
