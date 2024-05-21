
import LOGO_COWDAO from '@cowprotocol/assets/images/logo-cowdao.svg'
import LOGO_COWPROTOCOL from '@cowprotocol/assets/images/logo-cowprotocol.svg'
import LOGO_COWSWAP from '@cowprotocol/assets/images/logo-cowswap.svg'
import LOGO_ICON_COW from '@cowprotocol/assets/images/logo-icon-cow.svg'
import LOGO_MEVBLOCKER from '@cowprotocol/assets/images/logo-mevblocker.svg'

import SVG from 'react-inlinesvg'
import styled from 'styled-components'

import { CowSwapTheme } from '../../types'


export enum ProductVariant {
  CowSwap = 'cowSwap',
  CowProtocol = 'cowProtocol',
  MevBlocker = 'mevBlocker',
  CowAmm = 'cowAmm',
  CowDao = 'cowDao',
}

interface LogoInfo {
  src: string
  alt: string
  color?: string // Optional color attribute for SVG
}

export type ThemedLogo = Record<CowSwapTheme, { default: LogoInfo; logoIconOnly?: LogoInfo }>

const LOGOS: Record<ProductVariant, ThemedLogo> = {
  // CoW Swap
  [ProductVariant.CowSwap]: {
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

  // CoW DAO
  [ProductVariant.CowDao]: {
    light: {
      default: {
        src: LOGO_COWDAO,
        alt: 'CoW DAO light mode',
        color: '#000000',
      },
      logoIconOnly: {
        src: LOGO_ICON_COW,
        alt: 'CoW DAO icon only light mode',
        color: '#000000',
      },
    },
    dark: {
      default: {
        src: LOGO_COWDAO,
        alt: 'CoW DAO dark mode',
        color: '#FFFFFF',
      },
      logoIconOnly: {
        src: LOGO_ICON_COW,
        alt: 'CoW DAO icon only dark mode',
        color: '#FFFFFF',
      },
    },
  },

  // CoW Protocol
  [ProductVariant.CowProtocol]: {
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

  // MEV Blocker
  [ProductVariant.MevBlocker]: {
    light: {
      default: {
        src: LOGO_MEVBLOCKER,
        alt: 'MEV Blocker light mode',
        color: '#012F7A',
      },
      logoIconOnly: {
        src: LOGO_ICON_COW,
        alt: 'MEV Blocker icon only light mode',
        color: '#012F7A',
      },
    },
    dark: {
      default: {
        src: LOGO_MEVBLOCKER,
        alt: 'MEV Blocker dark mode',
        color: '#65D9FF',
      },
      logoIconOnly: {
        src: LOGO_ICON_COW,
        alt: 'MEV Blocker icon only dark mode',
        color: '#65D9FF',
      },
    },
  },

  // CoW AMM
  [ProductVariant.CowAmm]: {
    light: {
      default: {
        src: LOGO_COWSWAP,
        alt: 'CoW AMM light mode',
        color: '#012F7A',
      },
      logoIconOnly: {
        src: LOGO_ICON_COW,
        alt: 'CoW AMM icon only light mode',
        color: '#012F7A',
      },
    },
    dark: {
      default: {
        src: LOGO_COWSWAP,
        alt: 'CoW AMM dark mode',
        color: '#65D9FF',
      },
      logoIconOnly: {
        src: LOGO_ICON_COW,
        alt: 'CoW AMM icon only dark mode',
        color: '#65D9FF',
      },
    },
  },
}

export interface LogoProps {
  variant: ProductVariant
  theme: CowSwapTheme
  logoIconOnly?: boolean
  overrideColor?: string // Optional override color
  overrideHoverColor?: string // Optional override hover color
  height?: number
}

const Wrapper = styled.span<{ color?: string; hoverColor?: string; height?: number }>`
  --height: ${({ height }) => height || 24}px;
  --color: ${({ color }) => color || 'black'};
  --hoverColor: ${({ hoverColor }) => hoverColor || 'inherit'};

  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 8px;
  color: var(--color);
  height: var(--height);
  transition: color 0.2s ease-in-out;

  > svg {
    height: 100%;
    width: auto;
    color: inherit;
    fill: currentColor;
  }

  > svg path {
    fill: currentColor;
  }

  &:hover {
    color: var(--hoverColor);
  }
`

export const ProductLogo = ({
  variant,
  theme: themeMode,
  logoIconOnly,
  overrideColor,
  overrideHoverColor,
  height,
}: LogoProps) => {
  const logoForTheme = LOGOS[variant][themeMode]
  const logoInfo = logoIconOnly && logoForTheme.logoIconOnly ? logoForTheme.logoIconOnly : logoForTheme.default
  const initialColor = overrideColor || logoInfo.color

  return (
    <Wrapper color={initialColor} hoverColor={overrideHoverColor || logoInfo.color} height={height}>
      <SVG src={logoInfo.src} description={logoInfo.alt} />
    </Wrapper>
  )
}
