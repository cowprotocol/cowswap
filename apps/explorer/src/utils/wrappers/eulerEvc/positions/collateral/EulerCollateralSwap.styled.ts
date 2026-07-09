import { Color } from '@cowprotocol/ui'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import styled from 'styled-components/macro'

export const DisabledCollateralIcon = styled(FontAwesomeIcon)`
  color: ${Color.explorer_grey};
  opacity: 0.7;
  width: 0.9rem;
  height: 0.9rem;
`

export const DisabledCollateralBadge = styled.span`
  width: 1.8rem;
  height: 1.8rem;
  border: 1px solid ${Color.explorer_tableRowBorder};
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`
