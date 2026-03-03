import { t } from '@lingui/core/macro'

import { AffiliatePartnerCodeCreateError } from '../../lib/affiliatePartnerCodeCreateError'

export function getAffiliatePartnerCodeErrorMessage(error: AffiliatePartnerCodeCreateError): string {
  if (error === AffiliatePartnerCodeCreateError.SignatureRejected) return t`Signature request rejected.`
  if (error === AffiliatePartnerCodeCreateError.Unavailable) return t`This code is taken. Generate another one.`
  if (error === AffiliatePartnerCodeCreateError.NetworkError)
    return t`Affiliate service is unreachable. Try again later.`
  return t`Unable to create affiliate code.`
}

export function getAffiliatePartnerUnavailableAdornmentLabel(error?: AffiliatePartnerCodeCreateError): string {
  if (error === AffiliatePartnerCodeCreateError.NetworkError) return t`Error`
  return t`This code is taken. Generate another one.`
}
