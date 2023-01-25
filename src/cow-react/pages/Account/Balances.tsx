import { Trans } from '@lingui/macro'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ExtLink,
  Card,
  CardActions,
  BalanceDisplay,
  ConvertWrapper,
  VestingBreakdown,
  CardsLoader,
  CardsSpinner,
} from '@cow/pages/Account/styled'
import { useWeb3React } from '@web3-react/core'
import { getBlockExplorerUrl } from 'utils'
import { formatMax, formatSmartLocaleAware } from '@cow/utils/format'
import { MouseoverTooltipContent } from 'components/Tooltip'
import { SupportedChainId as ChainId } from 'constants/chains'
import { ButtonPrimary } from 'custom/components/Button'
import vCOWImage from 'assets/cow-swap/vCOW.png'
import SVG from 'react-inlinesvg'
import ArrowIcon from 'assets/cow-swap/arrow.svg'
import CowImage from 'assets/cow-swap/cow_v2.svg'
import { useTokenBalance } from 'state/connection/hooks'
import { useVCowData, useSwapVCowCallback, useSetSwapVCowStatus, useSwapVCowStatus } from 'state/cowToken/hooks'
import { V_COW_CONTRACT_ADDRESS, COW_CONTRACT_ADDRESS, AMOUNT_PRECISION } from 'constants/index'
import { COW } from 'constants/tokens'
import { useErrorModal } from 'hooks/useErrorMessageAndModal'
import { OperationType } from 'components/TransactionConfirmationModal'
import useTransactionConfirmationModal from 'hooks/useTransactionConfirmationModal'
import AddToMetamask from 'components/AddToMetamask'
import { Link } from 'react-router-dom'
import CopyHelper from 'components/Copy'
import { SwapVCowStatus } from 'state/cowToken/actions'
import useBlockNumber from 'lib/hooks/useBlockNumber'
import usePrevious from 'hooks/usePrevious'
import LockedGnoVesting from './LockedGnoVesting'
import { useCowFromLockedGnoBalances } from '@cow/pages/Account/LockedGnoVesting/hooks'
import { getProviderErrorMessage } from 'utils/misc'
import { MetaMask } from '@web3-react/metamask'
import { HelpCircle } from '@cow/common/pure/HelpCircle'

const COW_DECIMALS = COW[ChainId.MAINNET].decimals

// Number of blocks to wait before we re-enable the swap COW -> vCOW button after confirmation
const BLOCKS_TO_WAIT = 2

