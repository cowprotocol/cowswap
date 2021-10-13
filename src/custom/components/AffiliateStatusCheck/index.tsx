import React, { useCallback, useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useActiveWeb3React } from 'hooks/web3'
import NotificationBanner from 'components/NotificationBanner'
import { useReferralAddress, useResetReferralAddress, useUploadReferralDocAndSetDataHash } from 'state/affiliate/hooks'
import { useAppDispatch } from 'state/hooks'
import { hasTrades } from 'utils/trade'
import { retry, RetryOptions } from 'utils/retry'
import { SupportedChainId } from 'constants/chains'

type AffiliateStatus = 'NOT_CONNECTED' | 'OWN_LINK' | 'ALREADY_TRADED' | 'ACTIVE' | 'UNSUPPORTED_NETWORK'

const STATUS_TO_MESSAGE_MAPPING: Record<AffiliateStatus, string> = {
  NOT_CONNECTED: 'Please connect your wallet to participate',
  OWN_LINK: 'You followed your own referral link',
  ALREADY_TRADED: 'You have already traded with the current account',
  ACTIVE: 'Your affiliate link will be effective on next trade',
  UNSUPPORTED_NETWORK: 'Only Mainnet is supported. Please change the network to participate',
}

const DEFAULT_RETRY_OPTIONS: RetryOptions = { n: 3, minWait: 1000, maxWait: 3000 }

export default function AffiliateStatusCheck() {
  const appDispatch = useAppDispatch()
  const resetReferralAddress = useResetReferralAddress()
  const uploadReferralDocAndSetDataHash = useUploadReferralDocAndSetDataHash()
  const history = useHistory()
  const { account, chainId } = useActiveWeb3React()
  const referralAddress = useReferralAddress()
  const [affiliateState, setAffiliateState] = useState<AffiliateStatus | null>()
  const [error, setError] = useState('')

  const uploadDataDoc = useCallback(async () => {
    setError('')

    if (!chainId || !account || !referralAddress) {
      return
    }

    try {
      // we first validate that the user hasn't already traded
      const userHasTrades = await retry(() => hasTrades(chainId, account), DEFAULT_RETRY_OPTIONS).promise

      if (userHasTrades) {
        resetReferralAddress()
        setAffiliateState('ALREADY_TRADED')
        return
      }
    } catch (error) {
      console.error(error)
      setError('There was an error validating existing trades')
      return
    }

    try {
      await retry(() => uploadReferralDocAndSetDataHash(referralAddress), DEFAULT_RETRY_OPTIONS).promise

      setAffiliateState('ACTIVE')
    } catch (error) {
      console.error(error)
      setError('There was an error while uploading the referral document to IPFS')
    }
  }, [chainId, account, referralAddress, resetReferralAddress, uploadReferralDocAndSetDataHash])

  useEffect(() => {
    if (!referralAddress) {
      return
    }

    setAffiliateState(null)

    if (!account) {
      setAffiliateState('NOT_CONNECTED')
      return
    }

    if (chainId !== SupportedChainId.MAINNET) {
      setAffiliateState('UNSUPPORTED_NETWORK')
      return
    }

    if (referralAddress === account) {
      // clean-up saved referral address if the user follows its own referral link
      resetReferralAddress()
      history.push('/profile')
      setAffiliateState('OWN_LINK')
      return
    }

    uploadDataDoc()
  }, [referralAddress, account, resetReferralAddress, history, chainId, appDispatch, uploadDataDoc])

  if (error) {
    return (
      <NotificationBanner isVisible level="error">
        Affiliate program error: {error}
      </NotificationBanner>
    )
  }

  if (affiliateState) {
    return (
      <NotificationBanner isVisible level="info">
        Affiliate program: {STATUS_TO_MESSAGE_MAPPING[affiliateState]}
      </NotificationBanner>
    )
  }

  return null
}
