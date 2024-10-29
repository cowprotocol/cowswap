import { TokenLogoWrapper } from '@cowprotocol/tokens'
import { UI, Media, ExternalLink } from '@cowprotocol/ui'

import { X } from 'react-feather'
import styled, { keyframes } from 'styled-components/macro'

const arrowUpAnimation = keyframes`
  0% {
    transform: translateY(100%);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100%);
    opacity: 0;
  }
`

export const BannerWrapper = styled.div`
  position: fixed;
  top: 76px;
  right: 10px;
  z-index: 3;
  width: 485px;
  height: auto;
  border-radius: 24px;
  background-color: var(${UI.COLOR_COWAMM_DARK_GREEN});
  color: var(${UI.COLOR_COWAMM_DARK_GREEN});
  padding: 20px;
  display: flex;
  flex-flow: column wrap;
  align-items: center;
  justify-content: center;
  gap: 20px;
  overflow: hidden;
  overflow: hidden;
  transition: transform 0.2s ease;

  ${Media.upToSmall()} {
    width: 100%;
    height: auto;
    left: 0;
    right: 0;
    margin: 0 auto;
    bottom: 57px;
    top: initial;
    border-radius: 24px 24px 0 0;
    box-shadow: 0 0 0 100vh rgb(0 0 0 / 40%);
    z-index: 10;
  }
`

export const CloseButton = styled(X)<{ color?: string; top?: number }>`
  position: absolute;
  top: ${({ top = 16 }) => top}px;
  right: 16px;
  cursor: pointer;
  color: ${({ color }) => color || `var(${UI.COLOR_COWAMM_LIGHT_GREEN})`};
  opacity: 0.6;
  transition: opacity 0.2s ease-in-out;

  &:hover {
    opacity: 1;
  }
`

export const Title = styled.h2<{ color?: string }>`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: bold;
  margin: 0 auto 0 0;
  color: ${({ color }) => color || `var(${UI.COLOR_COWAMM_LIGHT_GREEN})`};

  ${Media.upToSmall()} {
    font-size: 26px;
  }
`

export const Card = styled.div<{
  bgColor?: string
  color?: string
  height?: number | 'max-content'
  borderColor?: string
  borderWidth?: number
  padding?: string
  gap?: string
}>`
  --default-height: 150px;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: center;
  gap: ${({ gap }) => gap || '24px'};
  font-size: 30px;
  line-height: 1.2;
  font-weight: 500;
  margin: 0;
  width: 100%;
  max-width: 100%;
  height: ${({ height }) =>
    height === 'max-content' ? 'max-content' : height ? `${height}px` : 'var(--default-height)'};
  max-height: ${({ height }) =>
    height === 'max-content' ? 'max-content' : height ? `${height}px` : 'var(--default-height)'};
  border-radius: 16px;
  padding: ${({ padding }) => padding || '24px'};
  background: ${({ bgColor }) => bgColor || 'transparent'};
  color: ${({ color }) => color || 'inherit'};
  border: ${({ borderWidth, borderColor }) => borderWidth && borderColor && `${borderWidth}px solid ${borderColor}`};
  position: relative;

  ${Media.upToSmall()} {
    flex-flow: column wrap;
    height: auto;
    max-height: initial;
    gap: 8px;
  }

  > h3,
  > span {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0;
    width: max-content;
    height: 100%;
    max-height: 100%;
    color: inherit;

    ${Media.upToSmall()} {
      width: 100%;
      text-align: center;
    }

    > div {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  > h3 {
    font-weight: bold;
    letter-spacing: -2px;
  }

  > span {
    font-weight: inherit;
  }

  > span b {
    font-weight: 900;
    color: var(${UI.COLOR_COWAMM_LIGHTER_GREEN});
  }
`

