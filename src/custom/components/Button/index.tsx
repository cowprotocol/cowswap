import React from 'react'
import styled from 'styled-components'
import { ButtonProps } from 'rebass/styled-components'
import { ChevronDown } from 'react-feather'

import { RowBetween } from 'components/Row'

import {
  // Import only the basic buttons
  ButtonPrimary as ButtonPrimaryMod,
  ButtonLight as ButtonLightMod,
  ButtonGray as ButtonGrayMod,
  ButtonSecondary as ButtonSecondaryMod,
  ButtonPink as ButtonPinkMod,
  ButtonOutlined as ButtonOutlinedMod,
  ButtonEmpty as ButtonEmptyMod,
  ButtonWhite as ButtonWhiteMod,
  ButtonConfirmedStyle as ButtonConfirmedStyleMod
  // ButtonErrorStyle as ButtonErrorStyleMod
  // We don't import the "composite" buttons, they are just redefined (c&p actually)
} from './ButtonMod'
import { ButtonSize } from 'theme'

export const ButtonPrimary = styled(ButtonPrimaryMod)`
  // CSS overrides
  ${({ theme }) => theme.buttonPrimary.background}
  color: ${({ theme }) => theme.primaryText1};
  font-size: ${({ theme }) => theme.buttonPrimary.fontSize};
  font-weight: ${({ theme }) => theme.buttonPrimary.fontWeight};
  border: ${({ theme }) => theme.buttonPrimary.border};
  box-shadow: ${({ theme }) => theme.buttonPrimary.boxShadow};
  border-radius: ${({ theme }) => theme.buttonPrimary.borderRadius};
  ${({ theme }) => theme.cursor};
  overflow: hidden;
  position: relative;
  transition: box-shadow 0.1s ease-in-out, transform 0.1s ease-in-out;

  > div {
    font-size: ${({ theme }) => theme.buttonPrimary.fontSize};
    font-weight: ${({ theme }) => theme.buttonPrimary.fontWeight};
  }

  &:focus,
  &:hover,
  &:active {
    ${({ theme }) => theme.buttonPrimary.background}
    border: ${({ theme }) => theme.buttonPrimary.border};
    box-shadow: none;
    transform: translateY(3px);
  }
  &:disabled {
    background-color: ${({ theme }) => theme.disabled};
    color: ${({ theme }) => theme.primaryText1};
    background-image: none;
    border: 0;
    cursor: auto;
    animation: none;
    transform: none;
  }
`

export const ButtonLight = styled(ButtonLightMod)`
  // CSS override
  ${({ theme }) => theme.buttonLight.background}
  color: ${({ theme }) => theme.primaryText1};
  font-size: ${({ theme }) => theme.buttonLight.fontSize};
  font-weight: ${({ theme }) => theme.buttonLight.fontWeight};
  border: ${({ theme }) => theme.buttonLight.border};
  box-shadow: ${({ theme }) => theme.buttonLight.boxShadow};
  border-radius: ${({ theme }) => theme.buttonLight.borderRadius};
  ${({ theme }) => theme.cursor};
  overflow: hidden;
  position: relative;

  > div {
    font-size: inherit;
    font-weight: inherit;
  }

  &:focus {
    box-shadow: ${({ theme }) => theme.buttonLight.boxShadow};
    background-color: ${({ theme }) => theme.buttonLight.backgroundHover};
  }
  &:hover {
    background-color: ${({ theme }) => theme.buttonLight.backgroundHover};
  }
  &:active {
    box-shadow: ${({ theme }) => theme.buttonLight.boxShadow};
    background-color: ${({ theme }) => theme.buttonLight.backgroundHover};
  }
  &:disabled {
    opacity: 0.4;
    cursor: auto;
    animation: none;
    color: ${({ theme }) => theme.primaryText1};

    :hover {
      cursor: auto;
      background-color: ${({ theme }) => theme.primary5};
      box-shadow: none;
      border: ${({ theme }) => theme.buttonLight.borderHover};
      outline: none;
    }
  }

`

export const ButtonGray = styled(ButtonGrayMod)`
  // CSS overrides
`

