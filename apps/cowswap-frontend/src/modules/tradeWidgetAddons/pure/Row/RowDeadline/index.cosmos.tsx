import { MINIMUM_ETH_FLOW_DEADLINE_SECONDS } from '@cowprotocol/common-const'

import { RowDeadlineContent, RowDeadlineProps } from '.'

const defaultProps: RowDeadlineProps = {
  isEoaEthFlow: true,
  displayDeadline: Math.floor(MINIMUM_ETH_FLOW_DEADLINE_SECONDS / 60) + ' minutes',
  symbols: ['ETH', 'WETH'],
  userDeadline: 600,
}

export default <RowDeadlineContent {...defaultProps} />
