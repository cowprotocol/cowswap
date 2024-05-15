import ms from 'ms.macro'

export const PENDING_ORDER_PERMIT_CHECK_INTERVAL = ms`60s`

// TODO: revert to previous one, only for temporary testing
export const PRE_GENERATED_PERMIT_URL =
  'https://raw.githubusercontent.com/cowprotocol/token-lists/2a83e3299264b31b99e3bc760223cb75b14fe7fa/src/public/PermitInfo'
