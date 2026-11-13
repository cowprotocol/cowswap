import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  analyzeFile,
  collectFromSources,
  countBindings,
  diffBaseline,
  domainHookLocals,
  emptySnapshot,
} from './architecture-and-tests-guardrail-lib.mjs'

const HOOK_FILE = 'apps/cowswap-frontend/src/modules/trade/hooks/useExample.ts'
const STATE_FILE = 'apps/cowswap-frontend/src/modules/trade/state/exampleAtom.ts'
const TEST_FILE = 'apps/cowswap-frontend/src/modules/trade/hooks/useExample.test.ts'

describe('countBindings', () => {
  it('counts named, default, and namespace bindings', () => {
    assert.equal(countBindings('{ Order, OrderStatus }'), 2)
    assert.equal(countBindings('Order, { OrderStatus }'), 2)
    assert.equal(countBindings('* as Orders'), 1)
    assert.equal(countBindings('{ type Order }'), 1)
  })
})

describe('domainHookLocals', () => {
  it('keeps useX locals and follows rename aliases', () => {
    assert.deepEqual(domainHookLocals('{ helper, useFoo, useBar as useBaz }'), ['useFoo', 'useBaz'])
    assert.deepEqual(domainHookLocals('useDefault, { useNamed }'), ['useNamed', 'useDefault'])
  })
})

describe('analyzeFile legacy/state imports', () => {
  it('counts static, type, export-from, and dynamic bindings', () => {
    const source = `
      import { Order, OrderStatus } from 'legacy/state/orders/actions'
      import type { OrdersState } from 'legacy/state/orders/reducer'
      export { addPendingOrder } from 'legacy/state/orders/actions'
      const loader = () => import('legacy/state/orders/utils')
      import { unrelated } from 'legacy/stateMachine'
    `
    const result = analyzeFile(STATE_FILE, source)
    assert.equal(result.legacyStateImportBindings, 5)
  })

  it('ignores commented imports', () => {
    const source = `
      // import { Order } from 'legacy/state/orders/actions'
      /* import { OrderStatus } from 'legacy/state/orders/actions' */
    `
    assert.equal(analyzeFile(STATE_FILE, source).legacyStateImportBindings, 0)
  })
})

describe('analyzeFile hook orchestration', () => {
  it('flags a hook that memos over three domain hooks', () => {
    const source = `
      import { useMemo } from 'react'
      import { useAtomValue } from 'jotai'
      import { useWalletInfo } from '@cowprotocol/wallet'
      import { useDerivedTradeState } from 'modules/trade'
      import { useTradeQuote } from './useTradeQuote'

      export function useExample() {
        const wallet = useWalletInfo()
        const trade = useDerivedTradeState()
        const quote = useTradeQuote()
        return useMemo(() => ({ wallet, trade, quote }), [wallet, trade, quote])
      }
    `
    assert.equal(analyzeFile(HOOK_FILE, source).hookOrchestration, 3)
  })

  it('ignores the same imports when they are not combined with a memo or effect hook', () => {
    const source = `
      import { useWalletInfo } from '@cowprotocol/wallet'
      import { useDerivedTradeState } from 'modules/trade'
      import { useTradeQuote } from './useTradeQuote'
      export function useExample() {
        return [useWalletInfo(), useDerivedTradeState(), useTradeQuote()]
      }
    `
    assert.equal(analyzeFile(HOOK_FILE, source).hookOrchestration, null)
  })

  it('ignores React, Jotai, and Lingui hooks and stays under the limit at two domain hooks', () => {
    const source = `
      import { useMemo } from 'react'
      import { useAtomValue } from 'jotai'
      import { useLingui } from '@lingui/react/macro'
      import { useWalletInfo } from '@cowprotocol/wallet'
      import { useTradeQuote } from './useTradeQuote'
      export function useExample() {
        return useMemo(() => useWalletInfo().account, [])
      }
    `
    assert.equal(analyzeFile(HOOK_FILE, source).hookOrchestration, null)
  })

  it('does not treat files outside hooks/ or hook tests as orchestration', () => {
    const source = `
      import { useMemo } from 'react'
      import { useA } from './useA'
      import { useB } from './useB'
      import { useC } from './useC'
    `
    assert.equal(analyzeFile(STATE_FILE, source).hookOrchestration, null)
    assert.equal(analyzeFile(TEST_FILE, source).hookOrchestration, null)
  })
})

