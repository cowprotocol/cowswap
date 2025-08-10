import { UI, Font, Media } from '@cowprotocol/ui'

import { MenuButton as ReachMenuButton, MenuItems as ReachMenuItems } from '@reach/menu-button'
import styled from 'styled-components/macro'

import { AccountCardHoverBehavior } from './types'

export const LeftTop = styled.div`
  display: flex;
  flex-flow: column wrap;
  gap: 10px;
`

export const ValueAmount = styled.span`
  font-size: 36px;
  font-weight: 500;
  margin: 0;

  ${Media.upToSmall()} {
    font-size: 18px;
  }

  > span {
    font-size: inherit;
    color: inherit;
    opacity: 1;
  }
`

export const ValueLabel = styled.span`
  font-size: 13px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
`

export const RightTop = styled.div`
  text-align: right;
  position: relative;
`

export const LeftBottom = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
`

export const AddressDisplay = styled.span`
  font-size: 18px;
  font-weight: 600;
  font-family: ${Font.familyMono};
  font-feature-settings: 'ss10' on;

  ${Media.upToSmall()} {
    font-size: 14px;
  }
`
export const AddressLinkWrapper = styled.span`
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 12px;

  &::after {
    content: '↗';
    font-size: 14px;
    opacity: 0;
    margin: 0;
    transition: opacity 0.2s ease;
    color: var(${UI.COLOR_TEXT_OPACITY_70});
  }

  &:hover::after {
    opacity: 1;
  }
`

export const MenuButton = styled(ReachMenuButton)`
  background: none;
  border: none;
  outline: none;
  padding: 0;
  margin: 0;
  color: var(${UI.COLOR_TEXT_OPACITY_50});
  cursor: pointer;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: var(${UI.COLOR_TEXT});
    background: var(${UI.COLOR_TEXT_OPACITY_10});
    border-radius: 10px;
  }
`

export const MenuItems = styled(ReachMenuItems)`
  background: var(${UI.COLOR_PAPER});
  box-shadow: var(${UI.BOX_SHADOW});
  right: 0;
  top: 20px;
  border-radius: 10px;
  position: absolute;
  min-width: 180px;
  text-align: left;
`

export const AccountCardWrapper = styled.div<{
  width?: number | string
  height?: number | string
  borderRadius?: number
  padding?: number
  hoverBehavior?: AccountCardHoverBehavior
  enableScale?: boolean
  margin?: string
  minHeight?: number | string
}>`
  --cowprotocol-mask-start: 0%;
  --cowprotocol-mask-end: 40%;

  width: ${({ width }) => (typeof width === 'number' ? `${width}px` : width || '100%')};
  height: ${({ height }) => (typeof height === 'number' ? `${height}px` : height || 'auto')};
  min-height: ${({ minHeight, height }) =>
    minHeight
      ? typeof minHeight === 'number'
        ? `${minHeight}px`
        : minHeight
      : height
        ? typeof height === 'number'
          ? `${height}px`
          : height
        : '200px'};
  border-radius: ${({ borderRadius }) => (borderRadius ? `${borderRadius}px` : '24px')};
  padding: ${({ padding }) => (padding ? `${padding}px` : '24px')};
  margin: ${({ margin }) => margin || '0 auto'};
  background: var(${UI.COLOR_PAPER_GRADIENT});
  border: 1px solid var(${UI.COLOR_TEXT_OPACITY_10});
  box-shadow: var(${UI.BOX_SHADOW_3});
  backdrop-filter: blur(50px);
  position: relative;
  overflow: hidden;
  display: ${({ width, height }) => (width && height ? 'flex' : 'grid')};
  ${({ width, height }) =>
    width && height
      ? `flex-flow: row wrap;
         justify-content: space-between;
         align-items: center;
         gap: 8px;`
      : `grid-template-columns: 1fr auto;
         grid-template-rows: 1fr auto;`}
  ${({ hoverBehavior }) =>
    hoverBehavior !== AccountCardHoverBehavior.NONE
      ? `
    transition:
      transform 0.2s ease-out,
      box-shadow 0.2s ease-out;
  `
      : ''}
  transform: translateY(0) scale(1);

  @property --cowprotocol-mask-start {
    syntax: '<percentage>';
    inherits: true;
    initial-value: 0%;
  }

  @property --cowprotocol-mask-end {
    syntax: '<percentage>';
    inherits: true;
    initial-value: 40%;
  }

  ${Media.upToSmall()} {
    padding: 14px;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      45deg,
      transparent 0%,
      transparent 40%,
      rgba(255, 255, 255, 0.15) 50%,
      transparent 60%,
      transparent 100%
    );
    transition: left 0.6s ease-out;
    z-index: 1;
    pointer-events: none;
  }

  ${({ hoverBehavior, enableScale }) => {
    if (hoverBehavior === AccountCardHoverBehavior.NONE) return ''
    
    const hoverSelector = hoverBehavior === AccountCardHoverBehavior.PARENT 
      ? '[data-hover-trigger]:hover > &' 
      : '&:hover'
    
    return `
      ${hoverSelector} {
        --cowprotocol-mask-start: 0%;
        --cowprotocol-mask-end: 0%;
        box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
        ${enableScale ? 'transform: translateY(-1px) scale(1.03);' : ''}
      }
      ${hoverSelector}::before {
        left: 100%;
      }
    `
  }}
`

export const IdentityIconStyled = styled.div`
  --size: 70px;
  width: var(--size);
  height: var(--size);
  border-radius: var(--size);
  background: var(${UI.COLOR_TEXT_OPACITY_10});
  display: flex;
  align-items: center;
  justify-content: center;

  > svg,
  > img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    padding: 25%;
    fill: var(${UI.COLOR_TEXT_OPACITY_70});
  }
`

export const SkeletonLine = styled.div`
  --skeletonHeight: 6px;
  width: 65px;
  height: var(--skeletonHeight);
  background: var(${UI.COLOR_TEXT_OPACITY_10});
  margin: 12px 0;
`

export const WatermarkIcon = styled.div`
  --stroke-width: 0.1px;
  --stroke-color: var(${UI.COLOR_TEXT_OPACITY_10});
  position: absolute;
  right: -35%;
  top: -1%;
  width: 90%;
  height: auto;
  pointer-events: none;
  z-index: -1;

  mask: linear-gradient(to bottom, black 0%, black 30%, transparent 100%);

  > span {
    display: block;
    width: 100%;
    height: 100%;
  }

  > span > svg {
    width: 100%;
    height: 100%;
    fill: none;
  }

  > span > svg > path {
    fill: none;
    stroke: var(--stroke-color);
    stroke-width: var(--stroke-width);
  }
`
