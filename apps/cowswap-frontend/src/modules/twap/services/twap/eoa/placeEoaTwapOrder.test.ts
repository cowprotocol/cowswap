import { COW_TOKEN_TO_CHAIN, WETH_SEPOLIA } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { ComposableCoWAbi } from '@cowprotocol/cowswap-abis'
import { CurrencyAmount } from '@cowprotocol/currency'

import { COMPOSABLE_COW_ADDRESS, CURRENT_BLOCK_FACTORY_ADDRESS } from 'modules/advancedOrders'
import { getAppData } from 'modules/appData'

import { getEoaTwapOrderShedCalls } from './placeEoaTwapOrder'

import { TwapOrderCreationContext } from '../../../hooks/useTwapOrderCreationContext'
import { ConditionalOrderParams, TWAPOrder } from '../../../types'

const chainId = SupportedChainId.SEPOLIA
const COW_SEPOLIA = COW_TOKEN_TO_CHAIN[chainId]

if (!COW_SEPOLIA) {
  throw new Error(`COW token not found for chain ${chainId}`)
}

const paramsStruct: ConditionalOrderParams = {
  handler: '0x6c99c4c8d51ed92722d1cd059cad3b8b0e506759',
  salt: '0x0000000000000000000000000000000000000000000000000000018c6c5e8000',
  staticInput: '0x',
}

const vaultRelayer = '0x9008D19f58AAbD9eD0D60971565AA8510560ab41'
const APP_DATA_HASH = getAppData().appDataKeccak256
const POLLER = '0xA360eE11eD0d2025604518CF4B8F6e6CB76C7Df7'

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
  pollerAddress: POLLER as `0x${string}`,
  schedule: {
    handler: paramsStruct.handler as `0x${string}`,
    funder: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6' as `0x${string}`,
    owner: '0x0000000000000000000000000000000000000001' as `0x${string}`,
    salt: paramsStruct.salt as `0x${string}`,
    staticInput: paramsStruct.staticInput as `0x${string}`,
  },
  deadline: 2_000_000_000n,
  signature: '0x1234' as `0x${string}`,
}

describe('getEoaTwapOrderShedCalls()', () => {
  it('Includes approve then create when proxy needsApproval is true', () => {
    const calls = getEoaTwapOrderShedCalls({
      twapOrder,
      twapOrderCreationContext,
      paramsStruct,
      spender: vaultRelayer,
      proxyAllowances: { needsApproval: true, needsZeroApproval: false },
    })

    expect(calls).toHaveLength(2)

    expect(calls[0].target.toLowerCase()).toBe(COW_SEPOLIA.address.toLowerCase())
    expect(calls[0].value).toBe(0n)
    expect(calls[0].isDelegateCall).toBe(false)
    expect(calls[0].allowFailure).toBe(false)
    expect(calls[0].callData).toMatch(/^0x/)

    expect(calls[1].target).toBe(COMPOSABLE_COW_ADDRESS[chainId])
    expect(calls[1].value).toBe(0n)
    expect(calls[1].isDelegateCall).toBe(false)
    expect(calls[1].allowFailure).toBe(false)
    expect(calls[1].callData).toMatch(/^0x/)
  })

  it('Omits approve when proxy needsApproval is false', () => {
    const calls = getEoaTwapOrderShedCalls({
      twapOrder,
      twapOrderCreationContext,
      paramsStruct,
      spender: vaultRelayer,
      proxyAllowances: { needsApproval: false, needsZeroApproval: false },
    })

    expect(calls).toHaveLength(1)
    expect(calls[0].target).toBe(COMPOSABLE_COW_ADDRESS[chainId])
    expect(calls[0].allowFailure).toBe(false)
  })

  it('Includes zero-approve before approve when proxy needsZeroApproval is true', () => {
    const calls = getEoaTwapOrderShedCalls({
      twapOrder,
      twapOrderCreationContext,
      paramsStruct,
      spender: vaultRelayer,
      proxyAllowances: { needsApproval: true, needsZeroApproval: true },
    })

    expect(calls).toHaveLength(3)
    expect(calls[0].target.toLowerCase()).toBe(COW_SEPOLIA.address.toLowerCase())
    expect(calls[0].allowFailure).toBe(false)
    expect(calls[1].target.toLowerCase()).toBe(COW_SEPOLIA.address.toLowerCase())
    expect(calls[1].allowFailure).toBe(false)
    expect(calls[2].target).toBe(COMPOSABLE_COW_ADDRESS[chainId])
    expect(calls[2].allowFailure).toBe(false)
  })

  it('Includes registerWithSignature before create when pollerRegistration is set', () => {
    const calls = getEoaTwapOrderShedCalls({
      twapOrder,
      twapOrderCreationContext,
      paramsStruct,
      spender: vaultRelayer,
      proxyAllowances: { needsApproval: false, needsZeroApproval: false },
      pollerRegistration,
    })

    expect(calls).toHaveLength(2)
    expect(calls[0].target).toBe(POLLER)
    expect(calls[0].allowFailure).toBe(false)
    expect(calls[0].callData).toMatch(/^0x/)
    expect(calls[1].target).toBe(COMPOSABLE_COW_ADDRESS[chainId])
  })

  it('Orders zero-approve, approve, register, then create', () => {
    const calls = getEoaTwapOrderShedCalls({
      twapOrder,
      twapOrderCreationContext,
      paramsStruct,
      spender: vaultRelayer,
      proxyAllowances: { needsApproval: true, needsZeroApproval: true },
      pollerRegistration,
    })

    expect(calls).toHaveLength(4)
    expect(calls[0].target.toLowerCase()).toBe(COW_SEPOLIA.address.toLowerCase())
    expect(calls[1].target.toLowerCase()).toBe(COW_SEPOLIA.address.toLowerCase())
    expect(calls[2].target).toBe(POLLER)
    expect(calls[3].target).toBe(COMPOSABLE_COW_ADDRESS[chainId])
  })
})
