import { decodeFunctionData, maxUint256, zeroAddress } from 'viem'

import { PERMIT_HOOK_DAPP_ID } from '@cowprotocol/hook-dapp-lib'

import { getPermitHookPlaceholder, isPermitHookPlaceholder } from './getPermitHookPlaceholder'

import {
  DAI_EIP_2612_PERMIT_ABI,
  DAI_PERMIT_SELECTOR,
  EIP_2612_PERMIT_ABI,
  EIP_2612_PERMIT_SELECTOR,
} from '../consts/1inchPermitUtils'

jest.mock('../const', () => ({
  DEFAULT_PERMIT_GAS_LIMIT: 160_000n,
  DEFAULT_PERMIT_VALUE: maxUint256,
}))

const TOKEN = '0x1111111111111111111111111111111111111111'
const SPENDER = '0x2222222222222222222222222222222222222222'
const OWNER = '0x3333333333333333333333333333333333333333'

describe('getPermitHookPlaceholder', () => {
  it('builds an eip-2612 permit call for the given owner and spender', () => {
    const hook = getPermitHookPlaceholder({
      tokenAddress: TOKEN,
      permitInfo: { type: 'eip-2612', version: '1', name: 'Token' },
      spender: SPENDER,
      owner: OWNER,
    })

    expect(hook).toMatchObject({
      target: TOKEN,
      gasLimit: '160000',
      dappId: PERMIT_HOOK_DAPP_ID,
    })
    expect(hook?.callData.startsWith(EIP_2612_PERMIT_SELECTOR)).toBe(true)

    const { args } = decodeFunctionData({ abi: EIP_2612_PERMIT_ABI, data: hook?.callData as `0x${string}` })

    expect(args.slice(0, 3)).toEqual([OWNER, SPENDER, maxUint256])
  })

  it('builds a dai-like permit call and uses the zero address when there is no owner', () => {
    const hook = getPermitHookPlaceholder({
      tokenAddress: TOKEN,
      permitInfo: { type: 'dai-like', name: 'Dai' },
      spender: SPENDER,
    })

    expect(hook?.callData.startsWith(DAI_PERMIT_SELECTOR)).toBe(true)

    const { args } = decodeFunctionData({ abi: DAI_EIP_2612_PERMIT_ABI, data: hook?.callData as `0x${string}` })

    expect(args.slice(0, 2)).toEqual([zeroAddress, SPENDER])
  })

  it('returns undefined for unsupported tokens', () => {
    const hook = getPermitHookPlaceholder({
      tokenAddress: TOKEN,
      permitInfo: { type: 'unsupported', name: 'Token' },
      spender: SPENDER,
    })

    expect(hook).toBeUndefined()
  })
})

describe('isPermitHookPlaceholder', () => {
  it('detects the placeholder call data', () => {
    const hook = getPermitHookPlaceholder({
      tokenAddress: TOKEN,
      permitInfo: { type: 'eip-2612', version: '1', name: 'Token' },
      spender: SPENDER,
      owner: OWNER,
    })

    expect(isPermitHookPlaceholder(hook?.callData ?? '')).toBe(true)
    expect(isPermitHookPlaceholder(hook?.callData.toUpperCase() ?? '')).toBe(true)
  })

  it('does not match other call data', () => {
    expect(isPermitHookPlaceholder(`${EIP_2612_PERMIT_SELECTOR}${'ab'.repeat(224)}`)).toBe(false)
  })
})
