import React, { useContext } from 'react'

import { RowFixed, TokenSymbol } from '@cowprotocol/ui'
import { MetaMaskLogo } from '@cowprotocol/wallet'
import { Currency } from '@uniswap/sdk-core'

import { CheckCircle } from 'react-feather'
import styled, { ThemeContext } from 'styled-components/macro'

export const ButtonCustom = styled.button`
  display: flex;
  flex: 1 1 auto;
  align-self: center;
  justify-content: center;
  align-items: center;
  border-radius: 16px;
  min-height: 52px;
  border: 1px solid ${({ theme }) => theme.border2};
  color: var(--cow-color-text1);
  background: transparent;
  outline: 0;
  padding: 8px 16px;
  margin: 16px 0 0;
  font-size: 14px;
  line-height: 1;
  font-weight: 500;
  transition: background 0.2s ease-in-out;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.border2};
  }

  > a {
    display: flex;
    align-items: center;
    color: inherit;
    text-decoration: none;
  }
`

const StyledIcon = styled.img`
  height: auto;
  width: 20px;
  max-height: 100%;
  margin: 0 10px 0 0;
`

const CheckCircleCustom = styled(CheckCircle)`
  height: auto;
  width: 20px;
  max-height: 100%;
  margin: 0 10px 0 0;
`

export type AddToMetamaskProps = {
  currency: Currency | undefined
  shortLabel?: boolean
  addToken: () => void
  success?: boolean
  className?: string
}

export function AddToMetamask(props: AddToMetamaskProps) {
  const { className, currency, shortLabel, addToken, success } = props
  const theme = useContext(ThemeContext)

  return (
    <ButtonCustom className={className} onClick={addToken}>
      {!success ? (
        <RowFixed>
          <StyledIcon src={MetaMaskLogo} />{' '}
          {shortLabel ? (
            'Add token'
          ) : (
            <>
              Add <TokenSymbol token={currency} /> to Metamask
            </>
          )}
        </RowFixed>
      ) : (
        <RowFixed>
          <CheckCircleCustom size={'16px'} stroke={theme.green1} />
          Added &nbsp;
          <TokenSymbol token={currency} />
        </RowFixed>
      )}
    </ButtonCustom>
  )
}
