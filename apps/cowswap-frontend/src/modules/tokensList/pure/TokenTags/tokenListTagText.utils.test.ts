import { i18n, MessageDescriptor } from '@lingui/core'

import { msg } from '@lingui/core/macro'

import { translateTokenListTagText } from './tokenListTagText.utils'

function extractText(text: string | MessageDescriptor): string {
  return typeof text === 'string' ? text : i18n._(text)
}

describe('translateTokenListTagText', () => {
  it.each([
    'Tokenized by Example Issuer',
    'Issued by Example Issuer',
    'Asset officially issued by Example Issuer',
    'Token officially issued by Example Issuer',
  ])('translates known token-list tag text while preserving the issuer: %s', (input) => {
    const translated = translateTokenListTagText(input)

    expect(typeof translated).toBe('object')
    expect(extractText(translated)).toBe(input)
  })

  it('leaves unknown token-list text unchanged', () => {
    const text = 'Example Issuer token'

    expect(translateTokenListTagText(text)).toBe(text)
  })

  it('leaves existing message descriptors unchanged', () => {
    const descriptor = msg`Unsupported`

    expect(translateTokenListTagText(descriptor)).toBe(descriptor)
  })
})
