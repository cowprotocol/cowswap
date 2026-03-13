import { useAtomValue, useSetAtom } from 'jotai'
import { ReactNode, useEffect, useRef } from 'react'

import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import { orderBookApi } from 'cowSdk'

import { TURNSTILE_SITE_KEY, TURNSTILE_TOKEN_HEADER_NAME } from './const'
import { logCaptcha } from './logger'
import { turnstileTokenAtom } from './state/turnstileTokenAtom'

export function CaptchaWidget(): ReactNode {
  const setToken = useSetAtom(turnstileTokenAtom)
  const token = useAtomValue(turnstileTokenAtom)
  const captchaRef = useRef<TurnstileInstance | undefined>(undefined)

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) {
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
  }, [token])

  if (!TURNSTILE_SITE_KEY) return null

  return (
    <Turnstile
      ref={captchaRef}
      siteKey={TURNSTILE_SITE_KEY}
      options={{
        theme: 'light',
        size: 'invisible',
        execution: 'execute',
        refreshExpired: 'manual',
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
