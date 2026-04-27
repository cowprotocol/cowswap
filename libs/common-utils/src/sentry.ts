import * as Sentry from '@sentry/browser'

import { log } from './logger'

export enum ERROR_TYPES {
  ON_SWAP = 'onSwap',
  ON_APPROVE = 'onApprove',
}

export enum SentryTag {
  DISCONNECTED = 'DISCONNECTED',
  UNKNOWN = 'UNKNOWN',
}

export function reportPermitWithDefaultSigner(params: Record<string, unknown>): void {
  // report this to sentry if we ever use the default signer in the permit
  Sentry.captureException('User signed the permit using PERMIT_SIGNER instead of their account', {
    tags: { errorType: 'permitWithDefaultSigner' },
    contexts: { params },
  })
}

export function reportPlaceOrderWithExpiredQuote(params: Record<string, unknown>): void {
  Sentry.captureException('Attempt to place order with expired quote', {
    tags: { errorType: 'placeOrderWithExpiredQuote' },
    contexts: { params },
  })
}

export function captureError(error: Error, errorType: ERROR_TYPES, params?: Record<string, unknown>): void {
  log('Sentry', '#ff0000', `Capturing error of type ${errorType}:`, error, params)
  Sentry.captureException(error, {
    tags: { errorType, captureType: 'manual' },
    contexts: {
      params,
    },
  })
}
