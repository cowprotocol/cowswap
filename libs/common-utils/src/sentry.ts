import * as Sentry from '@sentry/browser'

export function reportPermitWithDefaultSigner(params: Record<any, any>): void {
  // report this to sentry if we ever use the default signer in the permit
  Sentry.captureException('User signed the permit using PERMIT_SIGNER instead of their account', {
    tags: { errorType: 'permitWithDefaultSigner' },
    contexts: { params },
  })
}

export function reportAppDataWithHooks(params: Record<any, any>): void {
  // report to sentry if we ever use hooks in the app data
  Sentry.captureException("Hooks are present in the app data when it shouldn't", {
    tags: { errorType: 'appDataWithHooks' },
    contexts: { params },
  })
}

export function reportPlaceOrderWithExpiredQuote(params: Record<any, any>): void {
  Sentry.captureException('Attempt to place order with expired quote', {
    tags: { errorType: 'placeOrderWithExpiredQuote' },
    contexts: { params },
  })
}
