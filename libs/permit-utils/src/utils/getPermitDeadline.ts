import { DEFAULT_PERMIT_DURATION } from '../const'

export function getPermitDeadline() {
  return Math.ceil((Date.now() + DEFAULT_PERMIT_DURATION) / 1000)
}
