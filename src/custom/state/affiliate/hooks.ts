import { useCallback } from 'react'
import { useSelector } from 'react-redux'
import { AppState } from 'state'
import { useAppDispatch } from 'state/hooks'
import { updateAppDataHash } from 'state/affiliate/actions'
import { generateReferralMetadataDoc, uploadMetadataDocToIpfs } from 'utils/metadata'
import { APP_DATA_HASH, IS_NOTIFICATION_CLOSED } from 'constants/index'

export function useAppDataHash() {
  return useSelector<AppState, string>((state) => {
    return state.affiliate.appDataHash || APP_DATA_HASH
  })
}

export function useReferralAddress() {
  return useSelector<
    AppState,
    | {
        value: string
        isValid: boolean
      }
    | undefined
  >((state) => {
    return state.affiliate.referralAddress
  })
}

export function useDismissNotification() {
  return useSelector<AppState, boolean>((state) => {
    return state.affiliate.isNotificationClosed || IS_NOTIFICATION_CLOSED
  })
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
