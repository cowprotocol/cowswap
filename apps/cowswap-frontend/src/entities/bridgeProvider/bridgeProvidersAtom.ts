import { atom } from 'jotai'

import { DefaultBridgeProvider } from '@cowprotocol/sdk-bridging'

import { bungeeBridgeProvider } from 'tradingSdk/bridgingSdk'

export const bridgeProvidersAtom = atom(new Set<DefaultBridgeProvider>([bungeeBridgeProvider]))
