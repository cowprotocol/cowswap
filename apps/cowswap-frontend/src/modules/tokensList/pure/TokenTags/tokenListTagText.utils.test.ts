import { i18n, MessageDescriptor } from '@lingui/core'
import { msg } from '@lingui/core/macro'

import { translateTokenListTagText } from './tokenListTagText.utils'

function extractText(text: string | MessageDescriptor): string {
  return typeof text === 'string' ? text : i18n._(text)
}

describe('translateTokenListTagText', () => {
  it('translates Tokenized by labels while preserving the issuer from the token list', () => {
    const translated = translateTokenListTagText('Tokenized by Example Issuer')

    expect(typeof translated).toBe('object')
    expect(extractText(translated)).toBe('Tokenized by Example Issuer')
  })

  it('translates known issuer descriptions while preserving the issuer from the token list', () => {
    const translated = translateTokenListTagText('Asset officially issued by Example Issuer')

    expect(typeof translated).toBe('object')
    expect(extractText(translated)).toBe('Asset officially issued by Example Issuer')
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
