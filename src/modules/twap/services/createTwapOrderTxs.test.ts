import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { COW } from 'legacy/constants/tokens'
import { WETH_GOERLI } from 'legacy/utils/goerli/constants'

import { COMPOSABLE_COW_ADDRESS, CURRENT_BLOCK_FACTORY_ADDRESS } from 'modules/advancedOrders'
import { getAppDataHash } from 'modules/appData'

import { createTwapOrderTxs } from './createTwapOrderTxs'

import { TwapOrderCreationContext } from '../hooks/useTwapOrderCreationContext'
import { TWAPOrder } from '../types'
import { buildTwapOrderParamsStruct } from '../utils/buildTwapOrderParamsStruct'

const chainId = SupportedChainId.GOERLI

const order: TWAPOrder = {
  sellAmount: CurrencyAmount.fromRawAmount(COW[SupportedChainId.GOERLI], 100_000_000_000),
  buyAmount: CurrencyAmount.fromRawAmount(WETH_GOERLI, 200_000),
  receiver: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
  numOfParts: 3,
  startTime: 1684764716,
  timeInterval: 600,
  span: 0,
  appData: getAppDataHash(),
}

const CREATE_COW_TX_DATA = '0xCREATE_COW_TX_DATA'
const APPROVE_TX_DATA = '0xAPPROVE_TX_DATA'

describe('Create TWAP order', () => {
  let context: TwapOrderCreationContext
  let createCowFn: jest.Mock
  let approveFn: jest.Mock

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockImplementation(() => 1497076708000)

    createCowFn = jest.fn().mockReturnValue(CREATE_COW_TX_DATA)
    approveFn = jest.fn().mockReturnValue(APPROVE_TX_DATA)

    context = {
      composableCowContract: {
        interface: { encodeFunctionData: createCowFn },
        address: COMPOSABLE_COW_ADDRESS[chainId],
      } as any,
      needsApproval: false,
      spender: '0xB4FBF271143F4FBf7B91A5ded31805e42b222222',
      currentBlockFactoryAddress: CURRENT_BLOCK_FACTORY_ADDRESS[chainId],
      erc20Contract: { interface: { encodeFunctionData: approveFn } } as any,
    }
  })

  it('When sell token is approved, then should generate only creation transaction', () => {
    const paramsStruct = buildTwapOrderParamsStruct(chainId, order)
    const result = createTwapOrderTxs(order, paramsStruct, { ...context, needsApproval: false })

    expect(createCowFn).toHaveBeenCalledTimes(1)
    expect(createCowFn.mock.calls[0]).toMatchSnapshot()

    expect(result.length).toBe(1)
    expect(result).toMatchSnapshot()
  })

  it('When sell token is NOT approved, then should generate approval and creation transactions', () => {
    const paramsStruct = buildTwapOrderParamsStruct(chainId, order)
    const result = createTwapOrderTxs(order, paramsStruct, { ...context, needsApproval: true })

    expect(createCowFn).toHaveBeenCalledTimes(1)
    expect(createCowFn.mock.calls[0]).toMatchSnapshot()

    expect(approveFn).toHaveBeenCalledTimes(1)
    expect(approveFn.mock.calls[0]).toMatchSnapshot()

    expect(result.length).toBe(2)
    expect(result).toMatchSnapshot()
  })
})
