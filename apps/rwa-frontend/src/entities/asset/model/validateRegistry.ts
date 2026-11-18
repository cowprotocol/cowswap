import { isAddress } from 'viem'

import { isSupportedChain } from '@cowprotocol/cow-sdk'

import { findRwaDescriptionIssue } from './description'
import { RWA_SECTOR_SEPARATOR, RWA_SECTORS } from './sectors'
import {
  RWA_ASSET_TYPES,
  type RwaAsset,
  type RwaAssetProfile,
  type RwaRegistry,
  type RwaToken,
  type RwaTradingTime,
} from './types'

import { isValidTimeZone } from '../lib/usMarketStatus'

const TRADING_TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/

const ASSET_TYPES: readonly string[] = RWA_ASSET_TYPES
const SECTORS: readonly string[] = RWA_SECTORS

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

function isValidSector(sector: string): boolean {
  const separatorIndex = sector.indexOf(RWA_SECTOR_SEPARATOR)
  if (separatorIndex === -1) return false

  const industry = sector.slice(separatorIndex + RWA_SECTOR_SEPARATOR.length).trim()

  return SECTORS.includes(sector.slice(0, separatorIndex)) && industry.length > 0
}

function isValidTradingTime(tradingTime: RwaTradingTime | undefined): boolean {
  return (
    !tradingTime ||
    (TRADING_TIME_REGEX.test(tradingTime.start) &&
      TRADING_TIME_REGEX.test(tradingTime.end) &&
      isValidTimeZone(tradingTime.timeZone))
  )
}

function validateAsset(asset: RwaAsset, path: string): string[] {
  const errors: string[] = []

  if (!/^[A-Z0-9.]+$/.test(asset.ticker)) errors.push(`${path}.ticker: must be uppercase, got "${asset.ticker}"`)

  errors.push(...validateRequiredStrings(asset, path))

  if (!ASSET_TYPES.includes(asset.type)) errors.push(`${path}.type: must be one of ${ASSET_TYPES.join(', ')}`)
  if (!Number.isInteger(asset.priority) || asset.priority < 0 || asset.priority > 10) {
    errors.push(`${path}.priority: must be an integer from 0 to 10`)
  }

  if (!isValidTradingTime(asset.allowedTradingTime)) {
    errors.push(`${path}.allowedTradingTime: start/end must be "HH:mm" in a valid timeZone`)
  }

  if (!asset.tokens.length) errors.push(`${path}.tokens: at least one token is required`)

  asset.tokens.forEach((token, index) => errors.push(...validateToken(token, `${path}.tokens[${index}]`)))

  return errors
}

function validateProfile(profile: RwaAssetProfile, title: string, path: string): string[] {
  const errors: string[] = []

  const descriptionIssue = profile.description ? findRwaDescriptionIssue(profile.description, title) : 'required'
  if (descriptionIssue) errors.push(`${path}.description: ${descriptionIssue}`)
  if (!profile.sector) errors.push(`${path}.sector: required`)
  else if (!isValidSector(profile.sector)) {
    errors.push(`${path}.sector: must start with one of ${SECTORS.join(', ')} followed by "${RWA_SECTOR_SEPARATOR}"`)
  }
  if (profile.website !== undefined && !isHttpsUrl(profile.website)) {
    errors.push(`${path}.website: must be an https URL`)
  }

  return errors
}

function validateRequiredStrings(asset: RwaAsset, path: string): string[] {
  const errors: string[] = []

  if (!asset.title) errors.push(`${path}.title: required`)
  if (!asset.coingeckoId) errors.push(`${path}.coingeckoId: required`)
  if (asset.logoUrl !== undefined && !isHttpsUrl(asset.logoUrl)) errors.push(`${path}.logoUrl: must be an https URL`)
  if (asset.newsFeed) {
    if (!asset.newsFeed.source) errors.push(`${path}.newsFeed.source: required`)
    if (!isHttpsUrl(asset.newsFeed.url)) errors.push(`${path}.newsFeed.url: must be an https URL`)
  }
  if (asset.profile) errors.push(...validateProfile(asset.profile, asset.title, `${path}.profile`))

  return errors
}

function validateToken(token: RwaToken, path: string): string[] {
  const errors: string[] = []

  if (!isSupportedChain(token.chainId)) errors.push(`${path}.chainId: unsupported chain ${token.chainId}`)
  if (!isAddress(token.address)) errors.push(`${path}.address: invalid address ${token.address}`)
  if (!token.symbol) errors.push(`${path}.symbol: required`)
  if (!token.name) errors.push(`${path}.name: required`)
  if (!token.issuer) errors.push(`${path}.issuer: required`)
  if (!Number.isInteger(token.decimals) || token.decimals < 0) errors.push(`${path}.decimals: invalid`)

  return errors
}
