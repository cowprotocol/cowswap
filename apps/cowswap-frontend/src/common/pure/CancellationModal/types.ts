import { ReactNode } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { Command } from '@cowprotocol/types'
import type { BigNumber } from '@ethersproject/bignumber'

import { CancellationType } from '../../hooks/useCancelOrder/state'

export type RequestCancellationModalProps = {
  summary?: ReactNode
  shortId: string
  defaultType: CancellationType
  onDismiss: Command
  triggerCancellation: (type: CancellationType) => void
  txCost: BigNumber | null
  nativeCurrency: TokenWithLogo
}
