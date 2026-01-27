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

import { isSupportedReferralNetwork } from '../../api/referralApi'
import { useReferral } from '../hooks/useReferral'
import { useReferralWalletSync } from '../hooks/useReferralWalletSync'

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

  useReferralWalletSync({
    account,
    chainId,
    supportedNetwork,
    actions: referral.actions,
    savedCode: referral.savedCode,
  })
  const { runVerification } = useReferralVerification({
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
