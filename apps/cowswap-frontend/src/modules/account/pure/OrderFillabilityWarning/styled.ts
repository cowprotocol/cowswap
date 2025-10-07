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

export const Subtitle = styled.div`
  margin-left: 30px;
  color: var(${UI.COLOR_RED});
  font-size: 13px;
`

export const OrderActionsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

export const Wrapper = styled.div`
  max-width: 450px;
`
