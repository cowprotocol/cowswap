import { decodeFunctionData, erc20Abi } from 'viem'
import type { Config } from 'wagmi'

import { COW_TOKEN_TO_CHAIN, WETH_SEPOLIA } from '@cowprotocol/common-const'
import { areAddressesEqual, SupportedChainId, ZERO_ADDRESS } from '@cowprotocol/cow-sdk'
import { ComposableCoWAbi, GPv2SettlementAbi } from '@cowprotocol/cowswap-abis'
import { CurrencyAmount } from '@cowprotocol/currency'

import { COMPOSABLE_COW_ADDRESS, CURRENT_BLOCK_FACTORY_ADDRESS } from 'modules/advancedOrders'
import { getAppData } from 'modules/appData'

import { getSafeTwapOrderTxs } from './placeSafeTwapOrder'

import { ExtensibleFallbackContext } from '../../../hooks/useExtensibleFallbackContext'
import { TwapOrderCreationContext } from '../../../hooks/useTwapOrderCreationContext'
import { TWAPOrder } from '../../../types'
import { buildTwapOrderParamsStruct } from '../../../utils/buildTwapOrderParamsStruct'
import { extensibleFallbackSetupTxs } from '../../extensibleFallbackSetupTxs'

jest.mock('../../extensibleFallbackSetupTxs')
jest.mock('modules/permit')

const mockExtensibleFallbackSetupTxs = extensibleFallbackSetupTxs as jest.MockedFunction<
  typeof extensibleFallbackSetupTxs
>

const APP_DATA_HASH = getAppData().appDataKeccak256

const chainId = SupportedChainId.SEPOLIA
const COW_SEPOLIA = COW_TOKEN_TO_CHAIN[chainId]

if (!COW_SEPOLIA) {
  throw new Error(`COW token not found for chain ${chainId}`)
}

const SAFE_ADDRESS = '0x360Ba61Bc799edfa01e306f1eCCb2F6e0C3C8c8e'
const AMOUNT_TO_APPROVE = 123_456_789n

const order: TWAPOrder = {
  sellAmount: CurrencyAmount.fromRawAmount(COW_SEPOLIA, 100_000_000_000),
  buyAmount: CurrencyAmount.fromRawAmount(WETH_SEPOLIA, 200_000),
  receiver: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
  numOfParts: 3,
  startTime: 1684764716,
  timeInterval: 600,
  span: 0,
  appData: APP_DATA_HASH,
}

const fallbackSetupTxs = [
  {
    to: SAFE_ADDRESS,
    data: '0xfallback1',
    value: '0',
    operation: 0,
  },
  {
    to: SAFE_ADDRESS,
    data: '0xfallback2',
    value: '0',
    operation: 0,
  },
]

