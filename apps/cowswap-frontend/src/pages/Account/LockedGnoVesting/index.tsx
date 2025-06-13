import { useCallback, useEffect, useState } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import ArrowIcon from '@cowprotocol/assets/cow-swap/arrow.svg'
import cowImage from '@cowprotocol/assets/cow-swap/cow_token.svg'
import {
  LOCKED_GNO_VESTING_START_DATE,
  MERKLE_DROP_CONTRACT_ADDRESSES,
  TOKEN_DISTRO_CONTRACT_ADDRESSES,
} from '@cowprotocol/common-const'
import { usePrevious } from '@cowprotocol/common-hooks'
import {
  formatDateWithTimezone,
  getBlockExplorerUrl,
  getProviderErrorMessage,
  isRejectRequestProviderError,
} from '@cowprotocol/common-utils'
import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
import { Command } from '@cowprotocol/types'
import { ButtonPrimary, ButtonSize, HoverTooltip, TokenAmount } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Trans } from '@lingui/macro'
import SVG from 'react-inlinesvg'

import CopyHelper from 'legacy/components/Copy'
import { useErrorModal } from 'legacy/hooks/useErrorMessageAndModal'

import { CowSwapAnalyticsCategory } from 'common/analytics/types'
import { HelpCircle } from 'common/pure/HelpCircle'
import { BalanceDisplay, Card, CardActions, ConvertWrapper, ExtLink, VestingBreakdown } from 'pages/Account/styled'

import { useClaimCowFromLockedGnoCallback } from './hooks'

enum ClaimStatus {
  INITIAL,
  ATTEMPTING,
  SUBMITTED,
  CONFIRMED,
}

interface Props {
  openModal: (message: string) => void
  closeModal: Command
  vested: CurrencyAmount<Currency>
  allocated: CurrencyAmount<Currency>
  claimed: CurrencyAmount<Currency>
  loading: boolean
}

