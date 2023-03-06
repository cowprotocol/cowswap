import React, { useCallback, useEffect, useState, useRef, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import NotificationBanner from 'components/NotificationBanner'
import { useReferralAddress, useResetReferralAddress, useSetReferralAddressActive } from 'state/affiliate/hooks'
import { hasTrades } from 'utils/trade'
import { retry, RetryOptions } from 'utils/retry'
import { SupportedChainId } from 'constants/chains'
import useParseReferralQueryParam from 'hooks/useParseReferralQueryParam'
import useRecentActivity from 'hooks/useRecentActivity'
import { OrderStatus } from 'state/orders/actions'
import { useWalletInfo } from '@cow/modules/wallet'

type AffiliateStatus = 'NOT_CONNECTED' | 'OWN_LINK' | 'ACTIVE' | 'UNSUPPORTED_NETWORK'

const STATUS_TO_MESSAGE_MAPPING: Record<AffiliateStatus, string> = {
  NOT_CONNECTED: 'Affiliate program: Please connect your wallet to participate.',
  OWN_LINK:
    'Affiliate program: Your affiliate code works! By sharing it, others would credit you their trading volume.',
  ACTIVE: 'Valid affiliate code: Please do your first trade to join the program!',
  UNSUPPORTED_NETWORK: 'Affiliate program works in Ethereum only. Please change the network to participate.',
}

const DEFAULT_RETRY_OPTIONS: RetryOptions = { n: 3, minWait: 1000, maxWait: 3000 }

export default function AffiliateStatusCheck() {
  const resetReferralAddress = useResetReferralAddress()
  const setReferralAddressActive = useSetReferralAddressActive()
  const navigate = useNavigate()
  const location = useLocation()
  const { account, chainId } = useWalletInfo()
  const referralAddress = useReferralAddress()
  const referralAddressQueryParam = useParseReferralQueryParam()
  const allRecentActivity = useRecentActivity()
  const [affiliateState, _setAffiliateState] = useState<AffiliateStatus | null>()

  /**
   * Wrapper around setAffiliateState (local) and setReferralAddressActive (global)
   * Need to keep track when affiliate is ACTIVE to know whether it should be included in the
   * metadata, no longer uploaded to IPFS here
   */
  const setAffiliateState = useCallback(
    (state: AffiliateStatus | null) => {
      _setAffiliateState(state)
      setReferralAddressActive(state === 'ACTIVE')
    },
    [setReferralAddressActive]
  )

  // De-normalized to avoid unnecessary useEffect triggers
  const isReferralAddressNotSet = !referralAddress
  const referralAddressAccount = referralAddress?.value
  const referralAddressIsValid = referralAddress?.isValid

  const [error, setError] = useState('')
  const isFirstTrade = useRef(false)
  const fulfilledOrders = allRecentActivity.filter((data) => {
    return 'appData' in data && data.status === OrderStatus.FULFILLED
  })

  const notificationBannerId = useMemo(() => {
    if (!referralAddressAccount) {
      return
    }

    if (!account) {
      return `referral-${referralAddressAccount}`
    }

    return `wallet-${account}:referral-${referralAddressAccount}:chain-${chainId}`
  }, [account, chainId, referralAddressAccount])

  const handleAffiliateState = useCallback(async () => {
    if (!chainId || !account) {
      return
    }

    // Note: comparing with `false` because in case `undefined` msg shouldn't be displayed
    if (referralAddressIsValid === false) {
      setError('Affiliate program: The referral address is invalid.')
      return
    }

    if (fulfilledOrders.length >= 1 && isFirstTrade.current) {
      setAffiliateState(null)
      isFirstTrade.current = false
      navigate({ pathname: location.pathname, search: '' })
      resetReferralAddress()
      return
    }

    try {
      // we first validate that the user hasn't already traded
      const userHasTrades = await retry(() => hasTrades(chainId, account), DEFAULT_RETRY_OPTIONS).promise
      if (userHasTrades) {
        return
      }
    } catch (error: any) {
      console.error(error)
      setError('Affiliate program: There was an error loading trades. Please try again later.')
      return
    }

    setAffiliateState('ACTIVE')
    isFirstTrade.current = true
  }, [
    account,
    chainId,
    fulfilledOrders.length,
    navigate,
    location,
    referralAddressIsValid,
    resetReferralAddress,
    setAffiliateState,
  ])

  useEffect(() => {
    if (isReferralAddressNotSet) {
      return
    }

    setError('')
    setAffiliateState(null)

    if (!account) {
      setAffiliateState('NOT_CONNECTED')
      return
    }

    if (chainId !== SupportedChainId.MAINNET) {
      setAffiliateState('UNSUPPORTED_NETWORK')
      return
    }

    if (referralAddressAccount === account) {
      // clean-up saved referral address if the user follows its own referral link
      setAffiliateState('OWN_LINK')

      if (referralAddressQueryParam) {
        navigate({ pathname: '/account', search: location.search })
      }
      return
    }

    handleAffiliateState()
  }, [
    account,
    navigate,
    chainId,
    handleAffiliateState,
    location.search,
    referralAddressQueryParam,
    setAffiliateState,
    referralAddressAccount,
    isReferralAddressNotSet,
  ])

  if (error) {
    return (
      <NotificationBanner isVisible level="error">
        {error}
      </NotificationBanner>
    )
  }

  if (affiliateState) {
    return (
      <NotificationBanner isVisible id={notificationBannerId} level="info">
        {STATUS_TO_MESSAGE_MAPPING[affiliateState]}
      </NotificationBanner>
    )
  }

  return null
}
