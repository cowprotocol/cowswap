import { isRejectRequestProviderError } from '@cowprotocol/common-utils'

import { ApiError } from '../utils/api-utils'

export enum AffiliatePartnerCodeCreateError {
  SignatureRejected = 'signatureRejected',
  Unavailable = 'unavailable',
  NetworkError = 'networkError',
}

export function mapAffiliatePartnerCodeCreateError(error: unknown): AffiliatePartnerCodeCreateError {
  if (isRejectRequestProviderError(error)) return AffiliatePartnerCodeCreateError.SignatureRejected

  if (error instanceof ApiError && (error.status === 409 || error.status === 403)) {
    return AffiliatePartnerCodeCreateError.Unavailable
  }

  return AffiliatePartnerCodeCreateError.NetworkError
}
