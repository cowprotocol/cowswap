import styled from 'styled-components'
import Page, { GdocsListStyle, Title } from 'components/Page'

export const Wrapper = styled(Page)`
  ${GdocsListStyle}

  max-width: 910px;
  padding-top: 1rem;
  display: flex;
  width: 100%;
  justify-content: flex-end;
  flex-direction: column;

  span[role='img'] {
    font-size: 2.7rem;
    ${({ theme }) => theme.mediaWidth.upToMedium`
      font-size: 2.5rem;
    `}
  }
`

export const ChildWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  justify-content: center;
  border-radius: 1.3rem;
  padding: 0.93rem;
  box-shadow: ${({ theme }) => `inset 2px -2px 4px ${theme.cardShadow21}, inset -2px 2px 4px ${theme.cardShadow22}`};
  background-color: ${({ theme }) => theme.bg7};
`

export const GridWrap = styled.div`
  display: grid;
  grid-column-gap: 1.3rem;
  grid-row-gap: 1.3rem;
  grid-template-columns: 1fr 1fr;
  > :first-child,
  > :nth-child(2),
  > :last-child {
    grid-column-start: 1;
    grid-column-end: 3;
  }
  > :nth-child(3) {
    grid-row-start: 3;
    grid-column-start: 1;
    grid-column-end: 1;
  }
  > :nth-child(4) {
    grid-row-start: 3;
    grid-column: 2 / 2;
  }
  > :last-child {
    grid-row-start: 4;
    max-width: 11.5rem;
    margin: auto;
  }
  ${({ theme }) => theme.mediaWidth.upToMedium`
  grid-template-columns: 1fr;
    > :first-child,
    > :nth-child(2),
    > :nth-child(3),
    > :nth-child(4),
    > :last-child {
      grid-column-start: 1;
      grid-column-end: 2;
  }
  > :nth-child(3) {
    grid-row-start: 3;
  }
  > :nth-child(4) {
    grid-row-start: 4;
  }
  > :last-child {
    display: none;
  }
  `};
`

export const CardHead = styled.div`
  display: flex;
  align-items: center;
  flex-grow: 1;
  flex-direction: row;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-direction: column;
  `}
`

export const StyledTitle = styled(Title)`
  display: flex;
  flex-grow: 1;
  justify-content: flex-start;
  margin: 0;
  line-height: 1.5;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    justify-content: center;
    font-size: 1.5rem;
  `}
`
export const ItemTitle = styled.p`
  display: flex;
  align-items: center;
  margin: 0 0 1.875rem;
  font-size: 1.125rem;
  line-height: 1.2rem;
  font-weight: bold;
  color: ${({ theme }) => theme.text1};
  span {
    opacity: 0.5;
  }
`

export const Wrap = styled.div`
  display: flex;
  flex-grow: 1;
  align-items: center;
  justify-content: flex-start;
`

export const FlexCol = styled.div`
  display: flex;
  flex-grow: 1;
  align-items: center;
  flex-direction: column;
`

export const FlexCentered = styled.div`
  display: flex;
  flex-grow: 1;
  align-items: center;
  justify-content: space-around;
  width: 100%;
`
