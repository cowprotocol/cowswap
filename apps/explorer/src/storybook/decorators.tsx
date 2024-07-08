import React, { useMemo } from 'react'

import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client'
import { faLightbulb, faMoon } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// eslint-disable-next-line no-restricted-imports
import { StoryFnReactReturnType } from '@storybook/react/dist/ts3.9/client/preview/types'
import combineReducers from 'combine-reducers'
import { ThemeToggle } from 'components/common/Button'
import { Frame } from 'components/common/Frame'
import { withGlobalContext } from 'hooks/useGlobalState'
import { useThemeManager } from 'hooks/useThemeManager'
import { FormProvider, useForm, UseFormOptions } from 'react-hook-form'
import { MemoryRouter } from 'react-router'
import { GLOBAL_INITIAL_STATE, globalRootReducer } from 'state'
import { reducer as networkReducer } from 'state/network'
import { ThemeProvider, getThemePalette, StaticGlobalStyle, Theme, ThemedGlobalStyle } from 'theme'
import { Network } from 'types'

export const GlobalStyles = (DecoratedStory: () => StoryFnReactReturnType): React.ReactNode => (
  <>
    <StaticGlobalStyle />
    <ThemeProvider>
      <ThemedGlobalStyle />
      {DecoratedStory()}
    </ThemeProvider>
  </>
)

const ThemeTogglerUnwrapped: React.FC = ({ children }) => {
  const [themeMode, setThemeMode] = useThemeManager()
  const [themePalette, isDarkMode] = useMemo(() => [getThemePalette(themeMode), themeMode === Theme.DARK], [themeMode])

  const handleDarkMode = (): void => setThemeMode(themeMode === Theme.DARK ? Theme.LIGHT : Theme.DARK)

  return (
    <>
      <Frame style={{ background: themePalette.bg1 }}>{children}</Frame>
      {/* Cheeky use of ButtonBase here :P */}
      <ThemeToggle onClick={handleDarkMode} mode={isDarkMode}>
        <FontAwesomeIcon icon={isDarkMode ? faMoon : faLightbulb} />
      </ThemeToggle>
      <br />
      <br />
      <code style={{ fontSize: '12px' }}>Current theme: {themeMode.toUpperCase()}</code>
    </>
  )
}
const WrappedThemeToggler: React.FC = withGlobalContext(ThemeTogglerUnwrapped, GLOBAL_INITIAL_STATE, globalRootReducer)

// Redux aware ThemeToggler - necessary for Theme
export const ThemeToggler = (DecoratedStory: () => React.ReactNode): React.ReactNode => (
  <WrappedThemeToggler>{DecoratedStory()}</WrappedThemeToggler>
)

export function NetworkDecorator(DecoratedStory: () => React.ReactNode): React.ReactNode {
  const Component = withGlobalContext(
    DecoratedStory,
    () => ({ networkId: Network.MAINNET }),
    combineReducers({ networkId: networkReducer })
  )
  return <Component />
}

export const Router = (DecoratedStory: () => React.ReactNode): React.ReactNode => (
  <MemoryRouter>{DecoratedStory()}</MemoryRouter>
)

export const CenteredAndFramed = (DecoratedStory: () => StoryFnReactReturnType): React.ReactNode => (
  <div style={{ textAlign: 'center' }}>
    <Frame style={{ display: 'inline-block' }}>{DecoratedStory()}</Frame>
  </div>
)

const apolloClient = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/gnosis/protocol',
  cache: new InMemoryCache(),
})

export const Apollo = (DecoratedStory: () => StoryFnReactReturnType): React.ReactNode => (
  <ApolloProvider client={apolloClient}>
    <Frame style={{ display: 'inline-block' }}>{DecoratedStory()}</Frame>
  </ApolloProvider>
)

export const Form = (args?: UseFormOptions) =>
  function InnerForm(DecoratedStory: () => StoryFnReactReturnType): React.ReactNode {
    const methods = useForm(args)
    return (
      <Frame>
        <FormProvider {...methods}>
          <form>{DecoratedStory()}</form>
        </FormProvider>
      </Frame>
    )
  }

export const FormEmpty = Form()
