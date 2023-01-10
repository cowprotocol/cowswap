import { RateImpactWarning } from './index'
import { COW } from 'constants/tokens'
import { SupportedChainId } from 'constants/chains'

const Fixtures = {
  default: <RateImpactWarning withAcknowledge={true} rateImpact={-10} inputCurrency={COW[SupportedChainId.MAINNET]} />,
}

export default Fixtures
