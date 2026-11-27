import assert from 'node:assert/strict'
import { test } from 'node:test'

import { buildWebsiteQuery, pickWebsites, sanitizeWebsite } from './websites.mjs'

function binding(item, website, { rank = 'NormalRank', language } = {}) {
  return {
    item: { value: `http://www.wikidata.org/entity/${item}` },
    website: { value: website },
    rank: { value: `http://wikiba.se/ontology#${rank}` },
    ...(language ? { language: { value: `http://www.wikidata.org/entity/${language}` } } : {}),
  }
}

test('sanitizeWebsite keeps the https origin and path only', () => {
  assert.equal(sanitizeWebsite('https://www.nvidia.com/'), 'https://www.nvidia.com')
  assert.equal(sanitizeWebsite(' https://WWW.Apple.com/en-us/?utm_source=x#top '), 'https://www.apple.com/en-us')
  assert.equal(sanitizeWebsite('https://www.nvidia.com:443/'), 'https://www.nvidia.com')
})

test('sanitizeWebsite rejects anything but plain public https links', () => {
  for (const value of [
    'http://www.nvidia.com',
    'javascript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'JaVaScRiPt:alert(1)',
    '//www.nvidia.com',
    'www.nvidia.com',
    'https://www.nvidia.com/"onmouseover="alert(1)',
    "https://www.nvidia.com/'><script>alert(1)</script>",
    'https://www.nvidia.com/<svg>',
    'https://www.nvidia.com/a\u2028b',
    'https://www.nvidia.com/a b',
    'https://user:pass@www.nvidia.com',
    'https://www.nvidia.com:8443',
    'https://127.0.0.1',
    'https://localhost',
    'https://xn--nvda-xqa.com',
    'https://nvídia.com',
    `https://www.nvidia.com/${'a'.repeat(200)}`,
    '',
    null,
  ]) {
    assert.throws(() => sanitizeWebsite(value), undefined, String(value))
  }
})

test('buildWebsiteQuery asks for official websites of the items', () => {
  const query = buildWebsiteQuery(['Q182477', 'Q312'])

  for (const part of ['wd:Q182477 wd:Q312', 'p:P856', 'pq:P407', 'DeprecatedRank'])
    assert.ok(query.includes(part), part)
})

test('pickWebsites prefers preferred rank, then English or language-less values', () => {
  const results = pickWebsites([
    binding('Q1', 'https://www.example.com/', { rank: 'PreferredRank' }),
    binding('Q1', 'https://old.example.com/'),
    binding('Q2', 'https://www.example.de/', { language: 'Q188' }),
    binding('Q2', 'https://www.example.com/', { language: 'Q1860' }),
    binding('Q3', 'https://www.example.com/'),
    binding('Q3', 'https://www.example.com'),
  ])

  assert.deepEqual(results.get('Q1'), { website: 'https://www.example.com' })
  assert.deepEqual(results.get('Q2'), { website: 'https://www.example.com' })
  assert.deepEqual(results.get('Q3'), { website: 'https://www.example.com' })
})

test('pickWebsites reports ambiguous and rejected websites', () => {
  const results = pickWebsites([
    binding('Q1', 'https://a.example.com'),
    binding('Q1', 'https://b.example.com'),
    binding('Q2', 'http://www.example.com'),
  ])

  assert.deepEqual(results.get('Q1'), { ambiguous: ['https://a.example.com', 'https://b.example.com'] })
  assert.equal(results.get('Q2').website, undefined)
  assert.match(results.get('Q2').rejected[0], /http instead of https/)
})
