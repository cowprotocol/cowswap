import { createStore, Provider } from 'jotai'
import { ReactNode, useLayoutEffect } from 'react'

import { act, render, screen } from '@testing-library/react'
import { DefaultTheme, useTheme } from 'styled-components/macro'

import { themeConfigAtom } from './themeConfigAtom'
import { ThemeProvider } from './ThemeProvider'

jest.mock('./themeConfigAtom', () => ({
  themeConfigAtom: jest.requireActual('jotai').atom({ primary: 'initial' }),
}))

jest.mock('./ThemedGlobalStyle', () => ({
  ThemedGlobalStyle: () => null,
}))

function CurrentTheme(): ReactNode {
  return <span data-testid="theme">{useTheme().primary}</span>
}

function theme(primary: string): DefaultTheme {
  return { primary } as DefaultTheme
}

describe('ThemeProvider', () => {
  it('provides the theme held by the atom', () => {
    render(
      <Provider store={createStore()}>
        <ThemeProvider>
          <CurrentTheme />
        </ThemeProvider>
      </Provider>,
    )

    expect(screen.getByTestId('theme').textContent).toBe('initial')
  })

  it('picks up a theme set in a layout effect while it mounts', () => {
    const store = createStore()

    function SetsThemeOnMount(): null {
      useLayoutEffect(() => {
        store.set(themeConfigAtom, theme('set on mount'))
      }, [])

      return null
    }

    render(
      <Provider store={store}>
        <ThemeProvider>
          <SetsThemeOnMount />
          <CurrentTheme />
        </ThemeProvider>
      </Provider>,
    )

    expect(screen.getByTestId('theme').textContent).toBe('set on mount')
  })

  it('follows later changes to the atom', () => {
    const store = createStore()

    render(
      <Provider store={store}>
        <ThemeProvider>
          <CurrentTheme />
        </ThemeProvider>
      </Provider>,
    )

    act(() => store.set(themeConfigAtom, theme('changed')))

    expect(screen.getByTestId('theme').textContent).toBe('changed')
  })

  it('stops listening once unmounted', () => {
    const store = createStore()
    const { unmount } = render(
      <Provider store={store}>
        <ThemeProvider />
      </Provider>,
    )
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined)

    unmount()
    store.set(themeConfigAtom, theme('after unmount'))

    expect(consoleError).not.toHaveBeenCalled()
    consoleError.mockRestore()
  })
})
