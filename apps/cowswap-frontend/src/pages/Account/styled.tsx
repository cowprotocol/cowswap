import { Loader as SpinnerLoader, ButtonPrimary } from '@cowprotocol/ui'
import { ExternalLink } from '@cowprotocol/ui'
import { UI } from '@cowprotocol/ui'

import { lighten } from 'color2k'
import SVG from 'react-inlinesvg'
import styled, { css } from 'styled-components/macro'

import { CopyIcon as ClickToCopy } from 'legacy/components/Copy'

import { Page, GdocsListStyle } from 'modules/application/pure/Page'
import { AddToMetamask } from 'modules/wallet/containers/AddToMetamask'

export const Container = styled.div`
  max-width: 100%;
  width: 100%;
  z-index: 1;
`

export const Wrapper = styled(Page)`
  ${GdocsListStyle}
  width: 100%;
  max-width: 100%;
  min-height: unset;
  padding-top: 16px;
  display: flex;
  justify-content: flex-end;
  flex-flow: column wrap;
  margin: 0;
  background: ${({ theme }) => theme.bg1};
  box-shadow: ${({ theme }) => theme.boxShadow1};
  border: none;

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
  color: var(${UI.COLOR_TEXT});

  &:hover,
  &:focus {
    color: var(${UI.COLOR_PRIMARY_PAPER});
  }
`

const linkMixin = css`
  font-size: 13px;
  height: 100%;
  font-weight: 500;
  border-radius: 0;
  min-height: initial;
  margin: 0;
  padding: 0;
  line-height: 1;
  color: inherit;
  display: flex;
  align-items: center;
  text-decoration: underline;
  text-decoration-color: transparent;
  transition: text-decoration-color var(${UI.ANIMATION_DURATION}) ease-in-out,
    color var(${UI.ANIMATION_DURATION}) ease-in-out;

  ${({ theme }) => theme.mediaWidth.upToMedium`
      font-size: 15px;
      margin: 0 auto;
    `};

  &:hover {
    text-decoration-color: ${({ theme }) => theme.text1};
    color: ${({ theme }) => theme.text1};
  }
`

export const StyledAddToMetamask = styled(AddToMetamask)`
  border: 0;
  min-height: initial;
  border-radius: initial;

  &:hover {
    background: transparent;

    > div {
      text-decoration: underline;
    }
  }

  > div > img,
  > div > svg {
    height: 13px;
    width: auto;
    object-fit: contain;
    margin: 0 6px 0 0;
  }

  ${linkMixin}
`

export const StyledTime = styled.p`
  margin: 0;
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
        ${theme.shimmer}; // shimmer effect
        content: '';
      }
    `}
