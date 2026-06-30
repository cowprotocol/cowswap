import type { Getter, Setter } from 'jotai'

import {
  balancesAtom,
  tokenAllowancesFamily,
  tradeSpenderAtom,
  type BalancesState,
} from '@cowprotocol/balances-and-allowances'
import { UiOrderType } from '@cowprotocol/types'
import { walletInfoAtom, isAtomicBatchSupportedLoadableAtom } from '@cowprotocol/wallet'

import { getOptimisticAllowanceKey } from 'entities/optimisticAllowance/getOptimisticAllowanceKey'
import { optimisticAllowancesAtom } from 'entities/optimisticAllowance/optimisticAllowancesAtom'
import {
  locationAtom,
  locationOrderTypeAtom,
  OrderTabId,
  pageParamAtom,
  TabOrderTypes,
  tabParamAtom,
} from 'entities/routes/routes.atom'

import { OrderStatus } from 'legacy/state/orders/actions'

import { ordersTablePageAtom, ordersTableTabIdAtom } from 'modules/ordersTable/state/params/ordersTableParams.atom'
import { HistoryStatusFilter } from 'modules/ordersTable/utils/getFilteredOrders'
import { emulatedPartOrdersAtom } from 'modules/twap/state/emulatedPartOrdersAtom'
import { emulatedTwapOrdersAtom } from 'modules/twap/state/emulatedTwapOrdersAtom'

import { hashHistory } from 'common/constants/routes'

import { ordersTableFiltersAtom } from './filters/ordersTableFilters.atom'
import {
  getBalancesAndAllowances,
  observeOrdersUrl,
  observeReduxOrders,
  ordersTableStateAtom,
} from './ordersTable.atoms'
import { EMPTY_ORDERS_LIST, EMPTY_ORDERS_TABLE_STATE } from './ordersTable.constants'
import { ordersTableOrderTypeAtom } from './ordersTableOrderType.atom'
import { pendingOrdersPermitValidityStateAtom } from './permit/pendingOrdersPermitValidity.atom'
import { reduxOrdersStateAtom } from './redux/reduxOrders.atom'
import { getReduxOrdersByOrderTypeFromNetworkState, getReduxOrdersStateByChain } from './redux/reduxOrders.utils'

jest.mock('@cowprotocol/balances-and-allowances', () => {
  const { atom } = require('jotai') as typeof import('jotai')
  const familyCache = new Map<string, unknown>()
  const tokenAllowancesFamily = jest.fn(
    (params: { account?: string; chainId: number; spender?: string; tokenAddresses: string[] }) => {
      const key = [params.chainId, params.account, params.spender, ...params.tokenAddresses].join(',')

      if (!familyCache.has(key)) {
        familyCache.set(key, atom(null))
      }

      return familyCache.get(key)
    },
  )

  return {
    balancesAtom: atom({}),
    tokenAllowancesFamily,
    tradeSpenderAtom: atom(undefined),
  }
})

jest.mock('@cowprotocol/wallet', () => {
  const { atom } = require('jotai') as typeof import('jotai')

  return {
    isAtomicBatchSupportedLoadableAtom: atom({ data: true, state: 'hasData' }),
    walletInfoAtom: atom({}),
  }
})

jest.mock('modules/twap/state/emulatedPartOrdersAtom', () => {
  const { atom } = require('jotai') as typeof import('jotai')

  return {
    emulatedPartOrdersAtom: atom([]),
  }
})

jest.mock('modules/twap/state/emulatedTwapOrdersAtom', () => {
  const { atom } = require('jotai') as typeof import('jotai')

  return {
    emulatedTwapOrdersAtom: atom([]),
  }
})

jest.mock('modules/ordersTable/state/redux/reduxOrders.utils', () => ({
  getReduxOrdersByOrderTypeFromNetworkState: jest.fn(),
  getReduxOrdersStateByChain: jest.fn(),
}))

jest.mock('modules/ordersTable/utils/getOrdersTableList', () => ({
  getOrdersTableList: jest.fn(),
}))

jest.mock('modules/ordersTable/utils/getFilteredOrders', () => ({
  HistoryStatusFilter: {
    ALL: 'all',
    CANCELLED: 'cancelled',
    EXPIRED: 'expired',
    FILLED: 'filled',
  },
  getFilteredOrders: jest.fn(),
}))

jest.mock('modules/ordersTable/utils/url/buildOrdersTableUrl', () => ({
  buildOrdersTableUrl: jest.fn(() => '/1/limit?tab=open&page=2'),
}))

jest.mock('common/constants/routes', () => ({
  hashHistory: {
    replace: jest.fn(),
  },
}))

