import React, { useCallback, useEffect, useState, useRef, useMemo } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { useActiveWeb3React } from 'hooks/web3'
import NotificationBanner from 'components/NotificationBanner'
import { useReferralAddress, useResetReferralAddress } from 'state/affiliate/hooks'
import { updateAppDataHash } from 'state/affiliate/actions'
import { useAppDispatch } from 'state/hooks'
import { hasTrades } from 'utils/trade'
import { generateReferralMetadataDoc, uploadMetadataDocToIpfs } from 'utils/metadata'
import { retry, RetryOptions } from 'utils/retry'
import { SupportedChainId } from 'constants/chains'
import useParseReferralQueryParam from 'hooks/useParseReferralQueryParam'
import useRecentActivity from 'hooks/useRecentActivity'
import { OrderStatus } from 'state/orders/actions'

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
  const appDispatch = useAppDispatch()
  const resetReferralAddress = useResetReferralAddress()
  const history = useHistory()
  const location = useLocation()
  const { account, chainId } = useActiveWeb3React()
  const referralAddress = useReferralAddress()
  const referralAddressQueryParam = useParseReferralQueryParam()
  const allRecentActivity = useRecentActivity()
  const [affiliateState, setAffiliateState] = useState<AffiliateStatus | null>()
  const [error, setError] = useState('')
  const isFirstTrade = useRef(false)
  const fulfilledOrders = allRecentActivity.filter((data) => {
    return 'appData' in data && data.status === OrderStatus.FULFILLED
  })

  const notificationBannerId = useMemo(() => {
    if (!referralAddress?.value) {
      return
    }

    if (!account) {
      return `referral-${referralAddress.value}`
    }

    return `wallet-${account}:referral-${referralAddress.value}:chain-${chainId}`
  }, [account, chainId, referralAddress?.value])

  const handleAffiliateState = useCallback(async () => {
    if (!chainId || !account || !referralAddress) {
      return
    }

    if (!referralAddress.isValid) {
      setError('Affiliate program: The referral address is invalid.')
      return
    }

    if (fulfilledOrders.length >= 1 && isFirstTrade.current) {
      setAffiliateState(null)
      isFirstTrade.current = false
      history.replace({ search: '' })
      resetReferralAddress()
      return
    }

    try {
      // we first validate that the user hasn't already traded
      const userHasTrades = await retry(() => hasTrades(chainId, account), DEFAULT_RETRY_OPTIONS).promise
      if (userHasTrades) {
        return
      }
    } catch (error) {
      console.error(error)
      setError('Affiliate program: There was an error loading trades. Please try again later.')
      return
    }

    setAffiliateState('ACTIVE')
    isFirstTrade.current = true
  }, [referralAddress, chainId, account, fulfilledOrders.length, history, resetReferralAddress])

  useEffect(() => {
    async function handleReferralAddress(referralAddress: { value: string; isValid: boolean } | undefined) {
      if (!referralAddress?.value) return
      try {
        const appDataHash = await uploadMetadataDocToIpfs(generateReferralMetadataDoc(referralAddress.value))
        appDispatch(updateAppDataHash(appDataHash))
      } catch (e) {
        console.error(e)
        setError('Affiliate program: There was an error while uploading your referral data. Please try again later.')
      }
    }
    if (affiliateState === 'ACTIVE') handleReferralAddress(referralAddress)
  }, [referralAddress, affiliateState, appDispatch])

  useEffect(() => {
    if (!referralAddress) {
      return
    }

    setError('')

    if (!account) {
      setAffiliateState('NOT_CONNECTED')
      return
    }

    if (chainId !== SupportedChainId.MAINNET) {
      setAffiliateState('UNSUPPORTED_NETWORK')
      return
    }

    if (referralAddress.value === account) {
      // clean-up saved referral address if the user follows its own referral link
      setAffiliateState('OWN_LINK')

      if (referralAddressQueryParam) {
        history.push('/profile' + location.search)
      }
      return
    }

    handleAffiliateState()
  }, [referralAddress, account, history, chainId, handleAffiliateState, location.search, referralAddressQueryParam])

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
