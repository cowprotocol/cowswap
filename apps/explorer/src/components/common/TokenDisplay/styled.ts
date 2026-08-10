import { Color } from '@cowprotocol/ui'

import { TokenImg } from 'components/common/TokenImg'
import styled from 'styled-components/macro'

export const Wrapper = styled.div`
  display: flex;
  align-items: center;
  flex-flow: row wrap;
  font-size: inherit;
  gap: 4px;
  overflow-wrap: break-word;
  word-break: normal;
`

export const NativeWrapper = styled.span`
  color: ${Color.neutral100};
`

export const StyledImg = styled(TokenImg)`
  width: 1.6rem;
  height: 1.6rem;
  margin: 0 0.5rem;
`
