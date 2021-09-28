import styled from 'styled-components'
import Page, { GdocsListStyle, Title } from 'components/Page'
import * as CSS from 'csstype'
import { transparentize } from 'polished'

export const Wrapper = styled(Page)`
  ${GdocsListStyle}

  max-width: 910px;
  min-height: auto;
  padding-top: 16px;
  display: flex;
  width: 100%;
  justify-content: flex-end;
  flex-direction: column;
  margin: 0;
  background: ${({ theme }) => transparentize(0.5, theme.bg1)};
  box-shadow: none;
  border: 1px solid ${({ theme }) => theme.cardBorder};
  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 16px;
  `}
  span[role='img'] {
    font-size: 55px;
    ${({ theme }) => theme.mediaWidth.upToSmall`
      font-size: 30px;
    `}
  }
`

export const ChildWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-grow: 1;
  justify-content: center;
  border-radius: 21px;
  padding: 15px;
  ${({ theme }) => theme.neumorphism.boxShadow};
  background-color: ${({ theme }) => theme.bg7};
  ${({ theme }) => theme.mediaWidth.upToSmall`
    grid-column-start: 1;
    grid-column-end: 2;
    width: 100%;
  `}
  > .item {
    width: 100%;
  }
`

export const GridWrap = styled.div<Partial<CSS.Properties & { horizontal?: boolean }>>`
  display: grid;
  grid-column-gap: 22px;
  grid-row-gap: 22px;
  grid-template-columns: ${(props) => (props.horizontal ? '1fr 1fr' : '1fr')};
  ${({ theme }) => theme.mediaWidth.upToSmall`
  grid-template-columns: 1fr;
  grid-column-gap: 16px;
  grid-row-gap: 16px;
    grid-column-gap: 0;
    > :first-child,
    > :nth-child(2) {
      grid-column-start: 1;
      grid-column-end: 2;
    }
    > :nth-child(4) {
      display: none;
    }
  `};
`

export const CardHead = styled.div`
  display: flex;
  align-items: center;
  flex-grow: 1;
  flex-direction: row;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
  `}
`

export const StyledTitle = styled(Title)`
  display: flex;
  flex-grow: 1;
  justify-content: flex-start;
  margin: 0;
  line-height: 1.21;
  font-size: 26px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    justify-content: center;
    font-size: 24px;
  `}
`
export const ItemTitle = styled.h3`
  display: flex;
  align-items: center;
  margin: 0 0 34px 0;
  font-size: 18px;
  line-height: 1.21;
  color: ${({ theme }) => theme.text1};
  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin: 0 0 10px 0;
    font-size: 16px;
  `}
`

export const FlexWrap = styled.div`
  display: flex;
  flex-grow: 1;
  align-items: center;
  flex-direction: row;
  justify-content: center;
  button {
    max-width: 180px;
  }
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-wrap: wrap;
    button {
      max-width: 100%;
    }
  `}
`

export const FlexCol = styled.div`
  display: flex;
  flex-grow: 1;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  strong {
    font-size: 21px;
    ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 14px;
  `}
  }
  span:not([role='img']) {
    font-size: 14px;
    color: ${({ theme }) => theme.text6};
  }
`
