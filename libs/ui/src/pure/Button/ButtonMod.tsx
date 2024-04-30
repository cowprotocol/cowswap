import { darken } from 'color2k'
import { ChevronDown } from 'react-feather'
import { Button as RebassButton, ButtonProps as ButtonPropsOriginal } from 'rebass/styled-components'
import styled from 'styled-components/macro'

import { ButtonSize } from '../../enum'
import { RowBetween } from '../Row'

type ButtonProps = Omit<ButtonPropsOriginal, 'css'>

export const BaseButton = styled(RebassButton)<
  {
    padding?: string
    width?: string
    $borderRadius?: string
    altDisabledStyle?: boolean
    buttonSize?: ButtonSize // mod
  } & ButtonProps
>`
  padding: ${({ padding }) => padding ?? '16px'};
  width: ${({ width }) => width ?? '100%'};
  ${({ theme, buttonSize = ButtonSize.DEFAULT }) => theme.buttonSizes[buttonSize]};
  font-weight: 500;
  text-align: center;
  border-radius: ${({ $borderRadius }) => $borderRadius ?? '20px'};
  outline: none;
  border: 1px solid transparent;
  color: white;
  text-decoration: none;
  display: flex;
  justify-content: center;
  flex-wrap: nowrap;
  align-items: center;
  cursor: pointer;
  position: relative;
  z-index: 1;
  &:disabled {
    opacity: 50%;
    cursor: auto;
    pointer-events: none;
  }

  will-change: transform;
  transition: transform 450ms ease;
  transform: perspective(1px) translateZ(0);

  > * {
    user-select: none;
  }

  > a {
    text-decoration: none;
  }
`

export const ButtonPrimary = styled(BaseButton)`
  font-size: 16px;
  &:focus,
  &:hover,
  &:active {
    color: ${({ theme }) => theme.text1};
  }
  &:disabled {
    background-color: ${({ theme, altDisabledStyle, disabled }) =>
      altDisabledStyle ? (disabled ? theme.primary1 : theme.bg2) : theme.bg3};
    color: ${({ theme, altDisabledStyle }) => (altDisabledStyle ? 'white' : theme.text3)};
    cursor: auto;
    box-shadow: none;
    border: 1px solid transparent;
    outline: none;
    opacity: ${({ altDisabledStyle }) => (altDisabledStyle ? '0.7' : '1')};
  }
`

export const ButtonLight = styled(BaseButton)`
  background-color: ${({ theme }) => theme.primary5};
  color: ${({ theme }) => theme.text1};
  font-size: 16px;
  // font-weight: 500;
  &:focus {
    box-shadow: 0 0 0 1pt ${({ theme, disabled }) => !disabled && darken(theme.primary5, 0.03)};
    background-color: ${({ theme, disabled }) => !disabled && darken(theme.primary5, 0.03)};
  }
  &:hover {
    background-color: ${({ theme, disabled }) => !disabled && darken(theme.primary5, 0.03)};
  }
  &:active {
    box-shadow: 0 0 0 1pt ${({ theme, disabled }) => !disabled && darken(theme.primary5, 0.05)};
    background-color: ${({ theme, disabled }) => !disabled && darken(theme.primary5, 0.05)};
  }
  :disabled {
    opacity: 0.4;
    :hover {
      cursor: auto;
      background-color: ${({ theme }) => theme.primary5};
      box-shadow: none;
      border: 1px solid transparent;
      outline: none;
    }
  }
`

export const ButtonGray = styled(BaseButton)`
  background-color: ${({ theme }) => theme.bg3};
  color: var(--cow-color-text2);
  font-size: 16px;
  // font-weight: 500;

  &:focus {
    box-shadow: 0 0 0 1pt ${({ theme, disabled }) => !disabled && darken(theme.bg2, 0.05)};
    background-color: ${({ theme, disabled }) => !disabled && darken(theme.bg2, 0.05)};
  }
  &:hover {
    background-color: ${({ theme, disabled }) => !disabled && darken(theme.bg2, 0.05)};
  }
  &:active {
    box-shadow: 0 0 0 1pt ${({ theme, disabled }) => !disabled && darken(theme.bg2, 0.1)};
    background-color: ${({ theme, disabled }) => !disabled && darken(theme.bg2, 0.1)};
  }
`

export const ButtonSecondary = styled(BaseButton)`
  border: 1px solid ${({ theme }) => theme.primary4};
  color: ${({ theme }) => theme.primary1};
  background-color: transparent;
  font-size: 16px;
  border-radius: 12px;
  padding: ${({ padding }) => (padding ? padding : '10px')};

  &:focus {
    box-shadow: 0 0 0 1pt ${({ theme }) => theme.primary4};
    border: 1px solid ${({ theme }) => theme.primary3};
  }
  &:hover {
    border: 1px solid ${({ theme }) => theme.primary3};
  }
  &:active {
    box-shadow: 0 0 0 1pt ${({ theme }) => theme.primary4};
    border: 1px solid ${({ theme }) => theme.primary3};
  }
  &:disabled {
    opacity: 50%;
    cursor: auto;
  }
  a:hover {
    text-decoration: none;
  }
`

