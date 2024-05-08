import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const ListWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  height: auto;
  width: 100%;
  margin: 0;
  padding: 16px;

  > h4 {
    font-size: 14px;
    font-weight: var(${UI.FONT_WEIGHT_MEDIUM});
    margin: 0 0 16px;
    opacity: 0.7;
  }

  > div {
    display: flex;
    flex-flow: column wrap;
    gap: 16px;
    margin: 0 0 35px;
  }
`

export const NotificationThumb = styled.div`
  width: var(--imageSize);
  height: var(--imageSize);
  border-radius: var(--imageSize);
  object-fit: cover;
  position: relative;

  > img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    border-radius: inherit;
  }
`

export const NotificationCard = styled.a<{ isRead?: boolean }>`
  --imageSize: 42px;
  display: grid;
  grid-template-columns:
    var(--imageSize)
    1fr;
  background: ${({ isRead }) => (isRead ? `var(${UI.COLOR_PAPER})` : `var(${UI.COLOR_PAPER_DARKER})`)};
  margin: 0;
  padding: 16px;
  border-radius: 21px;
  gap: 16px;
  color: var(${UI.COLOR_TEXT});
  position: relative;
  border: 1px solid ${({ isRead }) => (isRead ? `var(${UI.COLOR_TEXT_OPACITY_10})` : 'transparent')};
  cursor: pointer;
  transition: background var(${UI.ANIMATION_DURATION}) ease-in-out;
  text-decoration: none;

  &:hover {
    background: var(${UI.COLOR_PAPER_DARKEST});
  }

  ${NotificationThumb} {
    &::after {
      content: '';
      --size: 8px;
      box-sizing: content-box;
      position: absolute;
      top: -3px;
      right: 0;
      width: var(--size);
      height: var(--size);
      border-radius: var(--size);
      transition: background var(${UI.ANIMATION_DURATION}) ease-in-out;
      border: ${({ isRead }) => (isRead ? '2px solid transparent' : `2px solid var(${UI.COLOR_PAPER})`)};
      background: ${({ isRead }) => (isRead ? 'transparent' : `var(${UI.COLOR_DANGER})`)};
    }
  }

  > span {
    display: flex;
    flex-flow: row wrap;
    align-items: center;
    gap: 10px;
    text-decoration: inherit;
  }

  > span > strong {
    font-size: 15px;
    font-weight: 600;
    color: inherit;
    text-decoration: inherit;
  }

  > span > p {
    font-size: 14px;
    line-height: 1.3;
    color: var(${UI.COLOR_TEXT_OPACITY_70});
    margin: 0;
    text-decoration: inherit;
  }
`
