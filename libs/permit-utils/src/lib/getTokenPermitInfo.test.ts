import { estimateGas } from 'wagmi/actions'

import { getPermitUtilsInstance } from './getPermitUtilsInstance'
import { getTokenPermitInfo } from './getTokenPermitInfo'

import { buildEip2612PermitCallData } from '../utils/buildPermitCallData'
import { getEip712Domain } from '../utils/getEip712Domain'

import type { GetTokenPermitInfoParams } from '../types'
import type { Address } from 'viem'
import type { Config } from 'wagmi'

jest.mock('../const', () => ({
  DEFAULT_MIN_GAS_LIMIT: 50000n,
  DEFAULT_PERMIT_VALUE: 1n,
  PERMIT_ACCOUNT: {
    address: '0x0000000000000000000000000000000000000001',
  },
}))

jest.mock('./getPermitUtilsInstance', () => ({
  getPermitUtilsInstance: jest.fn(),
}))

jest.mock('../utils/getEip712Domain', () => ({
  getEip712Domain: jest.fn(),
}))

jest.mock('../utils/buildPermitCallData', () => ({
  buildEip2612PermitCallData: jest.fn(),
  buildDaiLikePermitCallData: jest.fn(),
}))

jest.mock('wagmi/actions', () => ({
  estimateGas: jest.fn(),
}))

const mockedEstimateGas = estimateGas as jest.MockedFunction<typeof estimateGas>
const mockedGetPermitUtilsInstance = getPermitUtilsInstance as jest.MockedFunction<typeof getPermitUtilsInstance>
const mockedGetEip712Domain = getEip712Domain as jest.MockedFunction<typeof getEip712Domain>
const mockedBuildEip2612PermitCallData = buildEip2612PermitCallData as jest.MockedFunction<
  typeof buildEip2612PermitCallData
>

describe('getTokenPermitInfo request cache', () => {
  const config = {} as Config
  const publicClient = {}
  const spender = '0x3333333333333333333333333333333333333333'
  const otherSpender = '0x4444444444444444444444444444444444444444'

  function createParams(tokenAddress: Address, currentSpender = spender): GetTokenPermitInfoParams {
    return {
      tokenAddress,
      chainId: 1,
      spender: currentSpender,
      config,
      publicClient,
      minGasLimit: 50000n,
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()

    mockedGetPermitUtilsInstance.mockResolvedValue({
      getTokenNonce: jest.fn().mockResolvedValue(7),
    } as Awaited<ReturnType<typeof getPermitUtilsInstance>>)
    mockedGetEip712Domain.mockResolvedValue({ name: 'Test Token', version: '1' })
    mockedBuildEip2612PermitCallData.mockResolvedValue('0xpermit')
    mockedEstimateGas.mockResolvedValue(60000n)
  })

  it('reuses the in-flight request when the spender is unchanged', async () => {
    const tokenAddress = '0x1111111111111111111111111111111111111111' as Address

    await Promise.all([getTokenPermitInfo(createParams(tokenAddress)), getTokenPermitInfo(createParams(tokenAddress))])

    expect(mockedBuildEip2612PermitCallData).toHaveBeenCalledTimes(1)
    expect(mockedEstimateGas).toHaveBeenCalledTimes(1)
  })

  it('does not reuse the in-flight request when the spender changes', async () => {
    const tokenAddress = '0x2222222222222222222222222222222222222222' as Address

    await Promise.all([
      getTokenPermitInfo(createParams(tokenAddress)),
      getTokenPermitInfo(createParams(tokenAddress, otherSpender)),
    ])

    expect(mockedBuildEip2612PermitCallData).toHaveBeenCalledTimes(2)
    expect(mockedEstimateGas).toHaveBeenCalledTimes(2)
  })
})
