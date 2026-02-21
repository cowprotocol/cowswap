import { useCallback, useEffect, useMemo, useState } from 'react'

import ArrowIcon from '@cowprotocol/assets/cow-swap/arrow.svg'
import CowImage from '@cowprotocol/assets/cow-swap/cow_token.svg'
import vCOWImage from '@cowprotocol/assets/images/vCOW.svg'
import { useCurrencyAmountBalance } from '@cowprotocol/balances-and-allowances'
import { COW_TOKEN_TO_CHAIN, COW_CONTRACT_ADDRESS, V_COW } from '@cowprotocol/common-const'
import { WRAPPED_NATIVE_CURRENCIES as WETH } from '@cowprotocol/common-const'
import { usePrevious } from '@cowprotocol/common-hooks'
import { getBlockExplorerUrl, getProviderErrorMessage } from '@cowprotocol/common-utils'
import { ButtonPrimary, HoverTooltip, TokenAmount } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import SVG from 'react-inlinesvg'
import { Link } from 'react-router'

import CopyHelper from 'legacy/components/Copy'
import { useErrorModal } from 'legacy/hooks/useErrorMessageAndModal'
import { SwapVCowStatus } from 'legacy/state/cowToken/actions'
import { useSetSwapVCowStatus, useSwapVCowCallback, useSwapVCowStatus, useVCowData } from 'legacy/state/cowToken/hooks'

import { useBlockNumber } from 'common/hooks/useBlockNumber'
import { useIsProviderNetworkDeprecated } from 'common/hooks/useIsProviderNetworkDeprecated'
import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'
import { useModalState } from 'common/hooks/useModalState'
import { ConfirmationPendingContent } from 'common/pure/ConfirmationPendingContent'
import { HelpCircle } from 'common/pure/HelpCircle'
import { CowModal } from 'common/pure/Modal'
import { useCowFromLockedGnoBalances } from 'pages/Account/LockedGnoVesting/hooks'
import {
  BalanceDisplay,
  BannerCard,
  BannerCardContent,
  BannerCardTitle,
  Card,
  CardActions,
  CardsLoader,
  CardsSpinner,
  ConvertWrapper,
  ExtLink,
  StyledWatchAssetInWallet,
  VestingBreakdown,
} from 'pages/Account/styled'

import LockedGnoVesting from './LockedGnoVesting'

