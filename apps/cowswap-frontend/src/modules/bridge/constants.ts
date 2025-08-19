import { t } from '@lingui/core/macro'

export const COW_PROTOCOL_NAME = `CoW Protocol`

const getBridgeDisclaimerTooltipContent = (): string =>
  t`Bridging feature is exclusively operated by the indicated third party. Please review their terms.`
export const BRIDGE_DISCLAIMER_TOOLTIP_CONTENT = getBridgeDisclaimerTooltipContent()
