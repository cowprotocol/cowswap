import { EOA_TWAP_POLL_FUNDS_DAPP_ID, isEoaTwapPollFundsHook } from '@cowprotocol/hook-dapp-lib'

jest.mock('modules/appData', () => ({
  getAppDataHooks: jest.fn(),
}))

/* eslint-disable @typescript-eslint/no-restricted-imports */
import { getAppDataHooks } from 'modules/appData'
/* eslint-enable @typescript-eslint/no-restricted-imports */

import type { GenericOrder } from 'common/types'

import { doesOrderUsePollerApproval } from './doesOrderUsePollerApproval'

const mockGetAppDataHooks = getAppDataHooks as jest.MockedFunction<typeof getAppDataHooks>

const POLLER = '0x8c1cdDC5c012A2c84D531855f3946D927FE38E1E'
const OTHER_POLLER = '0x1111111111111111111111111111111111111111'

describe('isEoaTwapPollFundsHook', () => {
  it('matches the EOA TWAP pollFunds dapp id', () => {
    expect(isEoaTwapPollFundsHook({ dappId: EOA_TWAP_POLL_FUNDS_DAPP_ID })).toBe(true)
    expect(isEoaTwapPollFundsHook({ dappId: 'other' })).toBe(false)
    expect(isEoaTwapPollFundsHook({})).toBe(false)
  })
})

describe('doesOrderUsePollerApproval', () => {
  const baseOrder = { id: 'order-1', isEoaTwapOrder: true } as GenericOrder

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns false for non-EOA TWAP orders', () => {
    expect(doesOrderUsePollerApproval({ ...baseOrder, isEoaTwapOrder: false }, POLLER)).toBe(false)
  })

  it('returns true when pollFunds hook targets the poller', () => {
    mockGetAppDataHooks.mockReturnValue({
      pre: [{ dappId: EOA_TWAP_POLL_FUNDS_DAPP_ID, target: POLLER, callData: '0x', gasLimit: '1' }],
    })

    expect(doesOrderUsePollerApproval(baseOrder, POLLER)).toBe(true)
  })

  it('returns false when pollFunds hook targets a different address', () => {
    mockGetAppDataHooks.mockReturnValue({
      pre: [{ dappId: EOA_TWAP_POLL_FUNDS_DAPP_ID, target: OTHER_POLLER, callData: '0x', gasLimit: '1' }],
    })

    expect(doesOrderUsePollerApproval(baseOrder, POLLER)).toBe(false)
  })

  it('falls back to isEoaTwapOrder when hooks are not parsed yet', () => {
    mockGetAppDataHooks.mockReturnValue(undefined)

    expect(doesOrderUsePollerApproval(baseOrder, POLLER)).toBe(true)
  })
})
