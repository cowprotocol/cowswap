import { CowSwapWidgetPalette, CowSwapWidgetPaletteColors, CowSwapWidgetParams } from '@cowprotocol/widget-lib'

import { CONFIGURATOR_WIDGET_PREVIEW_APP_CODE_FALLBACK } from '../../../configurator.constants'
import { ColorPalette } from '../../../configurator.types'
import { WIDGET_CONFIGURATOR_DEFAULT_BASE_URL, WIDGET_SNIPPET_APP_CODE_PLACEHOLDER } from '../snippet.const'

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isEmptyPlainObject(value: unknown): boolean {
  return isPlainObject(value) && Object.keys(value).length === 0
}

function isPrunableLeaf(value: unknown): boolean {
  return (
    value === undefined ||
    value === null ||
    value === false ||
    value === '' ||
    (typeof value === 'number' && Number.isNaN(value)) ||
    typeof value === 'function'
  )
}

function shouldKeepPrunedChild(item: unknown): boolean {
  return item !== undefined && item !== null && item !== false && item !== '' && !isEmptyPlainObject(item)
}

function pruneArray(value: unknown[]): unknown {
  const items = value.map((item) => pruneNilEmptyAndNested(item)).filter(shouldKeepPrunedChild)

  return items.length === 0 ? undefined : items
}

function pruneRecord(value: Record<string, unknown>): unknown {
  const next: Record<string, unknown> = {}

  for (const [key, val] of Object.entries(value)) {
    const pruned = pruneNilEmptyAndNested(val)

    if (!shouldKeepPrunedChild(pruned)) {
      continue
    }

    next[key] = pruned
  }

  return Object.keys(next).length === 0 ? undefined : next
}

/** Drops unset/empty values so snippet JSON omits noise. Omits `false`; keeps numeric zero and `true`. */
function pruneNilEmptyAndNested(value: unknown): unknown {
  if (isPrunableLeaf(value)) {
    return undefined
  }

  if (Array.isArray(value)) {
    return pruneArray(value)
  }

  if (isPlainObject(value)) {
    return pruneRecord(value)
  }

  return value
}

/**
 * Params shaped for embed snippet output: theme diff, placeholder appCode when unset/preview-default,
 * default baseUrl omitted, and nil/empty/false nested values stripped.
 */
export function sanitizeParameters(params: CowSwapWidgetParams, defaultPalette: ColorPalette): CowSwapWidgetParams {
  const sanitized: CowSwapWidgetParams = {
    ...params,
    theme: sanitizePalette(params, defaultPalette),
  }

  const appCodeTrimmed = params.appCode?.trim()

  if (!appCodeTrimmed || appCodeTrimmed === CONFIGURATOR_WIDGET_PREVIEW_APP_CODE_FALLBACK) {
    sanitized.appCode = WIDGET_SNIPPET_APP_CODE_PLACEHOLDER
  }

  if (!params.baseUrl || params.baseUrl === WIDGET_CONFIGURATOR_DEFAULT_BASE_URL) {
    delete sanitized.baseUrl
  }

  return pruneNilEmptyAndNested(sanitized) as CowSwapWidgetParams
}

// Keep only changed values
function sanitizePalette(params: CowSwapWidgetParams, defaultPalette: ColorPalette): CowSwapWidgetParams['theme'] {
  if (typeof params.theme === 'string' || !params.theme) return params.theme

  const palette = params.theme

  const paletteDiff = Object.keys(palette).reduce((acc, key: string) => {
    const colorKey = key as CowSwapWidgetPaletteColors

    if (defaultPalette[colorKey] !== palette[colorKey]) {
      acc[colorKey] = palette[colorKey]
    }

    return acc
  }, {} as CowSwapWidgetPalette)

  if (Object.keys(paletteDiff).length === 1 && paletteDiff.baseTheme) return paletteDiff.baseTheme

  return paletteDiff
}
