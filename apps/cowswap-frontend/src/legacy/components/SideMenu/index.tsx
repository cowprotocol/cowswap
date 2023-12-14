import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const SideMenu = styled.div<{ isAccountPage?: boolean }>`
  display: flex;
  flex-flow: column wrap;
  font-size: 16px;
  font-weight: 500;
  line-height: 1;
  margin: 0 24px 0 0;
  color: inherit;
  height: max-content;
  position: sticky;
  top: 0;
  width: 100%;
  padding: 38px 0 0;

  ${({ theme, isAccountPage }) => theme.mediaWidth[isAccountPage ? 'upToMedium' : 'upToSmall']`
  padding: 0;
  margin: 0;
  position: relative;
`}

  > ul {
    display: flex;
    flex-flow: column wrap;
    list-style: none;
    margin: 0;
    padding: 0;
    font-size: inherit;

    ${({ theme, isAccountPage }) => theme.mediaWidth[isAccountPage ? 'upToMedium' : 'upToSmall']`
    background: var(${UI.COLOR_TEXT_OPACITY_10});
    border-radius: 16px;
    padding: 12px;
    margin: 0 0 24px;
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

    ${({ theme, isAccountPage }) => theme.mediaWidth[isAccountPage ? 'upToMedium' : 'upToSmall']`
    margin: 0;
  `}

    &:hover,
    &.active {
      opacity: 1;
    }

    &.active {
      font-weight: 600;

      ${({ theme, isAccountPage }) => theme.mediaWidth[isAccountPage ? 'upToMedium' : 'upToSmall']`
        background: var(${UI.COLOR_TEXT_OPACITY_10});
        border-radius: 16px;
      `}
    }
  }
`
