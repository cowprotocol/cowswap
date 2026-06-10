import { CowSwapWidgetParams, TradeType } from '@cowprotocol/widget-lib'

import { sanitizeParameters } from './sanitizeParameters'

import { ColorPalette } from '../../configurator/types'
import { COMMENTS_BY_PARAM_NAME, COMMENTS_BY_PARAM_NAME_TYPESCRIPT, REMOVE_PARAMS } from '../const'

const TRADE_TYPE_PLACEHOLDER_PREFIX = '__COW_WIDGET_TRADE_TYPE__'

export function formatParameters(
  params: CowSwapWidgetParams,
  padLeft = 0,
  isTypescript: boolean,
  defaultPalette: ColorPalette,
): string {
  const paramsSanitized = sanitizeParameters(params, defaultPalette)
  REMOVE_PARAMS.forEach((propName) => {
    delete paramsSanitized[propName]
  })

  const paramsForSerialization = isTypescript ? replaceTradeTypesWithPlaceholders(paramsSanitized) : paramsSanitized

  // Stringify params
  const formattedParams = escapeScriptSensitiveJson(JSON.stringify(paramsForSerialization, null, 4))

  // Add comments
  const commentsByParamName = isTypescript
    ? { ...COMMENTS_BY_PARAM_NAME, ...COMMENTS_BY_PARAM_NAME_TYPESCRIPT }
    : COMMENTS_BY_PARAM_NAME

  const resultWithComments = Object.keys(commentsByParamName).reduce((acc, propName) => {
    return acc.replace(new RegExp(`"${propName}".*$`, 'gm'), `$& // ${commentsByParamName[propName]}`)
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

function escapeScriptSensitiveJson(value: string): string {
  return value
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
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
