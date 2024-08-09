import { isCowOrder } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { ButtonPrimary } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'
import styled from 'styled-components/macro'

import { EnhancedTransactionLink } from 'legacy/components/EnhancedTransactionLink'
import { HashType } from 'legacy/state/enhancedTransactions/reducer'

import AnimatedConfirmation from 'common/pure/AnimatedConfirmation'
import { GnosisSafeInfo, useGnosisSafeInfo } from '@cowprotocol/wallet'

const Wrapper = styled.div`
  width: 100%;
  padding: 30px 15px 15px 15px;
  display: flex;
  gap: 20px;
  align-items: center;
  flex-direction: column;
`

const Caption = styled.h3`
  font-weight: 500;
  font-size: 20px;
  margin: 0;
`

const ActionButton = styled(ButtonPrimary)`
  margin-top: 30px;
`

export interface OrderSubmittedContentProps {
  onDismiss(): void
  chainId: SupportedChainId
  safeWallet: GnosisSafeInfo | undefined
  account: string
  hash: string
}

export function OrderSubmittedContent({ chainId, account, safeWallet, hash, onDismiss }: OrderSubmittedContentProps) {

  const tx = {
    hash,
    hashType: safeWallet && !isCowOrder('transaction', hash) ? HashType.GNOSIS_SAFE_TX : HashType.ETHEREUM_TX,
    safeTransaction: {
      safeTxHash: hash,
      safe: account,
    },
  }

  return (
    <Wrapper>
      <AnimatedConfirmation />
      <Caption>
        {safeWallet && safeWallet.threshold > 1 ? (
          <Trans>{`Order Submitted, but won't be processed until the transaction is signed by all your Safe{Wallet} signers.`}</Trans>
        ) : (
          <Trans>Order Submitted</Trans>
        )}
      </Caption>
      <EnhancedTransactionLink chainId={chainId} tx={tx} />
      <ActionButton onClick={onDismiss}>
        <Trans>Continue</Trans>
      </ActionButton>
    </Wrapper>
  )
}
