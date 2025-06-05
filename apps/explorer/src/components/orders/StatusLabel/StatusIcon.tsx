import React from 'react'

import { BridgeStatus } from '@cowprotocol/cow-sdk'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { OrderStatus } from 'api/operator'
import { GenericStatus, getStatusIcon } from 'utils/statusHelpers'

interface StatusIconProps {
  status: GenericStatus
}

export function StatusIcon({ status }: StatusIconProps): React.ReactNode {
  const icon = getStatusIcon(status)
  const isSpinning =
    status.toLowerCase() === OrderStatus.Open.toLowerCase() ||
    status.toLowerCase() === BridgeStatus.IN_PROGRESS.toLowerCase()

  return <FontAwesomeIcon icon={icon} spin={isSpinning} style={{ marginRight: '0.6rem' }} />
}
