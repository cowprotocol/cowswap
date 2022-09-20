import styled from 'styled-components/macro'
import { MobilePopupInner } from './PopupsMod'
import { transparentize } from 'polished'

export const MobilePopupWrapper = styled.div<{ show: boolean }>`
  position: relative;
  width: 100%;
  height: 100%;
  margin: 0;
  background: ${({ theme }) => transparentize(0.05, theme.bg4)};
  display: none;

  ${({ theme, show }) => theme.mediaWidth.upToSmall`
    position: fixed;
    top: 0;
    z-index: 90;
    height: 100%;
    display: ${show ? 'flex' : 'none'};
  `};

  ${MobilePopupInner} {
    flex-flow: row wrap;
    padding: 20px;
    width: 100%;
    height: 100%;
    align-content: flex-start;
    overflow-x: hidden;
    overflow-y: auto;
  }
`

export * from './PopupsMod'
export { default } from './PopupsMod'