export const PoolInfo = styled.div<{
  flow?: 'column' | 'row'
  align?: 'flex-start' | 'center'
  color?: string
  bgColor?: string
  tokenBorderColor?: string
}>`
  display: flex;
  align-items: ${({ align = 'flex-start' }) => align};
  flex-flow: ${({ flow = 'column' }) => flow};
  font-size: inherit;
  gap: 10px;

  ${Media.upToSmall()} {
    flex-flow: column wrap;
  }

  > i {
    font-style: normal;
    background: ${({ bgColor }) => bgColor || `var(${UI.COLOR_COWAMM_LIGHT_BLUE})`};
    color: ${({ color }) => color || `var(${UI.COLOR_COWAMM_DARK_BLUE})`};
    display: flex;
    flex-flow: row;
    gap: 6px;
    padding: 6px 12px 6px 6px;
    height: min-content;
    border-radius: 62px;
    width: min-content;
    box-shadow: var(${UI.BOX_SHADOW_2});
    align-items: center;

    ${Media.upToSmall()} {
      margin: 0 auto;
    }
  }

  > i > div {
    display: flex;
  }

  ${TokenLogoWrapper} {
    border: 2px solid ${({ tokenBorderColor }) => tokenBorderColor || `var(${UI.COLOR_COWAMM_LIGHT_BLUE})`};

    :last-child {
      margin-left: -18px;
    }
  }
`

export const CTAButton = styled.button<{
  bgColor?: string
  bgHoverColor?: string
  color?: string
  size?: number
  fontSize?: number
  fontSizeMobile?: number
}>`
  --size: ${({ size = 58 }) => size}px;
  --font-size: ${({ fontSize = 24 }) => fontSize}px;
  background: ${({ bgColor }) => bgColor || `var(${UI.COLOR_COWAMM_LIGHT_GREEN})`};
  color: ${({ color }) => color || `var(${UI.COLOR_COWAMM_DARK_GREEN})`};
  border: none;
  border-radius: var(--size);
  min-height: var(--size);
  padding: 12px 24px;
  font-size: var(--font-size);
  font-weight: bold;
  cursor: pointer;
  width: 100%;
  max-width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  position: relative;
  overflow: hidden;
  z-index: 1;

  ${Media.upToSmall()} {
    --font-size: ${({ fontSizeMobile = 21 }) => fontSizeMobile}px;
    min-height: initial;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${({ bgHoverColor }) => bgHoverColor || `var(${UI.COLOR_COWAMM_LIGHTER_GREEN})`};
    z-index: -1;
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 2s ease-out;
  }

  &:hover::before {
    transform: scaleX(1);
  }

  > * {
    z-index: 2;
  }
`

export const SecondaryLink = styled(ExternalLink)`
  color: var(${UI.COLOR_COWAMM_LIGHT_GREEN});
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`

export const DEMO_DROPDOWN = styled.select`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 999999999;
  padding: 5px;
  font-size: 14px;

  ${Media.upToSmall()} {
    bottom: initial;
    top: 0;
    width: 100%;
    right: 0;
    left: 0;
  }
`

export const StarIcon = styled.div<{
  color?: string
  size?: number
  top?: number | 'initial'
  left?: number | 'initial'
  right?: number | 'initial'
  bottom?: number | 'initial'
}>`
  width: ${({ size = 16 }) => size}px;
  height: ${({ size = 16 }) => size}px;
  position: absolute;
  top: ${({ top }) => (top === 'initial' ? 'initial' : top != null ? `${top}px` : 'initial')};
  left: ${({ left }) => (left === 'initial' ? 'initial' : left != null ? `${left}px` : 'initial')};
  right: ${({ right }) => (right === 'initial' ? 'initial' : right != null ? `${right}px` : 'initial')};
  bottom: ${({ bottom }) => (bottom === 'initial' ? 'initial' : bottom != null ? `${bottom}px` : 'initial')};
  color: ${({ color }) => color ?? `var(${UI.COLOR_COWAMM_LIGHT_BLUE})`};

  > svg > path {
    fill: ${({ color }) => color ?? 'currentColor'};
  }
`

export const LpEmblems = styled.div`
  display: flex;
  gap: 8px;
  width: 100%;
  justify-content: center;
  align-items: center;
`

export const LpEmblemItemsWrapper = styled.div<{ totalItems: number }>`
  display: ${({ totalItems }) => (totalItems > 2 ? 'grid' : 'flex')};
  gap: ${({ totalItems }) => (totalItems > 2 ? '0' : '8px')};
  width: 100%;
  justify-content: center;
  align-items: center;

  ${({ totalItems }) =>
    totalItems === 3 &&
    `
    grid-template: 1fr 1fr / 1fr 1fr;
    justify-items: center;

    > :first-child {
      grid-column: 1 / -1;
    }
  `}

  ${({ totalItems }) =>
    totalItems === 4 &&
    `
    grid-template: 1fr 1fr / 1fr 1fr;
  `}
`

