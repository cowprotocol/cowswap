import { act, fireEvent, render, screen } from '@testing-library/react'

import { HeaderMobileMenu } from './HeaderMobileMenu'
import { SETTINGS_BUTTON_ID } from './SettingsMenu'

let mockPathname = '/portfolio'

jest.mock('next/navigation', () => ({ usePathname: () => mockPathname }))

const viewport = { matches: true, listeners: new Set<() => void>() }

describe('HeaderMobileMenu', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      value: () => ({
        get matches() {
          return viewport.matches
        },
        addEventListener: (_type: string, listener: () => void) => viewport.listeners.add(listener),
        removeEventListener: (_type: string, listener: () => void) => viewport.listeners.delete(listener),
      }),
    })
  })

  beforeEach(() => {
    mockPathname = '/portfolio'
    viewport.matches = true
  })

  it('lists the pages and the legal links, and locks the page scroll while open', () => {
    render(<HeaderMobileMenu />)

    fireEvent.click(screen.getByRole('button', { name: 'Menu' }))

    expect(screen.getByRole('link', { name: 'Portfolio' }).getAttribute('aria-current')).toBe('page')
    expect(screen.getByRole('link', { name: 'Explore' }).getAttribute('aria-current')).toBeNull()
    expect(screen.getByRole('link', { name: 'Swap' })).toBeTruthy()
    expect(document.body.style.overflow).toBe('hidden')
    expect(screen.queryByRole('link', { name: 'Terms and Conditions' })).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'More' }))

    expect(screen.getByRole('link', { name: 'Terms and Conditions' }).getAttribute('href')).toBe(
      'https://cow.fi/legal/cowswap-terms',
    )
  })

  it('closes on Escape and returns the focus to the button', () => {
    render(<HeaderMobileMenu />)

    const trigger = screen.getByRole('button', { name: 'Menu' })

    fireEvent.click(trigger)
    fireEvent.keyDown(screen.getByRole('link', { name: 'Explore' }), { key: 'Escape' })

    expect(screen.queryByRole('navigation')).toBeNull()
    expect(document.body.style.overflow).toBe('')
    expect(document.activeElement).toBe(trigger)
  })

  it('closes on Escape while the focus is outside the menu', () => {
    render(<HeaderMobileMenu />)

    const trigger = screen.getByRole('button', { name: 'Menu' })

    fireEvent.click(trigger)
    fireEvent.keyDown(document.body, { key: 'Escape' })

    expect(screen.queryByRole('navigation')).toBeNull()
    expect(document.activeElement).toBe(trigger)
  })

  it('closes when the page changes', () => {
    const { rerender } = render(<HeaderMobileMenu />)

    fireEvent.click(screen.getByRole('button', { name: 'Menu' }))
    mockPathname = '/asset/NVDA'
    rerender(<HeaderMobileMenu />)

    expect(screen.queryByRole('navigation')).toBeNull()
    expect(document.body.style.overflow).toBe('')

    mockPathname = '/portfolio'
    rerender(<HeaderMobileMenu />)

    expect(screen.queryByRole('navigation')).toBeNull()
  })

  it('locks the page scroll only while the viewport shows the menu', () => {
    viewport.matches = false
    render(<HeaderMobileMenu />)

    fireEvent.click(screen.getByRole('button', { name: 'Menu' }))

    expect(document.body.style.overflow).toBe('')
  })

  it('closes and releases the page scroll when the viewport grows past the menu breakpoint', () => {
    render(<HeaderMobileMenu />)

    fireEvent.click(screen.getByRole('button', { name: 'Menu' }))

    expect(document.body.style.overflow).toBe('hidden')

    viewport.matches = false
    act(() => viewport.listeners.forEach((listener) => listener()))

    expect(screen.queryByRole('navigation')).toBeNull()
    expect(document.body.style.overflow).toBe('')

    viewport.matches = true
    act(() => viewport.listeners.forEach((listener) => listener()))

    expect(screen.queryByRole('navigation')).toBeNull()
    expect(document.body.style.overflow).toBe('')
  })

  it('moves the focus to the settings gear when it closes past the menu breakpoint', () => {
    render(
      <>
        <button type="button" id={SETTINGS_BUTTON_ID}>
          Settings
        </button>
        <HeaderMobileMenu />
      </>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Menu' }))
    screen.getByRole('link', { name: 'Explore' }).focus()
    viewport.matches = false
    act(() => viewport.listeners.forEach((listener) => listener()))

    expect(screen.queryByRole('navigation')).toBeNull()
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Settings' }))
  })

  it('stays open on an Escape that another control handled', () => {
    render(<HeaderMobileMenu />)

    fireEvent.click(screen.getByRole('button', { name: 'Menu' }))
    document.body.addEventListener('keydown', (event) => event.preventDefault(), { once: true })
    fireEvent.keyDown(document.body, { key: 'Escape' })

    expect(screen.getByRole('navigation')).toBeTruthy()
  })
})
