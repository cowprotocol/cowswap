import { useAtom } from 'jotai'
import { ReactNode, useEffect, useRef, useState } from 'react'

import { useTheme } from '@cowprotocol/common-hooks'
import { getJwtTtl } from '@cowprotocol/common-utils'

import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import { setBearerToken } from 'cowSdk'
import { captchaJwtAtom } from 'entities/captcha/state/captchaJwtAtom'

import { exchangeTurnstileToken } from '../api/captchaApi'
import { TURNSTILE_SITE_KEY } from '../config/captcha.const'
import { useCaptchaDebugControls } from '../hooks/useCaptchaDebugControls'
import { logCaptcha } from '../logger'

export function CaptchaWidget(): ReactNode {
  const [captchaJwt, setCaptchaJwt] = useAtom(captchaJwtAtom)
  const captchaRef = useRef<TurnstileInstance | undefined>(undefined)
  const exchangeRequestIdRef = useRef(0)
  const [siteKey, setSiteKey] = useState(TURNSTILE_SITE_KEY)
  const theme = useTheme()

  useEffect(() => {
    if (!siteKey) {
      logCaptcha.warn('Missing env TURNSTILE_SITE_KEY, captcha widget disabled')
      return
    }

    if (captchaJwt?.token) {
      setBearerToken(captchaJwt.token)
      logCaptcha.info('Captcha JWT applied to orderbook context', { expiresAt: captchaJwt.expiresAt })
    } else {
      setBearerToken(null)
      logCaptcha.info('Captcha JWT cleared from orderbook context')
    }
  }, [captchaJwt, siteKey])

  useEffect(() => {
    if (!captchaJwt) return

    const timeout = window.setTimeout(() => {
      logCaptcha.warn('Captcha JWT expired')
      setCaptchaJwt(null)
    }, getJwtTtl(captchaJwt.expiresAt))

    return () => window.clearTimeout(timeout)
  }, [captchaJwt, setCaptchaJwt])

  useCaptchaDebugControls({ exchangeRequestIdRef, setCaptchaJwt, setSiteKey })

  if (!siteKey || captchaJwt) return null

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
      onSuccess={async (token: string) => {
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

          logCaptcha.info('Captcha JWT received', { requestId })
          setCaptchaJwt(jwt)
        } catch (error) {
          if (exchangeRequestIdRef.current !== requestId) {
            return
          }

          logCaptcha.error('Captcha JWT exchange failed', { requestId, error })
          setCaptchaJwt(null)
        }
      }}
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
      }}
      onUnsupported={() => {
        logCaptcha.warn('Challenge unsupported by browser')
      }}
    />
  )
}
