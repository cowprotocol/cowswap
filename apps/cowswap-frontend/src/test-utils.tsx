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

const MockedI18nProvider = ({ children }: any) => <I18nProvider i18n={i18n}>{children}</I18nProvider>

const MockThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const darkMode = useIsDarkMode()

  const themeObject = useMemo(() => getCowswapTheme(darkMode), [darkMode])

  return <StyledComponentsThemeProvider theme={themeObject}>{children}</StyledComponentsThemeProvider>
}

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

const customRender = (ui: ReactElement) => render(ui, { wrapper: WithProviders })

export * from '@testing-library/react'
export { customRender as render }

class MockedConnector extends Connector {
  activate(): Promise<void> {
    return Promise.resolve()
  }

  getActions() {
    return this.actions
  }
}

export const [mockedConnector, mockedConnectorHooks] = initializeConnector<MockedConnector>(
  (actions) => new MockedConnector(actions),
)

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
  initialValues: any[]
  children?: ReactNode
}) => {
  useHydrateAtoms(initialValues, { store })
  return <>{children}</>
}

export const JotaiTestProvider = ({
  initialValues,
  children,
  store,
}: {
  initialValues: any[]
  children?: ReactNode
  store?: JotaiStore
}) => (
  <JotaiProvider store={store}>
    <HydrateAtoms initialValues={initialValues} store={store}>
      {children}
    </HydrateAtoms>
  </JotaiProvider>
)
