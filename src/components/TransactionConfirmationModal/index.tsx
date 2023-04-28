import { Currency } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { useGnosisSafeInfo, useWalletDetails, useWalletInfo } from '@cow/modules/wallet'
import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
import React, { ReactNode, useContext, useEffect, useMemo } from 'react'
import { ThemeContext } from 'styled-components/macro'
// eslint-disable-next-line no-restricted-imports
import { t, Trans } from '@lingui/macro'
import { ExternalLink } from 'theme'
import { getBlockExplorerUrl, getEtherscanLink, getExplorerLabel, shortenAddress } from 'utils'
import { Text } from 'rebass'
import { CheckCircle, UserCheck } from 'react-feather'
import GameIcon from 'assets/cow-swap/game.gif'
import { ConfirmationModalContent as ConfirmationModalContentMod } from './TransactionConfirmationModalMod'
import { getStatusIcon } from '@cow/modules/account/containers/AccountDetails'
import { OrderProgressBar } from 'components/OrderProgressBar'
import { getChainCurrencySymbols } from 'utils/gnosis_chain/hack'
import { Routes } from '@cow/constants/routes'
import { ActivityStatus, useMultipleActivityDescriptors } from 'hooks/useRecentActivity'
import { getActivityState, useActivityDerivedState } from 'hooks/useActivityDerivedState'
import { ActivityDerivedState } from '@cow/modules/account/containers/Transaction'
import AddToMetamask from '@cow/modules/wallet/web3-react/containers/AddToMetamask' // mod
import { supportedChainId } from 'utils/supportedChainId'
import { useOrder } from 'state/orders/hooks'
import { OrderStatus } from 'state/orders/actions'
import { EthFlowStepper } from '@cow/modules/swap/containers/EthFlowStepper'
import checkImage from 'assets/cow-swap/check.svg'
import alertImage from 'assets/cow-swap/alert-circle.svg'
import SVG from 'react-inlinesvg'
import {
  ApproveComparison,
  ApproveFooter,
  ApproveWrapper,
  ButtonCustom,
  ButtonGroup,
  CloseIconWrapper,
  CompareItem,
  ExternalLinkCustom,
  Header,
  InternalLink,
  ItemList,
  LowerSection,
  Section,
  StepsIconWrapper,
  StepsWrapper,
  StyledIcon,
  UpperSection,
  WalletIcon,
  Wrapper,
} from './styled'
import { ANIVERSSARY_CONFETTI_KEY } from 'constants/misc'
import Confetti from 'components/Confetti'

export * from './TransactionConfirmationModalMod'
export { default } from './TransactionConfirmationModalMod'

export enum WalletType {
  SAFE,
  SC,
  EOA,
}

export enum OperationType {
  WRAP_ETHER,
  UNWRAP_WETH,
  APPROVE_TOKEN,
  REVOKE_APPROVE_TOKEN,
  ORDER_SIGN,
  ORDER_CANCEL,
  CONVERT_VCOW,
  CLAIM_VESTED_COW,
}

function getWalletNameLabel(walletType: WalletType): string {
  switch (walletType) {
    case WalletType.SAFE:
      return 'Safe'
    case WalletType.SC:
      return 'smart contract wallet'
    case WalletType.EOA:
      return 'wallet'
  }
}

export function getOperationMessage(operationType: OperationType, chainId: number): string {
  const { native, wrapped } = getChainCurrencySymbols(chainId)

  switch (operationType) {
    case OperationType.WRAP_ETHER:
      return 'Wrapping ' + native
    case OperationType.UNWRAP_WETH:
      return 'Unwrapping ' + wrapped
    case OperationType.APPROVE_TOKEN:
      return 'Approving token'
    case OperationType.ORDER_CANCEL:
      return 'Canceling your order'
    case OperationType.REVOKE_APPROVE_TOKEN:
      return 'Revoking token approval'
    case OperationType.CONVERT_VCOW:
      return 'Converting vCOW to COW'
    case OperationType.CLAIM_VESTED_COW:
      return 'Claiming vested COW'
    default:
      return 'Almost there!'
  }
}

