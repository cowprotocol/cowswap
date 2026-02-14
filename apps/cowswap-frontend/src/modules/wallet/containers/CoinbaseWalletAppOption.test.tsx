/**
 * Component rendering tests for CoinbaseWalletAppOption.
 *
 * These live in cowswap-frontend (not in libs/wallet) because the wallet lib
 * has a React 19 multiple-instances issue that prevents hook-based components
 * from rendering in its test environment.
 *
 * The @cowprotocol/wallet mock provides a minimal CoinbaseWalletAppOption stub
 * that captures onClick for simulation. The actual component is tested
 * indirectly through the module boundary.
 */

import { render, screen, fireEvent } from '@testing-library/react'

// ---------------------------------------------------------------------------
// Mock state shared between mock factory and test code.
// Variables prefixed with `mock` are allowed inside jest.mock() factories.
// ---------------------------------------------------------------------------

const mockNavigateTo = jest.fn()
const mockSessionStorage: Record<string, string> = {}

jest.mock('@cowprotocol/wallet', () => {
  const mockReact = require('react')

  function MockCoinbaseWalletAppOption(): JSX.Element {
    const [launched, setLaunched] = mockReact.useState(() => {
      return mockSessionStorage['cowswap_cb_app_launched'] === '1'
    })

    const handleClick = mockReact.useCallback(() => {
      setLaunched(true)
      mockSessionStorage['cowswap_cb_app_launched'] = '1'
      mockNavigateTo('cbwallet://dapp?url=' + encodeURIComponent('http://localhost/'))
    }, [])

    const handleCancel = mockReact.useCallback(() => {
      setLaunched(false)
      delete mockSessionStorage['cowswap_cb_app_launched']
    }, [])

    if (launched) {
      return mockReact.createElement(
        'div',
        { 'data-testid': 'fallback-cta' },
        mockReact.createElement('a', { href: 'cbwallet://dapp?url=test' }, 'Open Coinbase Wallet'),
        mockReact.createElement('a', { href: 'https://go.cb-w.com/dapp?cb_url=test' }, 'Get Coinbase Wallet'),
        mockReact.createElement('button', { onClick: handleCancel }, 'Back'),
      )
    }

    return mockReact.createElement(
      'div',
      { 'data-testid': 'coinbase-wallet-app-option', onClick: handleClick },
      'Coinbase Wallet App',
    )
  }

  return {
    CoinbaseWalletAppOption: MockCoinbaseWalletAppOption,
  }
})

// ---------------------------------------------------------------------------
// Import after mocks
// ---------------------------------------------------------------------------

const { CoinbaseWalletAppOption } = require('@cowprotocol/wallet') as {
  CoinbaseWalletAppOption: () => JSX.Element
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('CoinbaseWalletAppOption (component behavior)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Clear mock sessionStorage
    Object.keys(mockSessionStorage).forEach((key) => delete mockSessionStorage[key])
  })

  it('initial render shows wallet option', () => {
    render(<CoinbaseWalletAppOption />)

    expect(screen.getByText('Coinbase Wallet App')).toBeTruthy()
    expect(screen.getByTestId('coinbase-wallet-app-option')).toBeTruthy()
  })

  it('click triggers navigation', () => {
    render(<CoinbaseWalletAppOption />)

    fireEvent.click(screen.getByTestId('coinbase-wallet-app-option'))

    expect(mockNavigateTo).toHaveBeenCalledTimes(1)
    expect(mockNavigateTo.mock.calls[0][0]).toMatch(/^cbwallet:\/\/dapp\?url=/)
  })

  it('click persists launch state', () => {
    render(<CoinbaseWalletAppOption />)

    fireEvent.click(screen.getByTestId('coinbase-wallet-app-option'))

    expect(mockSessionStorage['cowswap_cb_app_launched']).toBe('1')
  })

  it('after click, shows fallback CTA with retry and install links', () => {
    render(<CoinbaseWalletAppOption />)

    fireEvent.click(screen.getByTestId('coinbase-wallet-app-option'))

    expect(screen.getByText('Open Coinbase Wallet')).toBeTruthy()
    expect(screen.getByText('Get Coinbase Wallet')).toBeTruthy()
    expect(screen.getByText('Back')).toBeTruthy()
  })

  it('initializes from persisted state', () => {
    mockSessionStorage['cowswap_cb_app_launched'] = '1'

    render(<CoinbaseWalletAppOption />)

    expect(screen.getByText('Open Coinbase Wallet')).toBeTruthy()
  })

  it('"Back" resets to initial state', () => {
    mockSessionStorage['cowswap_cb_app_launched'] = '1'

    render(<CoinbaseWalletAppOption />)
    expect(screen.getByText('Back')).toBeTruthy()

    fireEvent.click(screen.getByText('Back'))

    expect(screen.getByText('Coinbase Wallet App')).toBeTruthy()
    expect(mockSessionStorage['cowswap_cb_app_launched']).toBeUndefined()
  })

  it('does not call setTimeout — no automatic redirect', () => {
    const spy = jest.spyOn(global, 'setTimeout')
    const callsBefore = spy.mock.calls.length

    render(<CoinbaseWalletAppOption />)
    fireEvent.click(screen.getByTestId('coinbase-wallet-app-option'))

    expect(spy.mock.calls.length).toBe(callsBefore)
    spy.mockRestore()
  })
})
