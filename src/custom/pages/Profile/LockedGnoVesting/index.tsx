import { Trans } from '@lingui/macro'
import { useCallback, useState } from 'react'
import SVG from 'react-inlinesvg'
import { Card, BalanceDisplay, ConvertWrapper, VestingBreakdown, CardActions, ExtLink } from 'pages/Profile/styled'
import { ButtonPrimary } from 'custom/components/Button'
import { HelpCircle } from 'components/Page'
import { MouseoverTooltipContent } from 'components/Tooltip'
import cowImage from 'assets/cow-swap/cow_v2.svg'
import ArrowIcon from 'assets/cow-swap/arrow.svg'
import { AMOUNT_PRECISION } from 'constants/index'
import { formatSmartLocaleAware } from 'utils/format'
import { OperationType } from 'components/TransactionConfirmationModal'
import { useErrorModal } from 'hooks/useErrorMessageAndModal'
import CopyHelper from 'components/Copy'
import { getBlockExplorerUrl } from 'utils'
import { SupportedChainId as ChainId } from 'constants/chains'
import { useActiveWeb3React } from 'hooks/web3'
import { MERKLE_DROP_CONTRACT_ADDRESSES } from 'pages/Profile/LockedGnoVesting/hooks'
import { useBalances, useClaimCallback } from './hooks'

enum ClaimStatus {
  INITIAL,
  ATTEMPTING,
  SUBMITTED,
  CONFIRMED,
}

interface Props {
  openModal: (message: string, operationType: OperationType) => void
  closeModal: () => void
}

const LockedGnoVesting: React.FC<Props> = ({ openModal, closeModal }: Props) => {
  const { chainId = ChainId.MAINNET } = useActiveWeb3React()
  const [status, setStatus] = useState<ClaimStatus>(ClaimStatus.INITIAL)
  const { allocated, vested, claimed, loading: loadingBalances } = useBalances()
  const unvested = allocated.subtract(vested)
  const allocatedFormatted = formatSmartLocaleAware(allocated, AMOUNT_PRECISION) || '0'
  const vestedFormatted = formatSmartLocaleAware(vested, AMOUNT_PRECISION) || '0'
  const unvestedFormatted = formatSmartLocaleAware(unvested, AMOUNT_PRECISION) || '0'
  const claimableFormatted = formatSmartLocaleAware(vested.subtract(claimed), AMOUNT_PRECISION) || '0'

  const canClaim = !loadingBalances && unvested.greaterThan(0) && status === ClaimStatus.INITIAL
  const isClaimPending = status === ClaimStatus.SUBMITTED

  const { handleSetError, handleCloseError, ErrorModal } = useErrorModal()

  const claimCallback = useClaimCallback({
    openModal,
    closeModal,
    isFirstClaim: claimed.equalTo(0),
  })

  const handleClaim = useCallback(async () => {
    handleCloseError()
    if (!claimCallback) {
      return
    }

    setStatus(ClaimStatus.ATTEMPTING)

    claimCallback()
      .then((tx) => {
        setStatus(ClaimStatus.SUBMITTED)
        return tx.wait()
      })
      .then(() => {
        setStatus(ClaimStatus.CONFIRMED)

        setTimeout(() => {
          setStatus(ClaimStatus.INITIAL)
        }, 5000)
      })
      .catch((error) => {
        console.error('[Profile::LockedGnoVesting::index::claimCallback]::error', error)
        setStatus(ClaimStatus.INITIAL)
        handleSetError(error?.message)
      })
  }, [handleCloseError, handleSetError, claimCallback])

  if (allocated.equalTo(0)) {
    // don't render anything until we know that the user is actually eligible to claim
    return null
  }

  return (
    <>
      <Card showLoader={loadingBalances || isClaimPending}>
        <BalanceDisplay hAlign="left">
          <img src={cowImage} alt="COW token" width="56" height="56" />
          <span>
            <i>COW vesting from locked GNO</i>
            <b>
              {allocatedFormatted} COW{' '}
              <MouseoverTooltipContent
                wrap
                content={
                  <VestingBreakdown>
                    <span>
                      <i>Unvested</i> <p>{unvestedFormatted} COW</p>
                    </span>
                    <span>
                      <i>Vested</i> <p>{vestedFormatted} COW</p>
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
              Vested{' '}
              <MouseoverTooltipContent
                wrap
                content={
                  <div>
                    <p>
                      <strong>COW vesting from the GNO lock</strong> is vested linearly over four years, starting on Fri
                      Feb 11 2022 at 13:05:15 GMT.
                    </p>
                    <p>Each time you claim, you will receive the entire vested amount.</p>
                  </div>
                }
              >
                <HelpCircle size={14} />
              </MouseoverTooltipContent>
            </i>
            <b>{claimableFormatted}</b>
          </BalanceDisplay>
          {status === ClaimStatus.CONFIRMED ? (
            <ButtonPrimary disabled>
              <Trans>Successfully claimed</Trans>
            </ButtonPrimary>
          ) : (
            <ButtonPrimary onClick={handleClaim} disabled={!canClaim}>
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
          <ExtLink href={getBlockExplorerUrl(chainId, MERKLE_DROP_CONTRACT_ADDRESSES[chainId], 'token')}>
            View contract ↗
          </ExtLink>
          <CopyHelper toCopy={MERKLE_DROP_CONTRACT_ADDRESSES[chainId]}>
            <div title="Click to copy token contract address">Copy contract</div>
          </CopyHelper>
        </CardActions>
      </Card>

      <ErrorModal />
    </>
  )
}

export default LockedGnoVesting
