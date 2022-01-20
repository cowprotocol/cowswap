import styled, { css } from 'styled-components/macro'
import Page, { GdocsListStyle } from 'components/Page'
import * as CSS from 'csstype'
import { transparentize } from 'polished'
import { ExternalLink } from 'theme'

export const Container = styled.div`
  max-width: 910px;
  width: 100%;
`
export const Wrapper = styled(Page)`
  ${GdocsListStyle}

  max-width: 910px;
  width: 100%;
  min-height: auto;
  padding-top: 16px;
  display: flex;
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

export const ExtLink = styled(ExternalLink)`
  &:hover,
  &:focus {
    color: ${({ theme }) => theme.text1};
  }
`

export const ChildWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-grow: 1;
  justify-content: center;
  border-radius: 21px;
  padding: 20px;
  ${({ theme }) => theme.neumorphism.boxShadow};
  background-color: ${({ theme }) => theme.bg7};
  ${({ theme }) => theme.mediaWidth.upToSmall`
    grid-column-start: 1;
    grid-column-end: 2;
    width: 100%;
    padding: 14px;
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
  `};
`

export const CardHead = styled.div`
  display: flex;
  flex-grow: 1;
  flex-direction: column;
`

export const StyledTime = styled.p`
  margin: 0;
`

export const ItemTitle = styled.h3`
  display: flex;
  align-items: center;
  margin: 0 0 16px 0;
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
  > div {
    width: auto;
  }
  button {
    max-width: 180px;
  }
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-wrap: wrap;
    > div {
      width: 50%;
    }
    button {
      max-width: 100%;
    }
  `}
`

export const StyledContainer = styled.div`
  display: flex;
  flex:1;
  align-items:center;
  justify-content: space-between;
  }
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-wrap: wrap;
    flex-direction: column;
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
    margin-top: 6px;
    ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 14px;
  `}
  }
  span:not([role='img']) {
    font-size: 14px;
    color: ${({ theme }) => theme.text6};
    text-align: center;
    display: flex;
    align-items: center;
    padding: 8px 0 0 0;
  }
`

export const Loader = styled.div<{ isLoading: boolean }>`
  display: flex;
  flex: 1;
  ${({ theme, isLoading }) =>
    isLoading &&
    css`
      position: relative;
      display: inline-block;

      overflow: hidden;
      &::after {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        transform: translateX(-100%);
        background-image: linear-gradient(
          90deg,
          rgba(255, 255, 255, 0) 0,
          ${theme.shimmer1} 20%,
          ${theme.shimmer2} 60%,
          rgba(255, 255, 255, 0)
        );
        animation: shimmer 2s infinite;
        content: '';
      }

      @keyframes shimmer {
        100% {
          transform: translateX(100%);
        }
      }
    `}
`

export const ProfileWrapper = styled(Wrapper)`
  margin: 0 0 16px 0;
  padding: 16px 24px;
`

export const ProfileFlexCol = styled.div`
  display: flex;
  flex-grow: 1;
  align-items: flex-start;
  flex-direction: column;

  span {
    padding: 0 8px;
  }
`
export const ProfileGridWrap = styled(GridWrap)`
  grid-template-columns: 1fr auto;
  justify-content: space-between;
  align-items: center;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    > :first-child,
    > :nth-child(2) {
      grid-column-start: auto;
      grid-column-end: auto;
    }
  `};
  ${({ theme }) => theme.mediaWidth.upToVerySmall`
    > :first-child,
    > :nth-child(2) {
      grid-column-start: 1;
      grid-column-end: 1;
    }
  `};
`

export const VCOWBalance = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-grow: 1;
  min-width: 215px;
  height: 56px;
  justify-content: center;
  border-radius: 12px;
  padding: 8px;
  ${({ theme }) => theme.neumorphism.boxShadow};
  background-color: ${({ theme }) => theme.bg7};
`
