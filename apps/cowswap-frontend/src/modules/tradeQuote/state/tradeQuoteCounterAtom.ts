import { atomWithReset } from 'jotai/utils'

import { QUOTE_POLLING_INTERVAL } from '../consts'

export const tradeQuoteCounterAtom = atomWithReset(QUOTE_POLLING_INTERVAL)
