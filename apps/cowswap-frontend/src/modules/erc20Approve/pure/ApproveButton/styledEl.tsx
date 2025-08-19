import { Loader } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const ApproveButtonWrapper = styled.div<{ isPending: boolean }>`
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 14px;
  opacity: ${({ isPending }) => (isPending ? 0.7 : 1)};
`

export const StyledLoader = styled(Loader)`
  stroke: ${({ theme }) => theme.text1};
`
