import LOGO_COWAMM from '@cowprotocol/assets/images/logo-cowamm.svg'
import LOGO_COWDAO from '@cowprotocol/assets/images/logo-cowdao.svg'
import LOGO_COWEXPLORER from '@cowprotocol/assets/images/logo-cowexplorer.svg'
import LOGO_COWPROTOCOL from '@cowprotocol/assets/images/logo-cowprotocol.svg'
import LOGO_COWSWAP from '@cowprotocol/assets/images/logo-cowswap.svg'
import LOGO_ICON_COW from '@cowprotocol/assets/images/logo-icon-cow.svg'
import LOGO_ICON_MEVBLOCKER from '@cowprotocol/assets/images/logo-icon-mevblocker.svg'
import LOGO_MEVBLOCKER from '@cowprotocol/assets/images/logo-mevblocker.svg'
import { useTheme } from '@cowprotocol/common-hooks'

import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

import { Color } from '../../consts'
import { CowSwapTheme } from '../../types'

export enum ProductVariant {
  CowSwap = 'cowSwap',
  CowExplorer = 'cowExplorer',
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
        color: '#004293',
      },
      logoIconOnly: {
        src: LOGO_ICON_COW,
        alt: 'CoW Swap icon only light mode',
        color: '#004293',
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

  // CoW Explorer
  [ProductVariant.CowExplorer]: {
    light: {
      default: {
        src: LOGO_COWEXPLORER,
        alt: 'CoW Explorer light mode',
        color: Color.neutral0,
      },
      logoIconOnly: {
        src: LOGO_ICON_COW,
        alt: 'CoW Explorer icon only light mode',
        color: Color.neutral0,
      },
    },
    dark: {
      default: {
        src: LOGO_COWEXPLORER,
        alt: 'CoW Explorer dark mode',
        color: Color.neutral100,
      },
      logoIconOnly: {
        src: LOGO_ICON_COW,
        alt: 'CoW Explorer icon only dark mode',
        color: Color.neutral100,
      },
    },
  },

  // CoW DAO
  [ProductVariant.CowDao]: {
    light: {
      default: {
        src: LOGO_COWDAO,
        alt: 'CoW DAO light mode',
        color: Color.neutral0,
      },
      logoIconOnly: {
        src: LOGO_ICON_COW,
        alt: 'CoW DAO icon only light mode',
        color: Color.neutral0,
      },
    },
    dark: {
      default: {
        src: LOGO_COWDAO,
        alt: 'CoW DAO dark mode',
        color: Color.neutral100,
      },
      logoIconOnly: {
        src: LOGO_ICON_COW,
        alt: 'CoW DAO icon only dark mode',
        color: Color.neutral100,
      },
    },
  },

  // CoW Protocol
  [ProductVariant.CowProtocol]: {
    light: {
      default: {
        src: LOGO_COWPROTOCOL,
        alt: 'CoW Protocol light mode',
        color: Color.neutral0,
      },
      logoIconOnly: {
        src: LOGO_ICON_COW,
        alt: 'CoW Protocol icon only light mode',
        color: Color.neutral0,
      },
    },
    dark: {
      default: {
        src: LOGO_COWPROTOCOL,
        alt: 'CoW Protocol dark mode',
        color: Color.neutral100,
      },
      logoIconOnly: {
        src: LOGO_ICON_COW,
        alt: 'CoW Protocol icon only dark mode',
        color: Color.neutral100,
      },
    },
  },

  // MEV Blocker
  [ProductVariant.MevBlocker]: {
    light: {
      default: {
        src: LOGO_MEVBLOCKER,
        alt: 'MEV Blocker light mode',
        color: '#EC4612',
      },
      logoIconOnly: {
        src: LOGO_ICON_MEVBLOCKER,
        alt: 'MEV Blocker icon only light mode',
        color: '#EC4612',
      },
    },
    dark: {
      default: {
        src: LOGO_MEVBLOCKER,
        alt: 'MEV Blocker dark mode',
        color: '#EC4612',
      },
      logoIconOnly: {
        src: LOGO_ICON_MEVBLOCKER,
        alt: 'MEV Blocker icon only dark mode',
        color: '#EC4612',
      },
    },
  },

  // CoW AMM
  [ProductVariant.CowAmm]: {
    light: {
      default: {
        src: LOGO_COWAMM,
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
        src: LOGO_COWAMM,
        alt: 'CoW AMM dark mode',
        color: '#007CDB',
      },
      logoIconOnly: {
        src: LOGO_ICON_COW,
        alt: 'CoW AMM icon only dark mode',
        color: '#007CDB',
      },
    },
  },
}

export interface LogoProps {
  variant: ProductVariant
  theme?: CowSwapTheme
  logoIconOnly?: boolean
  overrideColor?: string // Optional override color
  overrideHoverColor?: string // Optional override hover color
  height?: number | string
  href?: string // Optional href for the logo
  external?: boolean // Indicates if the href is an external link
}

export const ProductLogoWrapper = styled.span<{ color?: string; hoverColor?: string; height?: number | string }>`
  --height: ${({ height }) => (typeof height === 'number' ? `${height}px` : height || '28px')};
  --color: ${({ color }) => color || 'inherit'};
  --hoverColor: ${({ hoverColor }) => hoverColor || 'inherit'};

  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 8px;
  color: var(--color);
  height: var(--height);
  transition: color 0.2s ease-in-out;

  > a,
  > a > svg,
  > svg {
    height: 100%;
    width: auto;
    color: inherit;
    fill: currentColor;
  }

  > a > svg path,
  > svg path {
    fill: currentColor;
  }

  &:hover {
    color: var(--hoverColor);
  }
`

export const ProductLogo = ({
  variant,
  theme: customThemeMode,
  logoIconOnly,
  overrideColor,
  overrideHoverColor,
  height,
  href,
  external = false,
}: LogoProps) => {
  const themeMode = useTheme()
  const logoForTheme = LOGOS[variant][customThemeMode || (themeMode.darkMode ? 'dark' : 'light')]
  const logoInfo = logoIconOnly && logoForTheme.logoIconOnly ? logoForTheme.logoIconOnly : logoForTheme.default
  const initialColor = overrideColor || logoInfo.color

  const logoElement = <SVG src={logoInfo.src} description={logoInfo.alt} />

  return (
    <ProductLogoWrapper color={initialColor} hoverColor={overrideHoverColor || 'inherit'} height={height}>
      {href ? (
        <a href={href} target={external ? '_blank' : '_self'} rel={external ? 'noopener noreferrer' : undefined}>
          {logoElement}
        </a>
      ) : (
        logoElement
      )}
    </ProductLogoWrapper>
  )
}
