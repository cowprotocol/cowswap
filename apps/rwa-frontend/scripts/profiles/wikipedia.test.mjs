import assert from 'node:assert/strict'
import { test } from 'node:test'

import { resolveTitles, toSourceText } from './wikipedia.mjs'

test('toSourceText keeps regular articles only', () => {
  assert.equal(toSourceText({ title: 'Nvidia', extract: 'Nvidia is…' }), 'Nvidia is…')
  assert.equal(toSourceText({ title: 'Mercury', pageprops: { disambiguation: '' }, extract: 'Mercury may refer to' }), null)
  assert.equal(toSourceText({ title: 'X', missing: true }), null)
  assert.equal(toSourceText({ title: 'X', extract: '' }), null)
})

test('resolveTitles follows normalization and redirects', () => {
  const resolved = resolveTitles(['Nvidia_Corporation', "McDonald's"], {
    normalized: [{ from: 'Nvidia_Corporation', to: 'Nvidia Corporation' }],
    redirects: [{ from: 'Nvidia Corporation', to: 'Nvidia' }],
  })

  assert.equal(resolved.get('Nvidia_Corporation'), 'Nvidia')
  assert.equal(resolved.get("McDonald's"), "McDonald's")
})
