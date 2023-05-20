import { RateImpactWarning } from './index'
import { COW } from 'legacy/constants/tokens'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

const Fixtures = {
  default: <RateImpactWarning withAcknowledge={true} rateImpact={-10} inputCurrency={COW[SupportedChainId.MAINNET]} />,
}

export default Fixtures
