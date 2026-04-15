import { t } from '@lingui/core/macro'

export function getNoRouteTooltip(): string {
  return t`No route found for this token`
}

export function getCheckingRouteTooltip(): string {
  return t`Checking route availability...`
}
