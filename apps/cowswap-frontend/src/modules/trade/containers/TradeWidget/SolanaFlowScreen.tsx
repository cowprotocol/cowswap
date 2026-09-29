import { ReactNode } from 'react'

import { TransactionErrorContent } from 'common/pure/TransactionErrorContent'

export interface SolanaFlowScreenProps {
  error?: string
  onDismiss: () => void
  children: ReactNode
}

export function SolanaFlowScreen({ error, onDismiss, children }: SolanaFlowScreenProps): ReactNode {
  if (error) {
    return <TransactionErrorContent message={error} onDismiss={onDismiss} />
  }

  return <>{children}</>
}
