import { DEADLINE_LOWER_THRESHOLD_SECONDS } from '@cow/modules/swap/state/EthFlow/updaters'
import { RowDeadlineContent, RowDeadlineProps } from '.'

const defaultProps: RowDeadlineProps = {
  toggleSettings: console.log,
  isEthFlow: true,
  displayDeadline: Math.floor(DEADLINE_LOWER_THRESHOLD_SECONDS / 60) + ' minutes',
  symbols: ['ETH', 'WETH'],
  userDeadline: 600,
}

export default <RowDeadlineContent {...defaultProps} />
