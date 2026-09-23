import { LATEST_APP_DATA_VERSION } from '@cowprotocol/cow-sdk'

import { POLL_FUNDS_HOOK_GAS_LIMIT } from 'entities/twap/composable-cow-poller.constants'

import type { AppDataInfo, CowHook } from 'modules/appData'

import { withAdditionalPreHooks } from './withAdditionalPreHooks'

const EXISTING_PRE_HOOK: CowHook = {
  target: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  callData: '0xdeadbeef',
  gasLimit: '100000',
}

const EXISTING_POST_HOOK: CowHook = {
  target: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
  callData: '0xcafebabe',
  gasLimit: '50000',
}

const QUOTE_HOOK: CowHook = {
  target: '0x0000000000000000000000000000000000000000',
  callData: '0x',
  gasLimit: POLL_FUNDS_HOOK_GAS_LIMIT,
}

function buildDoc(hooks?: AppDataInfo['doc']['metadata']['hooks']): AppDataInfo['doc'] {
  return {
    version: LATEST_APP_DATA_VERSION,
    appCode: 'CoW Swap',
    metadata: hooks ? { hooks } : {},
  }
}

describe('withAdditionalPreHooks', () => {
  it('returns the same document when there are no extra hooks', () => {
    const doc = buildDoc({ pre: [EXISTING_PRE_HOOK] })

    expect(withAdditionalPreHooks(doc, undefined)).toBe(doc)
    expect(withAdditionalPreHooks(doc, [])).toBe(doc)
    expect(withAdditionalPreHooks(undefined, [QUOTE_HOOK])).toBeUndefined()
  })

  it('prepends extra pre-hooks and keeps existing pre- and post-hooks', () => {
    const doc = buildDoc({ pre: [EXISTING_PRE_HOOK], post: [EXISTING_POST_HOOK] })

    const result = withAdditionalPreHooks(doc, [QUOTE_HOOK])

    expect(result?.metadata.hooks?.pre).toEqual([QUOTE_HOOK, EXISTING_PRE_HOOK])
    expect(result?.metadata.hooks?.post).toEqual([EXISTING_POST_HOOK])
  })

  it('adds a pre-hook list when the document has no hooks yet', () => {
    const result = withAdditionalPreHooks(buildDoc(), [QUOTE_HOOK])

    expect(result?.metadata.hooks?.pre).toEqual([QUOTE_HOOK])
    expect(result?.metadata.hooks?.post).toBeUndefined()
  })
})
