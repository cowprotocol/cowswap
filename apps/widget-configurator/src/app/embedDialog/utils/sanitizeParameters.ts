import { CowSwapWidgetParams } from '@cowprotocol/widget-lib'

import { SANITIZE_PARAMS } from '../const'

export function sanitizeParameters(params: CowSwapWidgetParams) {
  return {
    ...params,
    ...SANITIZE_PARAMS,
  }
}
