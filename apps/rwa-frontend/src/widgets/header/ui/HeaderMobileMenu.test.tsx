import { createStore, Provider } from 'jotai'

import { fireEvent, render, screen } from '@testing-library/react'

import { HeaderMobileMenu } from './HeaderMobileMenu'
import { SettingsMenu } from './SettingsMenu'

import { mockViewport } from '@/shared/lib/testing'

const MENU_WIDTH = 1000
const PAST_THE_MENU_WIDTH = 1400

let mockPathname = '/portfolio'

jest.mock('next/navigation', () => ({ usePathname: () => mockPathname }))

describe('HeaderMobileMenu', () => {
  let setWidth: (width: number) => void

  beforeEach(() => {
    mockPathname = '/portfolio'
    setWidth = mockViewport(MENU_WIDTH)
  })

  it('lists the pages and the legal links', () => {
    render(<HeaderMobileMenu />)

    fireEvent.click(screen.getByRole('button', { name: 'Menu' }))

    expect(screen.getByRole('link', { name: 'Portfolio' }).getAttribute('aria-current')).toBe('page')
    expect(screen.getByRole('link', { name: 'Explore' }).getAttribute('aria-current')).toBeNull()
    expect(screen.queryByRole('link', { name: 'Terms and Conditions' })).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'More' }))

    expect(screen.getByRole('link', { name: 'Terms and Conditions' }).getAttribute('href')).toBe(
      'https://cow.fi/legal/cowswap-terms',
    )
  })

  it('folds the legal links again when it reopens', () => {
    render(<HeaderMobileMenu />)
    const trigger = screen.getByRole('button', { name: 'Menu' })

    fireEvent.click(trigger)
    fireEvent.click(screen.getByRole('button', { name: 'More' }))
    fireEvent.click(trigger)
    fireEvent.click(trigger)

    expect(screen.queryByRole('link', { name: 'Terms and Conditions' })).toBeNull()
  })

  it('closes on Escape and returns the focus to the button', () => {
    render(<HeaderMobileMenu />)

    const trigger = screen.getByRole('button', { name: 'Menu' })

    fireEvent.click(trigger)
    fireEvent.keyDown(screen.getByRole('link', { name: 'Explore' }), { key: 'Escape' })

    expect(screen.queryByRole('navigation')).toBeNull()
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

    mockPathname = '/portfolio'
    rerender(<HeaderMobileMenu />)

    expect(screen.queryByRole('navigation')).toBeNull()
  })

  it('closes when the viewport grows past the menu breakpoint', () => {
    render(<HeaderMobileMenu />)

    fireEvent.click(screen.getByRole('button', { name: 'Menu' }))
    setWidth(PAST_THE_MENU_WIDTH)

    expect(screen.queryByRole('navigation')).toBeNull()

    setWidth(MENU_WIDTH)

    expect(screen.queryByRole('navigation')).toBeNull()
  })

  it('moves the focus to the settings gear when it closes past the menu breakpoint', () => {
    render(
      <Provider store={createStore()}>
        <SettingsMenu />
        <HeaderMobileMenu />
      </Provider>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Menu' }))
    screen.getByRole('link', { name: 'Explore' }).focus()
    setWidth(PAST_THE_MENU_WIDTH)

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
