import { createStore, Provider } from 'jotai'

import { fireEvent, render, screen } from '@testing-library/react'

import { SettingsMenu } from './SettingsMenu'

describe('SettingsMenu', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      value: () => ({ matches: false, addEventListener: () => undefined, removeEventListener: () => undefined }),
    })
  })

  afterEach(() => {
    localStorage.clear()
    delete document.documentElement.dataset.theme
  })

  function renderMenu(): void {
    render(
      <Provider store={createStore()}>
        <SettingsMenu />
      </Provider>,
    )
  }

  it('toggles the theme from the menu and closes it', async () => {
    renderMenu()

    fireEvent.click(screen.getByRole('button', { name: 'Settings' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Dark Mode' }))

    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(screen.queryByRole('menu')).toBeNull()
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Settings' }))

    fireEvent.click(screen.getByRole('button', { name: 'Settings' }))
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Light Mode' }))

    expect(document.documentElement.dataset.theme).toBe('light')
  })

  it('closes on Escape and returns the focus to the button', () => {
    renderMenu()
    const button = screen.getByRole('button', { name: 'Settings' })

    fireEvent.click(button)
    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Dark Mode' }))

    fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' })

    expect(screen.queryByRole('menu')).toBeNull()
    expect(document.activeElement).toBe(button)
  })
})
