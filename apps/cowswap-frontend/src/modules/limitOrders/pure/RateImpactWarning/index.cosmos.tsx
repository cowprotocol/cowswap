import { COW_TOKEN_TO_CHAIN } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { RateImpactWarning } from './index'

const inputCurrency = COW_TOKEN_TO_CHAIN[SupportedChainId.MAINNET]

if (!inputCurrency) {
  throw new Error(`Input currency not found for chain ${SupportedChainId.MAINNET}`)
}

const Fixtures = {
  default: () => <RateImpactWarning withAcknowledge={true} rateImpact={-10} inputCurrency={inputCurrency} />,
}

export default Fixtures
