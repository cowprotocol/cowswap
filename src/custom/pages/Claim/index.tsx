import { useCallback, useEffect, useMemo } from 'react'
import { CurrencyAmount, MaxUint256 } from '@uniswap/sdk-core'
import { useActiveWeb3React } from 'hooks/web3'
import { useUserEnhancedClaimData, useUserUnclaimedAmount, useClaimCallback, ClaimInput } from 'state/claim/hooks'
import { PageWrapper } from 'pages/Claim/styled'
import EligibleBanner from './EligibleBanner'
import { getFreeClaims, hasPaidClaim, hasFreeClaim, prepareInvestClaims } from 'state/claim/hooks/utils'
import { useWalletModalToggle } from 'state/application/hooks'
import Confetti from 'components/Confetti'

import useENS from 'hooks/useENS'

import ClaimNav from './ClaimNav'
import { ClaimSummary } from './ClaimSummary'
import ClaimAddress from './ClaimAddress'
import CanUserClaimMessage from './CanUserClaimMessage'
import ClaimingStatus from './ClaimingStatus'
import ClaimsTable from './ClaimsTable'
import InvestmentFlow from './InvestmentFlow'

import { useClaimDispatchers, useClaimState } from 'state/claim/hooks'
import { ClaimStatus } from 'state/claim/actions'

import { useApproveCallbackFromClaim } from 'hooks/useApproveCallback'
import { OperationType } from 'components/TransactionConfirmationModal'
import useTransactionConfirmationModal from 'hooks/useTransactionConfirmationModal'

import { GNO, USDC_BY_CHAIN } from 'constants/tokens'
import { isSupportedChain } from 'utils/supportedChainId'
import { useErrorModal } from 'hooks/useErrorMessageAndModal'
import FooterNavButtons from './FooterNavButtons'

const GNO_CLAIM_APPROVE_MESSAGE = 'Approving GNO for investing in vCOW'
const USDC_CLAIM_APPROVE_MESSAGE = 'Approving USDC for investing in vCOW'

/* TODO: Replace URLs with the actual final URL destinations */
export const COW_LINKS = {
  vCowPost: 'https://cow.fi/',
  stepGuide: 'https://cow.fi/',
}

