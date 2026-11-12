import { ReactNode } from 'react'

import { act, fireEvent, render, renderHook, screen } from '@testing-library/react'

import { COOKIE_CONSENT_NAME } from './cookieConsent.constants'
import { __resetCookieConsentStore, acceptCookies, openCookieSettings } from './cookieConsent.store'
import { useCookieConsentBanner } from './useCookieConsentBanner'

function Banner(): ReactNode {
  const banner = useCookieConsentBanner()

  if (!banner.isOpen) return null

  return (
    <section {...banner.dialogProps} aria-label="Cookies">
      <p id={banner.messageId}>Message</p>
    </section>
  )
}

describe('useCookieConsentBanner', () => {
  beforeEach(() => {
    document.cookie = `${COOKIE_CONSENT_NAME}=; Max-Age=0; Path=/`
    __resetCookieConsentStore()
  })

  it('is open while no choice is made', () => {
    const { result } = renderHook(() => useCookieConsentBanner())

    expect(result.current.isOpen).toBe(true)
    expect(result.current.isReopened).toBe(false)
  })

  it('closes after a choice and reopens from the cookie settings', () => {
    const { result } = renderHook(() => useCookieConsentBanner())

    act(() => result.current.accept())

    expect(result.current.isOpen).toBe(false)

    act(() => openCookieSettings())

    expect(result.current.isOpen).toBe(true)
    expect(result.current.isReopened).toBe(true)
  })

  it('describes a non-modal dialog and leaves focus alone on a first visit', () => {
    render(<Banner />)

    const dialog = screen.getByRole('dialog', { name: 'Cookies' })
    const messageId = dialog.getAttribute('aria-describedby') ?? ''

    expect(dialog.getAttribute('aria-modal')).toBe('false')
    expect(document.getElementById(messageId)?.textContent).toBe('Message')
    expect(document.activeElement).not.toBe(dialog)
  })

  it('takes focus and closes on Escape when reopened', () => {
    acceptCookies()
    render(<Banner />)

    act(() => openCookieSettings())

    expect(document.activeElement).toBe(screen.getByRole('dialog'))

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('returns focus to the control that reopened it', () => {
    acceptCookies()
    render(
      <>
        <button onClick={openCookieSettings}>Cookie settings</button>
        <Banner />
      </>,
    )

    const settingsButton = screen.getByRole('button', { name: 'Cookie settings' })

    settingsButton.focus()
    fireEvent.click(settingsButton)

    expect(document.activeElement).toBe(screen.getByRole('dialog'))

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(document.activeElement).toBe(settingsButton)
  })
})