// Number of blocks to wait before we re-enable the swap COW -> vCOW button after confirmation
const BLOCKS_TO_WAIT = 2

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type, complexity
export default function Profile() {
  const { account, chainId } = useWalletInfo()
  const previousAccount = usePrevious(account)

  const cowContractAddress = COW_CONTRACT_ADDRESS[chainId]
  const nativeWrappedToken = WETH[chainId]
  const isProviderNetworkUnsupported = useIsProviderNetworkUnsupported()
  const isProviderNetworkDeprecated = useIsProviderNetworkDeprecated()
  const blockNumber = useBlockNumber()
  const [confirmationBlock, setConfirmationBlock] = useState<undefined | number>(undefined)
  const [shouldUpdate, setShouldUpdate] = useState<boolean>(false)

  const setSwapVCowStatus = useSetSwapVCowStatus()
  const swapVCowStatus = useSwapVCowStatus()

  // Locked GNO balance
  const { loading: isLockedGnoLoading, ...lockedGnoBalances } = useCowFromLockedGnoBalances()

  const cowToken = COW_TOKEN_TO_CHAIN[chainId]
  const vCowToken = V_COW[chainId]
  // Cow balance
  const cowBalance =
    useCurrencyAmountBalance(chainId ? cowToken : undefined) ||
    (cowToken ? CurrencyAmount.fromRawAmount(cowToken, 0) : undefined)

  // vCow balance values
  const { unvested, vested, total, isLoading: isVCowLoading } = useVCowData()

  // Boolean flags
  const hasVestedBalance = vested && !vested.equalTo(0)
  const hasVCowBalance = total && !total.equalTo(0)

  const isSwapPending = swapVCowStatus === SwapVCowStatus.SUBMITTED
  const isSwapInitial = swapVCowStatus === SwapVCowStatus.INITIAL
  const isSwapConfirmed = swapVCowStatus === SwapVCowStatus.CONFIRMED
  const isSwapDisabled = Boolean(
    !hasVestedBalance || !isSwapInitial || isSwapPending || isSwapConfirmed || shouldUpdate,
  )

  const isCardsLoading = useMemo(() => {
    let output = isVCowLoading || isLockedGnoLoading

    // remove loader after 5 sec in any case
    setTimeout(() => {
      output = false
    }, 5000)

    return output
  }, [isLockedGnoLoading, isVCowLoading])

  // Init modal hooks
  const { handleSetError, handleCloseError, ErrorModal } = useErrorModal()

  const { isModalOpen, openModal, closeModal } = useModalState<string>()

  // Handle swapping
  const swapCallback = useSwapVCowCallback({
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
          <i>
            <Trans>Unvested</Trans>
          </i>{' '}
          <p>
            <TokenAmount amount={unvested} defaultValue="0" tokenSymbol={vCowToken} />
          </p>
        </span>
        <span>
          <i>
            <Trans>Vested</Trans>
          </i>{' '}
          <p>
            <TokenAmount amount={shouldUpdate ? undefined : vested} defaultValue="0" tokenSymbol={vCowToken} />
          </p>
        </span>
      </VestingBreakdown>
    ),
    vested: (
      <div>
        <Trans>
          <p>
            <strong>Vested vCOW</strong> is the portion of your vCOW token balance, which is fully available to convert
            to COW token.
          </p>
          <p>
            This includes any vCOW received through an <strong>airdrop.</strong>
          </p>
          <p>When converting your vested vCOW balance to COW, your entire vested balance will be converted.</p>
        </Trans>
      </div>
    ),
  }

  const renderConvertToCowContent = useCallback(() => {
    let content = null

    if (isSwapPending) {
      content = (
        <span>
          <Trans>Converting vCOW...</Trans>
        </span>
      )
    } else if (isSwapConfirmed) {
      content = (
        <span>
          <Trans>Successfully converted!</Trans>
        </span>
      )
    } else {
      content = (
        <Trans>
          Convert to COW <SVG src={ArrowIcon} />
        </Trans>
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

  return (
    <>
      <CowModal isOpen={isModalOpen} onDismiss={closeModal}>
        <ConfirmationPendingContent
          modalMode
          onDismiss={closeModal}
          title={t`Convert vCOW to COW`}
          description={t`Converting vCOW to COW`}
          operationLabel={t`vCOW conversion`}
        />
      </CowModal>

      <ErrorModal />

      {isCardsLoading && !isProviderNetworkUnsupported && !isProviderNetworkDeprecated ? (
        <Card>
          <CardsLoader>
            <CardsSpinner size="42px" />
          </CardsLoader>
        </Card>
      ) : (
        <>
          {hasVCowBalance && vCowToken && (
            <Card showLoader={isVCowLoading || isSwapPending}>
              <BalanceDisplay hAlign="left">
                <SVG src={vCOWImage} title={t`vCOW token`} width="56" height="56" />
                <span>
                  <i>
                    <Trans>Total vCOW balance</Trans>
                  </i>
                  <b>
                    <TokenAmount amount={total} defaultValue="0" tokenSymbol={vCowToken} />{' '}
                    <HoverTooltip content={tooltipText.balanceBreakdown} wrapInContainer>
                      <HelpCircle size={14} />
                    </HoverTooltip>
                  </b>
                </span>
              </BalanceDisplay>
              <ConvertWrapper>
                <BalanceDisplay titleSize={18} altColor={true}>
                  <i>
                    <Trans>Vested</Trans>{' '}
                    <HoverTooltip content={tooltipText.vested} wrapInContainer>
                      <HelpCircle size={14} />
                    </HoverTooltip>
                  </i>
                  <b>
                    <TokenAmount amount={shouldUpdate ? undefined : vested} defaultValue="0" />
                  </b>
                </BalanceDisplay>
                <ButtonPrimary onClick={handleVCowSwap} disabled={isSwapDisabled}>
                  {renderConvertToCowContent()}
                </ButtonPrimary>
              </ConvertWrapper>

              <CardActions>
                <ExtLink href={getBlockExplorerUrl(chainId, 'token', vCowToken.address)}>
                  <Trans>View contract</Trans> ↗
                </ExtLink>
                <CopyHelper toCopy={vCowToken.address}>
                  <div title={t`Click to copy token contract address`}>
                    <Trans>Copy contract</Trans>
                  </div>
                </CopyHelper>
              </CardActions>
            </Card>
          )}

          {cowContractAddress && (
            <Card>
              <BalanceDisplay titleSize={26}>
                <img src={CowImage} alt={t`Cow Balance`} height="80" width="80" />
                <span>
                  <i>
                    <Trans>Available COW balance</Trans>
                  </i>
                  <b>
                    {!isProviderNetworkUnsupported && !isProviderNetworkDeprecated && (
                      <TokenAmount amount={cowBalance} defaultValue="0" tokenSymbol={cowToken} />
                    )}
                  </b>
                </span>
              </BalanceDisplay>
              <CardActions>
                <ExtLink title={t`View contract`} href={getBlockExplorerUrl(chainId, 'token', cowContractAddress)}>
                  <Trans>View contract</Trans> ↗
                </ExtLink>

                <StyledWatchAssetInWallet
                  shortLabel
                  currency={cowToken}
                  fallback={
                    <CopyHelper toCopy={cowContractAddress}>
                      <div title={t`Click to copy token contract address`}>
                        <Trans>Copy contract</Trans>
                      </div>
                    </CopyHelper>
                  }
                />

                <Link to={`/${chainId}/swap/${nativeWrappedToken.address}/${COW_CONTRACT_ADDRESS[chainId]}`}>
                  <Trans>Buy COW</Trans>
                </Link>
              </CardActions>
            </Card>
          )}

          {!cowContractAddress && (
            <BannerCard>
              <BannerCardContent justifyContent="center">
                <BannerCardTitle fontSize={24}>
                  <Trans>COW token is not available on this network</Trans>
                </BannerCardTitle>
              </BannerCardContent>
            </BannerCard>
          )}

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
