import { atom } from 'jotai'

import { featureFlagsAtom, featureFlagsStatusAtom } from 'common/state/featureFlagsState'

import { captchaErrorAtom } from './captchaErrorAtom'
import { captchaJwtAtom } from './captchaJwtAtom'

export const captchaCanQuoteAtom = atom((get) => {
  const featureFlagsStatus = get(featureFlagsStatusAtom)

  if (featureFlagsStatus === 'loading') return false
  if (featureFlagsStatus === 'unavailable') return true
  if (!get(featureFlagsAtom).isCaptchaEnabled) return true
  if (!process.env.REACT_APP_TURNSTILE_SITE_KEY) return true

  return Boolean(get(captchaJwtAtom) || get(captchaErrorAtom))
})
