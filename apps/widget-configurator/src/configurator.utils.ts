import { DEFAULT_PARTNER_FEE_RECIPIENT_PER_NETWORK } from '@cowprotocol/common-const'
import { isRecord } from '@cowprotocol/common-utils'
import { isSolanaChain, SupportedChainId } from '@cowprotocol/cow-sdk'
import { isSolanaEnabledForWidget, TradeType } from '@cowprotocol/widget-lib'
import type { CowSwapWidgetParams } from '@cowprotocol/widget-lib'

import { PaletteMode } from '@mui/material'

import { DEFAULT_CONFIGURATOR_FORM_VALUES, DEFAULT_DARK_PALETTE, DEFAULT_LIGHT_PALETTE } from './configurator.constants'
import { ColorPalette, ConfiguratorFormValues, ConfiguratorState } from './configurator.types'
import { parseJsonOrFallback } from './utils/json-field-parsing/jsonFieldParsing'
import { normalizeWidgetSdkVersion } from './utils/widget-sdk-versions/widget-sdk-versions.utils'

import type * as CSS from 'csstype'

export interface BuildConfiguratorStateParams {
  formValues: ConfiguratorFormValues
  effectiveChainId: SupportedChainId
  colorPalette: ColorPalette
  defaultPalette: ColorPalette
  disableToastMessages: boolean
}

/**
 * Derives the resolved {@link ConfiguratorState} from the persisted form values.
 * JSON style fields are parsed here on demand instead of being kept as derived state.
 */
/**
 * Trade types the widget cannot offer on Solana.
 *
 * TWAP ("advanced") is blocked outright — `isTwapSupportedChain` is false there, and the widget
 * renders the tab disabled. Yield has no Solana LP tokens behind it, so the tab opens on an empty
 * list rather than failing.
 */
const TRADE_TYPES_UNAVAILABLE_ON_SOLANA: readonly TradeType[] = [TradeType.ADVANCED, TradeType.YIELD]

export function buildConfiguratorState({
  formValues,
  effectiveChainId,
  colorPalette,
  defaultPalette,
  disableToastMessages,
}: BuildConfiguratorStateParams): ConfiguratorState {
  if (effectiveChainId === undefined) {
    throw new Error('buildConfiguratorState requires effectiveChainId')
  }

  const { locale, chainId: _, rootStyleJson, bodyWrapperStyleJson, cardStyleJson, rawParamsJson, ...rest } = formValues

  return {
    ...rest,
    locale: locale || undefined,
    chainId: effectiveChainId,
    customColors: colorPalette,
    defaultColors: defaultPalette,
    rootStyle: parseJsonOrFallback<CSS.Properties>(rootStyleJson, {}),
    bodyWrapperStyle: parseJsonOrFallback<CSS.Properties>(bodyWrapperStyleJson, {}),
    cardStyle: parseJsonOrFallback<CSS.Properties>(cardStyleJson, {}),
    disableToastMessages,
    partnerFeeRecipient: DEFAULT_PARTNER_FEE_RECIPIENT_PER_NETWORK[effectiveChainId],
    rawParams: parseJsonOrFallback<Partial<CowSwapWidgetParams>>(rawParamsJson, {}),
  }
}

export function getDefaultCustomColorsByTheme(): Record<PaletteMode, ColorPalette> {
  return {
    light: { ...DEFAULT_LIGHT_PALETTE },
    dark: { ...DEFAULT_DARK_PALETTE },
  }
}

export function getSolanaBlockedReason({ widgetMode }: ConfiguratorFormValues): string | undefined {
  if (widgetMode !== 'standalone') {
    return 'Solana needs standalone mode: a dapp-provided EIP-1193 provider cannot sign Solana transactions.'
  }

  return undefined
}

export function getSolanaFeeNotice({ enableSolana, partnerFeeBps }: ConfiguratorFormValues): string | undefined {
  if (!enableSolana || partnerFeeBps <= 0) return undefined

  return 'Partner fees are not charged on Solana yet, so Solana trades earn no fee.'
}

export function isSolanaSelectable({ enableSolana, widgetMode }: ConfiguratorFormValues): boolean {
  return isSolanaEnabledForWidget({ enableSolana, standaloneMode: widgetMode === 'standalone' })
}

export function isTradeTypeAvailableOnChain(tradeType: TradeType, chainId: SupportedChainId): boolean {
  return !isSolanaChain(chainId) || !TRADE_TYPES_UNAVAILABLE_ON_SOLANA.includes(tradeType)
}

export function resolveConfiguratorCustomColorsByTheme(persistedValue: unknown): Record<PaletteMode, ColorPalette> {
  const defaults = getDefaultCustomColorsByTheme()
  const parsed = parseCustomColorsByTheme(persistedValue)

  if (!parsed) {
    return defaults
  }

  return {
    light: { ...defaults.light, ...parsed.light },
    dark: { ...defaults.dark, ...parsed.dark },
  }
}

export function resolveConfiguratorFormValues(persistedValue: unknown): ConfiguratorFormValues {
  if (!isRecord(persistedValue)) {
    return DEFAULT_CONFIGURATOR_FORM_VALUES
  }

  const merged = { ...DEFAULT_CONFIGURATOR_FORM_VALUES, ...persistedValue }

  return {
    ...merged,
    sdkVersion: normalizeWidgetSdkVersion(merged.sdkVersion),
  }
}

function parseColorPalette(value: unknown): ColorPalette | null {
  if (!isRecord(value)) return null

  const keys = Object.keys(DEFAULT_LIGHT_PALETTE) as (keyof ColorPalette)[]
  const palette = {} as ColorPalette

  for (const key of keys) {
    const color = value[key]
    if (typeof color !== 'string') return null
    palette[key] = color
  }

  return palette
}

function parseCustomColorsByTheme(value: unknown): Record<PaletteMode, ColorPalette> | null {
  if (!isRecord(value)) return null

  const light = parseColorPalette(value.light)
  const dark = parseColorPalette(value.dark)

  if (!light || !dark) return null

  return { light, dark }
}
