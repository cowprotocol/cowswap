// RangeBadge.fixture.jsx
import RangeBadge from '../RangeBadge'

export default {
  removed: <RangeBadge removed={true} inRange={true} />,
  inRange: <RangeBadge removed={false} inRange={true} />,
  outRange: <RangeBadge removed={false} inRange={false} />,
}
