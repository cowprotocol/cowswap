import React, { ReactNode, useMemo } from 'react'

import { shortenAddress } from '@cowprotocol/common-utils'
import { useGnosisSafeInfo, useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'
import { useWeb3React } from '@web3-react/core'

import { Trans } from '@lingui/macro'

import { getStatusIcon } from 'modules/account/containers/AccountDetails'

import { ConfirmationPendingContent } from 'common/pure/ConfirmationPendingContent'

interface PendingTransactionModalProps {
  title: string | ReactNode
  description: string | ReactNode
  operationName: string | ReactNode
  onDismiss: () => void
  CustomBody?: ReactNode
  CustomDescription?: ReactNode
}
export function PendingTransactionModal(props: PendingTransactionModalProps) {
  const { title, description, operationName, onDismiss, CustomBody, CustomDescription } = props

  const { connector } = useWeb3React()
  const { account } = useWalletInfo()
  const walletDetails = useWalletDetails()
  const gnosisSafeInfo = useGnosisSafeInfo()

  const { ensName, isSmartContractWallet } = walletDetails
  const isGnosisSafe = !!gnosisSafeInfo

  const walletNameLabel = useMemo(() => {
    if (isGnosisSafe) return 'Safe'

    if (isSmartContractWallet) return 'smart contract wallet'

    return 'wallet'
  }, [isGnosisSafe, isSmartContractWallet])

  const statusIcon = useMemo(() => {
    return getStatusIcon(connector, walletDetails, 56)
  }, [connector, walletDetails])

  const operationSubmittedMessage = `The ${operationName} is submitted.`

  const defaultDescription = (
    <>
      <span>{description} </span>
      <br />
      <span>
        <Trans>Follow these steps:</Trans>
      </span>
    </>
  )

  return (
    <ConfirmationPendingContent
      onDismiss={onDismiss}
      statusIcon={statusIcon}
      title={title}
      description={CustomDescription || defaultDescription}
      operationLabel={operationName}
      walletNameLabel={walletNameLabel}
      walletAddress={ensName || shortenAddress(account)}
      operationSubmittedMessage={operationSubmittedMessage}
      CustomBody={CustomBody}
    />
  )
}
