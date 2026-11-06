import { atom, createStore, PrimitiveAtom } from 'jotai'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { UiOrderType } from '@cowprotocol/types'
import { walletInfoAtom } from '@cowprotocol/wallet'

import { triggerAppziSurvey } from 'appzi'
import { twapOrdersListAtom } from 'entities/twap'

import { twapAppziSurveyEffectAtom } from './twapAppziSurveyEffectAtom'

import { TwapOrderItem, TwapOrderStatus } from '../types'

jest.mock('@cowprotocol/wallet', () => {
  const { atom } = jest.requireActual<typeof import('jotai')>('jotai')
  return { walletInfoAtom: atom({ chainId: 1 }) }
})

jest.mock('entities/twap', () => {
  const { atom } = jest.requireActual<typeof import('jotai')>('jotai')
  return { twapOrdersListAtom: atom([]) }
})

jest.mock('appzi', () => ({
  getSurveyType: () => 'nps',
  triggerAppziSurvey: jest.fn(),
}))

const ACCOUNT = '0x016f34d4f2578c3e9dffc3f2b811ba30c0c9e7f3'
const OTHER_ACCOUNT = '0x1111111111111111111111111111111111111111'
const PROXY = '0x2222222222222222222222222222222222222222'
const EVENT_ID = '1'.repeat(70)
const NOW = Date.parse('2026-10-06T12:00:00Z')
const ordersAtom = twapOrdersListAtom as PrimitiveAtom<TwapOrderItem[]>
const triggerAppziSurveyMock = jest.mocked(triggerAppziSurvey)

function makeOrder(status: TwapOrderStatus, overrides: Partial<TwapOrderItem> = {}): TwapOrderItem {
  return {
    id: EVENT_ID,
    chainId: SupportedChainId.MAINNET,
    safeAddress: PROXY,
    resolvedOwner: ACCOUNT,
    submissionDate: new Date(NOW - 10 * 60 * 1000).toISOString(),
    status,
    order: {
      sellToken: PROXY,
      buyToken: OTHER_ACCOUNT,
      receiver: ACCOUNT,
      partSellAmount: '1',
      minPartLimit: '1',
      t0: 0,
      n: 2,
      t: 60,
      span: 0,
      appData: `0x${'00'.repeat(32)}`,
    },
    executionInfo: {
      confirmedPartsCount: 0,
      info: { executedSellAmount: '0', executedBuyAmount: '0', executedFee: '0' },
    },
    ...overrides,
  }
}

