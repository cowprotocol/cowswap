import { Erc20Abi } from '@cowprotocol/cowswap-abis'
import { PERMIT_ACCOUNT } from '@cowprotocol/permit-utils'

import { encodeFunctionData } from 'viem'

import { filterPermitSignerPermit } from './appDataFilter'

import { CowHook } from '../types'

const SPENDER = '0x1111111111111111111111111111111111111111'
const REAL_OWNER = '0x2222222222222222222222222222222222222222'

function buildPermitCallData(owner: string): string {
  return encodeFunctionData({
    abi: Erc20Abi,
    functionName: 'permit',
    args: [
      owner,
      SPENDER,
      1000000000000000000n,
      BigInt(Math.floor(Date.now() / 1000) + 86400),
      0, // v
      '0x0000000000000000000000000000000000000000000000000000000000000000', // r
      '0x0000000000000000000000000000000000000000000000000000000000000000', // s
    ],
  })
}

function buildHook(callData: string): CowHook {
  return { target: '0xToken', callData, gasLimit: '80000' }
}

describe('filterPermitSignerPermit', () => {
  it('filters out the account agnostic permit (owner === PERMIT_ACCOUNT)', () => {
    const hook = buildHook(buildPermitCallData(PERMIT_ACCOUNT.address))

    // Array.filter semantics: false means the hook is removed
    expect(filterPermitSignerPermit(hook)).toBe(false)
  })

  it('keeps a real permit owned by an actual account', () => {
    const hook = buildHook(buildPermitCallData(REAL_OWNER))

    expect(filterPermitSignerPermit(hook)).toBe(true)
  })

  it('keeps a non-permit hook', () => {
    const hook = buildHook('0xdeadbeef')

    expect(filterPermitSignerPermit(hook)).toBe(true)
  })
})
