import React from 'react'
import styled from 'styled-components/macro'
import SVG from 'react-inlinesvg'

import LOGO_COWSWAP from '@cowprotocol/assets/images/logo-cowswap.svg'
import LOGO_COWPROTOCOL from '@cowprotocol/assets/images/logo-cowprotocol.svg'

interface LogoInfo {
  src: string
  alt: string
  color?: string // Optional color attribute for SVG
}

export const LOGO_MAP: { [key: string]: LogoInfo } = {
  cowSwapLightMode: {
    src: LOGO_COWSWAP,
    alt: 'CoW Swap light mode',
    color: '#012F7A',
  },
  cowSwapDarkMode: {
    src: LOGO_COWSWAP,
    alt: 'CoW Swap dark mode',
    color: '#65D9FF',
  },
  cowProtocolLightMode: {
    src: LOGO_COWPROTOCOL,
    alt: 'CoW Protocol light mode',
    color: '#000000',
  },
  cowProtocolDarkMode: {
    src: LOGO_COWPROTOCOL,
    alt: 'CoW Protocol dark mode',
    color: '#FFFFFF',
  },
  // Additional variants can be added here
}

interface LogoProps {
  product: keyof typeof LOGO_MAP // 'cowSwap' or 'cowProtocol'
  themeMode: 'light' | 'dark' // Add a themeMode prop
}

const LogoWrapper = styled.span<{ color?: string }>`
  --maxHeight: 24px;
  --color: ${({ color }) => color || 'black'};

  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 8px;
  color: var(--color); // This sets the text color, not the SVG fill color directly.

  > svg {
    height: 100%;
    min-height: var(--maxHeight);
    width: auto;
    color: inherit;
    fill: currentColor; // Ensure SVGs use the current color inherited from the parent.
  }

  > svg path {
    fill: currentColor; // Ensure SVGs use the current color inherited from the parent.
  }
`

export const Logo: React.FC<LogoProps> = ({ product, themeMode }) => {
  const variant = `${product}${themeMode.charAt(0).toUpperCase()}${themeMode.slice(1)}Mode` // Constructs the correct variant key
  const logoInfo = LOGO_MAP[variant as keyof typeof LOGO_MAP]

  return (
    <LogoWrapper color={logoInfo.color}>
      <SVG src={logoInfo.src} description={logoInfo.alt} />
    </LogoWrapper>
  )
}
