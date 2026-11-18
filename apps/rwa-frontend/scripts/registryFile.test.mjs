import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

import { encodeRegistry, readRegistry, writeRegistry } from './registryFile.mjs'

const TRADING_TIME = { title: 'US market open', start: '09:30', end: '16:00', timeZone: 'America/New_York' }

const asset = (ticker, sector) => ({
  ticker,
  allowedTradingTime: TRADING_TIME,
  newsFeed: undefined,
  profile: sector && { description: 'A.', sector },
  tokens: [],
})

test('encodeRegistry keeps existing keys, numbers new values after them and drops unused ones', () => {
  const file = encodeRegistry(
    { version: '1', assets: [asset('A', 'ETF · Gold'), asset('B', 'ETF · Silver'), asset('C')] },
    { allowedTradingTimes: { 2: TRADING_TIME }, sectors: { 0: 'ETF · Unused', 4: 'ETF · Silver' } },
  )

  assert.deepEqual(file.allowedTradingTimes, { 2: TRADING_TIME })
  assert.deepEqual(file.sectors, { 4: 'ETF · Silver', 5: 'ETF · Gold' })
  assert.deepEqual(
    file.assets.map((item) => [item.allowedTradingTime, item.profile?.sector]),
    [
      [2, 5],
      [2, 4],
      [2, undefined],
    ],
  )
  assert.deepEqual(Object.keys(file.assets[0]), ['ticker', 'allowedTradingTime', 'newsFeed', 'profile', 'tokens'])
})

test('writeRegistry and readRegistry round-trip', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'rwas-'))
  const path = join(dir, 'RWAs.json')
  const registry = { version: '1', assets: [asset('A', 'ETF · Gold'), { ticker: 'XAU', tokens: [] }] }

  try {
    await writeRegistry(path, registry)
    const { registry: read, maps } = await readRegistry(path)

    assert.equal(JSON.stringify(read), JSON.stringify(registry))
    assert.deepEqual(maps.sectors, { 0: 'ETF · Gold' })
    assert.equal(JSON.parse(await readFile(path, 'utf8')).assets[0].profile.sector, 0)
  } finally {
    await rm(dir, { recursive: true })
  }
})

test('readRegistry rejects map keys and references that are not canonical numbers', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'rwas-'))
  const path = join(dir, 'RWAs.json')
  const write = (file) => writeFile(path, JSON.stringify({ version: '1', allowedTradingTimes: {}, ...file }))
  const withSector = (sectors, sector) => ({
    sectors,
    assets: [{ ticker: 'A', profile: { description: 'A.', sector }, tokens: [] }],
  })

  try {
    for (const file of [
      withSector({ tech: 'X' }, 0),
      withSector({ '01': 'X', 1: 'Y' }, 1),
      withSector({ 0: 'X' }, '0'),
    ]) {
      await write(file)
      await assert.rejects(readRegistry(path), /is not a number/, JSON.stringify(file))
    }
  } finally {
    await rm(dir, { recursive: true })
  }
})
