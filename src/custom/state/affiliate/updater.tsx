import { useEffect } from 'react'

import { updateReferralAddress } from 'state/affiliate/actions'
import useParseReferralQueryParam from 'hooks/useParseReferralQueryParam'
import { useAppDispatch } from 'state/hooks'
import { useReferralAddress } from 'state/affiliate/hooks'

export default function ReferralLinkUpdater() {
  const dispatch = useAppDispatch()
  const referralAddressParam = useParseReferralQueryParam()
  const referralAddress = useReferralAddress()

  useEffect(() => {
    if (!referralAddressParam && !referralAddress?.isValid) {
      dispatch(updateReferralAddress(null))
    } else if (referralAddressParam) {
      dispatch(updateReferralAddress(referralAddressParam))
    }
  }, [referralAddressParam, referralAddress, dispatch])

  return null
}
