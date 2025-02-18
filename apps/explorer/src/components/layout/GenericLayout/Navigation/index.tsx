import { Media } from '@cowprotocol/ui'
import { Color } from '@cowprotocol/ui'

import * as CSS from 'csstype'
import styled from 'styled-components/macro'

export const Navigation = styled.ol<Partial<CSS.Properties & { isActive: boolean }>>`
  list-style: none;
  display: flex;
  padding: 0;
  flex-grow: 1;
  justify-content: flex-end;

  ${Media.upToMedium()} {
    flex-direction: column;
    flex-wrap: nowrap;
    justify-content: flex-start;
    margin: 0 0 0 auto;
    position: absolute;
    width: 100%;
    top: 100%;
    max-width: 260px;
    border: 1px solid ${Color.explorer_border};
    border-radius: 0.4rem;
    transition: right 0.07s ease-in-out;
    left: auto;
    right: 15px;
    background-color: ${Color.explorer_bg};
    opacity: ${({ isActive }): string => (isActive ? '1' : '0')};
    z-index: ${({ isActive }): string => (isActive ? '99' : '-1')};
  }

  ${Media.upToExtraSmall()} {
    border-right: 1px solid ${Color.explorer_border};
    max-width: 100%;
    top: 0;
    bottom: 0;
    position: fixed;
    transition: left 0.15s ease-in-out;
    padding-top: 20%;
    right: auto;
    left: ${({ isActive }): string => (isActive ? '0' : '-100%')};
  }

  > li {
    font-size: var(--font-size-larger);
    color: ${Color.explorer_textSecondary2};
    background-color: transparent;
    transition:
      background-color 0.2s ease-in-out,
      color 0.2s ease-in-out;
    border-radius: 0.75rem;
    position: relative;
    flex-flow: row;
    display: flex;
    padding: 0 15px;
    &:not(:last-child):after {
      content: '';
      display: block;
      position: absolute;
      right: 0;
      top: 0;
      bottom: 0;
      height: 100%;
      width: 1px;
      background-color: ${Color.explorer_textSecondary2};
      opacity: 0.6;
    }

    ${Media.upToMedium()} {
      padding: 10px 15px;
      text-align: center;
      &:not(:last-child):after {
        right: auto;
        left: 50%;
        top: auto;
        bottom: 0;
        width: calc(100% - 30px);
        transform: translateX(-50%);
        height: 1px;
        background-color: ${Color.explorer_textSecondary2};
        opacity: 0.2;
      }
    }
  }

  > li.active,
  > li:hover {
    background-color: transparent;
    color: ${Color.explorer_textPrimary};
    font-weight: var(--font-weight-medium);
  }

  > li > div {
    border-radius: inherit;
  }

  > li > div > a,
  > li > a {
    font-weight: var(--font-weight-bold);
    font-size: inherit;
    color: inherit;
    text-align: center;
    text-decoration: none;
    padding: 1rem;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    position: relative;
    margin: 0;
    flex-grow: 1;
    border-radius: 0.6rem;
  }

  > li > div > a > i,
  > li > a {
    transition:
      width 0.3s ease-in-out,
      background 0.3s ease-in-out;
  }
`