export const LpEmblemItem = styled.div<{
  totalItems: number
  index: number
  isUSDC?: boolean
}>`
  --size: ${({ totalItems }) =>
    totalItems === 4 ? '50px' : totalItems === 3 ? '65px' : totalItems === 2 ? '80px' : '104px'};
  width: var(--size);
  height: var(--size);
  padding: ${({ totalItems, isUSDC }) =>
    isUSDC ? '9px' : totalItems === 4 ? '10px' : totalItems >= 2 ? '15px' : '20px'};
  border-radius: 50%;
  background: var(${UI.COLOR_COWAMM_DARK_GREEN});
  color: var(${UI.COLOR_COWAMM_LIGHT_GREEN});
  border: ${({ totalItems }) =>
    totalItems > 2 ? `2px solid var(${UI.COLOR_COWAMM_GREEN})` : `4px solid var(${UI.COLOR_COWAMM_GREEN})`};
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  > svg {
    width: 100%;
    height: 100%;
  }

  ${({ totalItems, index }) => {
    const styleMap: Record<number, Record<number, string>> = {
      2: {
        0: 'margin-right: -42px;',
      },
      3: {
        0: 'margin-bottom: -20px; z-index: 10;',
        1: 'margin-top: -20px;',
        2: 'margin-top: -20px;',
      },
      4: {
        0: 'margin: -5px -10px -5px 0; z-index: 10;',
        1: 'margin-bottom: -5px; z-index: 10;',
        2: 'margin: -5px -10px 0 0;',
        3: 'margin-top: -5px;',
      },
    }

    return styleMap[totalItems]?.[index] || ''
  }}
  ${TokenLogoWrapper} {
    width: 100%;
    height: 100%;
  }
`

export const CoWAMMEmblemItem = styled.div`
  --size: 104px;
  width: var(--size);
  height: var(--size);
  border-radius: var(--size);
  padding: 30px 30px 23px;
  background: var(${UI.COLOR_COWAMM_LIGHT_GREEN});
  color: var(${UI.COLOR_COWAMM_DARK_GREEN});
  border: 4px solid var(${UI.COLOR_COWAMM_GREEN});
  display: flex;
  align-items: center;
  justify-content: center;
`

export const EmblemArrow = styled.div`
  --size: 32px;
  width: var(--size);
  height: var(--size);
  min-width: var(--size);
  border-radius: var(--size);
  background: var(${UI.COLOR_COWAMM_DARK_GREEN});
  border: 3px solid var(${UI.COLOR_COWAMM_GREEN});
  margin: 0 -24px;
  padding: 6px;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(${UI.COLOR_COWAMM_LIGHT_GREEN});

  > svg > path {
    fill: var(${UI.COLOR_COWAMM_LIGHT_GREEN});
  }
`

export const ArrowBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  height: 100%;
  width: 100%;
  visibility: hidden;
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
`

export const Arrow = styled.span<{ delay: number }>`
  position: absolute;
  font-size: 28px;
  color: rgba(255, 255, 255, 0.3);
  animation: ${arrowUpAnimation} 1s linear infinite;
  animation-delay: ${({ delay }) => delay}s;
  left: ${() => Math.random() * 100}%;
  font-weight: 500;
`

export const TokenSelectorWrapper = styled.div`
  z-index: 3;
  width: 100%;
  padding: 20px;
  position: relative;
`

export const TokenSelectorWrapperInner = styled.div<{ bgColor?: string; color?: string }>`
  position: relative;
  width: 100%;
  height: auto;
  border-radius: 24px;
  background: ${({ bgColor }) => bgColor || `var(${UI.COLOR_COWAMM_LIGHT_GREEN})`};
  color: ${({ color }) => color || `var(${UI.COLOR_COWAMM_DARK_GREEN})`};
  padding: 14px;
  margin: 0 auto;
  display: flex;
  flex-flow: column wrap;
  align-items: center;
  justify-content: center;
  gap: 14px;
  overflow: hidden;
`
