import { atom } from 'jotai'

import { featureFlagsAtom, featureFlagsHydratedAtom } from 'common/state/featureFlagsState'

import { captchaErrorAtom } from './captchaErrorAtom'
import { captchaJwtAtom } from './captchaJwtAtom'

export const captchaCanQuoteAtom = atom((get) => {
  if (!get(featureFlagsHydratedAtom)) return false
  if (!get(featureFlagsAtom).isCaptchaEnabled) return true
  if (!process.env.REACT_APP_TURNSTILE_SITE_KEY) return true

  return Boolean(get(captchaJwtAtom) || get(captchaErrorAtom))
})
