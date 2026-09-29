import { Token } from '@cowprotocol/currency'
import { WidgetHookEvents } from '@cowprotocol/widget-lib'

import { callWidgetHook } from './callWidgetHook'
import { fireOnBeforeApprovalHook, WidgetHookDeclineError } from './fireOnBeforeApprovalHook'

jest.mock('./callWidgetHook', () => ({ callWidgetHook: jest.fn() }))

const mockCallWidgetHook = callWidgetHook as jest.MockedFunction<typeof callWidgetHook>

const sellCurrency = new Token(1, '0x1111111111111111111111111111111111111111', 18, 'SELL', 'Sell Token')

const params = {
  sellCurrency,
  sellAmount: 1000000000000000000n,
  walletAddress: '0xaccount',
  spenderAddress: '0xspender',
}

describe('fireOnBeforeApprovalHook', () => {
  beforeEach(() => jest.clearAllMocks())

  it('fires ON_BEFORE_APPROVAL with the sell token payload', async () => {
    mockCallWidgetHook.mockResolvedValue(true)

    await fireOnBeforeApprovalHook(params)

    expect(mockCallWidgetHook).toHaveBeenCalledWith(WidgetHookEvents.ON_BEFORE_APPROVAL, {
      chainId: 1,
      sellToken: {
        chainId: 1,
        address: sellCurrency.address,
        decimals: 18,
        name: 'Sell Token',
        symbol: 'SELL',
      },
      sellAmount: '1000000000000000000',
      walletAddress: '0xaccount',
      spenderAddress: '0xspender',
    })
  })

  it('defaults sellAmount to "0" when no amount is given', async () => {
    mockCallWidgetHook.mockResolvedValue(true)

    await fireOnBeforeApprovalHook({ ...params, sellAmount: undefined })

    expect(mockCallWidgetHook).toHaveBeenCalledWith(
      WidgetHookEvents.ON_BEFORE_APPROVAL,
      expect.objectContaining({ sellAmount: '0' }),
    )
  })

  it('throws WidgetHookDeclineError when the host widget declines', async () => {
    mockCallWidgetHook.mockResolvedValue(false)

    await expect(fireOnBeforeApprovalHook(params)).rejects.toBeInstanceOf(WidgetHookDeclineError)
  })
})
