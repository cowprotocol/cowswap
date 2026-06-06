import { Address } from 'viem'
import { estimateGas } from 'wagmi/actions'

import { generatePermitHook } from './generatePermitHook'

import { buildEip2612PermitCallData } from '../utils/buildPermitCallData'

import type { PermitHookParams } from '../types'
import type { Config } from 'wagmi'

jest.mock('../const', () => ({
  DEFAULT_PERMIT_GAS_LIMIT: 50000n,
  DEFAULT_PERMIT_VALUE: 1n,
  PERMIT_ACCOUNT: {
    address: '0x0000000000000000000000000000000000000001',
  },
}))

jest.mock('wagmi/actions', () => ({
  estimateGas: jest.fn(),
}))

jest.mock('../utils/buildPermitCallData', () => ({
  buildEip2612PermitCallData: jest.fn(),
  buildDaiLikePermitCallData: jest.fn(),
}))

const mockEstimateGas = estimateGas as jest.MockedFunction<typeof estimateGas>
const mockBuildEip2612PermitCallData = buildEip2612PermitCallData as jest.MockedFunction<
  typeof buildEip2612PermitCallData
>

describe('generatePermitHook request cache', () => {
  const config = {} as Config
  const tokenAddress = '0x1111111111111111111111111111111111111111' as Address
  const account = '0x2222222222222222222222222222222222222222' as Address
  const spender = '0x3333333333333333333333333333333333333333'
  const otherSpender = '0x4444444444444444444444444444444444444444'

  const eip2612Utils = {
    getTokenNonce: jest.fn().mockResolvedValue(7),
  }

  function createParams(customSpender = spender): PermitHookParams {
    return {
      chainId: 1,
      config,
      eip2612Utils: eip2612Utils as unknown as PermitHookParams['eip2612Utils'],
      inputToken: {
        address: tokenAddress,
        name: 'Test Token',
      },
      permitInfo: {
        type: 'eip-2612',
        name: 'Test Token',
        version: '1',
      },
      spender: customSpender,
      account,
      amount: 123n,
      nonce: 7,
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()

    mockEstimateGas.mockResolvedValue(45000n)
    mockBuildEip2612PermitCallData.mockResolvedValue('0xpermit')
  })

  it('reuses the in-flight request when the spender is unchanged', async () => {
    const [first, second] = await Promise.all([generatePermitHook(createParams()), generatePermitHook(createParams())])

    expect(first).toEqual(second)
    expect(mockBuildEip2612PermitCallData).toHaveBeenCalledTimes(1)
  })

  it('does not reuse the in-flight request when the spender changes', async () => {
    await Promise.all([generatePermitHook(createParams()), generatePermitHook(createParams(otherSpender))])

    expect(mockBuildEip2612PermitCallData).toHaveBeenCalledTimes(2)
  })
})
