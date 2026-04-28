import { useCowAnalytics } from '@cowprotocol/analytics'

import { act, renderHook } from '@testing-library/react'

import { CowSwapAnalyticsCategory } from 'common/analytics/types'

import { useAffiliatePartnerCodeCreate } from './useAffiliatePartnerCodeCreate'
import { useAffiliatePartnerInfo } from './useAffiliatePartnerInfo'

import { bffAffiliateApi } from '../api/bffAffiliateApi'
import { AFFILIATE_PAYOUTS_CHAIN_ID } from '../config/affiliateProgram.const'

import type { WalletClient } from 'viem'

jest.mock('@cowprotocol/analytics', () => {
  const actualModule = jest.requireActual('@cowprotocol/analytics')

  return {
    ...actualModule,
    __resetGtmInstance: jest.fn(),
    useCowAnalytics: jest.fn(),
  }
})

jest.mock('./useAffiliatePartnerInfo', () => ({
  useAffiliatePartnerInfo: jest.fn(),
}))

jest.mock('./useAffiliateTraderWallet', () => ({
  TraderWalletStatus: {
    PENDING: 'pending',
    UNSUPPORTED: 'unsupported',
    INELIGIBLE: 'ineligible',
    ELIGIBLE: 'eligible',
    LINKED: 'linked',
    ELIGIBILITY_UNKNOWN: 'eligibility-unknown',
    DISCONNECTED: 'disconnected',
  },
}))

jest.mock('../api/bffAffiliateApi', () => ({
  bffAffiliateApi: {
    createCode: jest.fn(),
  },
}))

jest.mock('../lib/affiliateProgramUtils', () => ({
  buildPartnerTypedData: jest.fn(({ walletAddress, code, chainId }) => ({
    domain: {
      name: 'CoW Affiliate',
      version: '1',
      chainId,
      verifyingContract: '0x0000000000000000000000000000000000000001',
    },
    types: {
      AffiliateCode: [
        { name: 'walletAddress', type: 'address' },
        { name: 'code', type: 'string' },
      ],
    },
    message: {
      walletAddress,
      code,
    },
  })),
}))

const useCowAnalyticsMock = useCowAnalytics as jest.MockedFunction<typeof useCowAnalytics>
const useAffiliatePartnerInfoMock = useAffiliatePartnerInfo as jest.MockedFunction<typeof useAffiliatePartnerInfo>
const createCodeMock = bffAffiliateApi.createCode as jest.MockedFunction<typeof bffAffiliateApi.createCode>

function createDeferred<T>(): {
  promise: Promise<T>
  resolve: (value: T) => void
  reject: (error?: unknown) => void
} {
  let resolve: (value: T) => void = () => {
    throw new Error('deferred not initialized')
  }
  let reject: (error?: unknown) => void = () => {
    throw new Error('deferred not initialized')
  }
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })

  return { promise, resolve, reject }
}

function createWalletClient(): WalletClient {
  return {
    account: { address: '0x1111111111111111111111111111111111111111' },
    signTypedData: jest.fn().mockResolvedValue('0xsigned-message'),
  } as unknown as WalletClient
}

describe('useAffiliatePartnerCodeCreate', () => {
  const sendEvent = jest.fn()
  const mutatePartnerInfo = jest.fn().mockResolvedValue(undefined)
  const setError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()

    useCowAnalyticsMock.mockReturnValue({
      sendEvent,
    } as unknown as ReturnType<typeof useCowAnalytics>)
    useAffiliatePartnerInfoMock.mockReturnValue({
      mutate: mutatePartnerInfo,
    } as unknown as ReturnType<typeof useAffiliatePartnerInfo>)
  })

  it('ignores a second create request while the first one is still in flight', async () => {
    const deferredCreate = createDeferred<{ code: string }>()
    const walletClient = createWalletClient()

    createCodeMock.mockImplementation(() => deferredCreate.promise)

    const { result } = renderHook(() =>
      useAffiliatePartnerCodeCreate({
        account: '0x1111111111111111111111111111111111111111',
        walletClient,
        code: 'COW-123',
        setError,
      }),
    )

    let firstRequest: Promise<void> = Promise.resolve()
    let secondRequest: Promise<void> = Promise.resolve()

    await act(async () => {
      firstRequest = result.current.onCreate()
      secondRequest = result.current.onCreate()
      await Promise.resolve()
    })

    expect(walletClient.signTypedData).toHaveBeenCalledTimes(1)
    expect(createCodeMock).toHaveBeenCalledTimes(1)

    deferredCreate.resolve({ code: 'COW-123' })

    await act(async () => {
      await Promise.all([firstRequest, secondRequest])
    })

    expect(mutatePartnerInfo).toHaveBeenCalledTimes(1)

    const trackedEvents = sendEvent.mock.calls.map(([event]) => event)
    const startedEvents = trackedEvents.filter((event) => event.action === 'affiliate_partner_code_create_started')
    const completedEvents = trackedEvents.filter((event) => event.action === 'affiliate_partner_code_create_completed')

    expect(startedEvents).toHaveLength(1)
    expect(completedEvents).toHaveLength(1)
    expect(completedEvents[0]).toEqual({
      category: CowSwapAnalyticsCategory.AFFILIATE,
      action: 'affiliate_partner_code_create_completed',
      chainId: AFFILIATE_PAYOUTS_CHAIN_ID,
      result: 'success',
    })
  })

  it('continues code creation if the start event throws', async () => {
    const walletClient = createWalletClient()

    sendEvent.mockImplementationOnce(() => {
      throw new Error('analytics failed')
    })
    createCodeMock.mockResolvedValue({ code: 'COW-123' } as Awaited<ReturnType<typeof bffAffiliateApi.createCode>>)

    const { result } = renderHook(() =>
      useAffiliatePartnerCodeCreate({
        account: '0x1111111111111111111111111111111111111111',
        walletClient,
        code: 'COW-123',
        setError,
      }),
    )

    await act(async () => {
      await result.current.onCreate()
    })

    expect(walletClient.signTypedData).toHaveBeenCalledTimes(1)
    expect(createCodeMock).toHaveBeenCalledTimes(1)
    expect(mutatePartnerInfo).toHaveBeenCalledTimes(1)
    expect(setError.mock.calls).toEqual([[undefined]])
  })
})
