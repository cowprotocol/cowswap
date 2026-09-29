import { Color } from '@cowprotocol/ui'

import { TokenImg } from 'components/common/TokenImg'
import styled from 'styled-components/macro'

export const Wrapper = styled.div<{ $wrap?: boolean }>`
  display: flex;
  align-items: center;
  flex-flow: row ${({ $wrap }) => ($wrap ? 'wrap' : 'nowrap')};
  font-size: inherit;
  gap: 4px;
  overflow-wrap: ${({ $wrap }) => ($wrap ? 'break-word' : 'normal')};
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
