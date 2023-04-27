import { useEffect, useMemo } from 'react'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { ClassifiedUserClaims, useClaimDispatchers, useClaimState, useClassifiedUserClaims } from 'state/claim/hooks'
import { ClaimInfo } from 'state/claim/reducer'
import { useWalletInfo } from '@cow/modules/wallet'

export default function Updater() {
  const { chainId } = useWalletInfo()
  const { activeClaimAccount } = useClaimState()
  const { setClaimsCount } = useClaimDispatchers()

  // --- MAINNET ---
  // Fetches all classified claims
  const mainnetClaims = useClassifiedUserClaims(activeClaimAccount, SupportedChainId.MAINNET)
  // De-normalizing to avoid react hook update nightmare
  const {
    total: mTotal,
    expired: mExpired,
    claimed: mClaimed,
    available: mAvailable,
    // Counts the claims, based on which is the current network
  } = useMemo(() => _countClaims(mainnetClaims, chainId, SupportedChainId.MAINNET), [chainId, mainnetClaims])

  // Stores it on redux
  useEffect(() => {
    if (!activeClaimAccount) return
    setClaimsCount({
      chain: SupportedChainId.MAINNET,
      claimInfo: { total: mTotal, expired: mExpired, claimed: mClaimed, available: mAvailable },
      account: activeClaimAccount,
    })
  }, [activeClaimAccount, mAvailable, mClaimed, mExpired, mTotal, setClaimsCount])

  // --- GCHAIN ---
  const gChainClaims = useClassifiedUserClaims(activeClaimAccount, SupportedChainId.GNOSIS_CHAIN)
  const {
    total: gTotal,
    expired: gExpired,
    claimed: gClaimed,
    available: gAvailable,
  } = useMemo(() => _countClaims(gChainClaims, chainId, SupportedChainId.GNOSIS_CHAIN), [chainId, gChainClaims])

  useEffect(() => {
    if (!activeClaimAccount) return
    setClaimsCount({
      chain: SupportedChainId.GNOSIS_CHAIN,
      claimInfo: { total: gTotal, expired: gExpired, claimed: gClaimed, available: gAvailable },
      account: activeClaimAccount,
    })
  }, [activeClaimAccount, gAvailable, gClaimed, gExpired, gTotal, setClaimsCount])

  return null
}

/**
 * Counts claims per network
 */
function _countClaims(
  mainnetClaims: ClassifiedUserClaims,
  currentChainId: number | undefined,
  chainId: SupportedChainId
) {
  const { available, claimed, expired } = mainnetClaims

  const count: ClaimInfo = {
    // Total is easy, just add everything up
    // This will always be accurate.
    // When we only have airdrop repo as reference, everything will be `available`
    // Otherwise the sum of all categories
    total: claimed.length + available.length + expired.length,
  }
  // Only if we are in the network we want to check we are able to do smart contract calls
  // and fetch contract data
  // Otherwise the count would be replaced with outdated info
  if (currentChainId === chainId) {
    count.available = available.length
    count.expired = expired.length
    count.claimed = claimed.length
  }
  return count
}
