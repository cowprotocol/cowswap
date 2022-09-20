import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { setReferralAddressActive, updateReferralAddress } from 'state/affiliate/actions'

export function useReferralAddress() {
  return useAppSelector((state) => state.affiliate.referralAddress)
}

export function useAffiliateAddress() {
  return useAppSelector((state) => state.affiliate.address)
}

export function useResetReferralAddress() {
  const dispatch = useAppDispatch()

  return useCallback(() => dispatch(updateReferralAddress(null)), [dispatch])
}

export function useSetReferralAddressActive() {
  const dispatch = useAppDispatch()

  return useCallback((isActive: boolean) => dispatch(setReferralAddressActive(isActive)), [dispatch])
}

export function useIsNotificationClosed(id?: string): boolean | null {
  return useAppSelector((state) => (id ? state.affiliate.isNotificationClosed?.[id] ?? false : null))
}
