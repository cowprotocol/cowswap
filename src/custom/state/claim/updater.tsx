import { useEffect } from 'react'
import { SupportedChainId } from 'constants/chains'
import { useActiveWeb3React } from 'hooks/web3'
import { useClaimDispatchers, useUserAvailableClaims } from './hooks'

export default function Updater() {
  const { account } = useActiveWeb3React()
  const { setHasClaimsOnOtherChains } = useClaimDispatchers()

  const mainnetAvailable = useUserAvailableClaims(account, SupportedChainId.MAINNET)
  const gnosisAvailable = useUserAvailableClaims(account, SupportedChainId.XDAI)

  useEffect(() => {
    setHasClaimsOnOtherChains({ chain: SupportedChainId.MAINNET, hasClaims: mainnetAvailable.length > 0 })
    setHasClaimsOnOtherChains({ chain: SupportedChainId.XDAI, hasClaims: gnosisAvailable.length > 0 })
  }, [mainnetAvailable.length, gnosisAvailable.length, setHasClaimsOnOtherChains])

  return null
}
