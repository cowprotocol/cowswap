import { ExternalLink, Media, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  gap: 16px;
  width: 100%;
`

export const Content = styled.div`
  display: flex;
  flex-flow: column wrap;
  align-items: center;
  justify-content: center;
  color: inherit;
  min-height: 490px;
  padding: 0;

  > span {
    --size: 130px;
    width: var(--size);
    height: var(--size);
    border-radius: var(--size);
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    margin: 0 0 16px;
    color: inherit;
    transform: rotate(0);
    transition: transform 5s cubic-bezier(0.68, -0.55, 0.27, 1.55);

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      background: var(${UI.COLOR_PAPER_DARKER});
      width: var(--size);
      height: var(--size);
      border-radius: var(--size);
      z-index: -1;
    }

    &:hover {
      transform: rotate(360deg);
    }

    > img,
    > svg {
      max-width: 100%;
      max-height: 100%;
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: inline;
    }

    > svg {
      padding: 28px;
      fill: currentColor;
      opacity: 0.5;
    }
  }

  > h3 {
    font-size: 26px;
    line-height: 1.2;
    font-weight: 500;
    margin: 0 auto 16px;
    text-align: center;
  }

  > p {
    font-size: 15px;
    line-height: 1.4;
    margin: 0 auto 21px;
    font-weight: 400;
    text-align: center;
    color: inherit;
  }
`

export const MeditatingCowImg = styled.img`
  padding: 16px;
`

export const TopContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 3px;

  ${Media.upToMedium()} {
    display: block;
    text-align: center;

    > h2 {
      margin-bottom: 15px !important;
    }
  }

  > h2 {
    font-size: 24px;
    margin: 0;
  }
`

export const TabsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;

  ${Media.upToMedium()} {
    flex-direction: column;
    align-items: end;
    gap: 10px;
  }
`

export const ExternalLinkStyled = styled(ExternalLink)`
  text-decoration: underline;
`

// Todo: Makes this arrow default behavior of <ExternalLink />
export const ExternalArrow = styled.span`
  display: inline-block;
  &::after {
    content: ' ↗';
    display: inline-block;
    padding: 0 0 0 1px;
    font-weight: bold;
    font-size: 11px;
  }
`

export const RightContainer = styled.div`
  display: flex;
  flex-flow: row wrap;

  ${Media.upToMedium()} {
    width: 100%;
    gap: 10px;
    flex-flow: column-reverse wrap;
  }
`