const { getOrdersTableList } = jest.requireMock('modules/ordersTable/utils/getOrdersTableList') as {
  getOrdersTableList: jest.Mock
}

const { getFilteredOrders } = jest.requireMock('modules/ordersTable/utils/getFilteredOrders') as {
  getFilteredOrders: jest.Mock
}

function createGetter(values: Map<unknown, unknown>): Getter {
  return ((atom: unknown) => {
    if (!values.has(atom)) {
      throw new Error(`Missing mocked atom value for ${String(atom)}`)
    }

    return values.get(atom)
  }) as Getter
}

describe('getBalancesAndAllowances', () => {
  it('applies optimistic allowances and preserves loading state', () => {
    const tokenAddress = '0x1111111111111111111111111111111111111111'
    const account = '0x2222222222222222222222222222222222222222'
    const spender = '0x3333333333333333333333333333333333333333'
    const optimisticAllowanceKey = getOptimisticAllowanceKey({ chainId: 1, tokenAddress, owner: account, spender })
    const balancesState: BalancesState = {
      chainId: 1,
      error: null,
      fromCache: false,
      hasFirstLoad: true,
      isLoading: true,
      values: {
        [tokenAddress]: 5n,
      },
    }

    const result = getBalancesAndAllowances(
      balancesState,
      {
        [tokenAddress]: 1n,
      },
      {
        [optimisticAllowanceKey]: {
          amount: 7n,
          blockNumber: 1n,
          timestamp: 123,
        },
      },
      1,
      account,
      spender,
    )

    expect(result).toEqual({
      isLoading: true,
      balances: {
        [tokenAddress]: 5n,
      },
      allowances: {
        [tokenAddress]: 7n,
      },
    })
  })

  it('marks allowances as loading while allowance state is unresolved', () => {
    const balancesState: BalancesState = {
      chainId: 1,
      error: null,
      fromCache: false,
      hasFirstLoad: true,
      isLoading: false,
      values: {},
    }

    expect(getBalancesAndAllowances(balancesState, null, {}, 1, '0xowner', '0xspender')).toEqual({
      isLoading: true,
      balances: {},
      allowances: {},
    })
  })
})

