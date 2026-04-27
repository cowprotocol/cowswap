import { useState } from 'react'

import { Toggle } from './Toggle.pure'

function InteractiveToggle(): React.ReactElement {
  const [checked, setChecked] = useState(false)
  return <Toggle checked={checked} toggle={() => setChecked((c) => !c)} />
}

const ToggleFixtures = {
  Toggle: () => <InteractiveToggle />,
  'Toggle disabled unchecked': <Toggle checked={false} toggle={() => {}} disabled />,
  'Toggle disabled checked': <Toggle checked={true} toggle={() => {}} disabled />,
}

export default ToggleFixtures
