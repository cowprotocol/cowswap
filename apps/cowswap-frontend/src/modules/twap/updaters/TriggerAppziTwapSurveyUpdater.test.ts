import { createStore, PrimitiveAtom, Provider } from 'jotai'
import { createElement } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { UiOrderType } from '@cowprotocol/types'
import { walletInfoAtom } from '@cowprotocol/wallet'

import { act, render } from '@testing-library/react'
import { triggerAppziSurvey } from 'appzi'
import { twapOrdersListAtom } from 'entities/twap'

import { TriggerAppziTwapSurveyUpdater } from './TriggerAppziTwapSurveyUpdater'

import { TwapOrderItem, TwapOrderStatus } from '../types'

jest.mock('@cowprotocol/wallet', () => {
  const { atom, useAtomValue } = jest.requireActual<typeof import('jotai')>('jotai')
  const walletInfoAtom = atom({ chainId: 1 })
  return { walletInfoAtom, useWalletInfo: () => useAtomValue(walletInfoAtom) }
})

jest.mock('entities/twap', () => {
  const { atom } = jest.requireActual<typeof import('jotai')>('jotai')
  return { twapOrdersListAtom: atom([]) }
})

jest.mock('appzi', () => ({
  getSurveyType: () => 'nps',
  triggerAppziSurvey: jest.fn(),
}))

const ACCOUNT = '0x1111111111111111111111111111111111111111'
const ordersAtom = twapOrdersListAtom as PrimitiveAtom<TwapOrderItem[]>
const triggerAppziSurveyMock = jest.mocked(triggerAppziSurvey)

function makeOrder(id: string, status: TwapOrderStatus = TwapOrderStatus.Pending): TwapOrderItem {
  return {
    id,
    chainId: SupportedChainId.MAINNET,
    safeAddress: ACCOUNT,
    resolvedOwner: ACCOUNT,
    submissionDate: '2026-10-06T10:00:00Z',
    status,
    order: {
      sellToken: ACCOUNT,
      buyToken: '0x2222222222222222222222222222222222222222',
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
  }
}

function mount(orders: TwapOrderItem[], account: string | null = ACCOUNT): ReturnType<typeof createStore> {
  const store = createStore()
  store.set(walletInfoAtom, { account: account ?? undefined, chainId: SupportedChainId.MAINNET })
  store.set(ordersAtom, orders)
  render(createElement(Provider, { store }, createElement(TriggerAppziTwapSurveyUpdater)))
  return store
}

describe('TriggerAppziTwapSurveyUpdater', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('uses the TWAP page flag and NPS survey with only pending parent identities', () => {
    mount([
      makeOrder('pending-safe'),
      makeOrder('unsigned', TwapOrderStatus.WaitSigning),
      makeOrder('cancelling', TwapOrderStatus.Cancelling),
      makeOrder('cancelled', TwapOrderStatus.Cancelled),
      makeOrder('expired', TwapOrderStatus.Expired),
      makeOrder('fulfilled', TwapOrderStatus.Fulfilled),
      makeOrder('partially-filled', TwapOrderStatus.PartiallyFilled),
      makeOrder('pending-indexed-eoa'),
    ])

    expect(triggerAppziSurveyMock).toHaveBeenCalledTimes(1)
    expect(triggerAppziSurveyMock).toHaveBeenCalledWith(
      {
        account: ACCOUNT,
        chainId: SupportedChainId.MAINNET,
        pendingOrderIds: 'pending-safe,pending-indexed-eoa',
        orderType: UiOrderType.TWAP,
        openedTwapPage: true,
      },
      'nps',
    )
  })

  it.each([
    TwapOrderStatus.WaitSigning,
    TwapOrderStatus.Cancelling,
    TwapOrderStatus.Cancelled,
    TwapOrderStatus.Expired,
    TwapOrderStatus.Fulfilled,
    TwapOrderStatus.PartiallyFilled,
  ])('does not trigger for a list containing only %s parents', (status) => {
    mount([makeOrder('parent', status)])

    expect(triggerAppziSurveyMock).not.toHaveBeenCalled()
  })

  it('does not trigger with an empty list', () => {
    mount([])

    expect(triggerAppziSurveyMock).not.toHaveBeenCalled()
  })

  it('waits for a connected account', () => {
    const store = mount([makeOrder('pending')], null)

    expect(triggerAppziSurveyMock).not.toHaveBeenCalled()

    act(() => {
      store.set(walletInfoAtom, { account: ACCOUNT, chainId: SupportedChainId.MAINNET })
    })

    expect(triggerAppziSurveyMock).toHaveBeenCalledTimes(1)
  })

  it('triggers when pending parent history arrives after the page opens', () => {
    const store = mount([])

    act(() => {
      store.set(ordersAtom, [makeOrder('pending')])
    })

    expect(triggerAppziSurveyMock).toHaveBeenCalledTimes(1)
    expect(triggerAppziSurveyMock).toHaveBeenCalledWith(expect.objectContaining({ pendingOrderIds: 'pending' }), 'nps')
  })

  it('does not trigger again when parent metadata updates without changing pending IDs', () => {
    const store = mount([makeOrder('pending')])

    act(() => {
      store.set(ordersAtom, [{ ...makeOrder('pending'), partOrdersCount: 1 }])
    })

    expect(triggerAppziSurveyMock).toHaveBeenCalledTimes(1)
  })

  it('refreshes the pending IDs when parents enter or leave pending status', () => {
    const store = mount([makeOrder('first'), makeOrder('second')])

    act(() => {
      store.set(ordersAtom, [makeOrder('first', TwapOrderStatus.Fulfilled), makeOrder('second')])
    })

    expect(triggerAppziSurveyMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ pendingOrderIds: 'second' }),
      'nps',
    )
    expect(triggerAppziSurveyMock).toHaveBeenCalledTimes(2)
  })
})
