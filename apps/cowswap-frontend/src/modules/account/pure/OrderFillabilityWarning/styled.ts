import { InlineBanner, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const UnfillableWarning = styled(InlineBanner)`
  margin: 10px 0;
  padding: 15px;
`

export const ApproveWrapper = styled.div`
  width: 100%;
  color: var(${UI.COLOR_TEXT});
`
