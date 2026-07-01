import { useAtom, useAtomValue } from 'jotai'
import { MutableRefObject, ReactNode, useEffect, useRef, useState } from 'react'

import { useTheme } from '@cowprotocol/common-hooks'
import { getJwtTtl } from '@cowprotocol/common-utils'

import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import { setBearerToken } from 'cowSdk'
import { captchaJwtAtom } from 'entities/captcha/state/captchaJwtAtom'

import { featureFlagsAtom } from 'common/state/featureFlagsState'

import { exchangeTurnstileToken } from '../api/captchaApi'
import { TURNSTILE_SITE_KEY } from '../config/captcha.const'
import { useCaptchaDebugControls } from '../hooks/useCaptchaDebugControls'
import { logCaptcha } from '../logger'

interface ChallengeSuccessHandlers {
  exchangeRequestIdRef: MutableRefObject<number>
  captchaRef: MutableRefObject<TurnstileInstance | undefined>
  setCaptchaJwt: (jwt: string | null) => void
}

async function handleChallengeSuccess(token: string, handlers: ChallengeSuccessHandlers): Promise<void> {
  const { exchangeRequestIdRef, captchaRef, setCaptchaJwt } = handlers
  const requestId = exchangeRequestIdRef.current + 1

  exchangeRequestIdRef.current = requestId

  logCaptcha.info('Challenge succeeded', { requestId, tokenLength: token.length })
  logCaptcha.debug('Exchanging challenge token for captcha JWT', { requestId })

  try {
    const jwt = await exchangeTurnstileToken(token)

    if (exchangeRequestIdRef.current !== requestId) {
      logCaptcha.warn('Skipping stale captcha JWT exchange result')
      return
    }

    logCaptcha.info('JWT received', { requestId })
    // Storing the JWT unmounts the widget, so the solved "Success!" box leaves the form.
    setCaptchaJwt(jwt)
  } catch (error) {
    if (exchangeRequestIdRef.current !== requestId) {
      return
    }

    logCaptcha.error('JWT exchange failed', { requestId, error })
    setCaptchaJwt(null)
    // The exchange failed after Cloudflare solved the challenge; reset the widget so it drops
    // the stale "Success!" box and re-runs the challenge for the user to re-confirm.
    captchaRef.current?.reset()
  }
}

export function CaptchaWidget(): ReactNode {
  const [captchaJwt, setCaptchaJwt] = useAtom(captchaJwtAtom)
  const { isCaptchaEnabled } = useAtomValue(featureFlagsAtom)
  const captchaRef = useRef<TurnstileInstance | undefined>(undefined)
  const exchangeRequestIdRef = useRef(0)
  const [siteKey, setSiteKey] = useState(TURNSTILE_SITE_KEY)
  const theme = useTheme()

  useEffect(() => {
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
      logCaptcha.info('JWT applied to orderbook context', { expiresAt: captchaJwt.expiresAt })
    } else {
      setBearerToken(null)
      logCaptcha.info('JWT cleared from orderbook context')
    }
  }, [captchaJwt, isCaptchaEnabled, siteKey])

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

  return (
    <Turnstile
      key={siteKey}
      ref={captchaRef}
      siteKey={siteKey}
      style={{ width: '100%', display: 'block' }}
      options={{
        theme: theme.darkMode ? 'dark' : 'light',
        size: 'flexible',
        appearance: 'interaction-only',
        // execution: 'execute',
        // refreshExpired: 'manual',
      }}
      onWidgetLoad={(widgetId) => {
        logCaptcha.debug('Challenge starting', { widgetId })
        captchaRef.current?.execute()
      }}
      onBeforeInteractive={() => {
        logCaptcha.debug('Challenge requires interaction')
      }}
      onAfterInteractive={() => {
        logCaptcha.debug('Challenge interaction completed')
      }}
      onSuccess={(token: string) => handleChallengeSuccess(token, { exchangeRequestIdRef, captchaRef, setCaptchaJwt })}
      onExpire={() => {
        exchangeRequestIdRef.current += 1
        logCaptcha.warn('Challenge expired')
        setCaptchaJwt(null)
        logCaptcha.debug('Challenge re-starting')
        captchaRef.current?.reset()
      }}
      onError={(errorCode) => {
        exchangeRequestIdRef.current += 1
        logCaptcha.error('Challenge errored', { errorCode, hostname: window.location.hostname })
        setCaptchaJwt(null)
        // Clear any stale solved state so the errored widget re-runs the challenge for re-confirmation.
        captchaRef.current?.reset()
      }}
      onUnsupported={() => {
        logCaptcha.warn('Challenge unsupported by browser')
      }}
    />
  )
}
