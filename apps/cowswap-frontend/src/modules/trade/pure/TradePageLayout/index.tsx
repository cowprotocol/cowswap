import styled from 'styled-components/macro'

export const PageWrapper = styled.div<{ isUnlocked: boolean }>`
  width: 100%;
  display: grid;
  max-width: 1500px;
  margin: 0 auto;
  grid-template-columns: ${({ theme, isUnlocked }) => (isUnlocked ? theme.appBody.maxWidth.swap : '')} 1fr;
  grid-template-rows: max-content;
  grid-column-gap: 20px;

  ${({ theme }) => theme.mediaWidth.upToLarge`
    display: flex;
    flex-flow: column wrap;
  `};

  > div:last-child {
    display: ${({ isUnlocked }) => (isUnlocked ? '' : 'none')};
  }
`
// Form + banner
export const PrimaryWrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  gap: 16px;
  width: 100%;
  max-width: ${({ theme }) => theme.appBody.maxWidth.swap};
  margin: 0 auto;
  color: inherit;
`

// Graph + orders table
export const SecondaryWrapper = styled.div`
  display: flex;
  width: 100%;

  ${({ theme }) => theme.mediaWidth.upToLargeAlt`
    flex-flow: column wrap;
    margin: 56px 0;
  `};
`
