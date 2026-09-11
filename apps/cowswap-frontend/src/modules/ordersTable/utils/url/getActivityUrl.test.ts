import { getEtherscanLink, getExplorerBaseUrl, getExplorerTwapOrderLink } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { OrderStatus } from 'legacy/state/orders/actions'

import { getActivityUrl } from './getActivityUrl'

import { ordersMock } from '../../test/ordersTable.mock'

const EVENT_ID = '1'.repeat(70)
const HASH = `0x${'a'.repeat(64)}`
const UID = `0x${'b'.repeat(112)}`
const order = ordersMock[0]

describe('TWAP explorer links', () => {
  it.each([SupportedChainId.MAINNET, SupportedChainId.GNOSIS_CHAIN, SupportedChainId.ARBITRUM_ONE])(
    'links an indexed parent on chain %s',
    (chainId) => {
      expect(getActivityUrl(chainId, { ...order, composableCowInfo: { id: EVENT_ID } })).toBe(
        `${getExplorerBaseUrl(chainId)}/twap/${EVENT_ID}`,
      )
    },
  )

  it.each([HASH, '', '123', `${EVENT_ID}/orders`])('hides hash-only or invalid parents: %s', (id) => {
    expect(getExplorerTwapOrderLink(SupportedChainId.MAINNET, id)).toBeUndefined()
  })

  it('hides Safe and optimistic EOA parent links until an event ID is available', () => {
    for (const isEoaTwapOrder of [false, true]) {
      expect(
        getActivityUrl(SupportedChainId.MAINNET, {
          ...order,
          isEoaTwapOrder,
          composableCowInfo: { id: HASH },
        }),
      ).toBeUndefined()
    }
  })

  it('links indexed Sepolia parents to the Sepolia route', () => {
    expect(getActivityUrl(SupportedChainId.SEPOLIA, { ...order, composableCowInfo: { id: EVENT_ID } })).toBe(
      `${getExplorerBaseUrl(SupportedChainId.MAINNET)}/sepolia/twap/${EVENT_ID}`,
    )
  })

  it.each([OrderStatus.PENDING, OrderStatus.FULFILLED, OrderStatus.EXPIRED, OrderStatus.CANCELLED])(
    'preserves real part links with status %s for both wallet types',
    (status) => {
      for (const parentId of [EVENT_ID, HASH]) {
        expect(
          getActivityUrl(SupportedChainId.GNOSIS_CHAIN, {
            ...order,
            status,
            composableCowInfo: { parentId },
            executionData: { ...order.executionData, activityId: UID },
          }),
        ).toBe(`${getExplorerBaseUrl(SupportedChainId.GNOSIS_CHAIN)}/orders/${UID}`)
      }
    },
  )

  it.each([OrderStatus.SCHEDULED, OrderStatus.EXPIRED, OrderStatus.CANCELLED])(
    'hides virtual part links even after the parent terminates: %s',
    (status) => {
      expect(
        getActivityUrl(SupportedChainId.MAINNET, {
          ...order,
          status,
          composableCowInfo: { parentId: EVENT_ID, isVirtualPart: true },
          executionData: { ...order.executionData, activityId: UID },
        }),
      ).toBeUndefined()
    },
  )

  it('hides scheduled parts', () => {
    expect(
      getActivityUrl(SupportedChainId.MAINNET, {
        ...order,
        status: OrderStatus.SCHEDULED,
        composableCowInfo: { parentId: EVENT_ID },
      }),
    ).toBeUndefined()
  })

  it('preserves creation transaction links', () => {
    expect(
      getActivityUrl(SupportedChainId.MAINNET, {
        ...order,
        status: OrderStatus.CREATING,
        executionData: { ...order.executionData, activityId: HASH },
      }),
    ).toBe(getEtherscanLink(SupportedChainId.MAINNET, 'transaction', HASH))
  })
})
