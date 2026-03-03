import { ReactNode } from 'react'

import { getAffiliatePartnerCodeErrorMessage } from './AffiliatePartnerCodeErrorMessage.utils'

import { AffiliatePartnerCodeCreateError } from '../../lib/affiliatePartnerCodeCreateError'
import { StatusText } from '../shared'

interface AffiliatePartnerCodeErrorMessageProps {
  error?: AffiliatePartnerCodeCreateError
}

export function AffiliatePartnerCodeErrorMessage({ error }: AffiliatePartnerCodeErrorMessageProps): ReactNode {
  if (!error) return null

  return <StatusText $variant="error">{getAffiliatePartnerCodeErrorMessage(error)}</StatusText>
}