// TODO: Break down this large function into smaller functions
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line max-lines-per-function, complexity
const LockedGnoVesting: React.FC<Props> = ({ openModal, closeModal, vested, allocated, claimed, loading }: Props) => {
  const { chainId = ChainId.MAINNET, account } = useWalletInfo()
  const [status, setStatus] = useState<ClaimStatus>(ClaimStatus.INITIAL)
  const unvested = allocated.subtract(vested)
  const previousAccount = usePrevious(account)

  const canClaim =
    !loading &&
    unvested.greaterThan(0) &&
    status === ClaimStatus.INITIAL &&
    MERKLE_DROP_CONTRACT_ADDRESSES[chainId] &&
    TOKEN_DISTRO_CONTRACT_ADDRESSES[chainId]
  const isClaimPending = status === ClaimStatus.SUBMITTED

  const { handleSetError, handleCloseError, ErrorModal } = useErrorModal()

  const isFirstClaim = claimed.equalTo(0)

  const claimCallback = useClaimCowFromLockedGnoCallback({
    openModal,
    closeModal,
    isFirstClaim,
  })

  const contractAddress = isFirstClaim
    ? MERKLE_DROP_CONTRACT_ADDRESSES[chainId]
    : TOKEN_DISTRO_CONTRACT_ADDRESSES[chainId]

  const cowAnalytics = useCowAnalytics()
  const claimAnalytics = useCallback(
    (action: string) => {
      cowAnalytics.sendEvent({
        category: CowSwapAnalyticsCategory.CLAIM_COW_FOR_LOCKED_GNO,
        action,
        label: 'GNO',
      })
    },
    [cowAnalytics],
  )

  const handleClaim = useCallback(async () => {
    handleCloseError()
    if (!claimCallback) {
      return
    }

    setStatus(ClaimStatus.ATTEMPTING)

    claimAnalytics('Claim')
    claimCallback()
      .then((tx) => {
        claimAnalytics('Sign')
        setStatus(ClaimStatus.SUBMITTED)
        return tx.wait()
      })
      .then((tx) => {
        const success = tx.status === 1
        setStatus(success ? ClaimStatus.CONFIRMED : ClaimStatus.INITIAL)

        setTimeout(() => {
          setStatus(ClaimStatus.INITIAL)
        }, 5000)
      })
      .catch((error) => {
        let errorMessage
        const isRejected = isRejectRequestProviderError(error)
        if (isRejected) {
          errorMessage = 'User rejected signing COW claim transaction'
        } else {
          errorMessage = getProviderErrorMessage(error)
          console.error('Error Signing locked GNO COW claiming', error)
        }
        console.error('[Profile::LockedGnoVesting::index::claimCallback]::error', errorMessage)
        setStatus(ClaimStatus.INITIAL)
        claimAnalytics(isRejected ? 'Reject' : 'Error')
        handleSetError(errorMessage)
      })
  }, [handleCloseError, handleSetError, claimCallback, claimAnalytics])

  // Fix for enabling claim button after user changes account
  useEffect(() => {
    if (account && previousAccount && account !== previousAccount && status !== ClaimStatus.INITIAL) {
      setStatus(ClaimStatus.INITIAL)
    }
  }, [account, previousAccount, status])

  if (allocated.equalTo(0)) {
    // don't render anything until we know that the user is actually eligible to claim
    return null
  }

  return (
    <>
      <Card showLoader={loading || isClaimPending}>
        <BalanceDisplay hAlign="left">
          <img src={cowImage} alt="COW token" width="56" height="56" />
          <span>
            <i>COW vesting from locked GNO</i>
            <b>
              <TokenAmount amount={allocated} defaultValue="0" tokenSymbol={allocated.currency} />
              <HoverTooltip
                wrapInContainer
                content={
                  <VestingBreakdown>
                    <span>
                      <i>Unvested</i>{' '}
                      <p>
                        <TokenAmount amount={unvested} defaultValue="0" tokenSymbol={unvested.currency} />
                      </p>
                    </span>
                    <span>
                      <i>Vested</i>{' '}
                      <p>
                        <TokenAmount amount={vested} defaultValue="0" tokenSymbol={vested.currency} />
                      </p>
                    </span>
                  </VestingBreakdown>
                }
              >
                <HelpCircle size={14} />
              </HoverTooltip>
            </b>
          </span>
        </BalanceDisplay>
        <ConvertWrapper>
          <BalanceDisplay titleSize={18} altColor={true}>
            <i>
              Claimable{' '}
              <HoverTooltip
                wrapInContainer
                content={
                  <div>
                    <p>
                      <strong>COW vesting from the GNO lock</strong> is vested linearly over four years, starting on{' '}
                      {formatDateWithTimezone(LOCKED_GNO_VESTING_START_DATE)}.
                    </p>
                    <p>Each time you claim, you will receive the entire claimable amount.</p>
                  </div>
                }
              >
                <HelpCircle size={14} />
              </HoverTooltip>
            </i>
            <b>
              <TokenAmount amount={vested.subtract(claimed)} defaultValue="0" />
            </b>
          </BalanceDisplay>
          {status === ClaimStatus.CONFIRMED ? (
            <ButtonPrimary disabled>
              <Trans>Successfully claimed</Trans>
            </ButtonPrimary>
          ) : (
            <ButtonPrimary buttonSize={ButtonSize.SMALL} onClick={handleClaim} disabled={!canClaim}>
              {isClaimPending ? (
                'Claiming COW...'
              ) : (
                <>
                  Claim COW <SVG src={ArrowIcon} />
                </>
              )}
            </ButtonPrimary>
          )}
        </ConvertWrapper>

        <CardActions>
          <ExtLink href={getBlockExplorerUrl(chainId, 'address', contractAddress)}>View contract ↗</ExtLink>
          <CopyHelper toCopy={contractAddress}>
            <div title="Click to copy contract address">Copy contract</div>
          </CopyHelper>
        </CardActions>
      </Card>

      <ErrorModal />
    </>
  )
}

export default LockedGnoVesting
