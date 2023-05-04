import { DeadlineSelector } from './index'
import { defaultOrderDeadline } from '@cow/common/pure/DeadlineSelector/deadlines'

const Fixtures = {
  default: (
    <DeadlineSelector
      deadline={defaultOrderDeadline}
      customDeadline={null}
      selectDeadline={() => void 0}
      selectCustomDeadline={() => void 0}
    />
  ),
}

export default Fixtures
