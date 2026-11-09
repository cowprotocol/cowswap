import { COOKIE_CONSENT_COPY } from '@cowprotocol/analytics'

import { fireEvent, render, screen } from '@testing-library/react'

import { CookieConsentBanner } from './CookieConsentBanner.pure'

const POLICY_HREF = 'https://cow.fi/legal/cowswap-cookie-policy'

function renderBanner(onClose?: () => void): { onAccept: jest.Mock; onReject: jest.Mock } {
  const onAccept = jest.fn()
  const onReject = jest.fn()

  render(
    <CookieConsentBanner
      copy={COOKIE_CONSENT_COPY}
      policyHref={POLICY_HREF}
      onAccept={onAccept}
      onReject={onReject}
      onClose={onClose}
    />,
  )

  return { onAccept, onReject }
}

describe('CookieConsentBanner', () => {
  it('labels the banner and links the cookie policy in a new tab', () => {
    renderBanner()

    const banner = screen.getByRole('dialog', { name: COOKIE_CONSENT_COPY.ariaLabel })
    const link = screen.getByRole('link', { name: COOKIE_CONSENT_COPY.policyLinkLabel })

    const descriptionId = banner.getAttribute('aria-describedby') ?? ''

    expect(banner.getAttribute('aria-modal')).toBe('false')
    expect(document.getElementById(descriptionId)?.textContent).toContain(COOKIE_CONSENT_COPY.message)
    expect(link.getAttribute('href')).toBe(POLICY_HREF)
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toBe('noopener noreferrer')
  })

  it('gives Reject All and Accept All the same button styling', () => {
    renderBanner()

    const reject = screen.getByRole('button', { name: COOKIE_CONSENT_COPY.rejectLabel })
    const accept = screen.getByRole('button', { name: COOKIE_CONSENT_COPY.acceptLabel })

    expect(reject.className).toBe(accept.className)
  })

  it('reports each choice', () => {
    const { onAccept, onReject } = renderBanner()

    fireEvent.click(screen.getByRole('button', { name: COOKIE_CONSENT_COPY.rejectLabel }))
    fireEvent.click(screen.getByRole('button', { name: COOKIE_CONSENT_COPY.acceptLabel }))

    expect(onReject).toHaveBeenCalledTimes(1)
    expect(onAccept).toHaveBeenCalledTimes(1)
  })

  it('has no close button on a first visit', () => {
    renderBanner()

    expect(screen.queryByRole('button', { name: COOKIE_CONSENT_COPY.closeLabel })).toBeNull()
  })

  it('focuses the banner and closes with the button or Escape when reopened', () => {
    const onClose = jest.fn()

    renderBanner(onClose)

    expect(document.activeElement).toBe(screen.getByRole('dialog'))

    fireEvent.click(screen.getByRole('button', { name: COOKIE_CONSENT_COPY.closeLabel }))
    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onClose).toHaveBeenCalledTimes(2)
  })
})