export default function Claim() {
  const { account, chainId } = useActiveWeb3React()

  const {
    // address/ENS address
    inputAddress,
    // account
    activeClaimAccount,
    // check address
    isSearchUsed,
    // claiming
    claimStatus,
    // investment
    investFlowStep,
    // table select change
    selected,
    // investFlowData
    investFlowData,
  } = useClaimState()

  const {
    // account
    setInputAddress,
    setActiveClaimAccount,
    setActiveClaimAccountENS,
    // search
    setIsSearchUsed,
    // claiming
    setClaimStatus,
    // setClaimedAmount, // TODO: uncomment when used
    // investing
    setIsInvestFlowActive,
    // claim row selection
    setSelected,
    // reset claim ui
    resetClaimUi,
  } = useClaimDispatchers()

  // addresses
  const { address: resolvedAddress, name: resolvedENS } = useENS(inputAddress)

  // toggle wallet when disconnected
  const toggleWalletModal = useWalletModalToggle()
  // error handling modals
  const { handleCloseError, handleSetError, ErrorModal } = useErrorModal()

  // get user claim data
  const userClaimData = useUserEnhancedClaimData(activeClaimAccount)

  // get total unclaimed amount
  const unclaimedAmount = useUserUnclaimedAmount(activeClaimAccount)

  const hasClaims = useMemo(() => userClaimData.length > 0, [userClaimData])
  const isAirdropOnly = useMemo(() => !hasPaidClaim(userClaimData), [userClaimData])
  const isPaidClaimsOnly = useMemo(() => hasPaidClaim(userClaimData) && !hasFreeClaim(userClaimData), [userClaimData])

  // claim callback
  const { claimCallback } = useClaimCallback(activeClaimAccount)

  // handle change account
  const handleChangeAccount = () => {
    setActiveClaimAccount('')
    setSelected([])
    setClaimStatus(ClaimStatus.DEFAULT)
    setIsSearchUsed(true)
  }

  // check claim
  const handleCheckClaim = () => {
    setActiveClaimAccount(resolvedAddress || '')
    setActiveClaimAccountENS(resolvedENS || '')
    setInputAddress('')
  }

  // handle submit claim
  const handleSubmitClaim = useCallback(() => {
    // Reset error handling
    handleCloseError()

    // just to be sure
    if (!activeClaimAccount) return

    const freeClaims = getFreeClaims(userClaimData)

    const sendTransaction = (inputData: ClaimInput[]) => {
      setClaimStatus(ClaimStatus.ATTEMPTING)
      claimCallback(inputData)
        .then((/* res */) => {
          setClaimStatus(ClaimStatus.SUBMITTED)
        })
        .catch((error) => {
          setClaimStatus(ClaimStatus.DEFAULT)
          console.error('[Claim::index::handleSubmitClaim]::error', error)
          handleSetError(error?.message)
        })
    }

    const inputData = freeClaims.map(({ index }) => ({ index }))

    // check if there are any selected (paid) claims
    if (!selected.length) {
      console.log('Starting claiming with', inputData)
      sendTransaction(inputData)
    } else if (investFlowStep == 2) {
      // Free claims + selected investment opportunities
      const investClaims = prepareInvestClaims(investFlowData, userClaimData)
      inputData.push(...investClaims)
      console.log('Starting claiming with', inputData)
      sendTransaction(inputData)
    } else {
      setIsInvestFlowActive(true)
    }
  }, [
    handleCloseError,
    activeClaimAccount,
    userClaimData,
    selected.length,
    investFlowStep,
    setClaimStatus,
    claimCallback,
    handleSetError,
    investFlowData,
    setIsInvestFlowActive,
  ])

  // on account/activeAccount/non-connected account (if claiming for someone else) change
  useEffect(() => {
    // disconnected wallet?
    if (!account) {
      setActiveClaimAccount('')
    } else if (!isSearchUsed) {
      setActiveClaimAccount(account)
    }

    // properly reset the user to the claims table and initial investment flow
    resetClaimUi()
  }, [account, activeClaimAccount, resolvedAddress, isSearchUsed, setActiveClaimAccount, resetClaimUi])

  // Transaction confirmation modal
  const { TransactionConfirmationModal, openModal, closeModal } = useTransactionConfirmationModal(
    OperationType.APPROVE_TOKEN
  )

  const [gnoApproveState, gnoApproveCallback] = useApproveCallbackFromClaim(
    () => openModal(GNO_CLAIM_APPROVE_MESSAGE, OperationType.APPROVE_TOKEN),
    closeModal,
    // approve max unit256 amount
    isSupportedChain(chainId) ? CurrencyAmount.fromRawAmount(GNO[chainId], MaxUint256) : undefined
  )

  const [usdcApproveState, usdcApproveCallback] = useApproveCallbackFromClaim(
    () => openModal(USDC_CLAIM_APPROVE_MESSAGE, OperationType.APPROVE_TOKEN),
    closeModal,
    // approve max unit256 amount
    isSupportedChain(chainId) ? CurrencyAmount.fromRawAmount(USDC_BY_CHAIN[chainId], MaxUint256) : undefined
  )

  return (
    <PageWrapper>
      {/* Approve confirmation modal */}
      <TransactionConfirmationModal />
      {/* Error modal */}
      <ErrorModal />
      {/* If claim is confirmed > trigger confetti effect */}
      <Confetti start={claimStatus === ClaimStatus.CONFIRMED} />

      {/* Top nav buttons */}
      <ClaimNav account={account} handleChangeAccount={handleChangeAccount} />
      {/* Show general title OR total to claim (user has airdrop or airdrop+investment) --------------------------- */}
      <EligibleBanner hasClaims={hasClaims} />
      {/* Show total to claim (user has airdrop or airdrop+investment) */}
      <ClaimSummary hasClaims={hasClaims} unclaimedAmount={unclaimedAmount} />
      {/* Get address/ENS (user not connected yet or opted for checking 'another' account) */}
      <ClaimAddress account={account} toggleWalletModal={toggleWalletModal} />
      {/* Is Airdrop only (simple) - does user have claims? Show messages dependent on claim state */}
      <CanUserClaimMessage
        hasClaims={hasClaims}
        isAirdropOnly={isAirdropOnly}
        handleChangeAccount={handleChangeAccount}
      />

      {/* Try claiming or inform successful claim */}
      <ClaimingStatus />
      {/* IS Airdrop + investing (advanced) */}
      <ClaimsTable isAirdropOnly={isAirdropOnly} hasClaims={hasClaims} />
      {/* Investing vCOW flow (advanced) */}
      <InvestmentFlow
        isAirdropOnly={isAirdropOnly}
        hasClaims={hasClaims}
        gnoApproveData={{
          approveCallback: gnoApproveCallback,
          approveState: gnoApproveState,
        }}
        usdcApproveData={{
          approveCallback: usdcApproveCallback,
          approveState: usdcApproveState,
        }}
      />

      <FooterNavButtons
        handleCheckClaim={handleCheckClaim}
        handleSubmitClaim={handleSubmitClaim}
        toggleWalletModal={toggleWalletModal}
        isAirdropOnly={isAirdropOnly}
        isPaidClaimsOnly={isPaidClaimsOnly}
        hasClaims={hasClaims}
        resolvedAddress={resolvedAddress}
      />
    </PageWrapper>
  )
}
