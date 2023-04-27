import { Trans } from '@lingui/macro'
import { useCallback, useState, useEffect } from 'react'
import SVG from 'react-inlinesvg'
import { Card, BalanceDisplay, ConvertWrapper, VestingBreakdown, CardActions, ExtLink } from '@cow/pages/Account/styled'
import { ButtonPrimary } from 'components/Button'
import { MouseoverTooltipContent } from 'components/Tooltip'
import cowImage from 'assets/cow-swap/cow_v2.svg'
import ArrowIcon from 'assets/cow-swap/arrow.svg'
import { OperationType } from 'components/TransactionConfirmationModal'
import { useErrorModal } from 'hooks/useErrorMessageAndModal'
import CopyHelper from 'components/Copy'
import { getBlockExplorerUrl } from 'utils'
import { formatDateWithTimezone } from '@cow/utils/time'
import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
import { MERKLE_DROP_CONTRACT_ADDRESSES, TOKEN_DISTRO_CONTRACT_ADDRESSES } from 'constants/tokens'
import { LOCKED_GNO_VESTING_START_DATE } from 'constants/index'
import { useClaimCowFromLockedGnoCallback } from './hooks'
import usePrevious from 'hooks/usePrevious'
import { CurrencyAmount, Currency } from '@uniswap/sdk-core'
// import ReactGA from 'react-ga4'
import { getProviderErrorMessage, isRejectRequestProviderError } from 'utils/misc'
import { claimAnalytics } from 'components/analytics'
import { ButtonSize } from 'theme/enum'
import { HelpCircle } from '@cow/common/pure/HelpCircle'
import { TokenAmount } from '@cow/common/pure/TokenAmount'
import { useWalletInfo } from '@cow/modules/wallet'

enum ClaimStatus {
  INITIAL,
  ATTEMPTING,
  SUBMITTED,
  CONFIRMED,
}

interface Props {
  openModal: (message: string, operationType: OperationType) => void
  closeModal: () => void
  vested: CurrencyAmount<Currency>
  allocated: CurrencyAmount<Currency>
  claimed: CurrencyAmount<Currency>
  loading: boolean
}

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

  const handleClaim = useCallback(async () => {
    handleCloseError()
    if (!claimCallback) {
      return
    }

    setStatus(ClaimStatus.ATTEMPTING)

    claimAnalytics('Send')
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
        let errorMessage, errorCode
        const isRejected = isRejectRequestProviderError(error)
        if (isRejected) {
          errorMessage = 'User rejected signing COW claim transaction'
        } else {
          errorMessage = getProviderErrorMessage(error)

          if (error?.code && typeof error.code === 'number') {
            errorCode = error.code
          }
          console.error('Error Signing locked GNO COW claiming', error)
        }
        console.error('[Profile::LockedGnoVesting::index::claimCallback]::error', errorMessage)
        setStatus(ClaimStatus.INITIAL)
        claimAnalytics(isRejected ? 'Reject' : 'Error', errorCode)
        handleSetError(errorMessage)
      })
  }, [handleCloseError, handleSetError, claimCallback])

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
              <MouseoverTooltipContent
                wrap
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
              </MouseoverTooltipContent>
            </b>
          </span>
        </BalanceDisplay>
        <ConvertWrapper>
          <BalanceDisplay titleSize={18} altColor={true}>
            <i>
              Claimable{' '}
              <MouseoverTooltipContent
                wrap
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
              </MouseoverTooltipContent>
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
          <ExtLink href={getBlockExplorerUrl(chainId, contractAddress, 'address')}>View contract ↗</ExtLink>
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