`

export const CardsWrapper = styled.div`
  display: flex;
  flex-flow: row wrap;
  gap: 16px;
  margin: 16px 0 16px 0;
  padding: 0;
  z-index: 2;

  > div {
    flex: 1 1 300px;
  }

  > div:last-child:nth-child(odd) {
    flex: 1 1 100%;
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: flex;
    flex-flow: column wrap;

    > div {
      flex: 1 1 100%;
    }

    > div:last-child:nth-child(odd) {
      flex: 1 1 100%;
    }
  `};
`

export const Card = styled.div<{ showLoader?: boolean }>`
  display: flex;
  flex-flow: row wrap;
  flex: 1;
  min-height: 192px;
  margin: 0;
  background: ${({ theme }) => theme.bg1};
  box-shadow: none;
  padding: 24px;
  gap: 24px 0;
  border-radius: 16px;
  border: none;
  align-items: flex-end;

  ${({ showLoader, theme }) =>
    showLoader &&
    css`
      position: relative;
      overflow: hidden;
      &::after {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        transform: translateX(-100%);
        ${theme.shimmer}; // shimmer effect
        content: '';
      }
    `}

  ${({ theme }) => theme.mediaWidth.upToSmall`
    min-height: 130px;
    padding: 24px 16px;
  `};

  ${ButtonPrimary} {
    height: 52px;

    > svg {
      height: 100%;
      width: 16px;
      object-fit: contain;
      margin: 0 0 0 6px;
      transform: translateX(0);
      transition: transform var(${UI.ANIMATION_DURATION}) ease-in-out;

      > path {
        fill: ${({ theme }) => theme.white};
      }
    }

    &:hover > svg {
      transform: translateX(2px);
    }
  }
`

const BannerExplainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 130px;
  border-radius: 12px;
  padding: 0 24px 0 20%;
  background: ${({ theme }) => theme.bg8};
  position: relative;
  overflow: hidden;
  border: 4px solid transparent;
  transition: border var(${UI.ANIMATION_DURATION}) ease-in-out;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 24px;
    height: auto;
  `}

  > span {
    display: flex;
    flex-flow: column wrap;
    height: 100%;
    flex: 1 1 auto;
    align-items: flex-end;
    justify-content: center;

    ${({ theme }) => theme.mediaWidth.upToSmall`
      align-items: center;
    `}
  }

  > span > b {
    @supports (-webkit-background-clip: text) {
      background: ${({ theme }) =>
        `linear-gradient(80deg, ${theme.primary1}, ${lighten(theme.primary1, 0.2)}, ${theme.white}, #5ea2fb)`};
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    @supports not (-webkit-background-clip: text) {
      color: ${({ theme }) => theme.white};
    }

    text-align: right;
    font-size: 32px;
    font-weight: 600;
    margin: 0 0 6px;

    ${({ theme }) => theme.mediaWidth.upToSmall`
      font-size: 19px;
      text-align: center;
    `}
  }

  > span > small {
    color: ${({ theme }) => theme.white};
    font-size: 16px;
    font-weight: 400;
    text-align: right;
    padding: 0 0 0 20%;

    ${({ theme }) => theme.mediaWidth.upToSmall`
      text-align: center;
      padding: 0;
    `}
  }

  > span > small > a {
    color: inherit;
  }

  > svg {
    width: auto;
    height: 168%;
    position: absolute;
    left: -16%;
    top: 0;
    bottom: 0;
    margin: auto;
    mix-blend-mode: hard-light;

    ${({ theme }) => theme.mediaWidth.upToSmall`
      display: none;
    `}
  }

  > svg {
    .stop1 {
      stop-color: ${({ theme }) => theme.white};
    }
    .stop2 {
      stop-color: ${({ theme }) => theme.white};
      stop-opacity: 0.8;
    }
    .stop3 {
      stop-color: ${({ theme }) => theme.white};
      stop-opacity: 0;
    }
  }
`

export const BannerCard = styled(BannerExplainer)`
  min-height: 192px;
  border-radius: 16px;
  background: ${({ theme }) => theme.bg1};
  border: none;
  padding: 0 100px 0 24px;
  flex: 1;
  overflow: hidden;
  height: auto;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    text-align: center;
    padding: 24px 16px;
  `}

  &:hover {
  }

  > span {
    align-items: flex-start;
    justify-content: space-between;
    height: 100%;
    padding: 24px 0;
    color: ${({ theme }) => theme.text1};

    ${({ theme }) => theme.mediaWidth.upToSmall`
      padding: 0;
    `}

    > b {
      font-size: 24px;

      @supports (-webkit-background-clip: text) {
        background: ${({ theme }) => `linear-gradient(80deg, ${theme.text1}, ${theme.text1}, #5ea2fb)`};
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      @supports not (-webkit-background-clip: text) {
        color: ${({ theme }) => theme.text1};
      }

      ${({ theme }) => theme.mediaWidth.upToSmall`
        text-align: center;
        margin: 0 auto;
      `};
    }

    > small {
      color: ${({ theme }) => theme.text1};
      font-size: 14px;
      line-height: 1.5;
      text-align: left;
      padding: 0;
      margin: 8px 0 auto;

      ${({ theme }) => theme.mediaWidth.upToSmall`
        text-align: center;
        margin: 16px auto;
      `}
    }

    > span {
      display: flex;
      margin: 8px 0 0;
      gap: 0 16px;
      width: 100%;

      ${({ theme }) => theme.mediaWidth.upToSmall`
        flex-flow: column wrap;
        gap: 16px 0;
        justify-content: center;
        margin: 24px 0 12px;
      `}
    }

    > span > a,
    > span > a:link {
      font-size: 15px;
      color: ${({ theme }) => theme.text1};

      &:hover {
        color: ${({ theme }) => theme.text3};
      }
    }
  }

  > svg {
    left: initial;
    right: -190px;
    transform: scale(-1, 1); // flip mirror
    opacity: 0.25;
    mix-blend-mode: initial;
  }

  > svg {
    .stop1 {
      stop-color: ${({ theme }) => theme.text1};
    }
    .stop2 {
      stop-color: ${({ theme }) => theme.text1};
      stop-opacity: 0.8;
    }
    .stop3 {
      stop-color: ${({ theme }) => theme.text1};
      stop-opacity: 0;
    }
  }
