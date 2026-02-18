jest.mock('cowSdk', () => ({
  metadataApiSDK: {
    generateAppDataDoc: jest.fn(),
  },
}))

import { LATEST_APP_DATA_VERSION, SupportedChainId, type LatestAppDataDocVersion } from '@cowprotocol/cow-sdk'

import { metadataApiSDK } from 'cowSdk'

import { toKeccak256 } from 'common/utils/toKeccak256'

import { buildAppData, type BuildAppDataParams } from './buildAppData'

const mockGenerateAppDataDoc = metadataApiSDK.generateAppDataDoc as jest.MockedFunction<
  typeof metadataApiSDK.generateAppDataDoc
>

const baseDoc: LatestAppDataDocVersion = {
  appCode: 'CoW Swap',
  environment: 'production',
  metadata: {
    orderClass: { orderClass: 'market' },
    quote: { slippageBips: 4 },
  },
  version: LATEST_APP_DATA_VERSION,
}

function getFirstGenerateCallArg(): Record<string, unknown> {
  const firstCall = mockGenerateAppDataDoc.mock.calls[0]

  if (!firstCall || firstCall.length === 0) {
    throw new Error('Expected metadataApiSDK.generateAppDataDoc to be called')
  }

  const firstCallArg = firstCall[0]

  if (!firstCallArg || typeof firstCallArg !== 'object') {
    throw new Error('Expected metadataApiSDK.generateAppDataDoc to be called with an object payload')
  }

  return firstCallArg as Record<string, unknown>
}

function getFirstGenerateCallMetadata(): Record<string, unknown> {
  const firstCallArg = getFirstGenerateCallArg()
  const metadata = firstCallArg['metadata']

  if (!metadata || typeof metadata !== 'object') {
    throw new Error('Expected metadata in metadataApiSDK.generateAppDataDoc payload')
  }

  return metadata as Record<string, unknown>
}

describe('buildAppData', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGenerateAppDataDoc.mockResolvedValue(baseDoc)
  })

  it('omits utm from appData metadata', async () => {
    const params: BuildAppDataParams = {
      appCode: 'CoW Swap',
      chainId: SupportedChainId.MAINNET,
      environment: 'production',
      orderClass: 'market',
      slippageBips: 4,
    }

    const result = await buildAppData(params)
    const metadata = getFirstGenerateCallMetadata()

    expect(metadata).not.toHaveProperty('utm')
    expect(result.doc.metadata).not.toHaveProperty('utm')
    expect(result.appDataKeccak256).toEqual(toKeccak256(result.fullAppData))
  })

  it('keeps other metadata fields untouched while omitting utm', async () => {
    const params: BuildAppDataParams = {
      appCode: 'CoW Swap',
      chainId: SupportedChainId.MAINNET,
      environment: 'production',
      isSmartSlippage: true,
      orderClass: 'limit',
      referrerAccount: '0x1234',
      replacedOrderUid: '0xoldOrder',
      slippageBips: 7,
    }

    await buildAppData(params)
    const metadata = getFirstGenerateCallMetadata()

    expect(metadata).toEqual(
      expect.objectContaining({
        orderClass: { orderClass: 'limit' },
        quote: { slippageBips: 7, smartSlippage: true },
        referrer: { code: '0x1234' },
        replacedOrder: { uid: '0xoldOrder' },
      }),
    )
    expect(metadata).not.toHaveProperty('utm')
  })
})