describe('analyzeFile render tests', () => {
  it('flags more than three jest.mock calls together with renderHook', () => {
    const source = `
      import { renderHook } from '@testing-library/react'
      jest.mock('a')
      jest.mock('b')
      jest.mock('c')
      jest.mock('d')
    `
    assert.equal(analyzeFile(TEST_FILE, source).highMockRenderTests, 4)
  })

  it('allows three mocks, mock-only tests, and screen-only imports', () => {
    const withThreeMocks = `
      import { render } from '@testing-library/react'
      jest.mock('a')
      jest.mock('b')
      jest.mock('c')
    `
    const mocksWithoutRender = `
      jest.mock('a')
      jest.mock('b')
      jest.mock('c')
      jest.mock('d')
    `
    const screenOnly = `
      import { screen } from '@testing-library/react'
      jest.mock('a')
      jest.mock('b')
      jest.mock('c')
      jest.mock('d')
    `
    assert.equal(analyzeFile(TEST_FILE, withThreeMocks).highMockRenderTests, null)
    assert.equal(analyzeFile(TEST_FILE, mocksWithoutRender).highMockRenderTests, null)
    assert.equal(analyzeFile(TEST_FILE, screenOnly).highMockRenderTests, null)
  })

  it('treats a namespace testing-library import as render usage', () => {
    const source = `
      import * as rtl from '@testing-library/react'
      jest.mock('a')
      jest.mock('b')
      jest.mock('c')
      jest.mock('d')
    `
    assert.equal(analyzeFile(TEST_FILE, source).highMockRenderTests, 4)
  })
})

describe('analyzeFile atom alias hooks', () => {
  it('counts a hook that only forwards useAtomValue, useSetAtom, or useAtom', () => {
    const source = `
      import { useAtom, useAtomValue, useSetAtom } from 'jotai'
      import { volumeFeeAtom } from '../state/volumeFeeAtom'
      import type { TradeDerivedState } from '../types'

      // TODO: Add proper return type annotation
      export function useVolumeFee() {
        return useAtomValue(volumeFeeAtom)
      }

      export function useDerivedTradeState(): TradeDerivedState | null {
        return useAtomValue(derivedTradeStateAtom)
      }

      export function useTokenListAddingError() {
        return useAtom(tokenListAddingErrorAtom)
      }

      export const useReset = (): (() => void) => {
        return useSetAtom(resetAtom)
      }

      export const useDirect = () => useAtomValue(directAtom)
    `
    assert.equal(analyzeFile(HOOK_FILE, source).atomAliasHooks, 5)
  })

  it('ignores projections, indexes, atom families, and unit tests, and still counts a returned temporary', () => {
    const source = `
      export function useInjectedWidgetParams(): Partial<CowSwapWidgetAppParams> {
        return useAtomValue(injectedWidgetParamsAtom).params
      }

      export function useWidgetPartnerFee(): PartnerFee | undefined {
        return useAtomValue(injectedWidgetPartnerFeeAtom)
      }

      export function useBlockNumber(): number | undefined {
        const { chainId } = useWalletInfo()
        return useAtomValue(blockNumberByChainIdAtom)[chainId]
      }

      export function useFamily(id: string) {
        return useAtomValue(family(id))
      }

      export function useWithFallback() {
        return useAtomValue(valueAtom) ?? null
      }

      export function useHeld() {
        const value = useAtomValue(valueAtom)
        return value
      }
    `
    assert.equal(analyzeFile(HOOK_FILE, source).atomAliasHooks, 2)

    const testSource = `
      export function useVolumeFee() {
        return useAtomValue(volumeFeeAtom)
      }
    `
    assert.equal(analyzeFile(TEST_FILE, testSource).atomAliasHooks, 0)
  })

  it('fails a new alias file and an increased alias count', () => {
    const current = collectFromSources([
      {
        relPath: HOOK_FILE,
        source: `
          export function useVolumeFee() {
            return useAtomValue(volumeFeeAtom)
          }
          export function useOther() {
            return useSetAtom(otherAtom)
          }
        `,
      },
    ])
    const baseline = emptySnapshot()
    baseline.atomAliasHooks[HOOK_FILE] = 2
    assert.equal(diffBaseline(current, baseline).length, 0)

    baseline.atomAliasHooks[HOOK_FILE] = 1
    const increased = diffBaseline(current, baseline)
    assert.equal(increased.length, 1)
    assert.match(increased[0], /grew from 1 to 2/)

    const fresh = diffBaseline(current, emptySnapshot())
    assert.equal(fresh.length, 1)
    assert.match(fresh[0], /useAtomValue, useSetAtom, or useAtom/)
  })
})

describe('diffBaseline', () => {
  it('fails new files and increased counts, and allows equal or lower counts', () => {
    const current = collectFromSources([
      {
        relPath: STATE_FILE,
        source: `import { Order, OrderStatus } from 'legacy/state/orders/actions'`,
      },
      {
        relPath: HOOK_FILE,
        source: `
          import { useEffect } from 'react'
          import { useA } from './useA'
          import { useB } from './useB'
          import { useC } from './useC'
          import { useD } from './useD'
        `,
      },
    ])
    const baseline = emptySnapshot()
    baseline.legacyStateImportBindings[STATE_FILE] = 2
    baseline.hookOrchestration[HOOK_FILE] = 5

    const errors = diffBaseline(current, baseline)
    assert.equal(errors.length, 0)

    baseline.legacyStateImportBindings[STATE_FILE] = 1
    const increased = diffBaseline(current, baseline)
    assert.equal(increased.length, 1)
    assert.match(increased[0], /grew from 1 to 2/)

    const fresh = diffBaseline(current, emptySnapshot())
    assert.equal(fresh.length, 2)
    assert.match(fresh[0], /Jotai atom/)
    assert.match(fresh[1], /pure function/)
  })
})
