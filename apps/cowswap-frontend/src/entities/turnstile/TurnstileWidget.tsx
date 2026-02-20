import { useSetAtom } from 'jotai'
import { ReactNode, useRef } from 'react'

import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'

import { TURNSTILE_SITE_KEY } from './const'
import { turnstileTokenAtom } from './state/turnstileTokenAtom'

export function TurnstileWidget(): ReactNode {
  const setToken = useSetAtom(turnstileTokenAtom)
  const turnstileRef = useRef<TurnstileInstance | undefined>(undefined)

  if (!TURNSTILE_SITE_KEY) {
    return null
  }

  return (
    <Turnstile
      ref={turnstileRef}
      siteKey={TURNSTILE_SITE_KEY}
      options={{
        theme: 'light',
        size: 'invisible',
        execution: 'execute',
      }}
      onWidgetLoad={() => turnstileRef.current?.execute()}
      onSuccess={(token) => setToken(token)}
      onExpire={() => setToken(null)}
      onError={() => setToken(null)}
    />
  )
}