function getOperationLabel(operationType: OperationType): string {
  switch (operationType) {
    case OperationType.WRAP_ETHER:
      return t`wrapping`
    case OperationType.UNWRAP_WETH:
      return t`unwrapping`
    case OperationType.APPROVE_TOKEN:
      return t`token approval`
    case OperationType.REVOKE_APPROVE_TOKEN:
      return t`revoking token approval`
    case OperationType.ORDER_SIGN:
      return t`order`
    case OperationType.ORDER_CANCEL:
      return t`cancellation`
    case OperationType.CONVERT_VCOW:
      return t`vCOW conversion`
    case OperationType.CLAIM_VESTED_COW:
      return t`vested COW claim`
  }
}

function getSubmittedMessage(operationLabel: string, operationType: OperationType): string {
  switch (operationType) {
    case OperationType.ORDER_SIGN:
      return t`The order is submitted and ready to be settled.`
    default:
      return `The ${operationLabel} is submitted.`
  }
}

function getTitleStatus(activityDerivedState: ActivityDerivedState | null): string {
  if (!activityDerivedState) {
    return ''
  }

  const prefix = activityDerivedState.isOrder ? 'Order' : 'Transaction'

  switch (activityDerivedState.status) {
    case ActivityStatus.CONFIRMED:
      return `${prefix} Confirmed`
    case ActivityStatus.EXPIRED:
      return `${prefix} Expired`
    case ActivityStatus.CANCELLED:
      return `${prefix} Cancelled`
    case ActivityStatus.CANCELLING:
      return `${prefix} Cancelling`
    case ActivityStatus.FAILED:
      return `${prefix} Failed`
    default:
      return `${prefix} Submitted`
  }
}

export function ConfirmationPendingContent({
  onDismiss,
  pendingText,
  operationType,
  chainId,
}: {
  onDismiss: () => void
  pendingText: ReactNode
  operationType: OperationType
  chainId: number
}) {
  const { connector } = useWeb3React()
  const { account } = useWalletInfo()
  const walletDetails = useWalletDetails()
  const { ensName, isSmartContractWallet } = walletDetails
  const gnosisSafeInfo = useGnosisSafeInfo()

  const walletType = useMemo((): WalletType => {
    if (gnosisSafeInfo) {
      return WalletType.SAFE
    } else if (isSmartContractWallet) {
      return WalletType.SC
    } else {
      return WalletType.EOA
    }
  }, [gnosisSafeInfo, isSmartContractWallet])

  const walletNameLabel = getWalletNameLabel(walletType)
  const operationMessage = getOperationMessage(operationType, chainId)
  const operationLabel = getOperationLabel(operationType)
  const operationSubmittedMessage = getSubmittedMessage(operationLabel, operationType)

  return (
    <Wrapper>
      <UpperSection>
        <CloseIconWrapper onClick={onDismiss} />

        <WalletIcon>{getStatusIcon(connector, walletDetails, 56)}</WalletIcon>
        <span>{pendingText}</span>
      </UpperSection>

      {/* Only shown for APPROVE_TOKEN operation */}
      {operationType === OperationType.APPROVE_TOKEN && (
        <ApproveWrapper>
          <h3>
            Review and select the ideal <br /> spending cap in your wallet
          </h3>
          <ApproveComparison>
            <CompareItem>
              <h5>'Max'</h5>
              <ItemList listIconAlert>
                <li>
                  <SVG src={alertImage} /> Approval on each order
                </li>
                <li>
                  <SVG src={alertImage} /> Pay gas on every trade
                </li>
              </ItemList>
            </CompareItem>
            <CompareItem highlight recommended>
              <h5>'Use default'</h5>
              <ItemList>
                <li>
                  <SVG src={checkImage} /> Only approve once
                </li>
                <li>
                  <SVG src={checkImage} /> Save on future gas fees
                </li>
              </ItemList>
            </CompareItem>
          </ApproveComparison>

          <ApproveFooter>
            <h6>No matter your choice, enjoy these benefits:</h6>
            <ul>
              <li>
                <SVG src={checkImage} /> The contract only withdraws funds for signed open orders
              </li>
              <li>
                <SVG src={checkImage} />{' '}
                <ExternalLink href={'#'} target={'_blank'} rel={'noopener'}>
                  Immutable contract
                </ExternalLink>{' '}
                with multiple{' '}
                <ExternalLink href={'#'} target={'_blank'} rel={'noopener'}>
                  audits
                </ExternalLink>
              </li>
              <li>
                <SVG src={checkImage} /> Over 2 years of successful trading with billions in volume
              </li>
              <li>
                <SVG src={checkImage} /> Adjust your spending cap anytime
              </li>
            </ul>
          </ApproveFooter>
        </ApproveWrapper>
      )}

      {/* Not shown for APPROVE_TOKEN operation */}
      {operationType !== OperationType.APPROVE_TOKEN && (
        <LowerSection>
          <h3>
            <span>{operationMessage} </span>
            <br />
            <span>
              <Trans>Follow these steps:</Trans>
            </span>
          </h3>

          <StepsWrapper>
            <div>
              <StepsIconWrapper>
                <UserCheck />
              </StepsIconWrapper>
              <p>
                <Trans>
                  Sign the {operationLabel} with your {walletNameLabel}{' '}
                  {account && <span>({ensName || shortenAddress(account)})</span>}
                </Trans>
              </p>
            </div>
            <hr />
            <div>
              <StepsIconWrapper>
                <CheckCircle />
              </StepsIconWrapper>
              <p>{operationSubmittedMessage}</p>
            </div>
          </StepsWrapper>
        </LowerSection>
      )}
    </Wrapper>
  )
}

