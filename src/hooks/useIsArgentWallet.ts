import { NEVER_RELOAD, useSingleCallResult } from 'lib/hooks/multicall'
import { useMemo } from 'react'
import { useWalletInfo } from '@cow/modules/wallet'
import { useArgentWalletDetectorContract } from './useContract'

export default function useIsArgentWallet(): boolean {
  const { account } = useWalletInfo()
  const argentWalletDetector = useArgentWalletDetectorContract()
  const inputs = useMemo(() => [account ?? undefined], [account])
  const call = useSingleCallResult(argentWalletDetector, 'isArgentWallet', inputs, NEVER_RELOAD)
  return Boolean(call?.result?.[0])
}
