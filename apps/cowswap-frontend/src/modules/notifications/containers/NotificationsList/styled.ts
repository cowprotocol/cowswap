import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const ListWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  height: auto;
  width: 100%;
  margin: 0;
  padding: 12px;

  > h4 {
    font-size: 14px;
    font-weight: var(${UI.FONT_WEIGHT_MEDIUM});
    margin: 0 0 16px;
    opacity: 0.7;
  }
`

export const NotificationsListWrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  gap: 12px;
  margin: 0 0 35px;
`

export const NotificationThumb = styled.div`
  width: var(--imageSize);
  height: var(--imageSize);
  border-radius: var(--imageSize);
  object-fit: cover;
  position: relative;
  background: var(${UI.COLOR_PAPER_DARKER});

  > img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    border-radius: inherit;
  }
`

export const NotificationCard = styled.a<{ isRead?: boolean; noImage?: boolean }>`
  --imageSize: 50px;
  display: grid;
  grid-template-columns: ${({ noImage }) => (noImage ? '1fr' : 'var(--imageSize) 1fr')};
  background: ${({ isRead }) => (isRead ? `var(${UI.COLOR_PAPER})` : `var(${UI.COLOR_PAPER_DARKER})`)};
  margin: 0;
  padding: 12px;
  border-radius: 21px;
  gap: 12px;
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
    flex-flow: column wrap;
    align-items: flex-start;
    gap: 10px;
    text-decoration: inherit;
    width: 100%;
  }

  > span > strong {
    font-size: 15px;
    font-weight: 600;
    color: inherit;
    text-decoration: inherit;
    word-break: break-word;
  }

  > span > p {
    font-size: 14px;
    line-height: 1.3;
    color: var(${UI.COLOR_TEXT_OPACITY_70});
    margin: 0;
    text-decoration: inherit;
    word-break: break-word;
  }
`

export const NoNotifications = styled.div`
  display: flex;
  flex-flow: column wrap;
  align-items: center;
  justify-content: space-between;
  margin-top: 30px;
  opacity: 0.7;

  > h4 {
    margin: 0;
  }
`
