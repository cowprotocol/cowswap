import { useEffect } from 'react'
import { SupportedChainId } from 'constants/chains'
import { useClaimDispatchers, useClaimState, useUserAvailableClaims } from './hooks'

export default function Updater() {
  const { activeClaimAccount } = useClaimState()
  const { setHasClaimsOnOtherChains } = useClaimDispatchers()

  const mainnetAvailable = useUserAvailableClaims(activeClaimAccount, SupportedChainId.MAINNET)
  const gnosisAvailable = useUserAvailableClaims(activeClaimAccount, SupportedChainId.XDAI)

  useEffect(() => {
    setHasClaimsOnOtherChains({ chain: SupportedChainId.MAINNET, hasClaims: mainnetAvailable.length > 0 })
    setHasClaimsOnOtherChains({ chain: SupportedChainId.XDAI, hasClaims: gnosisAvailable.length > 0 })
  }, [mainnetAvailable.length, gnosisAvailable.length, setHasClaimsOnOtherChains])

  return null
}
