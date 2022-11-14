import styled from 'styled-components/macro'
import { MEDIA_WIDTHS } from 'theme'

export const PageWrapper = styled.div`
  width: 100%;
  max-width: ${MEDIA_WIDTHS.upToLarge}px;
  display: grid;
  grid-template-columns: 480px 1fr;
  grid-column-gap: 20px;

  ${({ theme }) => theme.mediaWidth.upToLarge`
    display: flex;
    flex-direction: column;
    max-width: 640px;
  `}
`

export const Column = styled.div`
  ${({ theme }) => theme.mediaWidth.upToLarge`
    :not(:first-child) {
      margin-top: 20px;
    }
  `}
`
