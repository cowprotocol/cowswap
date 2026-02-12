import { atomWithStorage } from 'jotai/utils'

import { getJotaiIsolatedStorage } from '@cowprotocol/core'

export type PayoutAddressConfirmationByWallet = Record<string, boolean>

export const payoutAddressConfirmationAtom = atomWithStorage<PayoutAddressConfirmationByWallet>(
  'cowswap:affiliatePayoutAddressConfirmation:v0',
  {},
  getJotaiIsolatedStorage(),
)
