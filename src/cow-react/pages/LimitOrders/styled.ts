import styled from 'styled-components/macro'
import { MEDIA_WIDTHS } from 'theme'

export const PageWrapper = styled.div<{ isUnlocked: boolean }>`
  width: ${({ isUnlocked }) => (isUnlocked ? '100%' : '460px')};
  max-width: ${MEDIA_WIDTHS.upToLarge}px;
  display: ${({ isUnlocked }) => (isUnlocked ? 'grid' : 'block')};
  grid-template-columns: 480px 1fr;
  grid-column-gap: 20px;

  > div:last-child {
    display: ${({ isUnlocked }) => (isUnlocked ? '' : 'none')};
  }

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
