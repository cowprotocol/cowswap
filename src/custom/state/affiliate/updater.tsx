import { useEffect } from 'react'

import { updateReferrerAddress } from 'state/affiliate/actions'
import useParseReferralQueryParam from 'hooks/useParseReferralQueryParam'
import { useWalletInfo } from 'hooks/useWalletInfo'
import { useAppDispatch } from 'state/hooks'

export default function ReferralLinkUpdater() {
  const dispatch = useAppDispatch()
  const referralLink = useParseReferralQueryParam()
  const { account } = useWalletInfo()

  useEffect(() => {
    if (referralLink && account) {
      dispatch(updateReferrerAddress({ referrer: referralLink }))
    }
  }, [account, referralLink, dispatch])

  return null
}
