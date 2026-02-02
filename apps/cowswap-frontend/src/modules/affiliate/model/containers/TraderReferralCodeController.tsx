import { ReactNode, useMemo } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { useWalletInfo } from '@cowprotocol/wallet'
import { useWalletChainId } from '@cowprotocol/wallet-provider'

import { useToggleWalletModal } from 'legacy/state/application/hooks'

import {
  useTraderReferralCodeAutoVerification,
  useTraderReferralCodeVerification,
  usePendingReferralCodeVerificationHandler,
} from './verificationEffects'

import { isSupportedReferralNetwork } from '../../api'
import { useTraderReferralCode } from '../hooks/useTraderReferralCode'
import { useTraderReferralCodeWalletSync } from '../hooks/useTraderReferralCodeWalletSync'

export function TraderReferralCodeController(): ReactNode {
  const traderReferralCode = useTraderReferralCode()
  const { account } = useWalletInfo()
  const chainId = useWalletChainId()
  const analytics = useCowAnalytics()
  const toggleWalletModal = useToggleWalletModal()

  const supportedNetwork = useMemo(
    () => (chainId !== undefined ? isSupportedReferralNetwork(chainId) : false),
    [chainId],
  )

  useTraderReferralCodeWalletSync({
    account,
    chainId,
    supportedNetwork,
    actions: traderReferralCode.actions,
    savedCode: traderReferralCode.savedCode,
  })
  const { runVerification } = useTraderReferralCodeVerification({
    account,
    chainId,
    supportedNetwork,
    traderReferralCode,
    analytics,
    toggleWalletModal,
  })

  useTraderReferralCodeAutoVerification({
    account,
    chainId,
    supportedNetwork,
    traderReferralCode,
    runVerification,
  })

  usePendingReferralCodeVerificationHandler({ traderReferralCode, runVerification })

  return null
}