export function TransactionSubmittedContent({
  onDismiss,
  chainId,
  hash,
  currencyToAdd,
}: {
  onDismiss: () => void
  hash: string | undefined
  chainId: ChainId
  currencyToAdd?: Currency | undefined
}) {
  const activities = useMultipleActivityDescriptors({ chainId, ids: [hash || ''] }) || []
  const activityDerivedState = useActivityDerivedState({ chainId, activity: activities[0] })
  const activityState = activityDerivedState && getActivityState(activityDerivedState)
  const showProgressBar = activityState === 'open' || activityState === 'filled'
  const { order } = activityDerivedState || {}

  // Confetti
  // TODO: delete this after a while
  const showConfetti = !localStorage.getItem(ANIVERSSARY_CONFETTI_KEY)

  useEffect(() => {
    if (showConfetti) {
      setTimeout(() => {
        localStorage.setItem(ANIVERSSARY_CONFETTI_KEY, '1')
      }, 5000)
    }
  }, [showConfetti])

  if (!supportedChainId(chainId)) {
    return null
  }

  return (
    <Wrapper>
      {/* Anniversary confetti */}
      {showConfetti && <Confetti start={true} />}
      <Section>
        <Header>
          <CloseIconWrapper onClick={onDismiss} />
        </Header>
        <Text fontWeight={600} fontSize={28}>
          {getTitleStatus(activityDerivedState)}
        </Text>
        <DisplayLink id={hash} chainId={chainId} />
        <EthFlowStepper order={order} />
        {activityDerivedState && showProgressBar && (
          <OrderProgressBar hash={hash} activityDerivedState={activityDerivedState} chainId={chainId} />
        )}
        <ButtonGroup>
          <AddToMetamask shortLabel currency={currencyToAdd} />

          <ButtonCustom>
            <InternalLink to={Routes.PLAY_COWRUNNER} onClick={onDismiss}>
              <StyledIcon src={GameIcon} alt="Play CowGame" />
              Play the CoW Runner Game!
            </InternalLink>
          </ButtonCustom>
        </ButtonGroup>
      </Section>
    </Wrapper>
  )
}

type DisplayLinkProps = {
  id: string | undefined
  chainId: number
}

export function DisplayLink({ id, chainId }: DisplayLinkProps) {
  const theme = useContext(ThemeContext)
  const { orderCreationHash, status } = useOrder({ id, chainId }) || {}

  if (!id || !chainId) {
    return null
  }

  const ethFlowHash =
    orderCreationHash && (status === OrderStatus.CREATING || status === OrderStatus.FAILED)
      ? orderCreationHash
      : undefined
  const href = ethFlowHash
    ? getBlockExplorerUrl(chainId, ethFlowHash, 'transaction')
    : getEtherscanLink(chainId, id, 'transaction')
  const label = getExplorerLabel(chainId, ethFlowHash || id, 'transaction')

  return (
    <ExternalLinkCustom href={href}>
      <Text fontWeight={500} fontSize={14} color={theme.text3}>
        {label} ↗
      </Text>
    </ExternalLinkCustom>
  )
}

export interface ConfirmationModalContentProps {
  title: ReactNode
  titleSize?: number
  styles?: React.CSSProperties
  className?: string // mod
  onDismiss: () => void
  topContent: () => ReactNode
  bottomContent?: () => ReactNode | undefined
}

export function ConfirmationModalContent(props: ConfirmationModalContentProps) {
  return <ConfirmationModalContentMod {...props} />
}
