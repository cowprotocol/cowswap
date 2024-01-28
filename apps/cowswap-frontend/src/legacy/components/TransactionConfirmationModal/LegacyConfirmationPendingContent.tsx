import React, { ReactNode, useMemo } from 'react'

import { NATIVE_CURRENCIES, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { shortenAddress } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
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

import { MediumAndUp, useMediaQuery } from 'legacy/hooks/useMediaQuery'

import { getStatusIcon } from 'modules/account/containers/AccountDetails'

import { ConfirmationPendingContent } from 'common/pure/ConfirmationPendingContent'
import { MetamaskApproveBanner } from 'common/pure/MetamaskApproveBanner'

import { ConfirmOperationType } from '../../state/types'

enum WalletType {
  SAFE,
  SC,
  EOA,
}

export function getOperationMessage(operationType: ConfirmOperationType, chainId: number): string {
  const nativeToken = NATIVE_CURRENCIES[chainId as SupportedChainId]
  const wrappedToken = WRAPPED_NATIVE_CURRENCIES[chainId as SupportedChainId]

  const native = nativeToken.symbol
  const wrapped = wrappedToken.symbol

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

function useIsMetaMaskDesktop(): boolean {
  const { connector } = useWeb3React()
  const connectionType = getWeb3ReactConnection(connector)
  const isMetaMask = getIsMetaMask()
  const isNotMobile = useMediaQuery(MediumAndUp)

  return isMetaMask && isNotMobile && connectionType === injectedConnection
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

  const walletNameLabel = getWalletNameLabel(walletType)
  const operationMessage = getOperationMessage(operationType, chainId)
  const operationLabel = getOperationLabel(operationType)
  const operationSubmittedMessage = getSubmittedMessage(operationLabel, operationType)

  const isApproveMetaMaskDesktop = useIsMetaMaskDesktop() && operationType === ConfirmOperationType.APPROVE_TOKEN

  const statusIcon = getStatusIcon(connector, walletDetails, 56)
  const description = isApproveMetaMaskDesktop ? (
    <>
      Review and select the ideal <br /> spending cap in your wallet
    </>
  ) : (
    <>
      <span>{operationMessage} </span>
      <br />
      <span>
        <Trans>Follow these steps:</Trans>
      </span>
    </>
  )

  const CustomBody = isApproveMetaMaskDesktop ? <MetamaskApproveBanner /> : null

  return (
    <ConfirmationPendingContent
      onDismiss={onDismiss}
      statusIcon={statusIcon}
      title={pendingText}
      description={description}
      operationLabel={operationLabel}
      walletNameLabel={walletNameLabel}
      walletAddress={ensName || shortenAddress(account)}
      operationSubmittedMessage={operationSubmittedMessage}
      CustomBody={CustomBody}
    />
  )
}
