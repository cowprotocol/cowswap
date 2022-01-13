import { Trans } from '@lingui/macro'
import { ConfirmOrLoadingWrapper, ConfirmedIcon, AttemptFooter } from 'pages/Claim/styled'
import { ExternalLink, CustomLightSpinner } from 'theme'
import { ClaimStatus } from 'state/claim/actions'
import { useClaimState } from 'state/claim/hooks'
import { useActiveWeb3React } from 'hooks/web3'
import CowProtocolLogo from 'components/CowProtocolLogo'
import Circle from 'assets/images/blue-loader.svg'
// import { formatSmart } from 'utils/format'

export default function ClaimingStatus() {
  const { chainId } = useActiveWeb3React()
  const { activeClaimAccount, claimStatus /* , claimedAmount */ } = useClaimState()

  // claim status
  const isConfirmed = claimStatus === ClaimStatus.CONFIRMED
  const isAttempting = claimStatus === ClaimStatus.ATTEMPTING
  const isSubmitted = claimStatus === ClaimStatus.SUBMITTED

  if (!activeClaimAccount || claimStatus === ClaimStatus.DEFAULT) return null

  return (
    <ConfirmOrLoadingWrapper activeBG={true}>
      <ConfirmedIcon>
        {!isConfirmed ? <CustomLightSpinner src={Circle} alt="loader" size={'90px'} /> : <CowProtocolLogo size={100} />}
      </ConfirmedIcon>
      <h3>{isConfirmed ? 'Claimed!' : 'Claiming'}</h3>
      {/* TODO: fix this in new pr */}
      {!isConfirmed && <Trans>{/* formatSmart(claimedAmount) || 0 */} vCOW</Trans>}

      {isConfirmed && (
        <>
          <Trans>
            <h3>You have successfully claimed</h3>
          </Trans>
          <Trans>
            {/* TODO: fix this in new pr */}
            <p>{/* formatSmart(claimedAmount) || 0 */} vCOW</p>
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
      {isSubmitted && chainId && (
        // && claimTxn?.hash
        <ExternalLink
          // href={getExplorerLink(chainId, claimTxn?.hash, ExplorerDataType.TRANSACTION)}
          href="#"
          style={{ zIndex: 99, marginTop: '20px' }}
        >
          <Trans>View transaction on Explorer</Trans>
        </ExternalLink>
      )}
    </ConfirmOrLoadingWrapper>
  )
}