export const ButtonOutlined = styled(BaseButton)`
  border: 1px solid ${({ theme }) => theme.primary};
  background-color: transparent;
  color: var(--cow-color-text1);
  &:focus {
    box-shadow: 0 0 0 1px ${({ theme }) => theme.bg4};
  }
  &:hover {
    box-shadow: 0 0 0 1px ${({ theme }) => theme.bg4};
  }
  &:active {
    box-shadow: 0 0 0 1px ${({ theme }) => theme.bg4};
  }
  &:disabled {
    opacity: 50%;
    cursor: auto;
  }
`

export const ButtonYellow = styled(BaseButton)`
  background-color: ${({ theme }) => theme.yellow3};
  color: white;
  &:focus {
    box-shadow: 0 0 0 1pt ${({ theme }) => darken(theme.yellow3, 0.05)};
    background-color: ${({ theme }) => darken(theme.yellow3, 0.05)};
  }
  &:hover {
    background-color: ${({ theme }) => darken(theme.yellow3, 0.05)};
  }
  &:active {
    box-shadow: 0 0 0 1pt ${({ theme }) => darken(theme.yellow3, 0.1)};
    background-color: ${({ theme }) => darken(theme.yellow3, 0.1)};
  }
  &:disabled {
    background-color: ${({ theme }) => theme.yellow3};
    opacity: 50%;
    cursor: auto;
  }
`

export const ButtonEmpty = styled(BaseButton)`
  background-color: transparent;
  color: ${({ theme }) => theme.primary1};
  display: flex;
  justify-content: center;
  align-items: center;

  &:focus {
    text-decoration: underline;
  }
  &:hover {
    text-decoration: none;
  }
  &:active {
    text-decoration: none;
  }
  &:disabled {
    opacity: 50%;
    cursor: auto;
  }
`

export const ButtonText = styled(BaseButton)`
  padding: 0;
  width: fit-content;
  background: none;
  text-decoration: none;
  &:focus {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    text-decoration: underline;
  }
  &:hover {
    // text-decoration: underline;
    opacity: 0.9;
  }
  &:active {
    text-decoration: underline;
  }
  &:disabled {
    opacity: 50%;
    cursor: auto;
  }
`

export const ButtonConfirmedStyle = styled(BaseButton)`
  background-color: ${({ theme }) => theme.bg3};
  color: var(--cow-color-text1);
  /* border: 1px solid ${({ theme }) => theme.green1}; */

  &:disabled {
    /* opacity: 50%; */
    background-color: ${({ theme }) => theme.primary};
    color: var(--cow-color-text2);
    cursor: auto;
  }
`

export const ButtonErrorStyle = styled(BaseButton)`
  background-color: ${({ theme }) => theme.danger};
  border: 1px solid ${({ theme }) => theme.danger};

  &:focus {
    box-shadow: 0 0 0 1pt ${({ theme }) => darken(theme.red1, 0.05)};
    background-color: ${({ theme }) => darken(theme.red1, 0.05)};
  }
  &:hover {
    background-color: ${({ theme }) => darken(theme.red1, 0.05)};
  }
  &:active {
    box-shadow: 0 0 0 1pt ${({ theme }) => darken(theme.red1, 0.1)};
    background-color: ${({ theme }) => darken(theme.red1, 0.1)};
  }
  &:disabled {
    opacity: 50%;
    cursor: auto;
    box-shadow: none;
    background-color: ${({ theme }) => theme.danger};
    border: 1px solid ${({ theme }) => theme.danger};
  }
`

export function ButtonConfirmed({
  confirmed,
  altDisabledStyle,
  ...rest
}: { confirmed?: boolean; altDisabledStyle?: boolean } & ButtonProps) {
  if (confirmed) {
    return <ButtonConfirmedStyle {...rest} />
  } else {
    return <ButtonPrimary {...rest} altDisabledStyle={altDisabledStyle} />
  }
}

export function ButtonError({ error, ...rest }: { error?: boolean } & ButtonProps) {
  if (error) {
    return <ButtonErrorStyle {...rest} />
  } else {
    return <ButtonPrimary {...rest} />
  }
}

export function ButtonDropdown({ disabled = false, children, ...rest }: { disabled?: boolean } & ButtonProps) {
  return (
    <ButtonPrimary {...rest} disabled={disabled}>
      <RowBetween>
        <div style={{ display: 'flex', alignItems: 'center' }}>{children}</div>
        <ChevronDown size={24} />
      </RowBetween>
    </ButtonPrimary>
  )
}

export function ButtonDropdownLight({ disabled = false, children, ...rest }: { disabled?: boolean } & ButtonProps) {
  return (
    <ButtonOutlined {...rest} disabled={disabled}>
      <RowBetween>
        <div style={{ display: 'flex', alignItems: 'center' }}>{children}</div>
        <ChevronDown size={24} />
      </RowBetween>
    </ButtonOutlined>
  )
}
