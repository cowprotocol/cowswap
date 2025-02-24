import { Color } from '@cowprotocol/ui'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import styled from 'styled-components/macro'

const Icon = styled(FontAwesomeIcon)`
  background: ${Color.explorer_greyOpacity};
  border-radius: 1rem;
  width: 1rem !important;
  height: 1rem;
  padding: 0.4rem;
  margin: 0 0 0 0.5rem;
  cursor: pointer;
`

export default Icon
