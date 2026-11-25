import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { CSSProperties, ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react'

import { createCowTracker } from '@cowprotocol/analytics'
import { DEFAULT_LOCALE } from '@cowprotocol/common-const'
import { useFeatureFlags, useTheme } from '@cowprotocol/common-hooks'
import { getJwtTtl, normalizeError } from '@cowprotocol/common-utils'

import { DEFAULT_SCRIPT_ID, Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import { setBearerToken } from 'cowSdk'
import { captchaErrorAtom } from 'entities/captcha/state/captchaErrorAtom'
import { captchaInteractionRequiredAtom } from 'entities/captcha/state/captchaInteractionRequiredAtom'
import { captchaJwtAtom } from 'entities/captcha/state/captchaJwtAtom'
import { createPortal } from 'react-dom'

import { useActiveLocale } from 'legacy/hooks/useActiveLocale'

import { CowSwapAnalyticsCategory } from 'common/analytics/types'

import { exchangeTurnstileToken } from '../api/captchaApi'
import { TURNSTILE_DEMO_INTERACTIVE_SITE_KEY, TURNSTILE_SITE_KEY } from '../config/captcha.const'
import { useCaptchaDebugControls } from '../hooks/useCaptchaDebugControls'
import { useCaptchaRetry } from '../hooks/useCaptchaRetry'
import { logCaptcha } from '../logger'
import { captchaSlotAtom } from '../state/captchaSlot.atoms'

const trackCaptchaEvent = createCowTracker(CowSwapAnalyticsCategory.CAPTCHA)
const ignoreCaptchaEvent: typeof trackCaptchaEvent = () => undefined

// Turnstile needs a laid-out container to run its check, so off trade pages it sits off-screen instead of hidden.
const OFFSCREEN_STYLE = { position: 'fixed', top: 0, left: '-10000px', width: '300px' } as const satisfies CSSProperties

/* eslint-disable max-lines-per-function */
export function CaptchaWidget(): ReactNode {
  const [captchaJwt, setCaptchaJwt] = useAtom(captchaJwtAtom)
  const [captchaError, setCaptchaError] = useAtom(captchaErrorAtom)
  const setCaptchaInteractionRequired = useSetAtom(captchaInteractionRequiredAtom)
  const { isCaptchaEnabled } = useFeatureFlags()
  const captchaRef = useRef<TurnstileInstance | undefined>(undefined)
  const exchangeRequestIdRef = useRef(0)
  const [siteKey, setSiteKey] = useState(TURNSTILE_SITE_KEY)
  const theme = useTheme()
  const locale = useActiveLocale()
  const [isUnsupported, setIsUnsupported] = useState(false)
  const [scriptMountKey, setScriptMountKey] = useState(0)
  const { scheduleRetry, resetRetries } = useCaptchaRetry()
  const slot = useAtomValue(captchaSlotAtom)

  const trackCaptcha = siteKey === TURNSTILE_DEMO_INTERACTIVE_SITE_KEY ? ignoreCaptchaEvent : trackCaptchaEvent

  useLayoutEffect(() => {
    setCaptchaInteractionRequired(false)

    return () => setCaptchaInteractionRequired(false)
  }, [captchaError, captchaJwt, isCaptchaEnabled, setCaptchaInteractionRequired, siteKey])

  useEffect(() => {
    if (isCaptchaEnabled === undefined) return
    if (!isCaptchaEnabled) {
      logCaptcha.debug('Disabled by feature flag')
      return
    }

    if (!siteKey) {
      logCaptcha.warn('Disabled by missing env TURNSTILE_SITE_KEY')
      return
    }

    if (captchaJwt?.token) {
      setBearerToken(captchaJwt.token)
      setCaptchaError(null)
      resetRetries()
      logCaptcha.info('JWT applied to orderbook context', { expiresAt: captchaJwt.expiresAt })
    } else {
      setBearerToken(null)
      logCaptcha.info('JWT cleared from orderbook context')
    }
  }, [captchaJwt, isCaptchaEnabled, resetRetries, setCaptchaError, siteKey])

  useEffect(() => {
    if (isCaptchaEnabled !== false) return

    exchangeRequestIdRef.current += 1

    setBearerToken(null)
    if (captchaJwt) setCaptchaJwt(null)
  }, [captchaJwt, isCaptchaEnabled, setCaptchaJwt])

  useEffect(() => {
    if (!isCaptchaEnabled || !captchaJwt) return

    const timeout = window.setTimeout(() => {
      logCaptcha.warn('JWT expired')
      setCaptchaJwt(null)
    }, getJwtTtl(captchaJwt.expiresAt))

    return () => window.clearTimeout(timeout)
  }, [captchaJwt, isCaptchaEnabled, setCaptchaJwt])

  useCaptchaDebugControls({ exchangeRequestIdRef, setCaptchaJwt, setSiteKey })

  if (!isCaptchaEnabled || !siteKey || captchaJwt || isUnsupported) return null

  const turnstile = (
    <Turnstile
      key={`${siteKey}:${scriptMountKey}`}
      ref={captchaRef}
      siteKey={siteKey}
      style={{ width: '100%', display: 'block' }}
      options={{
        theme: theme.darkMode ? 'dark' : 'light',
        language: locale === 'pseudo' ? DEFAULT_LOCALE : locale,
        size: 'flexible',
        appearance: 'interaction-only',
        // execution: 'execute',
        // refreshExpired: 'manual',
      }}
      onWidgetLoad={(widgetId) => {
        setCaptchaInteractionRequired(false)
        logCaptcha.debug('Challenge starting', { widgetId })
        trackCaptcha({ action: 'captcha_challenge_started' })
        captchaRef.current?.execute()
      }}
      onBeforeInteractive={() => {
        setCaptchaInteractionRequired(true)
        logCaptcha.debug('Challenge requires interaction')
        trackCaptcha({ action: 'captcha_interaction_required' })
      }}
      onAfterInteractive={() => {
        setCaptchaInteractionRequired(false)
        logCaptcha.debug('Challenge interaction completed')
        trackCaptcha({ action: 'captcha_interaction_completed' })
      }}
      onSuccess={async (token: string) => {
        setCaptchaInteractionRequired(false)
        const requestId = exchangeRequestIdRef.current + 1

        exchangeRequestIdRef.current = requestId

        logCaptcha.info('Challenge succeeded', { requestId, tokenLength: token.length })
        logCaptcha.debug('Exchanging challenge token for captcha JWT', { requestId })

        try {
          const jwt = await exchangeTurnstileToken(token)

          if (exchangeRequestIdRef.current !== requestId) return

          logCaptcha.info('JWT received', { requestId })
          trackCaptcha({ action: 'captcha_challenge_solved' })
          setCaptchaJwt(jwt)
        } catch (err: unknown) {
          if (exchangeRequestIdRef.current !== requestId) return

          const error = normalizeError(err)
          setCaptchaError(error)

          logCaptcha.error(new Error('JWT exchange failed', { cause: error }), undefined, { requestId })
          trackCaptcha({ action: 'captcha_challenge_failed', reason: 'jwtExchangeFailed' })
          setCaptchaJwt(null)
          scheduleRetry(() => captchaRef.current?.reset())
        }
      }}
      onExpire={() => {
        setCaptchaInteractionRequired(false)
        exchangeRequestIdRef.current += 1

        logCaptcha.warn('Challenge expired')
        trackCaptcha({ action: 'captcha_challenge_failed', reason: 'turnstileExpired' })
        setCaptchaJwt(null)
        logCaptcha.debug('Challenge re-starting')
        captchaRef.current?.reset()
      }}
      onError={(errorCode) => {
        setCaptchaInteractionRequired(false)
        exchangeRequestIdRef.current += 1

        const error = new Error('Challenge errored')
        logCaptcha.error(error, undefined, { errorCode, hostname: window.location.hostname })
        setCaptchaError(error)
        trackCaptcha({ action: 'captcha_challenge_failed', reason: 'turnstileError' })
        setCaptchaJwt(null)
      }}
      onUnsupported={() => {
        setCaptchaInteractionRequired(false)
        const error = new Error('Challenge unsupported by browser')
        logCaptcha.error(error)
        setCaptchaError(error)
        trackCaptcha({ action: 'captcha_challenge_failed', reason: 'browserUnsupported' })
        setIsUnsupported(true)
      }}
      scriptOptions={{
        onError: () => {
          setCaptchaInteractionRequired(false)
          const error = new Error('Turnstile script failed to load')
          logCaptcha.error(error)
          setCaptchaError(error)
          // react-turnstile keeps the failed <script> (so it won't inject another) and its onload global
          // (so a fresh script still resolves its loader): drop the tag and remount to load it again.
          scheduleRetry(() => {
            document.getElementById(DEFAULT_SCRIPT_ID)?.remove()
            setScriptMountKey((key) => key + 1)
          })
        },
      }}
    />
  )

  return slot ? (
    createPortal(turnstile, slot)
  ) : (
    <div style={OFFSCREEN_STYLE} aria-hidden>
      {turnstile}
    </div>
  )
}
