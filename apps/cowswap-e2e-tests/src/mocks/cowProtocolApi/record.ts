import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import type { CowApiEndpointKey } from './endpoints'

const HOSTS = {
  prod: 'https://api.cow.fi',
  barn: 'https://barn.api.cow.fi',
} as const

const FIXTURES_DIR = path.join(__dirname, 'fixtures')

/** Trim recorded arrays to this many entries so fixtures stay reviewable. */
const MAX_ARRAY_ENTRIES = 3

const ACCOUNT = '0xfb3c7eb936cAA12B5A884d612393969A557d4307'
const ORDER_UID =
  '0x71622d8563a51e03b4f32cfaa8c6e80c6fd6a22eeacf1a00d41309326ba7f13afb3c7eb936caa12b5a884d612393969a557d43076bfb1da4'
const TX_HASH = '0x4cda04d9e5872969256306c98540279f10a822a718e85d46d535c50c2555fe2d'
const APP_DATA_HASH = '0xbc9e102748829db8395db85375d62375efe09b7109bc3aab8c12518fa22fe459'
const AUCTION_ID = '15567158'
const WETH = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
const USDC = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'

interface Recording {
  key: CowApiEndpointKey
  env: keyof typeof HOSTS
  network: string
  path: string
  body?: unknown
}

/**
 * Endpoints whose default is computed rather than recorded (`postOrder`,
 * `cancelOrders`, `putAppData`) have no entry here.
 */
const RECORDINGS: readonly Recording[] = [
  {
    key: 'accountOrders',
    env: 'barn',
    network: 'mainnet',
    path: `/api/v1/account/${ACCOUNT}/orders?offset=0&limit=10`,
  },
  { key: 'order', env: 'barn', network: 'mainnet', path: `/api/v1/orders/${ORDER_UID}` },
  { key: 'orderStatus', env: 'barn', network: 'mainnet', path: `/api/v1/orders/${ORDER_UID}/status` },
  { key: 'transactionOrders', env: 'barn', network: 'mainnet', path: `/api/v1/transactions/${TX_HASH}/orders` },
  { key: 'nativePrice', env: 'barn', network: 'mainnet', path: `/api/v1/token/${WETH}/native_price` },
  { key: 'totalSurplus', env: 'barn', network: 'mainnet', path: `/api/v1/users/${ACCOUNT}/total_surplus` },
  { key: 'appData', env: 'barn', network: 'mainnet', path: `/api/v1/app_data/${APP_DATA_HASH}` },
  { key: 'version', env: 'barn', network: 'mainnet', path: '/api/v1/version' },
  { key: 'trades', env: 'barn', network: 'mainnet', path: `/api/v2/trades?owner=${ACCOUNT}` },
  { key: 'solverCompetition', env: 'barn', network: 'mainnet', path: `/api/v2/solver_competition/${AUCTION_ID}` },
  {
    key: 'solverCompetitionByTx',
    env: 'barn',
    network: 'mainnet',
    path: `/api/v2/solver_competition/by_tx_hash/${TX_HASH}`,
  },
  {
    key: 'quote',
    env: 'barn',
    network: 'mainnet',
    path: '/api/v1/quote',
    body: {
      sellToken: WETH,
      buyToken: USDC,
      from: ACCOUNT,
      receiver: ACCOUNT,
      sellAmountBeforeFee: '1000000000000000000',
      kind: 'sell',
      onchainOrder: false,
      signingScheme: 'eip712',
      priceQuality: 'verified',
    },
  },
]

async function main(): Promise<void> {
  mkdirSync(FIXTURES_DIR, { recursive: true })
  console.log(`Recording ${RECORDINGS.length} CoW API fixtures into ${FIXTURES_DIR}`)

  const results = await Promise.all(
    RECORDINGS.map(async (recording) => {
      try {
        return await record(recording)
      } catch (error) {
        console.error(`  ✗ ${recording.key}: ${String(error)}`)
        return 'skipped' as const
      }
    }),
  )

  const written = results.filter((r) => r === 'written').length
  const skipped = results.length - written
  console.log(`\nDone: ${written} written, ${skipped} skipped.`)
  if (skipped > 0) process.exitCode = 1
}

async function record(recording: Recording): Promise<'written' | 'skipped'> {
  const url = `${HOSTS[recording.env]}/${recording.network}${recording.path}`
  const init: RequestInit = recording.body
    ? { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(recording.body) }
    : { method: 'GET' }

  const response = await fetch(url, init)
  if (!response.ok) {
    console.error(`  ✗ ${recording.key}: HTTP ${response.status} from ${url}`)
    return 'skipped'
  }

  const contentType = response.headers.get('content-type') ?? ''
  // `GET /api/v1/version` answers text/plain; store it as a JSON string so every
  // fixture stays a .json file.
  const parsed = contentType.toLowerCase().startsWith('application/json')
    ? trim((await response.json()) as unknown)
    : await response.text()

  const file = path.join(FIXTURES_DIR, `${recording.key}.json`)
  writeFileSync(file, `${JSON.stringify(parsed, null, 2)}\n`, 'utf8')
  console.log(`  ✓ ${recording.key} -> fixtures/${recording.key}.json`)
  return 'written'
}

function trim(value: unknown): unknown {
  if (Array.isArray(value)) return value.slice(0, MAX_ARRAY_ENTRIES)
  return value
}

void main()
