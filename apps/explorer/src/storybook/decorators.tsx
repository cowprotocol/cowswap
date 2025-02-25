import React from 'react'

import { Network } from '@cowprotocol/cow-sdk'
import { Color } from '@cowprotocol/ui'

import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client'
// eslint-disable-next-line no-restricted-imports
import { StoryFnReactReturnType } from '@storybook/react/dist/ts3.9/client/preview/types'
import { Frame } from 'components/common/Frame'
import { withGlobalContext } from 'hooks/useGlobalState'
import { FormProvider, useForm, UseFormOptions } from 'react-hook-form'
import { MemoryRouter } from 'react-router'
import { combineReducers } from 'redux'
import { GLOBAL_INITIAL_STATE, globalRootReducer } from 'state'
import { networkReducer } from 'state/network'
import { ThemeProvider, getThemePalette, StaticGlobalStyle, Theme, ThemedGlobalStyle } from 'theme'

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
  const themePalette = getThemePalette(Theme.DARK)

  return (
    <>
      <Frame style={{ background: themePalette.bg1 }}>{children}</Frame>
      <br />
      <br />
      <code style={{ fontSize: '12px' }}>Theme: DARK</code>
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
    combineReducers({ networkId: networkReducer }),
  )
  return <Component />
}

export const Router = (DecoratedStory: () => React.ReactNode): React.ReactNode => (
  <MemoryRouter>{DecoratedStory()}</MemoryRouter>
)

export const CenteredAndFramed = (DecoratedStory: () => StoryFnReactReturnType): React.ReactNode => (
  <div style={{ textAlign: 'center' }}>
    <Frame style={{ display: 'inline-block', background: Color.explorer_bg1 }}>{DecoratedStory()}</Frame>
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
