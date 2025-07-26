import { ReactNode } from 'react'

import { ExplorerDataType, getExplorerLink, shortenAddress } from '@cowprotocol/common-utils'
import { Icon, IconType, ExternalLink, UI } from '@cowprotocol/ui'

import { ActivityDerivedState } from 'common/types/activity'

import { SummaryInnerRow } from '../styled'

interface ActivityRecipientRowProps {
  order: ActivityDerivedState['order']
  isCustomRecipient: boolean
  isCustomRecipientWarningVisible: boolean
  receiverEnsName: string | undefined
  chainId: number
}

export function ActivityRecipientRow({
  order,
  isCustomRecipient,
  isCustomRecipientWarningVisible,
  receiverEnsName,
  chainId,
}: ActivityRecipientRowProps): ReactNode {
  if (!order || !isCustomRecipient) return null

  return (
    <SummaryInnerRow>
      <b>Recipient:</b>
      <i>
        {isCustomRecipientWarningVisible && (
          <Icon image={IconType.ALERT} color={UI.COLOR_ALERT} description="Alert" size={18} />
        )}
        <ExternalLink
          href={getExplorerLink(chainId, order.receiver || order.owner, ExplorerDataType.ADDRESS)}
        >
          {receiverEnsName || shortenAddress(order.receiver || order.owner)} ↗
        </ExternalLink>
      </i>
    </SummaryInnerRow>
  )
}