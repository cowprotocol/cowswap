import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { mergePersistedSigningTwapOrders } from './buildTwapOrdersItems'

import { DEFAULT_TWAP_EXECUTION } from '../const'
import { TwapOrdersExecutionMap } from '../hooks/useTwapOrdersExecutions'
import { TwapOrderItem, TwapOrderStatus, TWAPOrderStruct } from '../types'

const orderStruct: TWAPOrderStruct = {
  sellToken: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
  buyToken: '0x02ABBDbAaa7b1BB64B5c878f7ac17f8DDa169532',
  receiver: '0xe9B79591E270B3bCd0CC7e84f7B7De74BA3D0E2F',
  partSellAmount: '0xc4c6e2ce9530cf',
  minPartLimit: '0x091f5db5e0561ce4',
  t0: 0,
  n: 4,
  t: 300,
  span: 0,
  appData: '0x226123123d9e99f7e8b46519b6311acac9f3d5e661b1fb40dc638eae03e156df',
}

function makeWaitSigningItem(id: string): TwapOrderItem {
  return {
    id,
    chainId: SupportedChainId.MAINNET,
    safeAddress: '0x0000000000000000000000000000000000000001',
    order: orderStruct,
    status: TwapOrderStatus.WaitSigning,
    submissionDate: new Date().toISOString(),
    executionInfo: DEFAULT_TWAP_EXECUTION,
    safeTxParams: {
      submissionDate: new Date().toISOString(),
      executionDate: null,
      isExecuted: false,
      nonce: '0',
      confirmationsRequired: 1,
      confirmations: 0,
      safeTxHash: '0x',
    },
  }
}

describe('mergePersistedSigningTwapOrders()', () => {
  it('promotes WaitSigning to Pending when singleOrders (auth) is true', () => {
    const orderId = '0xabc' as const
    const stored = makeWaitSigningItem(orderId)
    const built = {}
    const auth = { [orderId]: true }
    const executions: TwapOrdersExecutionMap = {}

    const merged = mergePersistedSigningTwapOrders(built, { [orderId]: stored }, auth, executions)

    expect(merged[orderId]?.status).toBe(TwapOrderStatus.Pending)
  })

  it('does not overwrite rows already built from Safe snapshot', () => {
    const orderId = '0xabc' as const
    const stored = makeWaitSigningItem(orderId)
    const builtItem: TwapOrderItem = { ...stored, status: TwapOrderStatus.Pending }
    const built = { [orderId]: builtItem }
    const auth = { [orderId]: true }
    const executions: TwapOrdersExecutionMap = {}

    const merged = mergePersistedSigningTwapOrders(built, { [orderId]: stored }, auth, executions)

    expect(merged[orderId]).toBe(builtItem)
  })
})
