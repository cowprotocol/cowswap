import { CowSwapWidgetParams } from '@cowprotocol/widget-lib'

import { COMMENTS_BY_PARAM_NAME, COMMENTS_BY_PARAM_NAME_TYPESCRIPT } from './codeExample.constants'

import { ColorPalette } from '../../../../configurator.types'
import { sanitizeParameters } from '../sanitizeParameters'

const SNIPPET_JSON_INDENT = 2

export function formatParameters(
  params: CowSwapWidgetParams,
  padLeft = 0,
  isTypescript: boolean,
  defaultPalette: ColorPalette,
): string {
  const paramsSanitized = sanitizeParameters(params, defaultPalette)
  const formattedParams = JSON.stringify(paramsSanitized, null, SNIPPET_JSON_INDENT)

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

  // Add values
  const tradeTypeValue = params.tradeType
    ? isTypescript
      ? `TradeType.${params.tradeType.toUpperCase()}`
      : `"${params.tradeType}"`
    : null
  const valuesByParamName: Record<string, string> = tradeTypeValue ? { tradeType: tradeTypeValue } : {}

  let resultWithValues = Object.keys(valuesByParamName).reduce((acc, propName) => {
    return acc.replace(new RegExp(`("${propName}".* )(".*")(.*)$`, 'gm'), `$1${valuesByParamName[propName]}$3`)
  }, resultWithComments)

  // Fix the enabledTradeTypes
  if (isTypescript) {
    resultWithValues = resultWithValues.replace(
      new RegExp(/^(\s*)"(\w*)"(,?)$/gm),
      (_match, space, tradeType, comma) => space + 'TradeType.' + tradeType.toUpperCase() + comma,
    )
  }

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
