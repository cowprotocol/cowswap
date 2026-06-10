import { getParentOrigin } from '@cowprotocol/iframe-transport'

import { SAFE_APP_ORIGIN } from '../constants'

export function getIsSafeAppIframe(): boolean {
  return getParentOrigin() === SAFE_APP_ORIGIN
}