export const ButtonSecondary = styled(ButtonSecondaryMod)`
  // CSS overrides
  transition: box-shadow 0.1s ease-in-out;

  &:hover {
    box-shadow: none;
  }
`

export const ButtonPink = styled(ButtonPinkMod)`
  // CSS overrides
`

export const ButtonOutlined = styled(ButtonOutlinedMod)`
  // CSS overrides
  ${({ theme }) => theme.buttonOutlined.background}
  font-size: ${({ theme }) => theme.buttonOutlined.fontSize};
  font-weight: ${({ theme }) => theme.buttonOutlined.fontWeight};
  border: ${({ theme }) => theme.buttonOutlined.border};
  box-shadow: ${({ theme }) => theme.buttonOutlined.boxShadow};
  border-radius: ${({ theme }) => theme.buttonOutlined.borderRadius};
  ${({ theme }) => theme.cursor};
  overflow: hidden;
  position: relative;
  transition: box-shadow 0.1s ease-in-out, transform 0.1s ease-in-out;

  > div {
    font-size: inherit;
    font-weight: inherit;
  }

  &:focus,
  &:hover,
  &:active {
    ${({ theme }) => theme.buttonPrimary.background}
    border: ${({ theme }) => theme.buttonPrimary.border};
    box-shadow: none;
    transform: translateY(3px);
  }
  &:disabled {
    background-color: ${({ theme }) => theme.disabled};
    background-image: none;
    border: 0;
    cursor: auto;
    animation: none;
  }
`

export const ButtonWhite = styled(ButtonWhiteMod)`
  // CSS overrides
`

export const ButtonConfirmedStyle = styled(ButtonConfirmedStyleMod)`
  // CSS overrides
  background-color: ${({ theme }) => theme.disabled};
  color: ${({ theme }) => theme.primaryText1};
  background-image: none;
  border: 0;
  cursor: auto;
  animation: none;
  font-size: ${({ theme }) => theme.buttonPrimary.fontSize};
  font-weight: ${({ theme }) => theme.buttonPrimary.fontWeight};
  border: none;
  box-shadow: none;
  border-radius: ${({ theme }) => theme.buttonPrimary.borderRadius};
`

export const ButtonErrorStyle = styled(ButtonPrimary)`
  // CSS overrides
  background: ${({ theme }) => theme.red1};

  &:focus,
  &:hover,
  &:active {
    background: ${({ theme }) => theme.red1};
  }
`

export const ButtonEmpty = styled(ButtonEmptyMod)`
  // CSS overrides
`

type ButtonCustomProps = ButtonProps & {
  buttonSize?: ButtonSize
}

export function ButtonConfirmed({
  confirmed,
  altDisabledStyle,
  ...rest
}: { confirmed?: boolean; altDisabledStyle?: boolean } & ButtonCustomProps) {
  if (confirmed) {
    return <ButtonConfirmedStyle {...rest} />
  } else {
    return <ButtonPrimary {...rest} altDisabledStyle={altDisabledStyle} />
  }
}

export function ButtonError({ error, ...rest }: { error?: boolean } & ButtonCustomProps) {
  if (error) {
    return <ButtonErrorStyle {...rest} />
  } else {
    return <ButtonPrimary {...rest} />
  }
}

export function ButtonDropdown({ disabled = false, children, ...rest }: { disabled?: boolean } & ButtonCustomProps) {
  return (
    <ButtonPrimary {...rest} disabled={disabled}>
      <RowBetween>
        <div style={{ display: 'flex', alignItems: 'center' }}>{children}</div>
        <ChevronDown size={24} />
      </RowBetween>
    </ButtonPrimary>
  )
}

export function ButtonDropdownLight({
  disabled = false,
  children,
  ...rest
}: { disabled?: boolean } & ButtonCustomProps) {
  return (
    <ButtonOutlined {...rest} disabled={disabled}>
      <RowBetween>
        <div style={{ display: 'flex', alignItems: 'center' }}>{children}</div>
        <ChevronDown size={24} />
      </RowBetween>
    </ButtonOutlined>
  )
}

export function ButtonRadio({ active, ...rest }: { active?: boolean } & ButtonCustomProps) {
  if (!active) {
    return <ButtonWhite {...rest} />
  } else {
    return <ButtonPrimary {...rest} />
  }
}
