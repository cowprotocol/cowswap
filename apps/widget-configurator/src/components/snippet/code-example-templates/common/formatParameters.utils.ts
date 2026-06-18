import { CowSwapWidgetParams, TradeType } from '@cowprotocol/widget-lib'

import { COMMENTS_BY_PARAM_NAME, COMMENTS_BY_PARAM_NAME_TYPESCRIPT } from './codeExample.constants'

import { ColorPalette } from '../../../../configurator.types'
import { sanitizeParameters } from '../sanitizeParameters'

const SNIPPET_JSON_INDENT = 2
const TRADE_TYPE_PLACEHOLDER_PREFIX = '__COW_WIDGET_TRADE_TYPE__'

export function formatParameters(
  params: CowSwapWidgetParams,
  padLeft = 0,
  isTypescript: boolean,
  defaultPalette: ColorPalette,
): string {
  const paramsSanitized = sanitizeParameters(params, defaultPalette)
  const paramsForSerialization = isTypescript ? replaceTradeTypesWithPlaceholders(paramsSanitized) : paramsSanitized
  const formattedParams = JSON.stringify(paramsForSerialization, null, SNIPPET_JSON_INDENT)

  // Add comments
  const commentsByParamName = isTypescript
    ? { ...COMMENTS_BY_PARAM_NAME, ...COMMENTS_BY_PARAM_NAME_TYPESCRIPT }
    : COMMENTS_BY_PARAM_NAME

  const resultWithComments = Object.keys(commentsByParamName).reduce((acc, propName) => {
    return acc.replace(
      new RegExp(`"${propName}".*$`, 'gm'),
      `$& // ${commentsByParamName[propName as keyof CowSwapWidgetParams]}`,
    )
  }, formattedParams)

  const resultWithValues = isTypescript ? replaceTradeTypePlaceholders(resultWithComments) : resultWithComments

  if (padLeft === 0) {
    return resultWithValues
  }

  // Add indentation
  const lines = resultWithValues.split('\n')
  return (
    lines[0] +
    '\n' +
    lines
      .slice(1)
      .map((line) => `${' '.repeat(padLeft)}${line}`)
      .join('\n')
  )
}

function replaceTradeTypesWithPlaceholders(params: CowSwapWidgetParams): CowSwapWidgetParams {
  return {
    ...params,
    ...(params.tradeType ? { tradeType: toTradeTypePlaceholder(params.tradeType) as TradeType } : {}),
    ...(params.enabledTradeTypes
      ? {
          enabledTradeTypes: params.enabledTradeTypes.map(
            (tradeType) => toTradeTypePlaceholder(tradeType) as TradeType,
          ),
        }
      : {}),
  }
}

function replaceTradeTypePlaceholders(value: string): string {
  return value.replace(/"__COW_WIDGET_TRADE_TYPE__(swap|limit|advanced|yield)"/g, (_match, tradeType) => {
    return `TradeType.${tradeType.toUpperCase()}`
  })
}

function toTradeTypePlaceholder(tradeType: TradeType): string {
  return `${TRADE_TYPE_PLACEHOLDER_PREFIX}${tradeType}`
}
