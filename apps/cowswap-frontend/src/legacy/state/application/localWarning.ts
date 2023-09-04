import { PINATA_API_KEY, PINATA_SECRET_API_KEY } from '@cowswap/common-const'
import { isLocal } from '@cowswap/common-utils'

let warningMsg

if ((!PINATA_SECRET_API_KEY || !PINATA_API_KEY) && isLocal) {
  warningMsg =
    "Pinata env vars not set. Order appData upload won't work! " +
    'Set REACT_APP_PINATA_API_KEY and REACT_APP_PINATA_SECRET_API_KEY'
}

export const localWarning = warningMsg
