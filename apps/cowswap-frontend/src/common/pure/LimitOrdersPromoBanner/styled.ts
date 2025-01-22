import { UI, Media } from '@cowprotocol/ui'

import { X } from 'react-feather'
import styled from 'styled-components/macro'

export const BannerWrapper = styled.div`
  position: relative;
  width: 100%;
  padding: 16px;
  border-radius: 16px;
  background: var(${UI.COLOR_PAPER_DARKER});
  margin: 10px 0;
  color: var(${UI.COLOR_TEXT});
`

export const CloseButton = styled(X)`
  position: absolute;
  top: 16px;
  right: 16px;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s ease-in-out;

  &:hover {
    opacity: 1;
  }
`

export const TitleSection = styled.div`
  text-align: center;
  color: inherit;
  margin: 18px auto;
  width: 90%;

  > h3 {
    font-size: 26px;
    font-weight: 600;
    margin: 0 0 24px;
    color: inherit;

    ${Media.upToSmall()} {
      font-size: 20px;
    }
  }

  > strong {
    font-weight: 400;
    font-size: 16px;
    margin: 0;
    opacity: 0.7;
  }
`

export const List = styled.ul`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: max-content;
  list-style: none;
  margin: 0 0 28px;
  padding: 0;
  font-size: 14px;
  gap: 10px 12px;

  ${Media.upToSmall()} {
    grid-template-columns: 1fr;
  }

  > li {
    background: transparent;
    display: grid;
    grid-template-columns: 20px auto;
    grid-template-rows: max-content;
    align-items: flex-start;
    gap: 6px;
    margin: 0;
    padding: 10px;
    border-radius: 10px;
    line-height: 1.5;
  }

  > li > span {
    --size: 18px;
    width: var(--size);
    height: var(--size);
    display: inline-block;
    width: auto;
  }

  > li > span > svg {
    width: var(--size);
    height: var(--size);
    display: block;
  }

  > li > span > svg > path {
    fill: var(${UI.COLOR_SUCCESS});
  }
`

export const ControlSection = styled.div`
  text-align: center;
  color: inherit;
`

export const CTAButton = styled.button`
  width: 100%;
  padding: 16px;
  border-radius: 12px;
  border: none;
  background: var(${UI.COLOR_PRIMARY});
  color: var(${UI.COLOR_BUTTON_TEXT});
  font-size: 21px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease-in-out;

  &:hover {
    background: var(${UI.COLOR_PRIMARY_LIGHTER});
  }
`

export const DismissLink = styled.button`
  background: none;
  border: none;
  color: inherit;
  font-size: 16px;
  text-decoration: underline;
  cursor: pointer;
  padding: 0;
  margin: 24px auto 12px;
  opacity: 0.8;
  transition: opacity 0.2s ease-in-out;
  display: block;

  &:hover {
    opacity: 1;
  }
`
