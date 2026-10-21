import { encodeFunctionData } from 'viem'

import { Erc20Abi } from '@cowprotocol/cowswap-abis'
import { getPermitHookPlaceholder } from '@cowprotocol/permit-utils'

import { filterPermitPlaceholder } from './appDataFilter'

import { CowHook } from '../types'

const TOKEN = '0x3333333333333333333333333333333333333333'
const SPENDER = '0x1111111111111111111111111111111111111111'
const REAL_OWNER = '0x2222222222222222222222222222222222222222'
const LEGACY_PERMIT_SIGNER = '0xDa5F16F4ab0410096a4403e7223988649fac38cF'

function buildHook(callData: string): CowHook {
  return { target: TOKEN, callData, gasLimit: '80000' }
}

function buildPermitCallData(owner: string): string {
  return encodeFunctionData({
    abi: Erc20Abi,
    functionName: 'permit',
    args: [
      owner,
      SPENDER,
      1000000000000000000n,
      BigInt(Math.floor(Date.now() / 1000) + 86400),
      27,
      '0x1234567890123456789012345678901234567890123456789012345678901234',
      '0x1234567890123456789012345678901234567890123456789012345678901234',
    ],
  })
}

describe('filterPermitPlaceholder', () => {
  it('filters out the placeholder permit', () => {
    const placeholder = getPermitHookPlaceholder({
      tokenAddress: TOKEN,
      permitInfo: { type: 'eip-2612', version: '1', name: 'Token' },
      spender: SPENDER,
      owner: REAL_OWNER,
    })

    // Array.filter semantics: false means the hook is removed
    expect(filterPermitPlaceholder(buildHook(placeholder?.callData ?? ''))).toBe(false)
  })

  it('filters out a legacy permit signed by the former static key', () => {
    expect(filterPermitPlaceholder(buildHook(buildPermitCallData(LEGACY_PERMIT_SIGNER)))).toBe(false)
  })

  it('keeps a real permit owned by an actual account', () => {
    expect(filterPermitPlaceholder(buildHook(buildPermitCallData(REAL_OWNER)))).toBe(true)
  })

  it('keeps a non-permit hook', () => {
    expect(filterPermitPlaceholder(buildHook('0xdeadbeef'))).toBe(true)
  })
})
