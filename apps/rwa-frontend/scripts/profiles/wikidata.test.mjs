import assert from 'node:assert/strict'
import { test } from 'node:test'

import { buildSparqlQuery, EXCHANGES, matchEntities, toWikidataTicker } from './wikidata.mjs'

const US = [EXCHANGES.nyse, EXCHANGES.nasdaq, EXCHANGES.nyseArca, EXCHANGES.nyseAmerican]

function binding(symbol, item, { article, industry } = {}) {
  return {
    symbol: { value: symbol },
    item: { value: `http://www.wikidata.org/entity/${item}` },
    ...(article ? { article: { value: article } } : {}),
    ...(industry ? { industryLabel: { value: industry } } : {}),
  }
}

test('toWikidataTicker maps US, dotted, Hong Kong and London tickers', () => {
  assert.deepEqual(toWikidataTicker('NVDA'), { symbols: ['NVDA'], exchanges: US })
  assert.deepEqual(toWikidataTicker('BRK.B'), { symbols: ['BRK.B', 'BRK-B'], exchanges: US })
  assert.deepEqual(toWikidataTicker('700.HK'), { symbols: ['700', '0700'], exchanges: [EXCHANGES.hkex] })
  assert.deepEqual(toWikidataTicker('IB01.L'), { symbols: ['IB01'], exchanges: [EXCHANGES.lse] })
})

test('buildSparqlQuery filters by exchange and asks for the English article', () => {
  const query = buildSparqlQuery(['NVDA'])

  for (const part of ['"NVDA"', 'wd:Q13677', 'wd:Q82059', '<https://en.wikipedia.org/>']) {
    assert.ok(query.includes(part), part)
  }
})

test('matchEntities keys matches by registry ticker', () => {
  const matches = matchEntities(
    ['NVDA', 'META', 'XYZ', 'BRK.B', 'MCD'],
    [
      binding('NVDA', 'Q182477', {
        article: 'https://en.wikipedia.org/wiki/Nvidia',
        industry: 'semiconductor industry',
      }),
      binding('NVDA', 'Q182477', { article: 'https://en.wikipedia.org/wiki/Nvidia', industry: 'technology industry' }),
      binding('META', 'Q380'),
      binding('META', 'Q999'),
      binding('XYZ', 'Q1'),
      binding('BRK-B', 'Q217583', { article: 'https://en.wikipedia.org/wiki/Berkshire_Hathaway' }),
      binding('MCD', 'Q38076', { article: 'https://en.wikipedia.org/wiki/McDonald%27s' }),
    ],
  )

  assert.deepEqual(matches.get('NVDA'), { item: 'Q182477', articleTitle: 'Nvidia', industry: 'semiconductor industry' })
  assert.equal(matches.has('META'), false)
  assert.deepEqual(matches.get('XYZ'), { item: 'Q1', articleTitle: null, industry: null })
  assert.equal(matches.get('BRK.B').articleTitle, 'Berkshire_Hathaway')
  assert.equal(matches.get('MCD').articleTitle, "McDonald's")
})
