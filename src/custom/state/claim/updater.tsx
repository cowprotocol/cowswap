import { useEffect } from 'react'
import { SupportedChainId } from 'constants/chains'
import { useClaimDispatchers, useClaimState, useUserAvailableClaims } from './hooks'

export default function Updater() {
  const { activeClaimAccount } = useClaimState()
  const { setHasClaimsOnOtherChains } = useClaimDispatchers()

  const { claims: mainnetAvailable } = useUserAvailableClaims(activeClaimAccount, SupportedChainId.MAINNET)
  const { claims: gnosisAvailable } = useUserAvailableClaims(activeClaimAccount, SupportedChainId.XDAI)

  useEffect(() => {
    setHasClaimsOnOtherChains({
      chain: SupportedChainId.MAINNET,
      hasClaims: Boolean(mainnetAvailable && mainnetAvailable.length > 0),
    })
    setHasClaimsOnOtherChains({
      chain: SupportedChainId.XDAI,
      hasClaims: Boolean(gnosisAvailable && gnosisAvailable.length > 0),
    })
  }, [setHasClaimsOnOtherChains, mainnetAvailable, gnosisAvailable])

  return null
}
