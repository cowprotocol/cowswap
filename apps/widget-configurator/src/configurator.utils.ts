import { DEFAULT_PARTNER_FEE_RECIPIENT_PER_NETWORK } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import type { CowSwapWidgetParams } from '@cowprotocol/widget-lib'

import { PaletteMode } from '@mui/material'

import { DEFAULT_CONFIGURATOR_FORM_VALUES, DEFAULT_DARK_PALETTE, DEFAULT_LIGHT_PALETTE } from './configurator.constants'
import { ColorPalette, ConfiguratorFormValues, ConfiguratorState } from './configurator.types'
import { parseJsonOrFallback } from './utils/json-field-parsing/jsonFieldParsing'
import { normalizeWidgetSdkVersion } from './utils/widget-sdk-versions/widget-sdk-versions.utils'

import type * as CSS from 'csstype'

export function getDefaultCustomColorsByTheme(): Record<PaletteMode, ColorPalette> {
  return {
    light: { ...DEFAULT_LIGHT_PALETTE },
    dark: { ...DEFAULT_DARK_PALETTE },
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
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

export interface BuildConfiguratorStateParams {
  formValues: ConfiguratorFormValues
  effectiveChainId: SupportedChainId | undefined
  colorPalette: ColorPalette
  defaultPalette: ColorPalette
  disableToastMessages: boolean
}

/**
 * Derives the resolved {@link ConfiguratorState} from the persisted form values.
 * JSON style fields are parsed here on demand instead of being kept as derived state.
 */
export function buildConfiguratorState({
  formValues,
  effectiveChainId,
  colorPalette,
  defaultPalette,
  disableToastMessages,
}: BuildConfiguratorStateParams): ConfiguratorState {
  const { locale, chainId, iframeStyleJson, bodyWrapperStyleJson, cardStyleJson, rawParamsJson, ...rest } = formValues

  return {
    ...rest,
    locale: locale || undefined,
    chainId: effectiveChainId,
    customColors: colorPalette,
    defaultColors: defaultPalette,
    iframeStyle: parseJsonOrFallback<CSS.Properties>(iframeStyleJson, {}),
    bodyWrapperStyle: parseJsonOrFallback<CSS.Properties>(bodyWrapperStyleJson, {}),
    cardStyle: parseJsonOrFallback<CSS.Properties>(cardStyleJson, {}),
    disableToastMessages,
    partnerFeeRecipient: DEFAULT_PARTNER_FEE_RECIPIENT_PER_NETWORK[chainId],
    rawParams: parseJsonOrFallback<Partial<CowSwapWidgetParams>>(rawParamsJson, {}),
  }
}
