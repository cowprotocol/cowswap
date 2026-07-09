import { isAddress } from '@cowprotocol/common-utils'
import {
  CowSwapWidgetPalette,
  CowSwapWidgetPaletteColors,
  CowSwapWidgetParams,
  TradeType,
} from '@cowprotocol/widget-lib'

import {
  WIDGET_CONFIGURATOR_DEFAULT_BASE_URL,
  WIDGET_SNIPPET_APP_CODE_PLACEHOLDER,
} from './common/codeExample.constants'

import {
  CONFIGURATOR_WIDGET_PREVIEW_APP_CODE_FALLBACK,
  DEFAULT_ADVANCED_DEADLINE_MINUTES,
  DEFAULT_LIMIT_DEADLINE_MINUTES,
  DEFAULT_SWAP_DEADLINE_MINUTES,
  sanitizeConfiguratorAppCode,
} from '../../../configurator.constants'
import { ColorPalette } from '../../../configurator.types'

/** Widget API defaults; snippet output omits top-level params whose value matches. */
const DEFAULT_PARAM_VALUES = {
  standaloneMode: true,
} as const satisfies Partial<Record<keyof CowSwapWidgetParams, unknown>>

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNoiseValue(value: unknown): boolean {
  return (
    value === undefined ||
    value === null ||
    value === false ||
    value === '' ||
    (typeof value === 'number' && Number.isNaN(value)) ||
    typeof value === 'function' ||
    (isPlainObject(value) && Object.keys(value).length === 0)
  )
}

/** Prunes empty/false leaves inside nested param values (sell, rootStyle, disableTrade, …). */
function pruneNestedValue(value: unknown): unknown {
  if (isNoiseValue(value)) {
    return undefined
  }

  if (Array.isArray(value)) {
    const items = value.map(pruneNestedValue).filter((item) => item !== undefined)

    return items.length === 0 ? undefined : items
  }

  if (isPlainObject(value)) {
    const next: Record<string, unknown> = {}

    for (const [key, val] of Object.entries(value)) {
      const pruned = pruneNestedValue(val)

      if (pruned !== undefined) {
        next[key] = pruned
      }
    }

    return Object.keys(next).length === 0 ? undefined : next
  }

  return value
}

function pruneTopLevelParams(params: CowSwapWidgetParams): CowSwapWidgetParams {
  return Object.entries(params).reduce(
    (acc, [key, val]) => {
      if (key in DEFAULT_PARAM_VALUES) {
        const defaultValue = DEFAULT_PARAM_VALUES[key as keyof typeof DEFAULT_PARAM_VALUES]

        if (val !== defaultValue) {
          acc[key] = val
        }
      } else {
        const pruned = pruneNestedValue(val)

        if (pruned !== undefined) {
          acc[key] = pruned
        }
      }

      return acc
    },
    {} as Record<string, unknown>,
  ) as unknown as CowSwapWidgetParams
}

/**
 * Params shaped for embed snippet output: theme diff, placeholder appCode when unset/preview-default,
 * default baseUrl omitted, empty top-level values stripped, and params matching
 * {@link DEFAULT_PARAM_VALUES} omitted unless explicitly overridden (e.g. `standaloneMode: false`).
 */
export function sanitizeParameters(params: CowSwapWidgetParams, defaultPalette: ColorPalette): CowSwapWidgetParams {
  const sanitized: CowSwapWidgetParams = {
    ...params,
    theme: sanitizePalette(params, defaultPalette),
  }

  const appCodeTrimmed = sanitizeConfiguratorAppCode(params.appCode || '')

  if (!appCodeTrimmed || appCodeTrimmed === CONFIGURATOR_WIDGET_PREVIEW_APP_CODE_FALLBACK) {
    sanitized.appCode = WIDGET_SNIPPET_APP_CODE_PLACEHOLDER
  } else {
    sanitized.appCode = appCodeTrimmed
  }

  if (!params.baseUrl || params.baseUrl === WIDGET_CONFIGURATOR_DEFAULT_BASE_URL) {
    delete sanitized.baseUrl
  }

  // Preview maps rootStyle into deprecated top-level width/height/maxHeight for older widget-lib
  // consumers. Copied snippets should only include rootStyle (widget-lib applies layout there).
  delete sanitized.width
  delete sanitized.height
  delete sanitized.maxHeight

  sanitized.sell = sanitizeTradeAsset(sanitized.sell)
  sanitized.buy = sanitizeTradeAsset(sanitized.buy)
  sanitized.forcedOrderDeadline = sanitizeForcedOrderDeadline(sanitized.forcedOrderDeadline)

  if (!isTradeType(sanitized.tradeType)) {
    delete sanitized.tradeType
  }

  if (sanitized.enabledTradeTypes !== undefined) {
    if (Array.isArray(sanitized.enabledTradeTypes)) {
      sanitized.enabledTradeTypes = sanitized.enabledTradeTypes.filter(isTradeType)
    } else {
      delete sanitized.enabledTradeTypes
    }
  }

  return pruneTopLevelParams(sanitized)
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

function isTradeType(value: unknown): value is TradeType {
  return Object.values(TradeType).includes(value as TradeType)
}

function sanitizeTradeAsset(
  value: CowSwapWidgetParams['sell'] | CowSwapWidgetParams['buy'],
): CowSwapWidgetParams['sell'] | CowSwapWidgetParams['buy'] | undefined {
  if (!value || typeof value !== 'object' || !('asset' in value) || typeof value.asset !== 'string') {
    return undefined
  }

  return isTradeAssetIdentifier(value.asset) ? value : undefined
}

function sanitizeForcedOrderDeadline(
  value: CowSwapWidgetParams['forcedOrderDeadline'],
): CowSwapWidgetParams['forcedOrderDeadline'] | undefined {
  if (value === DEFAULT_SWAP_DEADLINE_MINUTES) return undefined

  if (!isPlainObject(value)) return value

  const deadlineByTradeType = value as Partial<Record<TradeType, unknown>>

  return pruneNestedValue({
    ...value,
    [TradeType.SWAP]:
      deadlineByTradeType[TradeType.SWAP] === DEFAULT_SWAP_DEADLINE_MINUTES
        ? undefined
        : deadlineByTradeType[TradeType.SWAP],
    [TradeType.LIMIT]:
      deadlineByTradeType[TradeType.LIMIT] === DEFAULT_LIMIT_DEADLINE_MINUTES
        ? undefined
        : deadlineByTradeType[TradeType.LIMIT],
    [TradeType.ADVANCED]:
      deadlineByTradeType[TradeType.ADVANCED] === DEFAULT_ADVANCED_DEADLINE_MINUTES
        ? undefined
        : deadlineByTradeType[TradeType.ADVANCED],
  }) as CowSwapWidgetParams['forcedOrderDeadline'] | undefined
}

function isTradeAssetIdentifier(value: string): boolean {
  return Boolean(isAddress(value)) || /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(value)
}
