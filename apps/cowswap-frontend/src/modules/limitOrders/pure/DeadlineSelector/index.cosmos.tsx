import { defaultLimitOrderDeadline } from 'modules/limitOrders/pure/DeadlineSelector/deadlines'

import { DeadlineSelector } from './index'

const Fixtures = {
  default: () => (
    <DeadlineSelector
      deadline={defaultLimitOrderDeadline}
      customDeadline={null}
      selectDeadline={() => void 0}
      selectCustomDeadline={() => void 0}
      isDeadlineDisabled={false}
    />
  ),
}

export default Fixtures
