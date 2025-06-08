import { Provider as JotaiProvider } from 'jotai'
import { useHydrateAtoms } from 'jotai/utils'
import { createStore } from 'jotai/vanilla'
import { ReactElement, ReactNode, useMemo } from 'react'

import { Web3Provider } from '@cowprotocol/wallet'
import { initializeConnector, Web3ReactHooks, Web3ReactProvider } from '@web3-react/core'
import { Connector } from '@web3-react/types'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router'
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components/macro'
import { getCowswapTheme } from 'theme'

import { cowSwapStore } from 'legacy/state'
import { useIsDarkMode } from 'legacy/state/user/hooks'

import { LanguageProvider } from './i18n'

type JotaiStore = ReturnType<typeof createStore>

// TODO: Replace any with proper type definitions
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-function-return-type
const MockedI18nProvider = ({ children }: any) => <I18nProvider i18n={i18n}>{children}</I18nProvider>

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const MockThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const darkMode = useIsDarkMode()

  const themeObject = useMemo(() => getCowswapTheme(darkMode), [darkMode])

  return <StyledComponentsThemeProvider theme={themeObject}>{children}</StyledComponentsThemeProvider>
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const WithProviders = ({ children }: { children?: ReactNode }) => {
  return (
    <LanguageProvider>
      <MockedI18nProvider>
        <Provider store={cowSwapStore}>
          <Web3Provider selectedWallet={undefined}>
            <MockThemeProvider>{children}</MockThemeProvider>
          </Web3Provider>
        </Provider>
      </MockedI18nProvider>
    </LanguageProvider>
  )
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const customRender = (ui: ReactElement) => render(ui, { wrapper: WithProviders })

export * from '@testing-library/react'
export { customRender as render }

class MockedConnector extends Connector {
  activate(): Promise<void> {
    return Promise.resolve()
  }

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  getActions() {
    return this.actions
  }
}

export const [mockedConnector, mockedConnectorHooks] = initializeConnector<MockedConnector>(
  (actions) => new MockedConnector(actions),
)

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function WithMockedWeb3({ children, location }: { children?: ReactNode; location?: Location }) {
  const connectors: [Connector, Web3ReactHooks][] = [[mockedConnector, mockedConnectorHooks]]

  return (
    <MemoryRouter initialEntries={location ? [location] : undefined}>
      <Provider store={cowSwapStore}>
        <Web3ReactProvider connectors={connectors}>{children}</Web3ReactProvider>
      </Provider>
    </MemoryRouter>
  )
}

const HydrateAtoms = ({
  initialValues,
  children,
  store,
}: {
  store?: JotaiStore
  // TODO: Replace any with proper type definitions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialValues: any[]
  children?: ReactNode
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
}) => {
  useHydrateAtoms(initialValues, { store })
  return <>{children}</>
}

export const JotaiTestProvider = ({
  initialValues,
  children,
  store,
}: {
  // TODO: Replace any with proper type definitions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialValues: any[]
  children?: ReactNode
  store?: JotaiStore
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
}) => (
  <JotaiProvider store={store}>
    <HydrateAtoms initialValues={initialValues} store={store}>
      {children}
    </HydrateAtoms>
  </JotaiProvider>
)
