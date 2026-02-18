import { useSetAtom } from 'jotai'
import { ReactNode } from 'react'

import { Turnstile } from '@marsidev/react-turnstile'

import { TURNSTILE_SITE_KEY } from './const'
import { turnstileTokenAtom } from './state/turnstileTokenAtom'

export function TurnstileWidget(): ReactNode {
  const setToken = useSetAtom(turnstileTokenAtom)

  if (!TURNSTILE_SITE_KEY) {
    return null
  }

  return (
    <Turnstile
      siteKey={TURNSTILE_SITE_KEY}
      options={{
        theme: 'light',
        size: 'normal',
        execution: 'render',
      }}
      onSuccess={(token) => setToken(token)}
      onExpire={() => setToken(null)}
      onError={() => setToken(null)}
    />
  )
}
