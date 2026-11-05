import assert from 'node:assert/strict'
import { test } from 'node:test'

import { toSourceText } from './wikipedia.mjs'

test('toSourceText keeps standard summaries only', () => {
  assert.equal(toSourceText({ type: 'standard', extract: 'Nvidia is…' }), 'Nvidia is…')
  assert.equal(toSourceText({ type: 'disambiguation', extract: 'X may refer to' }), null)
  assert.equal(toSourceText({ type: 'standard', extract: '' }), null)
})
