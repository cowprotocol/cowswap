import { ButtonPrimary, ExternalLink as ExternalLinkTheme, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { StyledInternalLink } from 'legacy/theme'

export const ExternalLinkFaq = styled(ExternalLinkTheme)`
  text-decoration: underline;
  font-weight: normal;
`

export const InternalLinkFaq = styled(StyledInternalLink)`
  text-decoration: underline;
  font-weight: normal;
`

export const FooterWrapper = styled.div`
  display: block;
  margin: 34px 0 0;
  padding: 14px 0 0;
  border-top: 1px solid ${({ theme }) => theme.text1};
`

export const PageIndex = styled.div`
  display: flex;
  flex-flow: column wrap;
  border-bottom: 1px solid ${({ theme }) => theme.text1};
`

export const ButtonNav = styled(ButtonPrimary)`
  width: min-content;
  white-space: nowrap;
`

export const Menu = styled.div`
  display: flex;
  flex-flow: column wrap;
  font-size: 16px;
  font-weight: bold;
  line-height: 1;
  margin: 0 24px 0 0;
  color: inherit;
  height: max-content;
  position: sticky;
  top: 0;
  width: 100%;
  padding: 38px 0 0;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 0;
    position: relative;
    margin: 0;
  `}

  > ul {
    display: flex;
    flex-flow: column wrap;
    list-style: none;
    margin: 0;
    padding: 0;
    font-size: inherit;

    ${({ theme }) => theme.mediaWidth.upToSmall`
      background: var(${UI.COLOR_TEXT_OPACITY_10});
      border-radius: 16px;
      padding: 12px;
    `}
  }

  > ul > li {
    width: 100%;
  }

  > ul > li > a {
    margin: 4px 0;
    padding: 12px;
    border-radius: 6px;
    width: 100%;
    text-decoration: none;
    color: inherit;
    opacity: 0.65;
    transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;
    display: block;

    ${({ theme }) => theme.mediaWidth.upToSmall`
      margin: 0;
    `}

    &:hover,
    &.active {
      opacity: 1;
    }

    &.active {
      ${({ theme }) => theme.mediaWidth.upToSmall`
        background: var(${UI.COLOR_TEXT_OPACITY_10});
        border-radius: 16px;
      `}
    }
  }
`
