import { useAtomValue } from 'jotai'
import { ReactNode } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { isSolanaChain } from '@cowprotocol/cow-sdk'
import { Command } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useOrder } from 'legacy/state/orders/hooks'

import { useNavigateToNewOrderCallback, useTradeConfirmState, waitAndSaveEnabledAtom } from 'modules/trade'

import { useOrderProgressBarProps } from '../hooks/useOrderProgressBarProps'
import { TransactionSubmittedContent } from '../pure/TransactionSubmittedContent'

interface OrderSubmittedContentProps {
  onDismiss: Command
  successTitle?: ReactNode
}

export function OrderSubmittedContent({ onDismiss, successTitle }: OrderSubmittedContentProps): ReactNode {
  const { chainId } = useWalletInfo()
  const { transactionHash } = useTradeConfirmState()
  const order = useOrder({ chainId, id: transactionHash || undefined })
  const { isWaitForCowsEnabled } = useFeatureFlags()
  const isWaitAndSaveEnabled = useAtomValue(waitAndSaveEnabledAtom)
  const showWaitAndSaveOutcome = Boolean(isWaitForCowsEnabled && isWaitAndSaveEnabled && !isSolanaChain(chainId))

  const { props: orderProgressBarProps, activityDerivedState } = useOrderProgressBarProps(chainId, order)

  const navigateToNewOrderCallback = useNavigateToNewOrderCallback()

  return (
    <TransactionSubmittedContent
      chainId={chainId}
      hash={transactionHash || undefined}
      onDismiss={onDismiss}
      activityDerivedState={activityDerivedState}
      orderProgressBarProps={{ ...orderProgressBarProps, showWaitAndSaveOutcome }}
      navigateToNewOrderCallback={navigateToNewOrderCallback}
      successTitle={successTitle}
    />
  )
}
