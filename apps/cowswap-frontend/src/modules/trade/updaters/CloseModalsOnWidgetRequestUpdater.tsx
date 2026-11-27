import { Command } from '@cowprotocol/types'

import { useCloseModalsOnWidgetRequest } from '../hooks/useCloseModalsOnWidgetRequest'

interface CloseModalsOnWidgetRequestUpdaterProps {
  onClose: Command
}

/** For a screen that replaces `TradeWidget`, which closes its own screens on the integrator's request */
export function CloseModalsOnWidgetRequestUpdater({ onClose }: CloseModalsOnWidgetRequestUpdaterProps): null {
  useCloseModalsOnWidgetRequest(onClose)

  return null
}
