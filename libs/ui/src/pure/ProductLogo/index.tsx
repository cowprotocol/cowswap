import React from 'react'
import styled from 'styled-components/macro'
import SVG from 'react-inlinesvg'

import LOGO_ICON_COW from '@cowprotocol/assets/images/logo-icon-cow.svg'
import LOGO_COWSWAP from '@cowprotocol/assets/images/logo-cowswap.svg'
import LOGO_COWPROTOCOL from '@cowprotocol/assets/images/logo-cowprotocol.svg'
import { CowSwapTheme } from '@cowprotocol/widget-lib'

interface LogoInfo {
  src: string
  alt: string
  color?: string // Optional color attribute for SVG
}

export type ThemedLogo = Record<CowSwapTheme, { default: LogoInfo; logoIconOnly?: LogoInfo }>

export type ProductVariant = 'cowSwap' | 'cowProtocol'

const LOGOS: Record<ProductVariant, ThemedLogo> = {
  // CoW Swap
  cowSwap: {
    light: {
      default: {
        src: LOGO_COWSWAP,
        alt: 'CoW Swap light mode',
        color: '#012F7A',
      },
      logoIconOnly: {
        src: LOGO_ICON_COW,
        alt: 'CoW Swap icon only light mode',
        color: '#012F7A',
      },
    },

    dark: {
      default: {
        src: LOGO_COWSWAP,
        alt: 'CoW Swap dark mode',
        color: '#65D9FF',
      },
      logoIconOnly: {
        src: LOGO_ICON_COW,
        alt: 'CoW Swap icon only dark mode',
        color: '#65D9FF',
      },
    },
  },

  // CoW Protocol
  cowProtocol: {
    light: {
      default: {
        src: LOGO_COWPROTOCOL,
        alt: 'CoW Protocol light mode',
        color: '#000000',
      },
      logoIconOnly: {
        src: LOGO_ICON_COW,
        alt: 'CoW Protocol icon only light mode',
        color: '#000000',
      },
    },
    dark: {
      default: {
        src: LOGO_COWPROTOCOL,
        alt: 'CoW Protocol dark mode',
        color: '#FFFFFF',
      },
      logoIconOnly: {
        src: LOGO_ICON_COW,
        alt: 'CoW Protocol icon only dark mode',
        color: '#FFFFFF',
      },
    },
  },
}

export interface LogoProps {
  variant: ProductVariant
  theme: CowSwapTheme
  logoIconOnly: boolean
}

const Wrapper = styled.span<{ color?: string }>`
  --maxHeight: 24px;
  --color: ${({ color }) => color || 'black'};

  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 8px;
  color: var(--color);

  > svg {
    height: 100%;
    min-height: var(--maxHeight);
    width: auto;
    color: inherit;
    fill: currentColor;
  }

  > svg path {
    fill: currentColor;
  }
`

export const ProductLogo: React.FC<LogoProps> = ({ variant, theme: themeMode, logoIconOnly }) => {
  const logoForTheme = LOGOS[variant][themeMode]
  const logoInfo = logoIconOnly && logoForTheme.logoIconOnly ? logoForTheme.logoIconOnly : logoForTheme.default

  return (
    <Wrapper color={logoInfo.color}>
      <SVG src={logoInfo.src} description={logoInfo.alt} />
    </Wrapper>
  )
}
