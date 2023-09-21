import React, { ReactNode, useMemo } from 'react'

import alertImage from '@cowprotocol/assets/cow-swap/alert-circle.svg'
import checkImage from '@cowprotocol/assets/cow-swap/check.svg'
import { getChainCurrencySymbols } from '@cowprotocol/common-const'
import { shortenAddress } from '@cowprotocol/common-utils'
import { ExternalLink } from '@cowprotocol/ui'
import {
  getWeb3ReactConnection,
  useGnosisSafeInfo,
  useWalletDetails,
  useWalletInfo,
  getIsMetaMask,
  injectedConnection,
} from '@cowprotocol/wallet'
import { useWeb3React } from '@web3-react/core'

import { t, Trans } from '@lingui/macro'
import { CheckCircle, UserCheck } from 'react-feather'
import SVG from 'react-inlinesvg'

import { MediumAndUp, useMediaQuery } from 'legacy/hooks/useMediaQuery'

import { getStatusIcon } from 'modules/account/containers/AccountDetails'

import {
  ApproveComparison,
  ApproveFooter,
  ApproveWrapper,
  CloseIconWrapper,
  CompareItem,
  ItemList,
  LowerSection,
  StepsIconWrapper,
  StepsWrapper,
  UpperSection,
  WalletIcon,
  Wrapper,
} from './styled'

import { ConfirmOperationType } from '../../state/types'

enum WalletType {
  SAFE,
  SC,
  EOA,
}

export function getOperationMessage(operationType: ConfirmOperationType, chainId: number): string {
  const { native, wrapped } = getChainCurrencySymbols(chainId)

  switch (operationType) {
    case ConfirmOperationType.WRAP_ETHER:
      return 'Wrapping ' + native
    case ConfirmOperationType.UNWRAP_WETH:
      return 'Unwrapping ' + wrapped
    case ConfirmOperationType.APPROVE_TOKEN:
      return 'Approving token'
    case ConfirmOperationType.ORDER_CANCEL:
      return 'Canceling your order'
    case ConfirmOperationType.REVOKE_APPROVE_TOKEN:
      return 'Revoking token approval'
    case ConfirmOperationType.CONVERT_VCOW:
      return 'Converting vCOW to COW'
    case ConfirmOperationType.CLAIM_VESTED_COW:
      return 'Claiming vested COW'
    default:
      return 'Almost there!'
  }
}

function getOperationLabel(operationType: ConfirmOperationType): string {
  switch (operationType) {
    case ConfirmOperationType.WRAP_ETHER:
      return t`wrapping`
    case ConfirmOperationType.UNWRAP_WETH:
      return t`unwrapping`
    case ConfirmOperationType.APPROVE_TOKEN:
      return t`token approval`
    case ConfirmOperationType.REVOKE_APPROVE_TOKEN:
      return t`revoking token approval`
    case ConfirmOperationType.ORDER_SIGN:
      return t`order`
    case ConfirmOperationType.ORDER_CANCEL:
      return t`cancellation`
    case ConfirmOperationType.CONVERT_VCOW:
      return t`vCOW conversion`
    case ConfirmOperationType.CLAIM_VESTED_COW:
      return t`vested COW claim`
  }
}

function getSubmittedMessage(operationLabel: string, operationType: ConfirmOperationType): string {
  switch (operationType) {
    case ConfirmOperationType.ORDER_SIGN:
      return t`The order is submitted and ready to be settled.`
    default:
      return `The ${operationLabel} is submitted.`
  }
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

// TODO: replace by common/pure/ConfirmationPendingContent
export function LegacyConfirmationPendingContent({
  onDismiss,
  pendingText,
  operationType,
  chainId,
}: {
  onDismiss: () => void
  pendingText: ReactNode
  operationType: ConfirmOperationType
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
    operationType === ConfirmOperationType.APPROVE_TOKEN &&
    isMetaMask &&
    isNotMobile &&
    connectionType === injectedConnection

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