`

export const CardActions = styled.div<{ justify?: string; content?: string }>`
  width: 100%;
  display: flex;
  flex-flow: row wrap;
  justify-content: ${({ justify }) => justify || 'space-between'};
  align-items: flex-end;
  margin: auto 0 0;
  align-content: ${({ content }) => content || 'unset'};
  color: inherit;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    justify-content: center;
    align-items: center;
    flex-flow: column wrap;
    gap: 32px 0;
    margin: 12px 0;
  `};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    align-content: center;
  `};

  > a,
  > ${ClickToCopy} {
    ${linkMixin}
  }

  > ${ClickToCopy} svg {
    height: 13px;
    width: auto;
    margin: 0 4px 0 0;
  }
`

export const BalanceDisplay = styled.div<{ titleSize?: number; altColor?: boolean; hAlign?: string }>`
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  align-content: center;
  justify-content: ${({ hAlign }) => (hAlign === 'left' ? 'flex-start' : 'center')};
  gap: 3px 12px;
  width: 100%;
  font-size: 14px;
  color: inherit;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    gap: 12px;
    flex-flow: column wrap;
  `};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    justify-content: center;
  `};

  > img {
    ${({ theme }) => theme.mediaWidth.upToSmall`
      height: 56px;
      width: 56px;
      object-fit: contain;
    `};
  }

  > span {
    display: flex;
    flex-flow: column wrap;
    gap: 3px 0;
  }

  i {
    display: flex;
    align-items: center;
    gap: 0 3px;
    width: 100%;
    font-style: normal;

    ${({ theme }) => theme.mediaWidth.upToMedium`
      justify-content: center;
    `};
  }

  b {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0 6px;
    color: ${({ theme, altColor }) => (altColor ? theme.text3 : `var(${UI.COLOR_TEXT})`)};
    font-size: ${({ titleSize }) => (titleSize ? `${titleSize}px` : '21px')};

    ${({ theme }) => theme.mediaWidth.upToMedium`
      justify-content: center;
    `};

    ${({ theme }) => theme.mediaWidth.upToSmall`
      font-size: 18px;
    `};

    > div {
      cursor: pointer;
    }

    // Todo: Prevent requiring overriding tooltip padding with important!
    > div > div {
      padding: 0 !important;
    }
  }
`

export const ConvertWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 200px;
  grid-template-rows: max-content;
  align-items: center;
  background: ${({ theme }) => theme.grey1};
  border-radius: 16px;
  padding: 16px;
  width: 100%;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: flex;
    flex-flow: column wrap;
    gap: 16px 0;

    > div { gap: 6px 12px; }
  `};
`

export const VestingBreakdown = styled.div`
  display: flex;
  flex-flow: column wrap;
  width: 100%;
  gap: 3px 0;

  > span {
    display: flex;
    flex-flow: row wrap;
    align-items: center;
    justify-items: center;
    justify-content: space-between;
    gap: 0 18px;
    width: 100%;
  }

  > span > i {
    font-style: normal;
    opacity: 0.75;
  }

  > span > p {
    font-weight: 500;
    margin: 0;
  }

  > span:last-of-type > p {
    color: ${({ theme }) => theme.text1};
  }
`

export const BannerCardContent = styled.span`
  z-index: 2;

  > b {
    text-align: left !important;
  }

  a:last-child {
    margin-left: 15px;
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    a:last-child {
      margin-left: auto;
    }
  `};
`

export const BannerCardSvg = styled(SVG)`
  z-index: 1;
`

export const CardsLoader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
`
export const CardsSpinner = styled(SpinnerLoader)`
  margin: auto;

  & path {
    stroke: ${({ theme }) => theme.text1};
  }
`
