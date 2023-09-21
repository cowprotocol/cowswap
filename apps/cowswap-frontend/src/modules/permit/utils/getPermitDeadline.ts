import { DEFAULT_PERMIT_DURATION } from '../const'

export function getPermitDeadline() {
  return Math.ceil(Date.now() / 1000) + DEFAULT_PERMIT_DURATION
}
