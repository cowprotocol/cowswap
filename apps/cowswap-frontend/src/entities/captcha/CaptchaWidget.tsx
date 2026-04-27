import { useAtomValue, useSetAtom } from 'jotai'
import { ReactNode, useEffect, useRef, useState } from 'react'

import { useTheme } from '@cowprotocol/common-hooks'

import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import { orderBookApi } from 'cowSdk'

import { exchangeTurnstileToken } from './api/exchangeTurnstileToken'
import { TURNSTILE_DEMO_INTERACTIVE_SITE_KEY, TURNSTILE_SITE_KEY, TURNSTILE_TOKEN_HEADER_NAME } from './const'
import { logCaptcha } from './logger'
import { captchaAuthTokenAtom } from './state/captchaAuthTokenAtom'

declare global {
  interface Window {
    useDemoInteractiveCaptchaKey?: () => void
    resetCaptchaKey?: () => void
  }
}

export function CaptchaWidget(): ReactNode {
  const setAuthToken = useSetAtom(captchaAuthTokenAtom)
  const authToken = useAtomValue(captchaAuthTokenAtom)
  const captchaRef = useRef<TurnstileInstance | undefined>(undefined)
  const exchangeRequestIdRef = useRef(0)
  const [siteKey, setSiteKey] = useState(TURNSTILE_SITE_KEY)
  const theme = useTheme()

  useEffect(() => {
    if (!siteKey) {
      logCaptcha('Missing env TURNSTILE_SITE_KEY, captcha widget disabled')
      return
    }

    const headers = { ...(orderBookApi.context.requestHeaders ?? {}) }

    if (authToken) {
      headers[TURNSTILE_TOKEN_HEADER_NAME] = authToken
    } else {
      delete headers[TURNSTILE_TOKEN_HEADER_NAME]
    }

    orderBookApi.context.requestHeaders = Object.keys(headers).length ? headers : undefined
  }, [authToken, siteKey])

  useEffect(() => {
    window.useDemoInteractiveCaptchaKey = () => {
      logCaptcha('Switching to demo interactive site key')
      exchangeRequestIdRef.current += 1
      setAuthToken(null)
      setSiteKey(TURNSTILE_DEMO_INTERACTIVE_SITE_KEY)
    }

    window.resetCaptchaKey = () => {
      logCaptcha('Resetting captcha site key')
      exchangeRequestIdRef.current += 1
      setAuthToken(null)
      setSiteKey(TURNSTILE_SITE_KEY)
    }

    return () => {
      delete window.useDemoInteractiveCaptchaKey
      delete window.resetCaptchaKey
    }
  }, [setAuthToken])

  if (!siteKey) return null

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
      onSuccess={async (token) => {
        const requestId = exchangeRequestIdRef.current + 1

        exchangeRequestIdRef.current = requestId

        logCaptcha('Challenge succeeded', token.slice(0, 10))
        logCaptcha('Exchanging challenge token for captcha JWT')

        try {
          const { jwt, expiresAt } = await exchangeTurnstileToken(token)

          if (exchangeRequestIdRef.current !== requestId) {
            logCaptcha('Skipping stale captcha JWT exchange result')
            return
          }

          logCaptcha('Captcha JWT received', expiresAt)
          setAuthToken(jwt)
        } catch (error) {
          if (exchangeRequestIdRef.current !== requestId) {
            return
          }

          logCaptcha('Captcha JWT exchange failed', error)
          setAuthToken(null)
        }
      }}
      onExpire={() => {
        exchangeRequestIdRef.current += 1
        logCaptcha('Challenge expired')
        setAuthToken(null)
        logCaptcha('Challenge re-starting')
        captchaRef.current?.reset()
      }}
      onError={() => {
        exchangeRequestIdRef.current += 1
        logCaptcha('Challenge errored')
        setAuthToken(null)
      }}
    />
  )
}
