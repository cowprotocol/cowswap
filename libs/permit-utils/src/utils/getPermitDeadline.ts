import { DEFAULT_PERMIT_DURATION } from '../const'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function getPermitDeadline() {
  return Math.ceil((Date.now() + DEFAULT_PERMIT_DURATION) / 1000)
}
