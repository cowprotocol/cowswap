import * as Sentry from '@sentry/browser'

export enum ERROR_TYPES {
  ON_SWAP = 'onSwap',
  ON_APPROVE = 'onApprove',
}

export enum SentryTag {
  DISCONNECTED = 'DISCONNECTED',
  UNKNOWN = 'UNKNOWN',
}

export function captureError(
  error: Error,
  errorType?: ERROR_TYPES,
  params?: Record<string, unknown>,
  extraTags?: Record<string, string>,
): void {
  const tags = {
    captureType: 'manual',
    ...(errorType ? { errorType } : undefined),
    ...extraTags,
  }

  Sentry.captureException(error, {
    tags,
    contexts: {
      params,
    },
  })
}

export function reportPermitPlaceholderInOrder(params: Record<string, unknown>): void {
  Sentry.captureException('Order appData contains a placeholder permit instead of a user signed one', {
    tags: { errorType: 'permitPlaceholderInOrder' },
    contexts: { params },
  })
}

export function reportPlaceOrderWithExpiredQuote(params: Record<string, unknown>): void {
  Sentry.captureException('Attempt to place order with expired quote', {
    tags: { errorType: 'placeOrderWithExpiredQuote' },
    contexts: { params },
  })
}
