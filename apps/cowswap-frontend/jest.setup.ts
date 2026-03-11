import type { ReactNode } from 'react'

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

jest.mock('@cowprotocol/analytics', () => ({
  __esModule: true,
  AnalyticsCategory: {},
  Category: {},
  CowAnalytics: class MockCowAnalytics {
    sendEvent = jest.fn()
  },
  CowAnalyticsProvider: ({ children }: { children: ReactNode }) => children,
  initGtm: jest.fn().mockImplementation(() => ({
    sendEvent: jest.fn(),
  })),
  initPixelAnalytics: jest.fn().mockImplementation(() => ({
    sendEvent: jest.fn(),
  })),
  setupEventHandlers: jest.fn(),
  toGtmEvent: jest.fn().mockImplementation((event) => JSON.stringify(event)),
  useAnalyticsReporter: jest.fn(),
  useCowAnalytics: jest.fn().mockImplementation(() => ({
    sendEvent: jest.fn(),
  })),
  waitForAnalytics: jest.fn().mockResolvedValue(undefined),
  WebVitalsAnalytics: class MockWebVitalsAnalytics {
    constructor(_cowAnalytics?: unknown) {}
  },
  __resetGtmInstance: jest.fn(),
}))

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
