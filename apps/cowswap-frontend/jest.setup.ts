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
  ...jest.requireActual('@cowprotocol/analytics'),
  initGtm: jest.fn().mockImplementation(() => ({
    sendEvent: jest.fn(),
  })),
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
