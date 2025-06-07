import * as Sentry from '@sentry/browser'

// TODO: Replace any with proper type definitions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function reportPermitWithDefaultSigner(params: Record<any, any>): void {
  // report this to sentry if we ever use the default signer in the permit
  Sentry.captureException('User signed the permit using PERMIT_SIGNER instead of their account', {
    tags: { errorType: 'permitWithDefaultSigner' },
    contexts: { params },
  })
}

// TODO: Replace any with proper type definitions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function reportAppDataWithHooks(params: Record<any, any>): void {
  // report to sentry if we ever use hooks in the app data
  Sentry.captureException("Hooks are present in the app data when it shouldn't", {
    tags: { errorType: 'appDataWithHooks' },
    contexts: { params },
  })
}

// TODO: Replace any with proper type definitions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function reportPlaceOrderWithExpiredQuote(params: Record<any, any>): void {
  Sentry.captureException('Attempt to place order with expired quote', {
    tags: { errorType: 'placeOrderWithExpiredQuote' },
    contexts: { params },
  })
}
