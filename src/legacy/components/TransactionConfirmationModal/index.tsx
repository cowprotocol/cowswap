import React, { ReactNode, useContext, useMemo } from 'react'

import { useWeb3React } from '@web3-react/core'

import { t, Trans } from '@lingui/macro'
import { CheckCircle, UserCheck } from 'react-feather'
import SVG from 'react-inlinesvg'
import { Text } from 'rebass'
import { ThemeContext } from 'styled-components/macro'

import alertImage from 'legacy/assets/cow-swap/alert-circle.svg'
import checkImage from 'legacy/assets/cow-swap/check.svg'
import { MediumAndUp, useMediaQuery } from 'legacy/hooks/useMediaQuery'
import { OrderStatus } from 'legacy/state/orders/actions'
import { useOrder } from 'legacy/state/orders/hooks'
import { ExternalLink } from 'legacy/theme'
import { getBlockExplorerUrl, getEtherscanLink, getExplorerLabel, shortenAddress } from 'legacy/utils'
import { getChainCurrencySymbols } from 'legacy/utils/gnosis_chain/hack'

import { getStatusIcon } from 'modules/account/containers/AccountDetails'
import { useGnosisSafeInfo, useWalletDetails, useWalletInfo } from 'modules/wallet'
import { getIsMetaMask } from 'modules/wallet/api/utils/connection'
import { getWeb3ReactConnection } from 'modules/wallet/web3-react/connection'
import { walletConnectConnection } from 'modules/wallet/web3-react/connection/walletConnect'

import {
  ApproveComparison,
  ApproveFooter,
  ApproveWrapper,
  CloseIconWrapper,
  CompareItem,
  ExternalLinkCustom,
  ItemList,
  LowerSection,
  StepsIconWrapper,
  StepsWrapper,
  UpperSection,
  WalletIcon,
  Wrapper,
} from './styled'
import { ConfirmationModalContent as ConfirmationModalContentMod } from './TransactionConfirmationModalMod'

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

  const connectionType = getWeb3ReactConnection(connector)
  const walletNameLabel = getWalletNameLabel(walletType)
  const operationMessage = getOperationMessage(operationType, chainId)
  const operationLabel = getOperationLabel(operationType)
  const operationSubmittedMessage = getSubmittedMessage(operationLabel, operationType)
  const isMetaMask = getIsMetaMask()
  const isNotMobile = useMediaQuery(MediumAndUp)
  const isApproveMetaMaskDesktop =
    operationType === OperationType.APPROVE_TOKEN &&
    isMetaMask &&
    isNotMobile &&
    connectionType !== walletConnectConnection

  return (
    <Wrapper>
      <UpperSection>
        <CloseIconWrapper onClick={onDismiss} />

        <WalletIcon>{getStatusIcon(connector, walletDetails, 56)}</WalletIcon>
        <span>{pendingText}</span>
      </UpperSection>

      {/* Only shown for APPROVE_TOKEN operation */}
      {isApproveMetaMaskDesktop && (
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
                <SVG src={checkImage} /> Immutable contract with multiple&nbsp;
                <ExternalLink
                  href="https://github.com/cowprotocol/contracts/tree/main/audits"
                  target={'_blank'}
                  rel={'noopener'}
                >
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
      {!isApproveMetaMaskDesktop && (
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
