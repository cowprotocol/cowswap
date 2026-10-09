import { atom, createStore, Provider, useAtomValue } from 'jotai'

import { encodeAbiParameters } from 'viem'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { ComposableCoWAbi } from '@cowprotocol/cowswap-abis'
import { UiOrderType } from '@cowprotocol/types'
import { useIsSafeViaWc, useIsSafeWallet, walletInfoAtom } from '@cowprotocol/wallet'

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { triggerAppziSurvey } from 'appzi'
import { twapOrdersAtom } from 'entities/twap'
import { Link, MemoryRouter, Route, Routes } from 'react-router'

import { useComposableCowContractData } from 'modules/advancedOrders'

import { CreatedInOrderBookOrdersUpdater } from './CreatedInOrderBookOrdersUpdater'
import { PartOrdersUpdater } from './PartOrdersUpdater'
import { SafeTwapOrdersUpdater } from './SafeTwapOrdersUpdater.updater'

import { TWAP_ORDER_STRUCT } from '../const'
import { useTwapOrdersAuthMulticall } from '../hooks/useTwapOrdersAuthMulticall'
import { TwapOrdersExecutionMap, useTwapOrdersExecutions } from '../hooks/useTwapOrdersExecutions'
import { fetchCachedTwapOrdersFromSafe } from '../services/fetchCachedTwapOrdersFromSafe'
import { twapAppziSurveyEffectAtom } from '../state/twapAppziSurveyEffectAtom'
import { TwapOrdersSafeData, TwapOrderStatus } from '../types'
import { getConditionalOrderId } from '../utils/getConditionalOrderId'

jest.mock('@cowprotocol/wallet', () => {
  const { atom, useAtomValue } = jest.requireActual<typeof import('jotai')>('jotai')
  const walletInfoAtom = atom({ chainId: 1 })
  return {
    walletInfoAtom,
    useWalletInfo: () => useAtomValue(walletInfoAtom),
    useIsSafeWallet: jest.fn(),
    useIsSafeViaWc: jest.fn(),
    useGnosisSafeInfo: () => undefined,
  }
})
jest.mock('modules/advancedOrders', () => ({ useComposableCowContractData: jest.fn() }))
jest.mock('appzi', () => ({ getSurveyType: () => 'nps', triggerAppziSurvey: jest.fn() }))
jest.mock('./CreatedInOrderBookOrdersUpdater', () => ({ CreatedInOrderBookOrdersUpdater: jest.fn(() => null) }))
jest.mock('./PartOrdersUpdater', () => ({ PartOrdersUpdater: jest.fn(() => null) }))
jest.mock('../services/fetchCachedTwapOrdersFromSafe')
jest.mock('../hooks/useTwapOrdersExecutions')
jest.mock('../hooks/useTwapOrdersAuthMulticall')

const OWNER = '0x1111111111111111111111111111111111111111'
const OTHER_OWNER = '0x2222222222222222222222222222222222222222'
const NOW = Date.parse('2026-10-06T12:00:00Z')
const ZERO_HASH = `0x${'00'.repeat(32)}` as const
const CONTRACT = { address: OWNER, abi: ComposableCoWAbi, chainId: SupportedChainId.MAINNET }
const executionsAtom = atom<TwapOrdersExecutionMap>({})

async function flushOrders(): Promise<void> {
  await act(async () => undefined)
  await act(async () => {
    jest.advanceTimersByTime(500)
  })
  await act(async () => {
    jest.advanceTimersByTime(3000)
  })
}

function makeSafeData(): TwapOrdersSafeData {
  return {
    conditionalOrderParams: {
      handler: OWNER,
      salt: ZERO_HASH,
      staticInput: encodeAbiParameters(TWAP_ORDER_STRUCT, [
        {
          sellToken: OWNER,
          buyToken: OTHER_OWNER,
          receiver: OWNER,
          partSellAmount: 1n,
          minPartLimit: 1n,
          t0: 0n,
          n: 2n,
          t: 600n,
          span: 0n,
          appData: ZERO_HASH,
        },
      ]),
    },
    safeTxParams: {
      isExecuted: true,
      submissionDate: new Date(NOW - 120_000).toISOString(),
      executionDate: new Date(NOW - 120_000).toISOString(),
      nonce: '1',
      confirmationsRequired: 1,
      confirmations: 1,
      safeTxHash: ZERO_HASH,
    },
  }
}

