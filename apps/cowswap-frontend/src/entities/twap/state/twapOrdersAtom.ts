import { atomWithStorage } from 'jotai/utils'

import { getJotaiIsolatedStorage } from '@cowprotocol/core'

import type { TwapOrderItem } from 'modules/twap'

export type TwapOrdersList = { [key: string]: TwapOrderItem }

export const twapOrdersAtom = atomWithStorage<TwapOrdersList>('twap-orders-list:v1', {}, getJotaiIsolatedStorage())
