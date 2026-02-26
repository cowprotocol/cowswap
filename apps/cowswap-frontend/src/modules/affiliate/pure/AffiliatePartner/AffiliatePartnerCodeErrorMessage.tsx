import { ReactNode } from 'react'

import { t } from '@lingui/core/macro'

import { AffiliatePartnerCodeCreateError } from '../../lib/affiliatePartnerCodeCreateError'
import { StatusText } from '../shared'

type AffiliatePartnerCodeErrorMessageProps = {
  error?: AffiliatePartnerCodeCreateError
}

function mapErrorCodeToMessage(error: AffiliatePartnerCodeCreateError): string {
  if (error === AffiliatePartnerCodeCreateError.SignatureRejected) return t`Signature request rejected.`
  if (error === AffiliatePartnerCodeCreateError.Unavailable) return t`This code is taken. Generate another one.`
  if (error === AffiliatePartnerCodeCreateError.NetworkError)
    return t`Affiliate service is unreachable. Try again later.`
  return t`Unable to create affiliate code.`
}

export function AffiliatePartnerCodeErrorMessage({ error }: AffiliatePartnerCodeErrorMessageProps): ReactNode {
  if (!error) return null

  return <StatusText $variant="error">{mapErrorCodeToMessage(error)}</StatusText>
}
