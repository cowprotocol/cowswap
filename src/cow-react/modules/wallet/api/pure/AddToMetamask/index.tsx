import React, { useContext } from 'react'
import { Currency } from '@uniswap/sdk-core'
import styled, { ThemeContext } from 'styled-components/macro'

import { CheckCircle } from 'react-feather'
import { RowFixed } from 'components/Row'
import MetaMaskLogo from '@cow/modules/wallet/api/assets/metamask.png'
import { TokenSymbol } from '@cow/common/pure/TokenSymbol'

export const ButtonCustom = styled.button`
  display: flex;
  flex: 1 1 auto;
  align-self: center;
  justify-content: center;
  align-items: center;
  border-radius: 16px;
  min-height: 52px;
  border: 1px solid ${({ theme }) => theme.border2};
  color: ${({ theme }) => theme.text1};
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
}

export function AddToMetamask(props: AddToMetamaskProps) {
  const { currency, shortLabel, addToken, success } = props
  const theme = useContext(ThemeContext)

  return (
    <ButtonCustom onClick={addToken}>
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
          Added <TokenSymbol token={currency} />
        </RowFixed>
      )}
    </ButtonCustom>
  )
}
