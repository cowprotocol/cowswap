import { createStore, Provider } from 'jotai'

import { fireEvent, render, screen } from '@testing-library/react'

import { ThemeSwitcher } from './ThemeSwitcher'

describe('ThemeSwitcher', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      value: () => ({ matches: false, addEventListener: () => undefined, removeEventListener: () => undefined }),
    })
  })

  afterEach(() => {
    localStorage.clear()
    delete document.documentElement.dataset.theme
  })

  it('switches the theme and marks the picked option', () => {
    render(
      <Provider store={createStore()}>
        <ThemeSwitcher />
      </Provider>,
    )

    expect(screen.getByRole('button', { name: 'System theme', pressed: true })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Dark theme' }))

    expect(screen.getByRole('button', { name: 'Dark theme', pressed: true })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'System theme', pressed: false })).toBeTruthy()
    expect(document.documentElement.dataset.theme).toBe('dark')
  })
})
