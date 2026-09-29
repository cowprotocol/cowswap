import { MessageDescriptor } from '@lingui/core'

import { msg } from '@lingui/core/macro'

const TOKENIZED_BY_PATTERN = /^Tokenized by\s+(.+)$/
const ISSUED_BY_PATTERN = /^Issued by\s+(.+)$/
const ASSET_OFFICIALLY_ISSUED_BY_PATTERN = /^Asset officially issued by\s+(.+)$/
const TOKEN_OFFICIALLY_ISSUED_BY_PATTERN = /^Token officially issued by\s+(.+)$/

export function translateTokenListTagText(text: string | MessageDescriptor): string | MessageDescriptor {
  if (typeof text !== 'string') {
    return text
  }

  const tokenizedByIssuer = getTemplateValue(text, TOKENIZED_BY_PATTERN)
  if (tokenizedByIssuer) {
    return msg`Tokenized by ${tokenizedByIssuer}`
  }

  const issuedByIssuer = getTemplateValue(text, ISSUED_BY_PATTERN)
  if (issuedByIssuer) {
    return msg`Issued by ${issuedByIssuer}`
  }

  const assetIssuedByIssuer = getTemplateValue(text, ASSET_OFFICIALLY_ISSUED_BY_PATTERN)
  if (assetIssuedByIssuer) {
    return msg`Asset officially issued by ${assetIssuedByIssuer}`
  }

  const tokenIssuedByIssuer = getTemplateValue(text, TOKEN_OFFICIALLY_ISSUED_BY_PATTERN)
  if (tokenIssuedByIssuer) {
    return msg`Token officially issued by ${tokenIssuedByIssuer}`
  }

  return text
}

function getTemplateValue(text: string, pattern: RegExp): string | null {
  const value = text.match(pattern)?.[1]?.trim()

  return value || null
}
