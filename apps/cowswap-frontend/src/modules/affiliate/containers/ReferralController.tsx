import { ReactNode, useMemo } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { useWalletInfo } from '@cowprotocol/wallet'
import { useWalletChainId } from '@cowprotocol/wallet-provider'

import { useToggleWalletModal } from 'legacy/state/application/hooks'

import {
  useReferralAutoVerification,
  useReferralVerification,
  usePendingVerificationHandler,
} from './verificationEffects'
import { useReferralWalletStatus, useReferralWalletSync } from './walletEffects'

import { useReferral } from '../hooks/useReferral'
import { isSupportedReferralNetwork } from '../services/referralApi'

export function ReferralController(): ReactNode {
  const referral = useReferral()
  const { account } = useWalletInfo()
  const chainId = useWalletChainId()
  const analytics = useCowAnalytics()
  const toggleWalletModal = useToggleWalletModal()

  const supportedNetwork = useMemo(
    () => (chainId !== undefined ? isSupportedReferralNetwork(chainId) : false),
    [chainId],
  )

  useReferralWalletSync({ account, chainId, supportedNetwork, actions: referral.actions })
  useReferralWalletStatus({
    account,
    chainId,
    supportedNetwork,
    referral,
  })

  const runVerification = useReferralVerification({
    account,
    chainId,
    supportedNetwork,
    referral,
    analytics,
    toggleWalletModal,
  })

  useReferralAutoVerification({
    account,
    chainId,
    supportedNetwork,
    referral,
    runVerification,
  })

  usePendingVerificationHandler({ referral, runVerification })

  return null
}
