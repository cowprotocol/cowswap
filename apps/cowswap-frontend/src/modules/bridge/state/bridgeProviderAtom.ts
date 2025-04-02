import { atom } from 'jotai'

import { acrossBridgeProvider } from 'tradingSdk/bridgingSdk'

export const bridgeProviderAtom = atom(acrossBridgeProvider)
