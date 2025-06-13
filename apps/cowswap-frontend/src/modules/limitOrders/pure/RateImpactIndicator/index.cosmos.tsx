import { GNO_GNOSIS_CHAIN } from '@cowprotocol/common-const'

import { RateImpactIndicator } from './index'

const Fixtures = {
  default: () => <RateImpactIndicator inputCurrency={GNO_GNOSIS_CHAIN} rateImpact={-10} />,
}

export default Fixtures
