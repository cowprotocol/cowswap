import { atom } from 'jotai'

import { isProd } from '@cowprotocol/common-utils'

import { bridgeProviders } from 'tradingSdk/bridgingSdk'

export const bridgeProvidersAtom = atom(isProd ? [bridgeProviders[0]] : bridgeProviders)
