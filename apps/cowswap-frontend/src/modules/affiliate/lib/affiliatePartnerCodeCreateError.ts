type ErrorWithCodeAndStatus = Error & { status?: number; code?: number }

export type AffiliatePartnerCodeCreateErrorCode = 'signatureRejected' | 'unavailable' | 'networkError' | 'createFailed'

export interface AffiliatePartnerCodeCreateError {
  code: AffiliatePartnerCodeCreateErrorCode
}

export function mapAffiliatePartnerCodeCreateError(error: unknown): AffiliatePartnerCodeCreateError {
  if (!(error instanceof Error)) {
    return { code: 'createFailed' }
  }

  const errorWithCodeAndStatus = error as ErrorWithCodeAndStatus

  if (errorWithCodeAndStatus.code === 4001) return { code: 'signatureRejected' }
  if (errorWithCodeAndStatus.status === 409) return { code: 'unavailable' }
  if (errorWithCodeAndStatus.status === 403) return { code: 'unavailable' }

  return { code: 'createFailed' }
}
