import React from 'react'

import { Currency } from '@uniswap/sdk-core'

import styled from 'styled-components/macro'

import Logo from 'legacy/components/Loader/Logo'

import useCurrencyLogoURIs from './hooks/useCurrencyLogoURIs'

export const StyledLogo = styled(Logo)<{ size: string; $native: boolean }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  min-width: ${({ size }) => size}; // MOD
  min-height: ${({ size }) => size}; // MOD
  border-radius: ${({ size }) => size};
  background-color: ${({ theme }) => theme.white}; // MOD
  color: ${({ theme }) => theme.black}!important; // MOD
`

export function CurrencyLogo({
  currency,
  size = '24px',
  style,
  ...rest
}: {
  currency?: Currency | null
  size?: string
  style?: React.CSSProperties
}) {
  const logoURIs = useCurrencyLogoURIs(currency)

  return (
    <StyledLogo
      size={size}
      $native={currency?.isNative ?? false}
      srcs={logoURIs}
      alt={`${currency?.symbol ?? 'token'} logo`}
      style={style}
      {...rest}
    />
  )
}
