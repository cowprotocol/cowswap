import ms from 'ms.macro'
import { Milliseconds } from 'types'

import { isCustomDeadlineExpired } from './calculateLimitOrdersDeadline'

import { LimitOrdersSettingsState } from '../state/limitOrdersSettingsAtom'

export enum OrderExpiryWarningTier {
  None = 'none',
  Subtle = 'subtle',
  Prominent = 'prominent',
}

export const NO_EXPIRY_WARNING_MAX_DURATION = ms`3d`
export const SUBTLE_EXPIRY_WARNING_MAX_DURATION = ms`7d`

export function getLimitOrderDeadlineDuration(settingsState: LimitOrdersSettingsState, now = Date.now()): Milliseconds {
  const { customDeadlineTimestamp, deadlineMilliseconds } = settingsState

  return customDeadlineTimestamp && !isCustomDeadlineExpired(customDeadlineTimestamp, now)
    ? customDeadlineTimestamp * 1000 - now
    : deadlineMilliseconds
}

export function getOrderExpiryWarningTier(durationMs: Milliseconds): OrderExpiryWarningTier {
  if (durationMs > SUBTLE_EXPIRY_WARNING_MAX_DURATION) return OrderExpiryWarningTier.Prominent
  if (durationMs > NO_EXPIRY_WARNING_MAX_DURATION) return OrderExpiryWarningTier.Subtle

  return OrderExpiryWarningTier.None
}