export default function Profile() {
  const { account, chainId = ChainId.MAINNET, provider, connector } = useWeb3React()
  const previousAccount = usePrevious(account)

  const blockNumber = useBlockNumber()
  const [confirmationBlock, setConfirmationBlock] = useState<undefined | number>(undefined)
  const [shouldUpdate, setShouldUpdate] = useState<boolean>(false)

  const setSwapVCowStatus = useSetSwapVCowStatus()
  const swapVCowStatus = useSwapVCowStatus()

  const isMetaMask = (connector as MetaMask)?.provider?.isMetaMask

  // Locked GNO balance
  const { loading: isLockedGnoLoading, ...lockedGnoBalances } = useCowFromLockedGnoBalances()

  // Cow balance
  const cow = useTokenBalance(account || undefined, chainId ? COW[chainId] : undefined)

  // vCow balance values
  const { unvested, vested, total, isLoading: isVCowLoading } = useVCowData()

  // Boolean flags
  const hasVestedBalance = vested && !vested.equalTo(0)
  const hasVCowBalance = total && !total.equalTo(0)

  const isSwapPending = swapVCowStatus === SwapVCowStatus.SUBMITTED
  const isSwapInitial = swapVCowStatus === SwapVCowStatus.INITIAL
  const isSwapConfirmed = swapVCowStatus === SwapVCowStatus.CONFIRMED
  const isSwapDisabled = Boolean(
    !hasVestedBalance || !isSwapInitial || isSwapPending || isSwapConfirmed || shouldUpdate
  )

  const isCardsLoading = useMemo(() => {
    let output = isVCowLoading || isLockedGnoLoading || !provider

    // remove loader after 5 sec in any case
    setTimeout(() => {
      output = false
    }, 5000)

    return output
  }, [isLockedGnoLoading, isVCowLoading, provider])

  const cowBalance = formatSmartLocaleAware(cow, AMOUNT_PRECISION) || '0'
  const cowBalanceMax = formatMax(cow, COW_DECIMALS) || '0'
  const vCowBalanceVested = formatSmartLocaleAware(shouldUpdate ? undefined : vested, AMOUNT_PRECISION) || '0'
  const vCowBalanceVestedMax = vested ? formatMax(shouldUpdate ? undefined : vested, COW_DECIMALS) : '0'
  const vCowBalanceUnvested = formatSmartLocaleAware(unvested, AMOUNT_PRECISION) || '0'
  const vCowBalance = formatSmartLocaleAware(total, AMOUNT_PRECISION) || '0'
  const vCowBalanceMax = total ? formatMax(total, COW_DECIMALS) : '0'

  // Init modal hooks
  const { handleSetError, handleCloseError, ErrorModal } = useErrorModal()
  const { TransactionConfirmationModal, openModal, closeModal } = useTransactionConfirmationModal(
    OperationType.CONVERT_VCOW
  )

  // Handle swaping
  const { swapCallback } = useSwapVCowCallback({
    openModal,
    closeModal,
  })

  const handleVCowSwap = useCallback(async () => {
    handleCloseError()

    if (!swapCallback) {
      return
    }

    setSwapVCowStatus(SwapVCowStatus.ATTEMPTING)

    swapCallback()
      .then(() => {
        setSwapVCowStatus(SwapVCowStatus.SUBMITTED)
      })
      .catch((error) => {
        console.error('[Profile::index::swapVCowCallback]::error', error)
        setSwapVCowStatus(SwapVCowStatus.INITIAL)
        handleSetError(getProviderErrorMessage(error))
      })
  }, [handleCloseError, handleSetError, setSwapVCowStatus, swapCallback])

  const tooltipText = {
    balanceBreakdown: (
      <VestingBreakdown>
        <span>
          <i>Unvested</i> <p>{vCowBalanceUnvested} vCOW</p>
        </span>
        <span>
          <i>Vested</i> <p>{vCowBalanceVested} vCOW</p>
        </span>
      </VestingBreakdown>
    ),
    vested: (
      <div>
        <p>
          <strong>Vested vCOW</strong> is the portion of your vCOW token balance, which is fully available to convert to
          COW token.
        </p>
        <p>
          This includes any vCOW received through an <strong>airdrop.</strong>
        </p>
        <p>When converting your vested vCOW balance to COW, your entire vested balance will be converted.</p>
      </div>
    ),
  }

  const renderConvertToCowContent = useCallback(() => {
    let content = null

    if (isSwapPending) {
      content = <span>Converting vCOW...</span>
    } else if (isSwapConfirmed) {
      content = <span>Successfully converted!</span>
    } else {
      content = (
        <>
          Convert to COW <SVG src={ArrowIcon} />
        </>
      )
    }

    return content
  }, [isSwapConfirmed, isSwapPending])

  // Fixes the issue with change in status after swap confirmation
  // Makes sure to wait 2 blocks after confirmation to enable the swap button again
  useEffect(() => {
    if (isSwapConfirmed && !confirmationBlock) {
      setConfirmationBlock(blockNumber)
      setShouldUpdate(true)
    }

    if (!confirmationBlock || !blockNumber) {
      return
    }

    if (isSwapConfirmed && blockNumber - confirmationBlock > BLOCKS_TO_WAIT && hasVestedBalance) {
      setSwapVCowStatus(SwapVCowStatus.INITIAL)
      setConfirmationBlock(undefined)
      setShouldUpdate(false)
    }
  }, [blockNumber, confirmationBlock, hasVestedBalance, isSwapConfirmed, setSwapVCowStatus, shouldUpdate])

  // Reset swap button status on account change
  useEffect(() => {
    if (account && previousAccount && account !== previousAccount && !isSwapInitial) {
      setSwapVCowStatus(SwapVCowStatus.INITIAL)
    }
  }, [account, isSwapInitial, previousAccount, setSwapVCowStatus])

  const currencyCOW = COW[chainId]

  return (
    <>
      <TransactionConfirmationModal />
      <ErrorModal />

      {isCardsLoading ? (
        <Card>
          <CardsLoader>
            <CardsSpinner size="42px" />
          </CardsLoader>
        </Card>
      ) : (
        <>
          {hasVCowBalance && (
            <Card showLoader={isVCowLoading || isSwapPending}>
              <BalanceDisplay hAlign="left">
                <img src={vCOWImage} alt="vCOW token" width="56" height="56" />
                <span>
                  <i>
                    <Trans>Total vCOW balance</Trans>
                  </i>
                  <b>
                    <span title={`${vCowBalanceMax} vCOW`}>{vCowBalance} vCOW</span>{' '}
                    <MouseoverTooltipContent content={tooltipText.balanceBreakdown} wrap>
                      <HelpCircle size={14} />
                    </MouseoverTooltipContent>
                  </b>
                </span>
              </BalanceDisplay>
              <ConvertWrapper>
                <BalanceDisplay titleSize={18} altColor={true}>
                  <i>
                    Vested{' '}
                    <MouseoverTooltipContent content={tooltipText.vested} wrap>
                      <HelpCircle size={14} />
                    </MouseoverTooltipContent>
                  </i>
                  <b title={`${vCowBalanceVestedMax} vCOW`}>{vCowBalanceVested}</b>
                </BalanceDisplay>
                <ButtonPrimary onClick={handleVCowSwap} disabled={isSwapDisabled}>
                  {renderConvertToCowContent()}
                </ButtonPrimary>
              </ConvertWrapper>

              <CardActions>
                <ExtLink href={getBlockExplorerUrl(chainId, V_COW_CONTRACT_ADDRESS[chainId], 'token')}>
                  View contract ↗
                </ExtLink>
                <CopyHelper toCopy={V_COW_CONTRACT_ADDRESS[chainId]}>
                  <div title="Click to copy token contract address">Copy contract</div>
                </CopyHelper>
              </CardActions>
            </Card>
          )}

          <Card>
            <BalanceDisplay titleSize={26}>
              <img src={CowImage} alt="Cow Balance" height="80" width="80" />
              <span>
                <i>Available COW balance</i>
                <b title={`${cowBalanceMax} COW`}>{cowBalance} COW</b>
              </span>
            </BalanceDisplay>
            <CardActions>
              <ExtLink
                title="View contract"
                href={getBlockExplorerUrl(chainId, COW_CONTRACT_ADDRESS[chainId], 'token')}
              >
                View contract ↗
              </ExtLink>

              {isMetaMask && <AddToMetamask shortLabel currency={currencyCOW} />}

              {!isMetaMask && (
                <CopyHelper toCopy={COW_CONTRACT_ADDRESS[chainId]}>
                  <div title="Click to copy token contract address">Copy contract</div>
                </CopyHelper>
              )}

              <Link to={`/swap?outputCurrency=${COW_CONTRACT_ADDRESS[chainId]}`}>Buy COW</Link>
            </CardActions>
          </Card>

          <LockedGnoVesting
            {...lockedGnoBalances}
            loading={isLockedGnoLoading}
            openModal={openModal}
            closeModal={closeModal}
          />
        </>
      )}
    </>
  )
}
