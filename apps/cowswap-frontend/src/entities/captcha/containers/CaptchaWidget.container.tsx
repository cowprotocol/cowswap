import { useAtomValue, useSetAtom } from 'jotai'
import { ReactNode, useEffect, useRef, useState } from 'react'

import { useTheme } from '@cowprotocol/common-hooks'
import { getJwtTtl } from '@cowprotocol/common-utils'

import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import { orderBookApi } from 'cowSdk'

import { exchangeTurnstileToken } from '../api/captchaApi'
import { TURNSTILE_SITE_KEY } from '../config/captcha.const'
import { useCaptchaDebugControls } from '../hooks/useCaptchaDebugControls'
import { logCaptcha } from '../logger'
import { captchaJwtAtom } from '../state/captchaJwtAtom'

export function CaptchaWidget(): ReactNode {
  const setCaptchaJwt = useSetAtom(captchaJwtAtom)
  const captchaJwt = useAtomValue(captchaJwtAtom)
  const captchaRef = useRef<TurnstileInstance | undefined>(undefined)
  const exchangeRequestIdRef = useRef(0)
  const [siteKey, setSiteKey] = useState(TURNSTILE_SITE_KEY)
  const theme = useTheme()

  useEffect(() => {
    if (!siteKey) {
      logCaptcha('Missing env TURNSTILE_SITE_KEY, captcha widget disabled')
      return
    }

    if (captchaJwt?.token) {
      orderBookApi.context.bearerToken = captchaJwt.token
    } else {
      delete orderBookApi.context.bearerToken
    }
  }, [captchaJwt, siteKey])

  useEffect(() => {
    if (!captchaJwt) return

    const timeout = window.setTimeout(() => {
      logCaptcha('Captcha JWT expired')
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
      onWidgetLoad={() => {
        logCaptcha('Challenge starting')
        captchaRef.current?.execute()
      }}
      onSuccess={async (token: string) => {
        const requestId = exchangeRequestIdRef.current + 1

        exchangeRequestIdRef.current = requestId

        logCaptcha('Challenge succeeded', token.slice(0, 10))
        logCaptcha('Exchanging challenge token for captcha JWT')

        try {
          const jwt = await exchangeTurnstileToken(token)

          if (exchangeRequestIdRef.current !== requestId) {
            logCaptcha('Skipping stale captcha JWT exchange result')
            return
          }

          logCaptcha('Captcha JWT received')
          setCaptchaJwt(jwt)
        } catch (error) {
          if (exchangeRequestIdRef.current !== requestId) {
            return
          }

          logCaptcha('Captcha JWT exchange failed', error)
          setCaptchaJwt(null)
        }
      }}
      onExpire={() => {
        exchangeRequestIdRef.current += 1
        logCaptcha('Challenge expired')
        setCaptchaJwt(null)
        logCaptcha('Challenge re-starting')
        captchaRef.current?.reset()
      }}
      onError={() => {
        exchangeRequestIdRef.current += 1
        logCaptcha('Challenge errored')
        setCaptchaJwt(null)
      }}
    />
  )
}
