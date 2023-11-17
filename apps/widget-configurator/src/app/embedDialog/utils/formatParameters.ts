import { CowSwapWidgetParams } from '@cowprotocol/widget-lib'

import { sanitizeParameters } from './sanitizeParameters'

import {
  COMMENTS_BY_PARAM_NAME,
  COMMENTS_BY_PARAM_NAME_TYPESCRIPT,
  REMOVE_PARAMS,
  VALUES_BY_PARAM_NAME,
} from '../const'

export function formatParameters(params: CowSwapWidgetParams, padLeft = 0, isTypescript: boolean): string {
  const paramsSanitized = sanitizeParameters(params)
  REMOVE_PARAMS.forEach((propName) => {
    delete paramsSanitized[propName]
  })
  const formattedParams = JSON.stringify(paramsSanitized, null, 4)

  // Add comments
  const commentsByParamName = isTypescript
    ? { ...COMMENTS_BY_PARAM_NAME, ...COMMENTS_BY_PARAM_NAME_TYPESCRIPT }
    : COMMENTS_BY_PARAM_NAME

  const resultWithComments = Object.keys(commentsByParamName).reduce((acc, propName) => {
    return acc.replace(new RegExp(`"${propName}".*$`, 'gm'), `$& // ${commentsByParamName[propName]}`)
  }, formattedParams)

  // Add values
  const tradeTypeValue = isTypescript ? 'TradeType.' + params.tradeType?.toUpperCase() : params.tradeType
  const valuesByParamName: Record<string, string> = tradeTypeValue
    ? { ...VALUES_BY_PARAM_NAME, tradeType: tradeTypeValue }
    : VALUES_BY_PARAM_NAME

  const resultWithValues = Object.keys(valuesByParamName).reduce((acc, propName) => {
    return acc.replace(new RegExp(`("${propName}".* )(".*")(.*)$`, 'gm'), `$1${valuesByParamName[propName]}$3`)
  }, resultWithComments)

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
