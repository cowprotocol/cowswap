import styled from 'styled-components/macro'
import { MEDIA_WIDTHS } from 'theme'

export const PageWrapper = styled.div`
  width: 460px;
  display: block;
  // max-width: ${MEDIA_WIDTHS.upToLarge}px;
  // display: grid;
  // grid-template-columns: 480px 1fr;
  // grid-column-gap: 20px;

  ${({ theme }) => theme.mediaWidth.upToLarge`
  max-width: ${MEDIA_WIDTHS.upToMedium}px;
`}

  ${({ theme }) => theme.mediaWidth.upToMedium`
  display: flex;
  flex-direction: column;
  max-width: 640px;
`}
`

export const Column = styled.div``
