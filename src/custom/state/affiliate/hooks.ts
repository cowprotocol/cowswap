import { useSelector } from 'react-redux'
import { AppState } from 'state'
import { useAppDispatch } from 'state/hooks'
import { updateAppDataHash, updateReferralAddress } from 'state/affiliate/actions'
import { useCallback } from 'react'
import { generateReferralMetadataDoc, uploadMetadataDocToIpfs } from 'utils/metadata'

export function useAppDataHash() {
  return useSelector<AppState, string>((state) => {
    return state.affiliate.appDataHash
  })
}

export function useReferralAddress() {
  return useSelector<AppState, string | undefined>((state) => {
    return state.affiliate.referralAddress
  })
}

export function useResetReferralAddress() {
  const dispatch = useAppDispatch()

  return useCallback(() => dispatch(updateReferralAddress('')), [dispatch])
}

export function useUploadReferralDocAndSetDataHash() {
  const dispatch = useAppDispatch()

  return useCallback(
    async (referralAddress: string) => {
      const appDataHash = await uploadMetadataDocToIpfs(generateReferralMetadataDoc(referralAddress))

      dispatch(updateAppDataHash(appDataHash))
    },
    [dispatch]
  )
}
