import { type RefObject, useEffect, useId, useRef, useSyncExternalStore } from 'react'

import {
  acceptCookies,
  closeCookieSettings,
  getCookieConsentState,
  rejectCookies,
  subscribeToCookieConsent,
} from './cookieConsent.store'
import { CookieConsentState } from './cookieConsent.types'

export interface CookieConsentBannerControls {
  isOpen: boolean
  /** True when the visitor reopened the banner from the cookie settings, after an earlier choice */
  isReopened: boolean
  messageId: string
  dialogProps: {
    ref: RefObject<HTMLElement | null>
    role: 'dialog'
    'aria-modal': false
    'aria-describedby': string
    tabIndex: -1
  }
  accept(): void
  reject(): void
  close(): void
}

/** Behaviour of the cookie banner, shared by the apps that each render it in their own design system */
export function useCookieConsentBanner(): CookieConsentBannerControls {
  const state = useSyncExternalStore<CookieConsentState | null>(
    subscribeToCookieConsent,
    getCookieConsentState,
    getServerSnapshot,
  )
  const dialogRef = useRef<HTMLElement>(null)
  const messageId = useId()
  const isOpen = !!state && (state.consent === null || state.isSettingsOpen)
  const isReopened = isOpen && state.consent !== null

  useEffect(() => {
    if (!isReopened) return

    const openedFrom = document.activeElement

    dialogRef.current?.focus()

    const closeOnEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') closeCookieSettings()
    }

    document.addEventListener('keydown', closeOnEscape)

    return () => {
      document.removeEventListener('keydown', closeOnEscape)

      if (openedFrom instanceof HTMLElement && openedFrom.isConnected) openedFrom.focus()
    }
  }, [isReopened])

  return {
    isOpen,
    isReopened,
    messageId,
    dialogProps: { ref: dialogRef, role: 'dialog', 'aria-modal': false, 'aria-describedby': messageId, tabIndex: -1 },
    accept: acceptCookies,
    reject: rejectCookies,
    close: closeCookieSettings,
  }
}

function getServerSnapshot(): null {
  return null
}
