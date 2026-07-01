import { PINATA_API_KEY } from '@cowprotocol/common-const'
import { isLocal } from '@cowprotocol/common-utils'

let warningMsg

if (!PINATA_API_KEY && isLocal) {
  warningMsg =
    "Pinata public env var not set. Order appData upload won't work! " +
    'Set REACT_APP_PINATA_API_KEY and configure the required server-side Pinata credentials separately.'
}

export const localWarning = warningMsg