describe('observeReduxOrders', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('recomputes orders table state from observed atom values', () => {
    const connector = { id: 'mock-connector' }
    const account = '0x2222222222222222222222222222222222222222'
    const spender = '0x3333333333333333333333333333333333333333'
    const tokenAddress = '0x1111111111111111111111111111111111111111'
    const pendingOrder = { id: 'pending-order', status: OrderStatus.PENDING }
    const openOrder = { id: 'open-order', status: OrderStatus.PENDING }
    const filteredOrder = { id: 'filtered-order', status: OrderStatus.PENDING }
    const ordersList = {
      ...EMPTY_ORDERS_LIST,
      [OrderTabId.OPEN]: [openOrder],
    }
    const balancesState: BalancesState = {
      chainId: 1,
      error: null,
      fromCache: false,
      hasFirstLoad: true,
      isLoading: false,
      values: {
        [tokenAddress]: 5n,
      },
    }
    const allowancesState = {
      [tokenAddress]: 3n,
    }
    const allowancesAtom = tokenAllowancesFamily({
      connector: connector as never,
      chainId: 1,
      account,
      spender,
      tokenAddresses: [tokenAddress],
    })

    ;(getReduxOrdersStateByChain as jest.Mock).mockReturnValue({
      lastCheckedBlock: 123,
    })
    ;(getReduxOrdersByOrderTypeFromNetworkState as jest.Mock).mockReturnValue({
      ordersTokensSet: new Set([tokenAddress]),
      reduxOrders: [pendingOrder],
    })
    getOrdersTableList.mockReturnValue(ordersList)
    getFilteredOrders.mockReturnValue([filteredOrder])

    const get = createGetter(
      new Map<unknown, unknown>([
        [walletInfoAtom, { account, chainId: 1, connector }],
        [ordersTableOrderTypeAtom, TabOrderTypes.LIMIT],
        [reduxOrdersStateAtom, {}],
        [tradeSpenderAtom, spender],
        [balancesAtom, balancesState],
        [allowancesAtom, allowancesState],
        [optimisticAllowancesAtom, {}],
        [pendingOrdersPermitValidityStateAtom, {}],
        [tabParamAtom, null],
        [
          ordersTableFiltersAtom,
          {
            historyStatusFilter: HistoryStatusFilter.ALL,
            searchTerm: '',
          },
        ],
      ]),
    )
    const set = jest.fn<void, [unknown, unknown]>() as Setter

    observeReduxOrders(get, set)

    expect(getReduxOrdersByOrderTypeFromNetworkState).toHaveBeenCalledWith({
      account,
      reduxOrdersStateInCurrentChain: { lastCheckedBlock: 123 },
      uiOrderType: UiOrderType.LIMIT,
    })
    expect(getOrdersTableList).toHaveBeenCalledWith(
      [pendingOrder],
      TabOrderTypes.LIMIT,
      1,
      {
        isLoading: false,
        balances: {
          [tokenAddress]: 5n,
        },
        allowances: {
          [tokenAddress]: 3n,
        },
      },
      {},
      expect.any(Function),
    )
    expect(getFilteredOrders).toHaveBeenCalledWith([openOrder], {
      historyStatusFilter: HistoryStatusFilter.ALL,
      searchTerm: '',
    })
    expect(set).toHaveBeenCalledWith(ordersTableStateAtom, {
      balancesAndAllowances: {
        isLoading: false,
        balances: {
          [tokenAddress]: 5n,
        },
        allowances: {
          [tokenAddress]: 3n,
        },
      },
      filteredOrders: [filteredOrder],
      hasHydratedOrders: true,
      orders: [openOrder],
      ordersList,
      pendingOrders: [pendingOrder],
      reduxOrders: [pendingOrder],
    })
  })

  it('resets table state when wallet context is incomplete', () => {
    const get = createGetter(new Map<unknown, unknown>([[walletInfoAtom, { account: undefined, chainId: 1 }]]))
    const set = jest.fn<void, [unknown, unknown]>() as Setter

    observeReduxOrders(get, set)

    expect(set).toHaveBeenCalledWith(ordersTableStateAtom, EMPTY_ORDERS_TABLE_STATE)
  })

  it('maps swap table orders to limit orders while preserving the swap table type', () => {
    const connector = { id: 'mock-connector' }
    const account = '0x2222222222222222222222222222222222222222'
    const spender = '0x3333333333333333333333333333333333333333'
    const tokenAddress = '0x1111111111111111111111111111111111111111'
    const swapOrder = { id: 'swap-order', status: OrderStatus.PENDING }
    const ordersList = {
      ...EMPTY_ORDERS_LIST,
      [OrderTabId.OPEN]: [swapOrder],
    }
    const balancesState: BalancesState = {
      chainId: 1,
      error: null,
      fromCache: false,
      hasFirstLoad: true,
      isLoading: false,
      values: {},
    }
    const allowancesAtom = tokenAllowancesFamily({
      connector: connector as never,
      chainId: 1,
      account,
      spender,
      tokenAddresses: [tokenAddress],
    })

    ;(getReduxOrdersStateByChain as jest.Mock).mockReturnValue({
      lastCheckedBlock: 123,
    })
    ;(getReduxOrdersByOrderTypeFromNetworkState as jest.Mock).mockReturnValue({
      ordersTokensSet: new Set([tokenAddress]),
      reduxOrders: [swapOrder],
    })
    getOrdersTableList.mockReturnValue(ordersList)
    getFilteredOrders.mockReturnValue([swapOrder])

    const get = createGetter(
      new Map<unknown, unknown>([
        [walletInfoAtom, { account, chainId: 1, connector }],
        [ordersTableOrderTypeAtom, TabOrderTypes.SWAP],
        [reduxOrdersStateAtom, {}],
        [tradeSpenderAtom, spender],
        [balancesAtom, balancesState],
        [allowancesAtom, {}],
        [optimisticAllowancesAtom, {}],
        [pendingOrdersPermitValidityStateAtom, {}],
        [tabParamAtom, null],
        [
          ordersTableFiltersAtom,
          {
            historyStatusFilter: HistoryStatusFilter.ALL,
            searchTerm: '',
          },
        ],
      ]),
    )

    observeReduxOrders(get, jest.fn<void, [unknown, unknown]>() as Setter)

    expect(getReduxOrdersByOrderTypeFromNetworkState).toHaveBeenCalledWith({
      account,
      reduxOrdersStateInCurrentChain: { lastCheckedBlock: 123 },
      uiOrderType: UiOrderType.LIMIT,
    })
    expect(getOrdersTableList).toHaveBeenCalledWith(
      [swapOrder],
      TabOrderTypes.SWAP,
      1,
      expect.any(Object),
      {},
      expect.any(Function),
    )
  })

  it('composes advanced orders from emulated TWAPs, emulated parts, and discrete TWAP orders', () => {
    const connector = { id: 'mock-connector' }
    const account = '0x2222222222222222222222222222222222222222'
    const spender = '0x3333333333333333333333333333333333333333'
    const tokenAddress = '0x1111111111111111111111111111111111111111'
    const emulatedTwapOrder = { id: 'emulated-twap', status: OrderStatus.PENDING }
    const emulatedPartOrder = { id: 'emulated-part', status: OrderStatus.PENDING }
    const virtualPartOrder = {
      composableCowInfo: { isVirtualPart: true },
      id: 'virtual-part',
      status: OrderStatus.PENDING,
    }
    const discreteTwapOrder = {
      composableCowInfo: { isVirtualPart: false },
      id: 'discrete-twap',
      status: OrderStatus.PENDING,
    }
    const expectedReduxOrders = [emulatedTwapOrder, emulatedPartOrder, discreteTwapOrder]
    const ordersList = {
      ...EMPTY_ORDERS_LIST,
      [OrderTabId.OPEN]: expectedReduxOrders,
    }
    const balancesState: BalancesState = {
      chainId: 1,
      error: null,
      fromCache: false,
      hasFirstLoad: true,
      isLoading: false,
      values: {},
    }
    const allowancesAtom = tokenAllowancesFamily({
      connector: connector as never,
      chainId: 1,
      account,
      spender,
      tokenAddresses: [tokenAddress],
    })

    ;(getReduxOrdersStateByChain as jest.Mock).mockReturnValue({
      lastCheckedBlock: 123,
    })
    ;(getReduxOrdersByOrderTypeFromNetworkState as jest.Mock).mockReturnValue({
      ordersTokensSet: new Set([tokenAddress]),
      reduxOrders: [virtualPartOrder, discreteTwapOrder],
    })
    getOrdersTableList.mockReturnValue(ordersList)
    getFilteredOrders.mockReturnValue(expectedReduxOrders)

    const get = createGetter(
      new Map<unknown, unknown>([
        [walletInfoAtom, { account, chainId: 1, connector }],
        [ordersTableOrderTypeAtom, TabOrderTypes.ADVANCED],
        [reduxOrdersStateAtom, {}],
        [tradeSpenderAtom, spender],
        [balancesAtom, balancesState],
        [allowancesAtom, {}],
        [optimisticAllowancesAtom, {}],
        [pendingOrdersPermitValidityStateAtom, {}],
        [tabParamAtom, null],
        [isAtomicBatchSupportedLoadableAtom, { data: true, state: 'hasData' }],
        [emulatedTwapOrdersAtom, [emulatedTwapOrder]],
        [emulatedPartOrdersAtom, [emulatedPartOrder]],
        [
          ordersTableFiltersAtom,
          {
            historyStatusFilter: HistoryStatusFilter.ALL,
            searchTerm: '',
          },
        ],
      ]),
    )

    observeReduxOrders(get, jest.fn<void, [unknown, unknown]>() as Setter)

    expect(getReduxOrdersByOrderTypeFromNetworkState).toHaveBeenCalledWith({
      account,
      reduxOrdersStateInCurrentChain: { lastCheckedBlock: 123 },
      uiOrderType: UiOrderType.TWAP,
    })
    expect(getOrdersTableList).toHaveBeenCalledWith(
      expectedReduxOrders,
      TabOrderTypes.ADVANCED,
      1,
      expect.any(Object),
      {},
      expect.any(Function),
    )
  })
})

describe('observeOrdersUrl', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('redirects to the derived tab and page when URL params are stale', () => {
    const location = {
      hash: '',
      key: 'test',
      pathname: '/1/limit',
      search: '?tab=history&page=1',
      state: undefined,
    }
    const get = createGetter(
      new Map<unknown, unknown>([
        [locationOrderTypeAtom, TabOrderTypes.LIMIT],
        [ordersTableOrderTypeAtom, TabOrderTypes.LIMIT],
        [tabParamAtom, OrderTabId.HISTORY],
        [pageParamAtom, 1],
        [ordersTableTabIdAtom, OrderTabId.OPEN],
        [ordersTablePageAtom, 2],
        [locationAtom, location],
      ]),
    )

    observeOrdersUrl(get)

    expect(hashHistory.replace).toHaveBeenCalledWith('/1/limit?tab=open&page=2')
  })

  it('does not redirect outside limit and advanced routes', () => {
    const get = createGetter(
      new Map<unknown, unknown>([
        [locationOrderTypeAtom, TabOrderTypes.SWAP],
        [ordersTableOrderTypeAtom, TabOrderTypes.SWAP],
      ]),
    )

    observeOrdersUrl(get)

    expect(hashHistory.replace).not.toHaveBeenCalled()
  })
})
