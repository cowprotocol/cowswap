import { render } from '@testing-library/react'
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components/macro'

import { AppWrapper, BodyWrapper, Marginer } from './styled'

describe('AppWrapper', () => {
  it('does not enforce a minimum viewport height in widget mode', () => {
    const { getByTestId } = render(
      <StyledComponentsThemeProvider theme={{ isWidget: true } as never}>
        <AppWrapper data-testid="app-wrapper" />
      </StyledComponentsThemeProvider>,
    )

    expect(window.getComputedStyle(getByTestId('app-wrapper')).minHeight).toBe('auto')
  })

  it('keeps the full-page minimum height outside widget mode', () => {
    const { getByTestId } = render(
      <StyledComponentsThemeProvider theme={{ isWidget: false } as never}>
        <AppWrapper data-testid="app-wrapper" />
      </StyledComponentsThemeProvider>,
    )

    expect(window.getComputedStyle(getByTestId('app-wrapper')).minHeight).toBe('100vh')
  })
})

describe('BodyWrapper', () => {
  it('does not flex-grow in widget mode', () => {
    const { getByTestId } = render(
      <StyledComponentsThemeProvider theme={{ isWidget: true } as never}>
        <BodyWrapper data-testid="body-wrapper" />
      </StyledComponentsThemeProvider>,
    )

    expect(window.getComputedStyle(getByTestId('body-wrapper')).flex).toBe('0 0 auto')
  })

  it('uses the legacy widget shell padding by default', () => {
    const { getByTestId } = render(
      <StyledComponentsThemeProvider theme={{ isWidget: true } as never}>
        <BodyWrapper data-testid="body-wrapper" />
      </StyledComponentsThemeProvider>,
    )

    const computedStyle = window.getComputedStyle(getByTestId('body-wrapper'))

    expect(computedStyle.paddingTop).toBe('16px')
    expect(computedStyle.paddingRight).toBe('16px')
    expect(computedStyle.paddingBottom).toBe('0px')
    expect(computedStyle.paddingLeft).toBe('16px')
  })

  it('keeps the legacy flex behavior outside widget mode', () => {
    const { getByTestId } = render(
      <StyledComponentsThemeProvider theme={{ isWidget: false } as never}>
        <BodyWrapper data-testid="body-wrapper" />
      </StyledComponentsThemeProvider>,
    )

    expect(window.getComputedStyle(getByTestId('body-wrapper')).flex).toBe('1 1 auto')
  })
})

describe('Marginer', () => {
  it('does not add vertical spacing in widget mode', () => {
    const { getByTestId } = render(
      <StyledComponentsThemeProvider theme={{ isWidget: true } as never}>
        <Marginer data-testid="marginer" />
      </StyledComponentsThemeProvider>,
    )

    expect(window.getComputedStyle(getByTestId('marginer')).marginTop).toBe('0px')
  })

  it('keeps the legacy spacing outside widget mode', () => {
    const { getByTestId } = render(
      <StyledComponentsThemeProvider theme={{ isWidget: false } as never}>
        <Marginer data-testid="marginer" />
      </StyledComponentsThemeProvider>,
    )

    expect(window.getComputedStyle(getByTestId('marginer')).marginTop).toBe('5rem')
  })
})
