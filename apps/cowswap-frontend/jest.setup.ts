jest.mock('react-markdown', () => () => null)

jest.mock('lottie-react', () => () => null)

jest.mock('quick-lru', () => {
  return {
    __esModule: true,
    default: class MockQuickLRU extends Map {
      constructor() {
        super()
      }
    },
  }
})

jest.mock('@cowprotocol/analytics', () => {
  const excludedGtmKeys = new Set([
    'category',
    'action',
    'label',
    'value',
    'orderId',
    'orderType',
    'tokenSymbol',
    'chainId',
  ])

  return {
    __esModule: true,
    AnalyticsCategory: {},
    Category: {},
    CowAnalytics: class MockCowAnalytics {
      sendEvent = jest.fn()
    },
    CowAnalyticsProvider: ({ children }: { children: unknown }) => children,
    initGtm: jest.fn().mockImplementation(() => ({
      sendEvent: jest.fn(),
    })),
    initPixelAnalytics: jest.fn().mockImplementation(() => ({
      sendEvent: jest.fn(),
    })),
    setupEventHandlers: jest.fn(),
    toGtmEvent: (event: Record<string, unknown>) => {
      const ga4Event: Record<string, unknown> = {
        event: event['action'] || '',
        ...(event['category'] && { event_category: event['category'] }),
        ...(event['label'] && { event_label: event['label'] }),
        ...(event['value'] !== undefined && { event_value: event['value'] }),
      }
      for (const [key, value] of Object.entries(event)) {
        if (!excludedGtmKeys.has(key)) ga4Event[key] = value
      }
      return JSON.stringify(ga4Event)
    },
    useAnalyticsReporter: jest.fn(),
    useCowAnalytics: jest.fn().mockImplementation(() => ({
      sendEvent: jest.fn(),
    })),
    waitForAnalytics: jest.fn().mockResolvedValue(undefined),
    WebVitalsAnalytics: class MockWebVitalsAnalytics {
      constructor(_cowAnalytics?: unknown) {}
    },
    __resetGtmInstance: jest.fn(),
  }
})

beforeEach(() => {
  const { __resetGtmInstance } = require('@cowprotocol/analytics')
  __resetGtmInstance()
})

// eslint-disable-next-line @nx/enforce-module-boundaries
import '../../jest.setup'
import { i18n } from '@lingui/core'

i18n.load('en-US', {})
i18n.activate('en-US')

export { i18n }
