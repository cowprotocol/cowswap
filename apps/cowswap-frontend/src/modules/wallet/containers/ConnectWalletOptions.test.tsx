import { render, RenderResult, screen } from '@testing-library/react'

// --- Stub component names used as test IDs ---
const COINBASE_WALLET = 'CoinbaseWalletOption'

// Fully mock @cowprotocol/wallet — it transitively imports browser-only connectors
// that cannot be instantiated in a jsdom/test environment.
// Stub components render a simple div with a data-testid; they intentionally
// ignore all incoming props to avoid React warnings about unknown DOM attributes.
jest.mock('@cowprotocol/wallet', () => ({
  CoinbaseWalletOption: () => <div data-testid="CoinbaseWalletOption" />,
  InjectedOption: () => <div data-testid="InjectedOption" />,
  MetaMaskSdkOption: () => <div data-testid="MetaMaskSdkOption" />,
  WalletConnectV2Option: () => <div data-testid="WalletConnectV2Option" />,
  Eip6963Option: () => <div data-testid="Eip6963Option" />,
  getIsInjected: () => false,
  getIsInjectedMobileBrowser: () => false,
  useMultiInjectedProviders: () => [],
  COINBASE_WALLET_RDNS: 'com.coinbase.wallet',
  TryActivation: undefined,
}))

jest.mock('@cowprotocol/common-hooks', () => ({
  useTheme: () => ({ darkMode: false }),
}))

jest.mock('@cowprotocol/common-utils', () => ({
  isMobile: false,
  isInjectedWidget: () => false,
  isTruthy: <T,>(v: T | null | undefined | false | '' | 0): v is T => Boolean(v),
}))

jest.mock('legacy/state/user/hooks', () => ({
  useSelectedWallet: () => undefined,
}))

// --- Import the component under test AFTER mocks are declared ---
import { ConnectWalletOptions } from './ConnectWalletOptions'

// Helper: renders the component with a pass-through children prop
function renderOptions(): RenderResult {
  return render(
    <ConnectWalletOptions tryActivation={jest.fn()}>
      {(content) => <div data-testid="wallet-options-container">{content}</div>}
    </ConnectWalletOptions>,
  )
}

describe('ConnectWalletOptions — Coinbase wallet rendering', () => {
  it('renders single CoinbaseWalletOption', () => {
    renderOptions()

    expect(screen.getByTestId(COINBASE_WALLET)).toBeTruthy()
  })
})
