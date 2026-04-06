import { isInjectedWidget } from '@cowprotocol/common-utils'

import { render, screen } from '@testing-library/react'

import { BalancesDevtools } from './BalancesDevtools'

jest.mock('@cowprotocol/common-utils', () => ({
  isInjectedWidget: jest.fn(),
}))

jest.mock('jotai-devtools', () => ({
  DevTools: () => <div data-testid="balances-devtools" />,
}))

const isInjectedWidgetMock = isInjectedWidget as jest.MockedFunction<typeof isInjectedWidget>

describe('BalancesDevtools', () => {
  const originalNodeEnv = process.env.NODE_ENV

  beforeEach(() => {
    isInjectedWidgetMock.mockReturnValue(false)
  })

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv
  })

  it('renders in development outside widget mode', () => {
    process.env.NODE_ENV = 'development'

    render(<BalancesDevtools />)

    expect(screen.getByTestId('balances-devtools')).toBeTruthy()
  })

  it('does not render inside widget mode', () => {
    process.env.NODE_ENV = 'development'
    isInjectedWidgetMock.mockReturnValue(true)

    render(<BalancesDevtools />)

    expect(screen.queryByTestId('balances-devtools')).toBeNull()
  })
})
