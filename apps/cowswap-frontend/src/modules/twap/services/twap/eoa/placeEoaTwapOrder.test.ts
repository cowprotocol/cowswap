import { COW_TOKEN_TO_CHAIN, WETH_SEPOLIA } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { ComposableCoWAbi } from '@cowprotocol/cowswap-abis'
import { CurrencyAmount } from '@cowprotocol/currency'

import { COMPOSABLE_COW_ADDRESS, CURRENT_BLOCK_FACTORY_ADDRESS } from 'modules/advancedOrders'
import { getAppData } from 'modules/appData'

import { getEoaTwapOrderShedCalls } from './placeEoaTwapOrder'

import {
  COMPOSABLE_COW_POLLER_ADDRESS,
  COMPOSABLE_COW_POLLER_INITIAL_AUTH_EPOCH,
} from '../../../composable-cow-poller/composable-cow-poller.constants'
import { TwapOrderCreationContext } from '../../../hooks/useTwapOrderCreationContext'
import { ConditionalOrderParams, TWAPOrder } from '../../../types'

const chainId = SupportedChainId.SEPOLIA
const COW_SEPOLIA = COW_TOKEN_TO_CHAIN[chainId]
const POLLER_ADDRESS = COMPOSABLE_COW_POLLER_ADDRESS[chainId]

if (!COW_SEPOLIA) {
  throw new Error(`COW token not found for chain ${chainId}`)
}

if (!POLLER_ADDRESS) {
  throw new Error(`ComposableCowPoller not found for chain ${chainId}`)
}

const paramsStruct: ConditionalOrderParams = {
  handler: '0x6c99c4c8d51ed92722d1cd059cad3b8b0e506759',
  salt: '0x0000000000000000000000000000000000000000000000000000018c6c5e8000',
  staticInput: '0x',
}

const vaultRelayer = '0x9008D19f58AAbD9eD0D60971565AA8510560ab41'
const APP_DATA_HASH = getAppData().appDataKeccak256

const twapOrder: TWAPOrder = {
  sellAmount: CurrencyAmount.fromRawAmount(COW_SEPOLIA, 100_000_000_000),
  buyAmount: CurrencyAmount.fromRawAmount(WETH_SEPOLIA, 200_000),
  receiver: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
  numOfParts: 3,
  startTime: 1684764716,
  timeInterval: 600,
  span: 0,
  appData: APP_DATA_HASH,
}

const twapOrderCreationContext: TwapOrderCreationContext = {
  chainId,
  composableCowContract: {
    abi: ComposableCoWAbi,
    address: COMPOSABLE_COW_ADDRESS[chainId],
    chainId,
  },
  // EOA wallet flags — intentionally unused by getEoaTwapOrderShedCalls
  needsApproval: false,
  needsZeroApproval: false,
  spender: vaultRelayer,
  currentBlockFactoryAddress: CURRENT_BLOCK_FACTORY_ADDRESS[chainId],
  erc20Contract: {
    chainId,
    contract: null,
  },
}

const pollerRegistration = {
  pollerAddress: POLLER_ADDRESS,
  schedule: {
    handler: paramsStruct.handler as `0x${string}`,
    authEpoch: COMPOSABLE_COW_POLLER_INITIAL_AUTH_EPOCH,
    funder: '0x1111111111111111111111111111111111111111' as `0x${string}`,
    owner: '0x2222222222222222222222222222222222222222' as `0x${string}`,
    salt: paramsStruct.salt as `0x${string}`,
    staticInput: paramsStruct.staticInput as `0x${string}`,
  },
}

describe('getEoaTwapOrderShedCalls()', () => {
  it('includes registerFromShed then approve then create when proxy needsApproval is true', () => {
    const calls = getEoaTwapOrderShedCalls({
      twapOrder,
      twapOrderCreationContext,
      paramsStruct,
      spender: vaultRelayer,
      proxyAllowances: { needsApproval: true, needsZeroApproval: false },
      pollerRegistration,
    })

    expect(calls).toHaveLength(3)

    expect(calls[0].target.toLowerCase()).toBe(POLLER_ADDRESS.toLowerCase())
    expect(calls[0].value).toBe(0n)
    expect(calls[0].isDelegateCall).toBe(false)
    expect(calls[0].allowFailure).toBe(false)
    expect(calls[0].callData).toMatch(/^0x/)

    expect(calls[1].target.toLowerCase()).toBe(COW_SEPOLIA.address.toLowerCase())
    expect(calls[1].allowFailure).toBe(false)

    expect(calls[2].target).toBe(COMPOSABLE_COW_ADDRESS[chainId])
    expect(calls[2].allowFailure).toBe(false)
  })

  it('includes registerFromShed then create when proxy needsApproval is false', () => {
    const calls = getEoaTwapOrderShedCalls({
      twapOrder,
      twapOrderCreationContext,
      paramsStruct,
      spender: vaultRelayer,
      proxyAllowances: { needsApproval: false, needsZeroApproval: false },
      pollerRegistration,
    })

    expect(calls).toHaveLength(2)
    expect(calls[0].target.toLowerCase()).toBe(POLLER_ADDRESS.toLowerCase())
    expect(calls[1].target).toBe(COMPOSABLE_COW_ADDRESS[chainId])
  })

  it('includes zero-approve before approve when proxy needsZeroApproval is true', () => {
    const calls = getEoaTwapOrderShedCalls({
      twapOrder,
      twapOrderCreationContext,
      paramsStruct,
      spender: vaultRelayer,
      proxyAllowances: { needsApproval: true, needsZeroApproval: true },
      pollerRegistration,
    })

    expect(calls).toHaveLength(4)
    expect(calls[0].target.toLowerCase()).toBe(POLLER_ADDRESS.toLowerCase())
    expect(calls[1].target.toLowerCase()).toBe(COW_SEPOLIA.address.toLowerCase())
    expect(calls[2].target.toLowerCase()).toBe(COW_SEPOLIA.address.toLowerCase())
    expect(calls[3].target).toBe(COMPOSABLE_COW_ADDRESS[chainId])
  })

  it('prepends pollerPermitData before registerFromShed when provided', () => {
    const calls = getEoaTwapOrderShedCalls({
      twapOrder,
      twapOrderCreationContext,
      paramsStruct,
      spender: vaultRelayer,
      proxyAllowances: { needsApproval: false, needsZeroApproval: false },
      pollerRegistration,
      pollerPermitData: {
        target: COW_SEPOLIA.address,
        callData: '0xdeadbeef',
        gasLimit: '50000',
      },
    })

    expect(calls).toHaveLength(3)
    expect(calls[0].target.toLowerCase()).toBe(COW_SEPOLIA.address.toLowerCase())
    expect(calls[0].callData).toBe('0xdeadbeef')
    expect(calls[1].target.toLowerCase()).toBe(POLLER_ADDRESS.toLowerCase())
    expect(calls[2].target).toBe(COMPOSABLE_COW_ADDRESS[chainId])
  })
})
