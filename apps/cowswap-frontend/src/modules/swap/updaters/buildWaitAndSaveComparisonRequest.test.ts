import type { QuoteBridgeRequest } from '@cowprotocol/sdk-bridging'

import { buildAppData, type UseAppDataParams } from 'modules/appData'

import { buildWaitAndSaveComparisonRequest } from './buildWaitAndSaveComparisonRequest'

jest.mock('modules/appData', () => ({
  buildAppData: jest.fn(),
  toBuildAppDataParams: jest.fn((params: UseAppDataParams) =>
    params.appCodeWithWidgetMetadata
      ? {
          appCode: params.appCodeWithWidgetMetadata.appCode,
          enableWaitForCow: params.enableWaitForCow,
          orderClass: params.orderClass,
          slippageBips: params.slippageBips,
          utm: params.utm,
        }
      : undefined,
  ),
}))

jest.mock('tradingSdk/tradingSdk', () => ({
  QUOTE_SETTINGS: { quoteRequest: { priceQuality: 'verified' } },
}))

const buildAppDataMock = buildAppData as jest.MockedFunction<typeof buildAppData>

const quoteParams = { amount: 1n, validFor: 1_800 } as QuoteBridgeRequest
const appDataParams = {
  appCodeWithWidgetMetadata: { appCode: 'CoW Swap' },
  orderClass: 'market',
  slippageBips: 50,
  utm: undefined,
} as UseAppDataParams

describe('buildWaitAndSaveComparisonRequest', () => {
  beforeEach(() => {
    buildAppDataMock.mockImplementation(async (params) => ({
      appDataKeccak256: '0xhash',
      doc: { metadata: { enableWaitForCow: params.enableWaitForCow } } as Awaited<
        ReturnType<typeof buildAppData>
      >['doc'],
      fullAppData: '{}',
    }))
  })

  it('requests the on-quote with enableWaitForCow and the swap quote lifetime', async () => {
    const request = await buildWaitAndSaveComparisonRequest({
      appDataParams,
      isOnQuote: true,
      quoteParams,
    })

    expect(buildAppDataMock).toHaveBeenCalledWith(expect.objectContaining({ enableWaitForCow: true }))
    expect(request?.quoteParams.validFor).toBe(quoteParams.validFor)
    expect(request?.advancedSettings.appData).toEqual({ metadata: { enableWaitForCow: true } })
  })

  it('requests the off-quote without enableWaitForCow and with the swap quote lifetime', async () => {
    const request = await buildWaitAndSaveComparisonRequest({
      appDataParams,
      isOnQuote: false,
      quoteParams,
    })

    expect(buildAppDataMock).toHaveBeenCalledWith(expect.objectContaining({ enableWaitForCow: false }))
    expect(request?.quoteParams.validFor).toBe(quoteParams.validFor)
    expect(request?.advancedSettings.appData).toEqual({ metadata: { enableWaitForCow: false } })
  })
})
