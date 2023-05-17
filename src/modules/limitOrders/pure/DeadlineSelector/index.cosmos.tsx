import { DeadlineSelector } from './index'
import { defaultLimitOrderDeadline } from 'modules/limitOrders/pure/DeadlineSelector/deadlines'

const Fixtures = {
  default: (
    <DeadlineSelector
      deadline={defaultLimitOrderDeadline}
      customDeadline={null}
      selectDeadline={() => void 0}
      selectCustomDeadline={() => void 0}
    />
  ),
}

export default Fixtures
