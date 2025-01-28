import { Provider as JotaiProvider } from 'jotai'
import { useHydrateAtoms } from 'jotai/utils'
import { createStore } from 'jotai/vanilla'
import { ReactElement, ReactNode, useMemo } from 'react'

import { isInjectedWidget } from '@cowprotocol/common-utils'
import { WalletProvider } from '@cowprotocol/wallet'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'
import { render } from '@testing-library/react'
import { LocationDescriptorObject } from 'history'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components/macro'
import { getCowswapTheme } from 'theme'

import { cowSwapStore } from 'legacy/state'
import { useIsDarkMode } from 'legacy/state/user/hooks'

import { LanguageProvider } from './i18n'

type JotaiStore = ReturnType<typeof createStore>

const MockedI18nProvider = ({ children }: any) => <I18nProvider i18n={i18n}>{children}</I18nProvider>

const MockThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const darkMode = useIsDarkMode()
  const isInjectedWidgetMode = isInjectedWidget()

  const themeObject = useMemo(() => getCowswapTheme(darkMode, isInjectedWidgetMode), [darkMode, isInjectedWidgetMode])

  return <StyledComponentsThemeProvider theme={themeObject}>{children}</StyledComponentsThemeProvider>
}

const WithProviders = ({ children }: { children?: ReactNode }) => {
  return (
    <LanguageProvider>
      <MockedI18nProvider>
        <Provider store={cowSwapStore}>
          <WalletProvider>
            <MockThemeProvider>{children}</MockThemeProvider>
          </WalletProvider>
        </Provider>
      </MockedI18nProvider>
    </LanguageProvider>
  )
}

const customRender = (ui: ReactElement) => render(ui, { wrapper: WithProviders })

export * from '@testing-library/react'
export { customRender as render }

export function WithMockedWeb3({ children, location }: { children?: ReactNode; location?: LocationDescriptorObject }) {
  return (
    <MemoryRouter initialEntries={location ? [location] : undefined}>
      <Provider store={cowSwapStore}>
        <WalletProvider>{children}</WalletProvider>
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