describe('twapAppziSurveyEffectAtom', () => {
  let unmount: () => void

  function mount(orders: TwapOrderItem[] = []): ReturnType<typeof createStore> {
    const store = createStore()
    store.set(walletInfoAtom, { account: ACCOUNT, chainId: SupportedChainId.MAINNET })
    store.set(ordersAtom, orders)
    unmount = store.sub(twapAppziSurveyEffectAtom, () => undefined)
    return store
  }

  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(Date, 'now').mockReturnValue(NOW)
    unmount = () => undefined
  })

  afterEach(() => {
    unmount()
    jest.restoreAllMocks()
  })

  it.each([
    TwapOrderStatus.Pending,
    TwapOrderStatus.Fulfilled,
    TwapOrderStatus.PartiallyFilled,
    TwapOrderStatus.Expired,
    TwapOrderStatus.Cancelled,
  ])('does not trigger on initial %s orders or arriving history', (status) => {
    const order = makeOrder(status)
    const store = mount([order])

    expect(triggerAppziSurveyMock).not.toHaveBeenCalled()

    store.set(ordersAtom, [order, makeOrder(status, { id: '2'.repeat(70) })])

    expect(triggerAppziSurveyMock).not.toHaveBeenCalled()
  })

  it('triggers creation when the parent is signed and becomes pending', () => {
    const store = mount([makeOrder(TwapOrderStatus.WaitSigning)])

    store.set(ordersAtom, [makeOrder(TwapOrderStatus.Pending)])

    expect(triggerAppziSurveyMock).toHaveBeenCalledTimes(1)
    expect(triggerAppziSurveyMock).toHaveBeenCalledWith(
      {
        created: true,
        account: ACCOUNT,
        chainId: SupportedChainId.MAINNET,
        orderType: UiOrderType.TWAP,
        pendingOrderIds: EVENT_ID,
        secondsSinceOpen: 600,
        explorerUrl: `https://explorer.cow.fi/twap/${EVENT_ID}`,
      },
      'nps',
    )
  })

  it('measures Safe open duration from execution rather than proposal submission', () => {
    const executedDate = new Date(NOW - 30 * 1000).toISOString()
    const store = mount([makeOrder(TwapOrderStatus.WaitSigning)])

    store.set(ordersAtom, [makeOrder(TwapOrderStatus.Pending, { executedDate })])

    expect(triggerAppziSurveyMock).toHaveBeenCalledWith(
      expect.objectContaining({ created: true, secondsSinceOpen: 30 }),
      'nps',
    )
  })

  it.each([
    [TwapOrderStatus.Fulfilled, { traded: true }],
    [TwapOrderStatus.Expired, { expired: true }],
    [TwapOrderStatus.PartiallyFilled, { expired: true }],
    [TwapOrderStatus.Cancelled, { cancelled: true }],
  ] as const)('triggers %s after a pending TWAP older than five minutes', (status, event) => {
    const store = mount([makeOrder(TwapOrderStatus.Pending)])

    store.set(ordersAtom, [makeOrder(status)])

    expect(triggerAppziSurveyMock).toHaveBeenCalledTimes(1)
    expect(triggerAppziSurveyMock).toHaveBeenCalledWith(
      expect.objectContaining({ ...event, secondsSinceOpen: 600, account: ACCOUNT, pendingOrderIds: '' }),
      'nps',
    )
  })

  it('waits for cancellation confirmation before triggering', () => {
    const store = mount([makeOrder(TwapOrderStatus.Pending)])

    store.set(ordersAtom, [makeOrder(TwapOrderStatus.Cancelling)])
    expect(triggerAppziSurveyMock).not.toHaveBeenCalled()

    store.set(ordersAtom, [makeOrder(TwapOrderStatus.Cancelled)])
    expect(triggerAppziSurveyMock).toHaveBeenCalledTimes(1)
    expect(triggerAppziSurveyMock).toHaveBeenCalledWith(expect.objectContaining({ cancelled: true }), 'nps')
  })

  it('does not repeat surveys for unchanged orders or later terminal refinements', () => {
    const store = mount([makeOrder(TwapOrderStatus.Pending)])

    store.set(ordersAtom, [makeOrder(TwapOrderStatus.Pending)])
    expect(triggerAppziSurveyMock).not.toHaveBeenCalled()

    store.set(ordersAtom, [makeOrder(TwapOrderStatus.Expired)])
    store.set(ordersAtom, [makeOrder(TwapOrderStatus.Expired)])
    store.set(ordersAtom, [makeOrder(TwapOrderStatus.PartiallyFilled)])
    store.set(ordersAtom, [makeOrder(TwapOrderStatus.Fulfilled)])

    expect(triggerAppziSurveyMock).toHaveBeenCalledTimes(1)
  })

  it('matches a signed optimistic hash to the indexed parent event identity', () => {
    const hash = `0x${'ab'.repeat(32)}`
    const store = mount([makeOrder(TwapOrderStatus.WaitSigning, { id: hash })])

    store.set(ordersAtom, [makeOrder(TwapOrderStatus.Pending, { hash })])

    expect(triggerAppziSurveyMock).toHaveBeenCalledTimes(1)
    expect(triggerAppziSurveyMock).toHaveBeenCalledWith(
      expect.objectContaining({ created: true, pendingOrderIds: EVENT_ID }),
      'nps',
    )
  })

  it('does not treat an indexed replacement with the same pending status as creation', () => {
    const hash = `0x${'ab'.repeat(32)}`
    const store = mount([makeOrder(TwapOrderStatus.Pending, { id: hash })])

    store.set(ordersAtom, [makeOrder(TwapOrderStatus.Pending, { hash })])

    expect(triggerAppziSurveyMock).not.toHaveBeenCalled()
  })

  it.each([
    { account: OTHER_ACCOUNT, chainId: SupportedChainId.MAINNET },
    { account: ACCOUNT, chainId: SupportedChainId.GNOSIS_CHAIN },
  ])('resets the snapshot when wallet context changes to %j', (wallet) => {
    const store = mount([makeOrder(TwapOrderStatus.Pending)])

    const changeContextAtom = atom(null, (_get, set) => {
      set(walletInfoAtom, wallet)
      set(ordersAtom, [makeOrder(TwapOrderStatus.Fulfilled, { chainId: wallet.chainId })])
    })

    store.set(changeContextAtom)

    expect(triggerAppziSurveyMock).not.toHaveBeenCalled()
  })

  it('retains the snapshot for the same wallet with checksum casing', () => {
    const store = mount([makeOrder(TwapOrderStatus.Pending)])

    store.set(walletInfoAtom, {
      account: '0x016F34d4F2578C3e9dfFc3f2b811ba30C0c9e7F3',
      chainId: SupportedChainId.MAINNET,
    })
    store.set(ordersAtom, [makeOrder(TwapOrderStatus.Fulfilled)])

    expect(triggerAppziSurveyMock).toHaveBeenCalledTimes(1)
  })

  it('does not emit a disconnected-wallet transition or replay it after reconnection', () => {
    const store = mount([makeOrder(TwapOrderStatus.Pending)])

    store.set(walletInfoAtom, { chainId: SupportedChainId.MAINNET })
    store.set(ordersAtom, [makeOrder(TwapOrderStatus.Fulfilled)])
    store.set(walletInfoAtom, { account: ACCOUNT, chainId: SupportedChainId.MAINNET })

    expect(triggerAppziSurveyMock).not.toHaveBeenCalled()
  })
})
