import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { COW } from '@cowswap/common-const'

import { RateImpactWarning } from './index'

const Fixtures = {
  default: <RateImpactWarning withAcknowledge={true} rateImpact={-10} inputCurrency={COW[SupportedChainId.MAINNET]} />,
}

export default Fixtures