function mount(store: ReturnType<typeof createStore>): void {
  render(
    <Provider store={store}>
      <SurveyObserver />
      <SafeTwapOrdersUpdater />
      <MemoryRouter initialEntries={['/twap']}>
        <Routes>
          <Route path="/twap" element={<Link to="/swap">Leave TWAP</Link>} />
          <Route path="/swap" element={<div>Swap page</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  )
}

function SurveyObserver(): null {
  useAtomValue(twapAppziSurveyEffectAtom)
  return null
}

beforeEach(() => {
  jest.useFakeTimers({ now: NOW })
  jest.clearAllMocks()
  localStorage.clear()
  jest.mocked(useIsSafeWallet).mockReturnValue(true)
  jest.mocked(useIsSafeViaWc).mockReturnValue(false)
  jest.mocked(useComposableCowContractData).mockReturnValue(CONTRACT)
  jest.mocked(useTwapOrdersAuthMulticall).mockReturnValue({})
  jest.mocked(useTwapOrdersExecutions).mockImplementation(function useMockExecutions() {
    return useAtomValue(executionsAtom)
  })
  jest.mocked(fetchCachedTwapOrdersFromSafe).mockImplementation(async (_chainId, _owner, _contract, setData) => {
    const data = [makeSafeData()]
    setData(data)
    return data
  })
})

afterEach(() => {
  cleanup()
  jest.useRealTimers()
})

it.each([
  { wallet: 'Safe App', viaWc: false, status: TwapOrderStatus.Fulfilled, event: { traded: true } },
  { wallet: 'Safe App', viaWc: false, status: TwapOrderStatus.Expired, event: { expired: true } },
  { wallet: 'Safe via WalletConnect', viaWc: true, status: TwapOrderStatus.Fulfilled, event: { traded: true } },
  { wallet: 'Safe via WalletConnect', viaWc: true, status: TwapOrderStatus.Expired, event: { expired: true } },
])('triggers $status NPS for $wallet after leaving the TWAP page', async ({ viaWc, status, event }) => {
  jest.mocked(useIsSafeWallet).mockReturnValue(!viaWc)
  jest.mocked(useIsSafeViaWc).mockReturnValue(viaWc)
  const store = createStore()
  store.set(walletInfoAtom, { account: OWNER, chainId: CONTRACT.chainId })
  const id = getConditionalOrderId(makeSafeData().conditionalOrderParams)
  mount(store)
  await flushOrders()
  expect(store.get(twapOrdersAtom)[id]?.status).toBe(TwapOrderStatus.Pending)
  expect(triggerAppziSurvey).not.toHaveBeenCalled()

  fireEvent.click(screen.getByText('Leave TWAP'))
  expect(screen.getByText('Swap page')).toBeTruthy()
  expect(fetchCachedTwapOrdersFromSafe).toHaveBeenCalledTimes(1)
  expect(CreatedInOrderBookOrdersUpdater).toHaveBeenCalledTimes(1)
  expect(PartOrdersUpdater).toHaveBeenCalledTimes(1)

  if (status === TwapOrderStatus.Fulfilled) {
    act(() => {
      store.set(executionsAtom, {
        [id]: { confirmedPartsCount: 2, info: { executedSellAmount: '2', executedBuyAmount: '2', executedFee: '0' } },
      })
    })
  } else {
    jest.setSystemTime(NOW + 20 * 60_000)
  }
  await act(async () => {
    jest.advanceTimersByTime(3000)
  })

  expect(store.get(twapOrdersAtom)[id]?.status).toBe(status)
  expect(triggerAppziSurvey).toHaveBeenCalledTimes(1)
  expect(triggerAppziSurvey).toHaveBeenCalledWith(
    expect.objectContaining({ ...event, account: OWNER, chainId: CONTRACT.chainId, orderType: UiOrderType.TWAP }),
    'nps',
  )
  await act(async () => {
    jest.advanceTimersByTime(3000)
  })
  expect(triggerAppziSurvey).toHaveBeenCalledTimes(1)
})

it.each(['EOA', 'disconnected', 'unsupported chain'])('does not start Safe polling for %s', async (context) => {
  const store = createStore()
  store.set(walletInfoAtom, { account: context === 'disconnected' ? undefined : OWNER, chainId: CONTRACT.chainId })
  if (context === 'EOA') jest.mocked(useIsSafeWallet).mockReturnValue(false)
  if (context === 'unsupported chain')
    jest.mocked(useComposableCowContractData).mockReturnValue({ ...CONTRACT, address: undefined })
  mount(store)
  await flushOrders()
  expect(fetchCachedTwapOrdersFromSafe).not.toHaveBeenCalled()
  expect(PartOrdersUpdater).not.toHaveBeenCalled()
  expect(CreatedInOrderBookOrdersUpdater).not.toHaveBeenCalled()
})

it.each(['account', 'chain'] as const)('discards previous Safe history after changing %s', async (context) => {
  const store = createStore()
  store.set(walletInfoAtom, { account: OWNER, chainId: CONTRACT.chainId })
  mount(store)
  await flushOrders()
  const id = getConditionalOrderId(makeSafeData().conditionalOrderParams)
  jest.mocked(fetchCachedTwapOrdersFromSafe).mockImplementation(async (_chainId, _owner, _contract, setData) => {
    setData([])
    return []
  })
  const account = context === 'account' ? OTHER_OWNER : OWNER
  const chainId = context === 'chain' ? SupportedChainId.GNOSIS_CHAIN : CONTRACT.chainId
  jest.mocked(useComposableCowContractData).mockReturnValue({ ...CONTRACT, chainId })
  act(() => {
    store.set(walletInfoAtom, { account, chainId })
  })
  await flushOrders()

  expect(fetchCachedTwapOrdersFromSafe).toHaveBeenLastCalledWith(
    chainId,
    account,
    expect.any(Object),
    expect.any(Function),
  )
  expect(store.get(twapOrdersAtom)[id]).toEqual(
    expect.objectContaining({ safeAddress: OWNER, chainId: CONTRACT.chainId }),
  )
  expect(triggerAppziSurvey).not.toHaveBeenCalled()
})
