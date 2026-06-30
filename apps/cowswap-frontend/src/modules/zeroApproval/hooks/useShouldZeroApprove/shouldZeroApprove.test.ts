import { BaseError } from 'viem'
import { simulateContract } from 'wagmi/actions'

import { shouldZeroApprove } from './shouldZeroApprove'

import type { Config } from 'wagmi'

jest.mock('wagmi/actions', () => ({
  simulateContract: jest.fn(),
}))

const simulateContractMock = simulateContract as jest.MockedFunction<typeof simulateContract>

const baseParams = {
  tokenAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7' as const,
  spender: '0xC92E8bdf79f0507f65a392b0ab4667716BFE0110' as const,
  // Only `quotient.toString()` is read by shouldZeroApprove
  amountToApprove: { quotient: { toString: () => '4' } } as never,
  config: {} as Config,
  forceApprove: true,
}

describe('shouldZeroApprove', () => {
  let errorSpy: jest.SpyInstance
  let warnSpy: jest.SpyInstance
  let debugSpy: jest.SpyInstance

  beforeEach(() => {
    jest.clearAllMocks()
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined)
    debugSpy = jest.spyOn(console, 'debug').mockImplementation(() => undefined)
  })

  afterEach(() => {
    errorSpy.mockRestore()
    warnSpy.mockRestore()
    debugSpy.mockRestore()
  })

  it('returns null when required params are missing', async () => {
    expect(await shouldZeroApprove({ ...baseParams, config: null })).toBe(null)
    expect(simulateContractMock).not.toHaveBeenCalled()
  })

  it('returns false when the approve simulation succeeds (no zero-approval needed)', async () => {
    simulateContractMock.mockResolvedValueOnce({} as never)

    expect(await shouldZeroApprove(baseParams)).toBe(false)
    expect(simulateContractMock).toHaveBeenCalledTimes(1)
  })

  it('detects USDT-style tokens without logging a scary error', async () => {
    // First (non-zero) approve reverts as USDT requires resetting the allowance to zero first,
    // the zero-amount approve then succeeds.
    simulateContractMock
      .mockRejectedValueOnce(new BaseError('The contract function "approve" reverted'))
      .mockResolvedValueOnce({} as never)

    expect(await shouldZeroApprove(baseParams)).toBe(true)
    expect(simulateContractMock).toHaveBeenCalledTimes(2)
    // The expected revert must not surface as a red console error.
    expect(errorSpy).not.toHaveBeenCalled()
    expect(debugSpy).toHaveBeenCalledTimes(1)
  })

  it('warns (not errors) and returns false when both simulations revert', async () => {
    simulateContractMock
      .mockRejectedValueOnce(new BaseError('first revert'))
      .mockRejectedValueOnce(new BaseError('second revert'))

    expect(await shouldZeroApprove(baseParams)).toBe(false)
    expect(errorSpy).not.toHaveBeenCalled()
    expect(warnSpy).toHaveBeenCalledTimes(1)
  })
})
