import { CurrencyAmount } from '@uniswap/sdk-core'
import { Trans } from '@lingui/macro'
import { ConfirmOrLoadingWrapper, ConfirmedIcon, AttemptFooter, CowSpinner } from 'pages/Claim/styled'
import { ClaimStatus } from 'state/claim/actions'
import { useClaimState } from 'state/claim/hooks'
import { useActiveWeb3React } from 'hooks/web3'
import CowProtocolLogo from 'components/CowProtocolLogo'
import { useAllClaimingTransactions } from 'state/enhancedTransactions/hooks'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ExplorerLink } from 'components/ExplorerLink'
import { EnhancedTransactionLink } from 'components/EnhancedTransactionLink'
import { ExplorerDataType } from 'utils/getExplorerLink'
import { V_COW } from 'constants/tokens'
import AddToMetamask from 'components/AddToMetamask'
import { formatMax, formatSmartLocaleAware } from 'utils/format'
import { AMOUNT_PRECISION } from 'constants/index'

export default function ClaimingStatus() {
  const { chainId, account } = useActiveWeb3React()
  const { activeClaimAccount, claimStatus, claimedAmount } = useClaimState()

  const allClaimTxs = useAllClaimingTransactions()
  const lastClaimTx = useMemo(() => {
    const numClaims = allClaimTxs.length
    return numClaims > 0 ? allClaimTxs[numClaims - 1] : undefined
  }, [allClaimTxs])

  // claim status
  const isConfirmed = claimStatus === ClaimStatus.CONFIRMED
  const isAttempting = claimStatus === ClaimStatus.ATTEMPTING
  const isSubmitted = claimStatus === ClaimStatus.SUBMITTED
  const isSelfClaiming = account === activeClaimAccount

  if (!account || !chainId || !activeClaimAccount || claimStatus === ClaimStatus.DEFAULT) return null

  const currency = chainId ? V_COW[chainId] : undefined

  const vCowAmount = currency && CurrencyAmount.fromRawAmount(currency, claimedAmount)

  const formattedVCowAmount = formatSmartLocaleAware(vCowAmount, AMOUNT_PRECISION)
  const formattedMaxVCowAmount = vCowAmount?.greaterThan('0') ? formatMax(vCowAmount, currency?.decimals) : ''

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
      {!isConfirmed && (
        <Trans>
          <span title={formattedMaxVCowAmount && `${formattedMaxVCowAmount} vCOW`}>{formattedVCowAmount} vCOW</span>
        </Trans>
      )}

      {isConfirmed && (
        <>
          <Trans>
            <h3>You have successfully claimed</h3>
          </Trans>
          <Trans>
            <p title={formattedMaxVCowAmount && `${formattedMaxVCowAmount} vCOW`}>{formattedVCowAmount} vCOW</p>
          </Trans>
          <Trans>
            <span role="img" aria-label="party-hat">
              🎉🐮{' '}
            </span>
            <p>Welcome to the COWmunnity! :)</p>
          </Trans>
          {isSelfClaiming ? (
            <Trans>
              <p>
                You can see your vCOW balance in the <Link to="/profile">Profile</Link>
              </p>
              <AddToMetamask currency={currency} />
            </Trans>
          ) : (
            <Trans>
              <p>
                You have just claimed on behalf of{' '}
                <ExplorerLink id={activeClaimAccount} type={ExplorerDataType.ADDRESS} />
              </p>
            </Trans>
          )}
        </>
      )}
      {isAttempting && (
        <AttemptFooter>
          <p>
            <Trans>Confirm this transaction in your wallet</Trans>
          </p>
        </AttemptFooter>
      )}
      {isSubmitted && chainId && lastClaimTx?.hash && <EnhancedTransactionLink tx={lastClaimTx} />}
    </ConfirmOrLoadingWrapper>
  )
}
