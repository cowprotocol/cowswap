import assert from 'node:assert/strict'
import { test } from 'node:test'

import { buildProfilePrompt, parseProfileResponse } from './claude.mjs'

const NVIDIA = {
  ticker: 'NVDA',
  title: 'NVIDIA',
  type: 'stock',
  sourceText: 'Nvidia Corporation is…',
  industry: 'semiconductor industry',
}

test('buildProfilePrompt with source text', () => {
  const prompt = buildProfilePrompt(NVIDIA)

  for (const part of [
    'NVDA',
    'NVIDIA',
    'Nvidia Corporation is…',
    'semiconductor industry',
    'Information Technology',
    'ETF',
    ' · ',
    '"skip": true',
  ]) {
    assert.ok(prompt.includes(part), part)
  }
})

test('buildProfilePrompt without source text tells the model to skip unknown assets', () => {
  const prompt = buildProfilePrompt({
    ticker: 'QQQ',
    title: 'Invesco QQQ ETF',
    type: 'index',
    sourceText: null,
    industry: null,
  })

  assert.ok(prompt.includes('QQQ') && prompt.includes('ETF'))
  assert.match(prompt, /confident/i)
})

test('parseProfileResponse accepts a valid profile wrapped in prose', () => {
  assert.deepEqual(
    parseProfileResponse(
      'Here: {"description":"NVIDIA designs GPUs.","sector":"Information Technology · Semiconductors"}',
      'NVIDIA',
    ),
    { description: 'NVIDIA designs GPUs.', sector: 'Information Technology · Semiconductors' },
  )
})

test('parseProfileResponse rejects skip, bad JSON, bad sector, figures, three sentences', () => {
  assert.equal(parseProfileResponse('{"skip":true}', 'X'), null)
  assert.equal(parseProfileResponse('not json', 'X'), null)
  assert.equal(parseProfileResponse('{"description":"A.","sector":"Technology · Chips"}', 'X'), null)
  assert.equal(parseProfileResponse('{"description":"A.","sector":"Information Technology - Chips"}', 'X'), null)
  assert.equal(
    parseProfileResponse('{"description":"Founded in 1993.","sector":"Information Technology · Chips"}', 'X'),
    null,
  )
  assert.equal(parseProfileResponse('{"description":"A. B. C.","sector":"Information Technology · Chips"}', 'X'), null)
})

test('parseProfileResponse allows digits that are part of the title and common abbreviations', () => {
  assert.ok(parseProfileResponse('{"description":"3M makes adhesives.","sector":"Industrials · Conglomerates"}', '3M'))
  assert.ok(
    parseProfileResponse(
      '{"description":"Apple Inc. designs phones. It also sells services in the U.S. and abroad.","sector":"Information Technology · Hardware"}',
      'Apple',
    ),
  )
})

test('parseProfileResponse rejects unsafe descriptions', () => {
  for (const description of [
    'NVIDIA <b>designs</b> GPUs.',
    'NVIDIA designs GPUs. See nvidia-claim.xyz.',
    'NVIDIA\u202E designs GPUs.',
  ]) {
    const text = JSON.stringify({ description, sector: 'Information Technology · Semiconductors' })

    assert.equal(parseProfileResponse(text, 'NVIDIA'), null, description)
  }
})
