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
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  min-height: 490px;
  padding: 24px 0 0;
  gap: 32px;

  > h3 {
    font-size: 32px;
    line-height: 1;
    font-weight: 600;
    margin: 0 auto;
    text-align: center;
    color: inherit;
  }

  > h4 {
    font-size: 24px;
    line-height: 1;
    font-weight: 600;
    margin: 0 auto;
    text-align: center;
    color: inherit;
  }

  > p {
    font-size: 15px;
    line-height: 1.4;
    margin: 0 auto;
    font-weight: 400;
    text-align: center;
    color: inherit;
  }
`

export const ConnecWalletIconWrapper = styled.span`
  --size: 130px;
  --backgroundColor: var(${UI.COLOR_PAPER_DARKER});
  --iconFillColor: var(${UI.COLOR_TEXT});
  --iconColor: var(${UI.COLOR_TEXT});

  width: var(--size);
  height: var(--size);
  border-radius: var(--size);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin: 0;
  color: inherit;
  transform: rotate(0);
  transition: transform 5s cubic-bezier(0.68, -0.55, 0.27, 1.55);

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--backgroundColor);
    border-radius: var(--size);
    z-index: -1;
  }

  &:hover {
    transform: rotate(360deg);
  }

  > svg,
  > img {
    max-width: 100%;
    max-height: 100%;
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: inline;
  }

  > svg {
    padding: 28px;
    fill: var(--iconFillColor);
    color: var(--iconColor);
    opacity: 0.5;
  }
`

export const UnsupportedNetworkIconWrapper = styled(ConnecWalletIconWrapper)`
  --backgroundColor: var(${UI.COLOR_DANGER_BG});
  --iconFillColor: transparent;
  --iconColor: var(${UI.COLOR_DANGER_TEXT});

  &:hover {
    transform: rotate(0);
  }
`

export const NoOrdersAnimation = styled.div`
  width: 100%;
  max-width: 320px;
  margin: 16px auto 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0;

  > img {
    width: 100%;
    height: auto;
    object-fit: contain;
  }
`

export const NoOrdersLottieFrame = styled.div`
  position: relative;
  width: 100%;
  padding-top: calc(386 / 1099 * 100%);

  > div {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }
`

export const TopContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 3px;
  min-height: 36px;

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
  flex-flow: row nowrap;

  ${Media.upToMedium()} {
    width: 100%;
    gap: 10px;
    flex-flow: column-reverse wrap;
  }
`

export const BannerContainer = styled.div`
  width: 100%;
`
