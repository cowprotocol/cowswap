import { Trans } from '@lingui/macro'
import { ConfirmOrLoadingWrapper, ConfirmedIcon, AttemptFooter, CowSpinner } from 'pages/Claim/styled'
import { ClaimStatus } from 'state/claim/actions'
import { useClaimState } from 'state/claim/hooks'
import { useActiveWeb3React } from 'hooks/web3'
import CowProtocolLogo from 'components/CowProtocolLogo'
import { useAllClaimingTransactions } from 'state/enhancedTransactions/hooks'
import { useMemo } from 'react'
import { ExplorerLink } from 'components/ExplorerLink'
import { ExplorerDataType } from 'utils/getExplorerLink'
// import { formatSmartLocationAware } from 'utils/format'

export default function ClaimingStatus() {
  const { chainId } = useActiveWeb3React()
  const { activeClaimAccount, claimStatus /* , claimedAmount */ } = useClaimState()

  const allClaimTxs = useAllClaimingTransactions()
  const lastClaimTx = useMemo(() => {
    const numClaims = allClaimTxs.length
    return numClaims > 0 ? allClaimTxs[numClaims - 1] : undefined
  }, [allClaimTxs])

  // claim status
  const isConfirmed = claimStatus === ClaimStatus.CONFIRMED
  const isAttempting = claimStatus === ClaimStatus.ATTEMPTING
  const isSubmitted = claimStatus === ClaimStatus.SUBMITTED

  if (!activeClaimAccount || claimStatus === ClaimStatus.DEFAULT) return null

  return (
    <ConfirmOrLoadingWrapper activeBG={true}>
      <ConfirmedIcon>
        {!isConfirmed ? (
          <CowSpinner>
            <CowProtocolLogo />
          </CowSpinner>
        ) : (
          <CowProtocolLogo size={100} />
        )}
      </ConfirmedIcon>
      <h3>{isConfirmed ? 'Claimed!' : 'Claiming'}</h3>
      {/* TODO: fix this in new pr */}
      {!isConfirmed && <Trans>{/* formatSmartLocationAware(claimedAmount) || '0' */} vCOW</Trans>}

      {isConfirmed && (
        <>
          <Trans>
            <h3>You have successfully claimed</h3>
          </Trans>
          <Trans>
            {/* TODO: fix this in new pr */}
            <p>{/* formatSmartLocationAware(claimedAmount) || '0' */} vCOW</p>
          </Trans>
          <Trans>
            <span role="img" aria-label="party-hat">
              🎉🐮{' '}
            </span>
            Welcome to the COWmunnity! :){' '}
            <span role="img" aria-label="party-hat">
              🐄🎉
            </span>
          </Trans>
        </>
      )}
      {isAttempting && (
        <AttemptFooter>
          <p>
            <Trans>Confirm this transaction in your wallet</Trans>
          </p>
        </AttemptFooter>
      )}
      {isSubmitted && chainId && lastClaimTx?.hash && (
        <ExplorerLink id={lastClaimTx.hash} type={ExplorerDataType.TRANSACTION} />
      )}
    </ConfirmOrLoadingWrapper>
  )
}
