import { BaseError, ExecutionRevertedError } from 'viem'
import type { Config } from 'wagmi'
import { estimateGas } from 'wagmi/actions'

import { generatePermitHook } from './generatePermitHook'

import { PermitHookParams } from '../types'

import type { Eip2612PermitUtils } from '@1inch/permit-signed-approvals-utils'

const DEFAULT_PERMIT_GAS_LIMIT = 130_000n

jest.mock('wagmi/actions', () => ({
  estimateGas: jest.fn(),
}))

jest.mock('../const', () => ({
  DEFAULT_PERMIT_DURATION: 3_600,
  DEFAULT_PERMIT_GAS_LIMIT: 130_000n,
  DEFAULT_PERMIT_VALUE: 1n,
  PERMIT_ACCOUNT: {
    address: '0x4444444444444444444444444444444444444444',
  },
}))

jest.mock('..', () => ({
  oneInchPermitUtilsConsts: {
    DAI_PERMIT_SELECTOR: '0x8fcbaf0c',
    EIP_2612_PERMIT_SELECTOR: '0xd505accf',
  },
}))

const mockEstimateGas = estimateGas as jest.MockedFunction<typeof estimateGas>
const mockBuildPermitCallData = jest.fn()

function getPermitParams(): PermitHookParams {
  return {
    account: '0x1111111111111111111111111111111111111111',
    amount: 1n,
    chainId: 1,
    config: {} as Config,
    eip2612Utils: {
      buildPermitCallData: mockBuildPermitCallData,
    } as unknown as Eip2612PermitUtils,
    inputToken: {
      address: '0x2222222222222222222222222222222222222222',
      name: 'Test Token',
    },
    nonce: 0,
    permitInfo: {
      name: 'Test Token',
      type: 'eip-2612',
      version: '1',
    },
    spender: '0x3333333333333333333333333333333333333333',
  }
}

describe('generatePermitHook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockBuildPermitCallData.mockResolvedValue('0x1234')
  })

  it('returns the signed permit when its exact execution can be estimated', async () => {
    mockEstimateGas.mockResolvedValue(500_000n)

    await expect(generatePermitHook(getPermitParams())).resolves.toEqual(
      expect.objectContaining({
        gasLimit: '500000',
      }),
    )
  })

  it('propagates a confirmed permit execution revert for the user account', async () => {
    const revertError = new ExecutionRevertedError({ message: 'invalid signature' })
    mockEstimateGas.mockRejectedValue(new BaseError('Gas estimation failed', { cause: revertError }))

    await expect(generatePermitHook(getPermitParams())).rejects.toBe(revertError)
  })

  it('keeps the existing default gas fallback for non-revert estimation errors', async () => {
    mockEstimateGas.mockRejectedValue(new BaseError('RPC unavailable'))

    await expect(generatePermitHook(getPermitParams())).resolves.toEqual(
      expect.objectContaining({
        gasLimit: DEFAULT_PERMIT_GAS_LIMIT.toString(),
      }),
    )
  })

  it('continues to propagate wallet rejection errors', async () => {
    mockBuildPermitCallData.mockRejectedValue({ code: 4001, message: 'User rejected' })

    await expect(generatePermitHook(getPermitParams())).rejects.toEqual(
      expect.objectContaining({
        code: 4001,
      }),
    )
  })
})