describe('getSafeTwapOrderTxs', () => {
  let twapOrderCreationContext: TwapOrderCreationContext
  let extensibleFallbackContext: ExtensibleFallbackContext

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockImplementation(() => 1497076708000)
    mockExtensibleFallbackSetupTxs.mockResolvedValue(fallbackSetupTxs)

    twapOrderCreationContext = {
      chainId,
      composableCowContract: {
        abi: ComposableCoWAbi,
        address: COMPOSABLE_COW_ADDRESS[chainId],
        chainId,
      },
      needsApproval: false,
      needsZeroApproval: false,
      spender: '0x9008D19f58AAbD9eD0D60971565AA8510560ab41',
      currentBlockFactoryAddress: CURRENT_BLOCK_FACTORY_ADDRESS[chainId],
      erc20Contract: {
        chainId,
        contract: null,
      },
    }

    extensibleFallbackContext = {
      chainId,
      config: {} as Config,
      safeAddress: SAFE_ADDRESS,
      settlementContract: {
        abi: GPv2SettlementAbi,
        address: ZERO_ADDRESS,
        chainId,
      },
    }
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('When sell token is approved, then should generate only creation transaction', async () => {
    const paramsStruct = buildTwapOrderParamsStruct(chainId, order)
    const result = await getSafeTwapOrderTxs({
      twapOrder: order,
      twapOrderCreationContext: { ...twapOrderCreationContext, needsApproval: false },
      paramsStruct,
      fallbackHandlerIsNotSet: false,
      extensibleFallbackContext,
      amountToApprove: AMOUNT_TO_APPROVE,
    })

    expect(result).toHaveLength(1)
    expect(result[0].to).toBe(COMPOSABLE_COW_ADDRESS[chainId])
    expect(result[0].data).toMatch(/^0x[a-fA-F0-9]+$/)
    expect(mockExtensibleFallbackSetupTxs).not.toHaveBeenCalled()
  })

  it('When sell token is NOT approved, then should generate approval and creation transactions', async () => {
    const paramsStruct = buildTwapOrderParamsStruct(chainId, order)
    const result = await getSafeTwapOrderTxs({
      twapOrder: order,
      twapOrderCreationContext: { ...twapOrderCreationContext, needsApproval: true },
      paramsStruct,
      fallbackHandlerIsNotSet: false,
      extensibleFallbackContext,
      amountToApprove: AMOUNT_TO_APPROVE,
    })

    expect(result).toHaveLength(2)
    expect(areAddressesEqual(result[0].to, order.sellAmount.currency.address)).toBe(true)
    expect(result[1].to).toBe(COMPOSABLE_COW_ADDRESS[chainId])
  })

  it('uses the given amountToApprove for the approve tx instead of an unlimited amount', async () => {
    const paramsStruct = buildTwapOrderParamsStruct(chainId, order)
    const result = await getSafeTwapOrderTxs({
      twapOrder: order,
      twapOrderCreationContext: { ...twapOrderCreationContext, needsApproval: true },
      paramsStruct,
      fallbackHandlerIsNotSet: false,
      extensibleFallbackContext,
      amountToApprove: AMOUNT_TO_APPROVE,
    })

    const { functionName, args } = decodeFunctionData({ abi: erc20Abi, data: result[0].data as `0x${string}` })
    expect(functionName).toBe('approve')
    expect(args[1]).toBe(AMOUNT_TO_APPROVE)
  })

  it('When sell token is NOT approved AND token needs zero approval, then should generate 2 approvals and creation transactions', async () => {
    const paramsStruct = buildTwapOrderParamsStruct(chainId, order)
    const result = await getSafeTwapOrderTxs({
      twapOrder: order,
      twapOrderCreationContext: {
        ...twapOrderCreationContext,
        needsApproval: true,
        needsZeroApproval: true,
      },
      paramsStruct,
      fallbackHandlerIsNotSet: false,
      extensibleFallbackContext,
      amountToApprove: AMOUNT_TO_APPROVE,
    })

    expect(result).toHaveLength(3)
    expect(areAddressesEqual(result[0].to, order.sellAmount.currency.address)).toBe(true)
    expect(areAddressesEqual(result[1].to, order.sellAmount.currency.address)).toBe(true)
    expect(result[2].to).toBe(COMPOSABLE_COW_ADDRESS[chainId])
  })

  it('When fallback handler is not set, then should prepend fallback setup transactions', async () => {
    const paramsStruct = buildTwapOrderParamsStruct(chainId, order)
    const result = await getSafeTwapOrderTxs({
      twapOrder: order,
      twapOrderCreationContext: { ...twapOrderCreationContext, needsApproval: true },
      paramsStruct,
      fallbackHandlerIsNotSet: true,
      extensibleFallbackContext,
      amountToApprove: AMOUNT_TO_APPROVE,
    })

    expect(result).toHaveLength(4)
    expect(result[0]).toEqual(fallbackSetupTxs[0])
    expect(result[1]).toEqual(fallbackSetupTxs[1])
    expect(areAddressesEqual(result[2].to, order.sellAmount.currency.address)).toBe(true)
    expect(result[3].to).toBe(COMPOSABLE_COW_ADDRESS[chainId])
    expect(mockExtensibleFallbackSetupTxs).toHaveBeenCalledWith(extensibleFallbackContext)
  })
})
