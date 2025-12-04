import styled from 'styled-components/macro'

import { ContentWrapper } from 'common/pure/Modal'

export const ModalContentWrapper = styled(ContentWrapper)`
  flex: 1;
  padding: 1.5rem;
  color: inherit;
  border-radius: 1.5rem;
`

export const Description = styled.p`
  line-height: 1.4;
  margin: 0 0 1.5rem;
`

export const Warning = styled.strong`
  color: inherit;
`

export const ButtonContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
`

