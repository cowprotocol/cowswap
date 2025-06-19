import { UI, ExternalLink, Loader as SpinnerLoader, ButtonPrimary, Media } from '@cowprotocol/ui'

import { X } from 'react-feather'
import styled, { css } from 'styled-components/macro'

import { CopyIcon as ClickToCopy } from 'legacy/components/Copy'

import { WatchAssetInWallet } from 'modules/wallet'

export const Container = styled.div`
  max-width: 100%;
  width: 100%;
  z-index: 1;
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

  ${Media.upToMedium()} {
    font-size: 15px;
    margin: 0 auto;
  }
`

export const StyledWatchAssetInWallet = styled(WatchAssetInWallet)`
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

export const CardsWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin: 0;
  padding: 0;
  z-index: 2;

  ${Media.upToMedium()} {
    grid-template-columns: 1fr;
  }
`

export const Card = styled.div<{ showLoader?: boolean }>`
  display: flex;
  flex-flow: row wrap;
  flex: 1;
  min-height: 192px;
  margin: 0;
  background: var(${UI.COLOR_PAPER});
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
        ${theme.shimmer};
        content: '';
      }
    `}

  ${Media.upToSmall()} {
    min-height: 130px;
    padding: 24px 16px;
  }

  ${ButtonPrimary} {
    height: 52px;
    gap: 10px;

    > svg {
      height: 100%;
      width: 16px;
      object-fit: contain;
      margin: 0;
      color: inherit;
      transform: translateX(0);
      transition: transform var(${UI.ANIMATION_DURATION}) ease-in-out;

      > path {
        fill: currentColor;
      }
    }

    &:hover > svg {
      transform: translateX(2px);
    }
  }
`

export const BannerCard = styled.div<{ rowOnMobile?: boolean }>`
  position: relative;
  width: 100%;
  border: 4px solid transparent;
  transition: border var(${UI.ANIMATION_DURATION}) ease-in-out;
  display: flex;
  flex-flow: row;
  align-items: center;
  justify-content: flex-start;
  min-height: 192px;
  border-radius: 16px;
  background: var(${UI.COLOR_PAPER});
  border: none;
  padding: 24px;
  gap: 24px;
  flex: 1;
  overflow: hidden;

  ${Media.upToMedium()} {
    text-align: center;
    padding: 24px 16px;
    flex-flow: ${({ rowOnMobile }) => (rowOnMobile ? 'row' : 'column')};
    align-items: center;
    justify-content: center;
  }
`

export const BannerCardContent = styled.span<{ fontSize?: string; justifyContent?: string; alignItems?: string }>`
  z-index: 2;
  display: flex;
  flex-flow: column;
  justify-content: ${({ justifyContent }) => justifyContent ?? 'space-between'};
  gap: 24px;
  height: 100%;
  width: 100%;
  flex: 1 1 auto;
  color: var(${UI.COLOR_TEXT});
  font-size: ${({ fontSize }) => fontSize ?? '16px'};

  ${Media.upToMedium()} {
    justify-content: center;
    align-items: center;
  }

  > b {
    font-size: 24px;
  }

  > small {
    color: var(${UI.COLOR_TEXT});
    font-size: inherit;
    line-height: 1.2;
    text-align: left;
    padding: 0;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 4px;

    ${Media.upToSmall()} {
      text-align: center;
    }
  }
`

export const BannerCardTitle = styled.h3<{ fontSize?: number }>`
  font-size: ${({ fontSize }) => fontSize ?? 40}px;
  font-weight: 700;
  line-height: 1;
  color: var(${UI.COLOR_TEXT});
  margin: 0;
`

export const BannerCardIcon = styled.div<{ width?: string | number; height?: string | number }>`
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${({ width }) => (typeof width === 'number' ? `${width}px` : (width ?? '100%'))};
  height: ${({ height }) => (typeof height === 'number' ? `${height}px` : (height ?? '100%'))};
`

export const CardActions = styled.div<{ content?: string }>`
  width: 100%;
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  align-items: flex-end;
  margin: auto 0 0;
  align-content: ${({ content }) => content ?? 'unset'};
  color: inherit;
  gap: 12px;

  ${Media.upToMedium()} {
    justify-content: center;
    flex-flow: column;
    gap: 24px;
  }

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

  ${Media.upToMedium()} {
    gap: 12px;
    flex-flow: column wrap;
  }

  ${Media.upToSmall()} {
    justify-content: center;
  }

  > img {
    ${Media.upToSmall()} {
      height: 56px;
      width: 56px;
      object-fit: contain;
    }
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

    ${Media.upToMedium()} {
      justify-content: center;
    }
  }

  b {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0 6px;
    color: ${({ altColor }) => (altColor ? `var(${UI.COLOR_INFO})` : `var(${UI.COLOR_TEXT})`)};
    font-size: ${({ titleSize }) => (titleSize ? `${titleSize}px` : '21px')};

    ${Media.upToMedium()} {
      justify-content: center;
    }

    ${Media.upToSmall()} {
      font-size: 18px;
    }

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
  background: var(${UI.COLOR_PAPER_DARKER});
  border-radius: 16px;
  padding: 16px;
  width: 100%;

  ${Media.upToMedium()} {
    display: flex;
    flex-flow: column wrap;
    gap: 16px 0;

    > div {
      gap: 6px 12px;
    }
  }
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
    color: var(${UI.COLOR_TEXT});
  }
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
    stroke: var(${UI.COLOR_TEXT});
  }
`

export const CloseButton = styled(X)`
  --size: 24px;
  cursor: pointer;
  position: absolute;
  right: 16px;
  top: 16px;
  stroke-width: 2px;
  transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;
  height: var(--size);
  width: var(--size);
  opacity: 0.6;
  z-index: 2;
  color: var(${UI.COLOR_TEXT});

  &:hover {
    opacity: 1;
  }
`
