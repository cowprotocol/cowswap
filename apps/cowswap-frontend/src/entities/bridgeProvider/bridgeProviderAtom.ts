import { atom } from 'jotai'

import { bungeeBridgeProvider } from 'tradingSdk/bridgingSdk'

export const bridgeProviderAtom = atom(bungeeBridgeProvider)
