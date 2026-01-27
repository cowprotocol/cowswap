import { COW_PROTOCOL_VAULT_RELAYER_ADDRESS, SupportedChainId } from '@cowprotocol/cow-sdk'
import { Erc20__factory } from '@cowprotocol/cowswap-abis'
import { oneInchPermitUtilsConsts } from '@cowprotocol/permit-utils'
import { Interface } from '@ethersproject/abi'
import { BigNumber as EthersBigNumber } from '@ethersproject/bignumber'
import { MaxUint256 } from '@ethersproject/constants'

import BigNumber from 'bignumber.js'
import JSBI from 'jsbi'

import { getOrderPermitAmount } from './getOrderPermitAmount'
import { ParsedOrder } from './parseOrder'

const erc20Interface = Erc20__factory.createInterface()
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const daiInterface = new Interface(oneInchPermitUtilsConsts.DAI_EIP_2612_PERMIT_ABI as any)

// eslint-disable-next-line max-lines-per-function
describe('getOrderPermitAmount', () => {
  const chainId = SupportedChainId.MAINNET
  const spenderAddress = COW_PROTOCOL_VAULT_RELAYER_ADDRESS[chainId].toLowerCase()
  const ownerAddress = '0x1234567890123456789012345678901234567890'
  const futureDeadline = Math.floor(Date.now() / 1000) + 86400 // 24 hours from now
  const pastDeadline = Math.floor(Date.now() / 1000) - 86400 // 24 hours ago
  const permitValue = EthersBigNumber.from('1000000000000000000') // 1 token

  const baseOrder: Partial<ParsedOrder> = {
    id: 'test-order-id',
    owner: ownerAddress,
    inputToken: {
      address: '0xToken',
      chainId: 1,
      decimals: 18,
      symbol: 'TEST',
      name: 'Test Token',
    } as ParsedOrder['inputToken'],
    outputToken: {} as ParsedOrder['outputToken'],
    sellAmount: '1000000000000000000',
    buyAmount: '2000000000000000000',
    feeAmount: '0',
    kind: 'sell' as ParsedOrder['kind'],
    class: 'market' as ParsedOrder['class'],
    status: 'pending' as ParsedOrder['status'],
    partiallyFillable: false,
    creationTime: new Date(),
    expirationTime: new Date(),
    signingScheme: 'eip712' as ParsedOrder['signingScheme'],
    executionData: {
      filledAmount: new BigNumber(0),
      filledPercentage: new BigNumber(0),
      filledPercentDisplay: '0',
      executedBuyAmount: JSBI.BigInt(0),
      executedSellAmount: JSBI.BigInt(0),
      fullyFilled: false,
      partiallyFilled: false,
      surplusAmount: new BigNumber(0),
      surplusPercentage: new BigNumber(0),
      executedFeeAmount: undefined,
      executedFee: null,
      executedFeeToken: null,
      totalFee: null,
      executedPrice: null,
      activityId: undefined,
      activityTitle: 'Order ID',
    },
  }

  function createEip2612PermitCallData(
    owner: string,
    spender: string,
    value: EthersBigNumber,
    deadline: number,
  ): string {
    const permitData = erc20Interface.encodeFunctionData('permit', [
      owner,
      spender,
      value,
      deadline,
      0, // v
      '0x0000000000000000000000000000000000000000000000000000000000000000', // r
      '0x0000000000000000000000000000000000000000000000000000000000000000', // s
    ])
    // Replace standard permit selector (first 10 chars: 0x + 4 bytes) with EIP_2612_PERMIT_SELECTOR
    return oneInchPermitUtilsConsts.EIP_2612_PERMIT_SELECTOR + permitData.slice(10)
  }

  function createDaiPermitCallData(
    holder: string,
    spender: string,
    nonce: number,
    expiry: number,
    allowed: boolean,
  ): string {
    const permitData = daiInterface.encodeFunctionData('permit', [
      holder,
      spender,
      nonce,
      expiry,
      allowed,
      0, // v
      '0x0000000000000000000000000000000000000000000000000000000000000000', // r
      '0x0000000000000000000000000000000000000000000000000000000000000000', // s
    ])
    // Replace standard permit selector (first 10 chars: 0x + 4 bytes) with DAI_PERMIT_SELECTOR
    return oneInchPermitUtilsConsts.DAI_PERMIT_SELECTOR + permitData.slice(10)
  }

  describe('when order has no fullAppData', () => {
    it('should return null', () => {
      const order = {
        ...baseOrder,
        fullAppData: null,
      } as ParsedOrder

      const result = getOrderPermitAmount(chainId, order)

      expect(result).toBeNull()
    })

    it('should return null when fullAppData is undefined', () => {
      const order = {
        ...baseOrder,
        fullAppData: undefined,
      } as ParsedOrder

      const result = getOrderPermitAmount(chainId, order)

      expect(result).toBeNull()
    })
  })

  describe('when appData has no preHooks', () => {
    it('should return null', () => {
      const order = {
        ...baseOrder,
        fullAppData: JSON.stringify({
          metadata: {},
        }),
      } as ParsedOrder

      const result = getOrderPermitAmount(chainId, order)

      expect(result).toBeNull()
    })

    it('should return null when hooks is undefined', () => {
      const order = {
        ...baseOrder,
        fullAppData: JSON.stringify({
          metadata: {
            hooks: {},
          },
        }),
      } as ParsedOrder

      const result = getOrderPermitAmount(chainId, order)

      expect(result).toBeNull()
    })
  })

  describe('EIP-2612 permit', () => {
    it('should return permit value when permit is valid', () => {
      const callData = createEip2612PermitCallData(ownerAddress, spenderAddress, permitValue, futureDeadline)
      const order = {
        ...baseOrder,
        fullAppData: JSON.stringify({
          metadata: {
            hooks: {
              pre: [
                {
                  target: baseOrder.inputToken?.address,
                  callData,
                },
              ],
            },
          },
        }),
      } as ParsedOrder

      const result = getOrderPermitAmount(chainId, order)

      expect(result).not.toBeNull()
      expect(result?.toString()).toBe(permitValue.toString())
    })

    it('should return null when spender does not match', () => {
      const wrongSpender = '0x9999999999999999999999999999999999999999'
      const callData = createEip2612PermitCallData(ownerAddress, wrongSpender, permitValue, futureDeadline)
      const order = {
        ...baseOrder,
        fullAppData: JSON.stringify({
          metadata: {
            hooks: {
              pre: [
                {
                  target: baseOrder.inputToken?.address,
                  callData,
                },
              ],
            },
          },
        }),
      } as ParsedOrder

      const result = getOrderPermitAmount(chainId, order)

      expect(result).toBeNull()
    })

    it('should return null when owner does not match', () => {
      const wrongOwner = '0x9999999999999999999999999999999999999999'
      const callData = createEip2612PermitCallData(wrongOwner, spenderAddress, permitValue, futureDeadline)
      const order = {
        ...baseOrder,
        fullAppData: JSON.stringify({
          metadata: {
            hooks: {
              pre: [
                {
                  target: baseOrder.inputToken?.address,
                  callData,
                },
              ],
            },
          },
        }),
      } as ParsedOrder

      const result = getOrderPermitAmount(chainId, order)

      expect(result).toBeNull()
    })

    it('should return null when deadline has expired', () => {
      const callData = createEip2612PermitCallData(ownerAddress, spenderAddress, permitValue, pastDeadline)
      const order = {
        ...baseOrder,
        fullAppData: JSON.stringify({
          metadata: {
            hooks: {
              pre: [
                {
                  target: baseOrder.inputToken?.address,
                  callData,
                },
              ],
            },
          },
        }),
      } as ParsedOrder

      const result = getOrderPermitAmount(chainId, order)

      expect(result).toBeNull()
    })

    it('should continue to next hook when decoding fails', () => {
      const invalidCallData = oneInchPermitUtilsConsts.EIP_2612_PERMIT_SELECTOR + 'invalid'
      const validCallData = createEip2612PermitCallData(ownerAddress, spenderAddress, permitValue, futureDeadline)
      const order = {
        ...baseOrder,
        fullAppData: JSON.stringify({
          metadata: {
            hooks: {
              pre: [
                {
                  target: baseOrder.inputToken?.address,
                  callData: invalidCallData,
                },
                {
                  target: baseOrder.inputToken?.address,
                  callData: validCallData,
                },
              ],
            },
          },
        }),
      } as ParsedOrder

      const result = getOrderPermitAmount(chainId, order)

      expect(result).not.toBeNull()
      expect(result?.toString()).toBe(permitValue.toString())
    })
  })

  describe('DAI permit', () => {
    it('should return MaxUint256 when permit is valid', () => {
      const callData = createDaiPermitCallData(ownerAddress, spenderAddress, 0, futureDeadline, true)
      const order = {
        ...baseOrder,
        fullAppData: JSON.stringify({
          metadata: {
            hooks: {
              pre: [
                {
                  target: baseOrder.inputToken?.address,
                  callData,
                },
              ],
            },
          },
        }),
      } as ParsedOrder

      const result = getOrderPermitAmount(chainId, order)

      expect(result).not.toBeNull()
      expect(result?.toString()).toBe(MaxUint256.toString())
    })

    it('should return null when spender does not match', () => {
      const wrongSpender = '0x9999999999999999999999999999999999999999'
      const callData = createDaiPermitCallData(ownerAddress, wrongSpender, 0, futureDeadline, true)
      const order = {
        ...baseOrder,
        fullAppData: JSON.stringify({
          metadata: {
            hooks: {
              pre: [
                {
                  target: baseOrder.inputToken?.address,
                  callData,
                },
              ],
            },
          },
        }),
      } as ParsedOrder

      const result = getOrderPermitAmount(chainId, order)

      expect(result).toBeNull()
    })

    it('should return null when holder does not match', () => {
      const wrongHolder = '0x9999999999999999999999999999999999999999'
      const callData = createDaiPermitCallData(wrongHolder, spenderAddress, 0, futureDeadline, true)
      const order = {
        ...baseOrder,
        fullAppData: JSON.stringify({
          metadata: {
            hooks: {
              pre: [
                {
                  target: baseOrder.inputToken?.address,
                  callData,
                },
              ],
            },
          },
        }),
      } as ParsedOrder

      const result = getOrderPermitAmount(chainId, order)

      expect(result).toBeNull()
    })

    it('should return null when expiry has expired', () => {
      const callData = createDaiPermitCallData(ownerAddress, spenderAddress, 0, pastDeadline, true)
      const order = {
        ...baseOrder,
        fullAppData: JSON.stringify({
          metadata: {
            hooks: {
              pre: [
                {
                  target: baseOrder.inputToken?.address,
                  callData,
                },
              ],
            },
          },
        }),
      } as ParsedOrder

      const result = getOrderPermitAmount(chainId, order)

      expect(result).toBeNull()
    })

    it('should continue to next hook when decoding fails', () => {
      const invalidCallData = oneInchPermitUtilsConsts.DAI_PERMIT_SELECTOR + 'invalid'
      const validCallData = createDaiPermitCallData(ownerAddress, spenderAddress, 0, futureDeadline, true)
      const order = {
        ...baseOrder,
        fullAppData: JSON.stringify({
          metadata: {
            hooks: {
              pre: [
                {
                  target: baseOrder.inputToken?.address,
                  callData: invalidCallData,
                },
                {
                  target: baseOrder.inputToken?.address,
                  callData: validCallData,
                },
              ],
            },
          },
        }),
      } as ParsedOrder

      const result = getOrderPermitAmount(chainId, order)

      expect(result).not.toBeNull()
      expect(result?.toString()).toBe(MaxUint256.toString())
    })
  })
})
