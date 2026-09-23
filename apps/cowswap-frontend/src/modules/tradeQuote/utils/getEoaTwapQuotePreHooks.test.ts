import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { POLL_FUNDS_HOOK_GAS_LIMIT } from 'entities/twap/composable-cow-poller.constants'

import { type EoaTwapQuotePreHookParams, getEoaTwapQuotePreHooks } from './getEoaTwapQuotePreHooks'

const EOA_TWAP: EoaTwapQuotePreHookParams = {
  orderClass: 'twap',
  isTwapEoaEnabled: true,
  isEoa: true,
  chainId: SupportedChainId.MAINNET,
}

const EXPECTED_QUOTE_HOOK = {
  target: '0x0000000000000000000000000000000000000000',
  callData: '0x',
  gasLimit: POLL_FUNDS_HOOK_GAS_LIMIT,
}

describe('getEoaTwapQuotePreHooks', () => {
  it('returns a stable no-op hook for an EOA TWAP on an EVM chain', () => {
    const hooks = getEoaTwapQuotePreHooks(EOA_TWAP)

    expect(hooks).toEqual([EXPECTED_QUOTE_HOOK])
    expect(getEoaTwapQuotePreHooks(EOA_TWAP)).toBe(hooks)
  })

  it.each([
    ['the feature flag is off', { isTwapEoaEnabled: false }],
    ['the wallet is not an EOA', { isEoa: false }],
    ['the order class is market', { orderClass: 'market' }],
    ['the order class is limit', { orderClass: 'limit' }],
    ['there is no chain', { chainId: undefined }],
    ['the chain is not EVM', { chainId: SupportedChainId.SOLANA }],
  ] satisfies Array<[string, Partial<EoaTwapQuotePreHookParams>]>)('returns undefined when %s', (_label, override) => {
    expect(getEoaTwapQuotePreHooks({ ...EOA_TWAP, ...override })).toBeUndefined()
  })
})
