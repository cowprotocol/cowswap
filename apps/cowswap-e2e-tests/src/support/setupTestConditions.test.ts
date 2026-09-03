import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { strict as assert } from 'node:assert'
import { test } from 'node:test'

import { createSetupTestConditions, type SetupTestConditionsDeps } from './setupTestConditions'

import type { AllowancesMock } from '../mocks/allowances'
import type { BalancesMock } from '../mocks/balances'
import type { TradePage } from '../pages/TradePage'

const WETH_ADDRESS = '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14'
const USDC_ADDRESS = '0xbe72E441BF55620febc26715db68d3494213D8Cb'

function buildDeps(): {
  deps: SetupTestConditionsDeps
  balances: ReturnType<typeof fakeBalances>
  allowances: ReturnType<typeof fakeAllowances>
  swapPage: ReturnType<typeof fakeTradePage>
  limitPage: ReturnType<typeof fakeTradePage>
  twapPage: ReturnType<typeof fakeTradePage>
} {
  const balances = fakeBalances()
  const allowances = fakeAllowances()
  const swapPage = fakeTradePage()
  const limitPage = fakeTradePage()
  const twapPage = fakeTradePage()
  const deps: SetupTestConditionsDeps = {
    wallet: { address: '0xOwner' },
    mocks: { balances, allowances },
    swapPage,
    limitPage,
    twapPage,
  }
  return { deps, balances, allowances, swapPage, limitPage, twapPage }
}

function fakeAllowances(): AllowancesMock & { calls: Array<[string, number, Record<string, unknown>]> } {
  const calls: Array<[string, number, Record<string, unknown>]> = []
  return {
    calls,
    set(owner, chainId, allowances) {
      calls.push([owner, chainId, allowances])
    },
    clear() {},
    reset() {},
  }
}

function fakeBalances(): BalancesMock & { calls: Array<[string, number, Record<string, unknown>]> } {
  const calls: Array<[string, number, Record<string, unknown>]> = []
  return {
    calls,
    set(owner, chainId, balances) {
      calls.push([owner, chainId, balances])
    },
    clear() {},
    sessions: () => [],
    reportUnknownOwners() {},
    getBalance: () => undefined,
    reset() {},
  }
}

function fakeTradePage(): TradePage & { calls: string[] } {
  const calls: string[] = []
  return {
    calls,
    async goto(opts) {
      calls.push(`goto(${JSON.stringify(opts)})`)
    },
    async enterSellAmount(amount) {
      calls.push(`enterSellAmount(${amount})`)
    },
    async waitForQuote() {
      calls.push('waitForQuote()')
    },
  }
}

test('converts human-readable balances/allowances to raw atoms keyed by address', async () => {
  const { deps, balances, allowances } = buildDeps()
  const setupTestConditions = createSetupTestConditions(deps)

  await setupTestConditions({
    chainId: SupportedChainId.SEPOLIA,
    tradeType: 'swap',
    sellToken: 'WETH',
    buyToken: 'USDC',
    sellAmount: '0.5',
    balances: { WETH: '1', USDC: '56000' },
    allowances: { WETH: '50' },
  })

  assert.deepEqual(balances.calls, [
    [
      '0xOwner',
      SupportedChainId.SEPOLIA,
      { [WETH_ADDRESS]: 1_000_000_000_000_000_000n, [USDC_ADDRESS]: 56_000_000_000_000_000_000_000n },
    ],
  ])
  assert.deepEqual(allowances.calls, [
    ['0xOwner', SupportedChainId.SEPOLIA, { [WETH_ADDRESS]: 50_000_000_000_000_000_000n }],
  ])
})

test('drives swapPage for tradeType "swap" and leaves other pages untouched', async () => {
  const { deps, swapPage, limitPage, twapPage } = buildDeps()
  const setupTestConditions = createSetupTestConditions(deps)

  await setupTestConditions({
    chainId: SupportedChainId.SEPOLIA,
    tradeType: 'swap',
    sellToken: 'WETH',
    buyToken: 'USDC',
    sellAmount: '0.5',
  })

  assert.deepEqual(swapPage.calls, [
    `goto(${JSON.stringify({ chainId: SupportedChainId.SEPOLIA, sell: WETH_ADDRESS, buy: USDC_ADDRESS })})`,
    'enterSellAmount(0.5)',
    'waitForQuote()',
  ])
  assert.deepEqual(limitPage.calls, [])
  assert.deepEqual(twapPage.calls, [])
})

test('drives limitPage for tradeType "limitOrder"', async () => {
  const { deps, swapPage, limitPage } = buildDeps()
  const setupTestConditions = createSetupTestConditions(deps)

  await setupTestConditions({
    chainId: SupportedChainId.SEPOLIA,
    tradeType: 'limitOrder',
    sellToken: 'WETH',
    buyToken: 'USDC',
    sellAmount: '0.5',
  })

  assert.equal(limitPage.calls.length, 3)
  assert.deepEqual(swapPage.calls, [])
})

test('drives twapPage for tradeType "twap"', async () => {
  const { deps, twapPage } = buildDeps()
  const setupTestConditions = createSetupTestConditions(deps)

  await setupTestConditions({
    chainId: SupportedChainId.SEPOLIA,
    tradeType: 'twap',
    sellToken: 'WETH',
    buyToken: 'USDC',
    sellAmount: '0.5',
  })

  assert.equal(twapPage.calls.length, 3)
})

test('skips balances/allowances mocking when omitted', async () => {
  const { deps, balances, allowances } = buildDeps()
  const setupTestConditions = createSetupTestConditions(deps)

  await setupTestConditions({
    chainId: SupportedChainId.SEPOLIA,
    tradeType: 'swap',
    sellToken: 'WETH',
    buyToken: 'USDC',
    sellAmount: '0.5',
  })

  assert.deepEqual(balances.calls, [])
  assert.deepEqual(allowances.calls, [])
})
