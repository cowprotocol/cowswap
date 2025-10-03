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

  > p {
    font-size: 15px;
    line-height: 1.4;
    margin: 0 auto;
    font-weight: 400;
    text-align: center;
    color: inherit;
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
