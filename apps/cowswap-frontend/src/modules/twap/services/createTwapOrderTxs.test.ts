import { COW_TOKEN_TO_CHAIN, WETH_SEPOLIA } from '@cowprotocol/common-const'
import { SupportedChainId, ZERO_ADDRESS } from '@cowprotocol/cow-sdk'
import { ComposableCoWAbi } from '@cowprotocol/cowswap-abis'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { CURRENT_BLOCK_FACTORY_ADDRESS } from 'modules/advancedOrders'
import { getAppData } from 'modules/appData'

import { createTwapOrderTxs } from './createTwapOrderTxs'

import { TwapOrderCreationContext } from '../hooks/useTwapOrderCreationContext'
import { TWAPOrder } from '../types'
import { buildTwapOrderParamsStruct } from '../utils/buildTwapOrderParamsStruct'

jest.mock('modules/permit')
jest.mock('viem', () => {
  return {
    ...jest.requireActual('viem'),
    encodeFunctionData: jest.fn(),
  }
})

const APP_DATA_HASH = getAppData().appDataKeccak256

const chainId = SupportedChainId.SEPOLIA

if (!COW_TOKEN_TO_CHAIN[SupportedChainId.SEPOLIA]) {
  throw new Error(`COW token not found for chain ${SupportedChainId.SEPOLIA}`)
}

const order: TWAPOrder = {
  sellAmount: CurrencyAmount.fromRawAmount(COW_TOKEN_TO_CHAIN[SupportedChainId.SEPOLIA], 100_000_000_000),
  buyAmount: CurrencyAmount.fromRawAmount(WETH_SEPOLIA, 200_000),
  receiver: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
  numOfParts: 3,
  startTime: 1684764716,
  timeInterval: 600,
  span: 0,
  appData: APP_DATA_HASH,
}

describe('Create TWAP order', () => {
  let context: TwapOrderCreationContext

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockImplementation(() => 1497076708000)

    context = {
      chainId,
      composableCowContract: {
        abi: ComposableCoWAbi,
        address: ZERO_ADDRESS,
      },
      needsApproval: false,
      needsZeroApproval: false,
      spender: '0xB4FBF271143F4FBf7B91A5ded31805e42b222222',
      currentBlockFactoryAddress: CURRENT_BLOCK_FACTORY_ADDRESS[chainId],
    }
  })

  it('When sell token is approved, then should generate only creation transaction', () => {
    const paramsStruct = buildTwapOrderParamsStruct(chainId, order)
    const result = createTwapOrderTxs(order, paramsStruct, { ...context, needsApproval: false })

    expect(result.length).toBe(1)
  })

  it('When sell token is NOT approved, then should generate approval and creation transactions', () => {
    const paramsStruct = buildTwapOrderParamsStruct(chainId, order)
    const result = createTwapOrderTxs(order, paramsStruct, { ...context, needsApproval: true })

    expect(result.length).toBe(2)
  })

  it('When sell token is NOT approved AND token needs zero approval, then should generate 2 approvals and creation transactions', () => {
    const paramsStruct = buildTwapOrderParamsStruct(chainId, order)
    const result = createTwapOrderTxs(order, paramsStruct, { ...context, needsApproval: true, needsZeroApproval: true })

    expect(result.length).toBe(3)
  })
})
