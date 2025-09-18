import { Loader } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const ButtonLabelWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

export const StyledLoader = styled(Loader)`
  stroke: ${({ theme }) => theme.text1};
`
