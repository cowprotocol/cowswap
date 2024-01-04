import * as Sentry from '@sentry/browser'

export function reportPermitWithDefaultSigner(params: Record<any, any>): void {
  // report this to sentry if we ever use the default signer in the permit
  Sentry.captureException('User signed the permit using PERMIT_SIGNER instead of their account', {
    tags: { errorType: 'permitWithDefaultSigner' },
    contexts: { params },
  })
}
