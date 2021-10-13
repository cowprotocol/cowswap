import { useEffect } from 'react'

import { updateReferralAddress } from 'state/affiliate/actions'
import useParseReferralQueryParam from 'hooks/useParseReferralQueryParam'
import { useAppDispatch } from 'state/hooks'

export default function ReferralLinkUpdater() {
  const dispatch = useAppDispatch()
  const referralAddress = useParseReferralQueryParam()

  useEffect(() => {
    if (referralAddress) {
      dispatch(updateReferralAddress(referralAddress))
    }
  }, [referralAddress, dispatch])

  return null
}
