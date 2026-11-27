import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { CSSProperties, ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react'

import { createCowTracker } from '@cowprotocol/analytics'
import { DEFAULT_LOCALE } from '@cowprotocol/common-const'
import { useFeatureFlags, useTheme } from '@cowprotocol/common-hooks'
import { getJwtTtl, normalizeError } from '@cowprotocol/common-utils'

import { DEFAULT_SCRIPT_ID, Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import { setBearerToken } from 'cowSdk'
import { bffRateLimitedAtom } from 'entities/captcha/state/bffRateLimitedAtom'
import { captchaErrorAtom } from 'entities/captcha/state/captchaErrorAtom'
import { captchaInteractionRequiredAtom } from 'entities/captcha/state/captchaInteractionRequiredAtom'
import { captchaJwtAtom } from 'entities/captcha/state/captchaJwtAtom'
import { quoteRateLimitedUntilAtom } from 'entities/captcha/state/quoteRateLimitedUntilAtom'
import { createPortal } from 'react-dom'

import { useActiveLocale } from 'legacy/hooks/useActiveLocale'

import { CowSwapAnalyticsCategory } from 'common/analytics/types'

import { exchangeTurnstileToken } from '../api/captchaApi'
import { TURNSTILE_DEMO_INTERACTIVE_SITE_KEY, TURNSTILE_SITE_KEY } from '../config/captcha.const'
import { useCaptchaDebugControls } from '../hooks/useCaptchaDebugControls'
import { useCaptchaModal } from '../hooks/useCaptchaModal'
import { useCaptchaRetry } from '../hooks/useCaptchaRetry'
import { logCaptcha } from '../logger'
import { CaptchaModal } from '../pure/CaptchaModal.pure'
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
  const setQuoteRateLimitedUntil = useSetAtom(quoteRateLimitedUntilAtom)
  const setBffRateLimited = useSetAtom(bffRateLimitedAtom)
  const { isCaptchaEnabled } = useFeatureFlags()
  const captchaRef = useRef<TurnstileInstance | undefined>(undefined)
  const exchangeRequestIdRef = useRef(0)
  const [siteKey, setSiteKey] = useState(TURNSTILE_SITE_KEY)
  const theme = useTheme()
  const locale = useActiveLocale()
  const [isUnsupported, setIsUnsupported] = useState(false)
  const [isScriptRetryPending, setIsScriptRetryPending] = useState(false)
  const widgetIdRef = useRef<string | undefined>(undefined)
  const { scheduleRetry, resetRetries } = useCaptchaRetry()
  const slot = useAtomValue(captchaSlotAtom)
  const { isModalOpen, dismissModal } = useCaptchaModal()
  const [modalTarget, setModalTarget] = useState<HTMLDivElement | null>(null)

  const trackCaptcha = siteKey === TURNSTILE_DEMO_INTERACTIVE_SITE_KEY ? ignoreCaptchaEvent : trackCaptchaEvent

  useLayoutEffect(() => {
    setCaptchaInteractionRequired(false)

    return () => setCaptchaInteractionRequired(false)
  }, [captchaError, captchaJwt, isCaptchaEnabled, setCaptchaInteractionRequired, siteKey, slot])

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
      setIsScriptRetryPending(false)
      // A new JWT has its own rate-limit budget.
      setQuoteRateLimitedUntil(null)
      setBffRateLimited(false)
      resetRetries()
      logCaptcha.info('JWT applied to orderbook context', { expiresAt: captchaJwt.expiresAt })
    } else {
      setBearerToken(null)
      logCaptcha.info('JWT cleared from orderbook context')
    }
  }, [
    captchaJwt,
    isCaptchaEnabled,
    resetRetries,
    setBffRateLimited,
    setCaptchaError,
    setQuoteRateLimitedUntil,
    siteKey,
  ])

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

  if (!isCaptchaEnabled || !siteKey || captchaJwt) return null

  // captchaError stays set until a JWT arrives, so retries that keep failing are reported once.
  const handleFailure = (error: Error, reason?: string, context?: Record<string, string | number>): void => {
    setCaptchaError(error)

    if (captchaError) {
      logCaptcha.warn(`${error.message} again`, ...(context ? [context] : []))
      return
    }

    logCaptcha.error(error, undefined, context)
    if (reason) trackCaptcha({ action: 'captcha_challenge_failed', reason })
  }

  const turnstile = (
    <Turnstile
      key={siteKey}
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
        widgetIdRef.current = widgetId
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
        const widgetId = widgetIdRef.current

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

          handleFailure(new Error('JWT exchange failed', { cause: normalizeError(err) }), 'jwtExchangeFailed', {
            requestId,
          })
          setCaptchaJwt(null)
          // A remount in the meantime (portal move, site key switch) already started a fresh challenge.
          scheduleRetry(() => {
            if (widgetIdRef.current === widgetId) captchaRef.current?.reset()
          })
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

        handleFailure(new Error('Challenge errored'), 'turnstileError', {
          errorCode,
          hostname: window.location.hostname,
        })
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
          handleFailure(new Error('Turnstile script failed to load'))
          // react-turnstile 1.4.2 never injects a script while `#cf-turnstile-script` exists, and a failed one
          // doesn't fire again. Drop it now so nothing (a cross-tab JWT, say) can strand it, and keep Turnstile
          // unmounted until the retry, or it would re-inject right away. On remount the library detects the new
          // script by polling `window.turnstile`, since it deletes its onload callback when `onError` is set.
          document.getElementById(DEFAULT_SCRIPT_ID)?.remove()
          setIsScriptRetryPending(true)
          scheduleRetry(() => setIsScriptRetryPending(false))
        },
      }}
    />
  )

  const target = slot ?? (isModalOpen ? modalTarget : null)
  const placedTurnstile = target ? (
    createPortal(turnstile, target)
  ) : (
    <div style={OFFSCREEN_STYLE} inert>
      {turnstile}
    </div>
  )

  return (
    <>
      {!isUnsupported && !isScriptRetryPending && placedTurnstile}
      <CaptchaModal
        isOpen={isModalOpen}
        isError={!!captchaError}
        onDismiss={dismissModal}
        turnstileTargetRef={setModalTarget}
      />
    </>
  )
}
