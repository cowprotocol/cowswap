import { useAtomValue, useSetAtom } from 'jotai'
import { ReactNode, useEffect, useRef, useState } from 'react'

import { useTheme } from '@cowprotocol/common-hooks'

import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import { orderBookApi } from 'cowSdk'

import { TURNSTILE_DEMO_INTERACTIVE_SITE_KEY, TURNSTILE_SITE_KEY, TURNSTILE_TOKEN_HEADER_NAME } from './const'
import { logCaptcha } from './logger'
import { turnstileTokenAtom } from './state/turnstileTokenAtom'

declare global {
  interface Window {
    useDemoInteractiveCaptchaKey?: () => void
    resetCaptchaKey?: () => void
  }
}

export function CaptchaWidget(): ReactNode {
  const setToken = useSetAtom(turnstileTokenAtom)
  const token = useAtomValue(turnstileTokenAtom)
  const captchaRef = useRef<TurnstileInstance | undefined>(undefined)
  const [siteKey, setSiteKey] = useState(TURNSTILE_SITE_KEY)
  const theme = useTheme()

  useEffect(() => {
    if (!siteKey) {
      logCaptcha('Missing env TURNSTILE_SITE_KEY, captcha widget disabled')
      return
    }

    const headers = { ...(orderBookApi.context.requestHeaders ?? {}) }

    if (token) {
      headers[TURNSTILE_TOKEN_HEADER_NAME] = token
    } else {
      delete headers[TURNSTILE_TOKEN_HEADER_NAME]
    }

    orderBookApi.context.requestHeaders = Object.keys(headers).length ? headers : undefined
  }, [siteKey, token])

  useEffect(() => {
    window.useDemoInteractiveCaptchaKey = () => {
      logCaptcha('Switching to demo interactive site key')
      setToken(null)
      setSiteKey(TURNSTILE_DEMO_INTERACTIVE_SITE_KEY)
    }

    window.resetCaptchaKey = () => {
      logCaptcha('Resetting captcha site key')
      setToken(null)
      setSiteKey(TURNSTILE_SITE_KEY)
    }

    return () => {
      delete window.useDemoInteractiveCaptchaKey
      delete window.resetCaptchaKey
    }
  }, [setToken])

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
      onSuccess={(token) => {
        logCaptcha('Challenge succeeded', token.slice(0, 10))
        setToken(token)
      }}
      onExpire={() => {
        logCaptcha('Challenge expired')
        setToken(null)
        logCaptcha('Challenge re-starting')
        captchaRef.current?.reset()
      }}
      onError={() => {
        logCaptcha('Challenge errored')
        setToken(null)
      }}
    />
  )
}
