import { CowSwapWidgetParams } from '@cowprotocol/widget-lib'

import { sanitizeParameters } from './sanitizeParameters'

import { COMMENTS_BY_PARAM_NAME, REMOVE_PARAMS, VALUES_BY_PARAM_NAME } from '../const'

export function formatParameters(params: CowSwapWidgetParams, padLeft = 0): string {
  const paramsSanitized = sanitizeParameters(params)
  REMOVE_PARAMS.forEach((propName) => {
    delete paramsSanitized[propName]
  })
  const formattedParams = JSON.stringify(paramsSanitized, null, 4)

  // Add comments
  const resultWithComments = Object.keys(COMMENTS_BY_PARAM_NAME).reduce((acc, propName) => {
    return acc.replace(new RegExp(`"${propName}".*$`, 'gm'), `$& // ${COMMENTS_BY_PARAM_NAME[propName]}`)
  }, formattedParams)

  // Add values
  const resultWithValues = Object.keys(VALUES_BY_PARAM_NAME).reduce((acc, propName) => {
    return acc.replace(new RegExp(`("${propName}".* )(".*")(.*)$`, 'gm'), `$1${VALUES_BY_PARAM_NAME[propName]}$3`)
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
