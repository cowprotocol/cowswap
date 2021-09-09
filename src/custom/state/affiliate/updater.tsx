import { useEffect } from 'react'

import { updateReferralAddress } from 'state/affiliate/actions'
import useParseReferralQueryParam from 'hooks/useParseReferralQueryParam'
import { useWalletInfo } from 'hooks/useWalletInfo'
import { useAppDispatch } from 'state/hooks'

export default function ReferralLinkUpdater() {
  const dispatch = useAppDispatch()
  const referralAddress = useParseReferralQueryParam()
  const { account } = useWalletInfo()

  useEffect(() => {
    if (referralAddress && account) {
      dispatch(updateReferralAddress(referralAddress))
    }
  }, [account, referralAddress, dispatch])

  return null
}
