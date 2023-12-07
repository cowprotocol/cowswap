import { HTMLAttributes } from 'react'

import { ChevronDown, Star } from 'react-feather'
import { ButtonProps } from 'rebass/styled-components'
import styled from 'styled-components'

import { RowBetween } from '../Row'
import { ButtonSize, UI } from '../../enum'

import {
  // Import only the basic buttons
  ButtonPrimary as ButtonPrimaryMod,
  ButtonGray as ButtonGrayMod,
  ButtonOutlined as ButtonOutlinedMod,
  ButtonEmpty as ButtonEmptyMod,
  ButtonConfirmedStyle as ButtonConfirmedStyleMod,
  // We don't import the "composite" buttons, they are just redefined (c&p actually)
} from './ButtonMod'

export * from './ButtonMod'

export const ButtonPrimary = styled(ButtonPrimaryMod)`
  // CSS overrides
  background: ${`var(${UI.COLOR_PRIMARY})`};
  color: ${`var(${UI.COLOR_BUTTON_TEXT})`};
  font-size: 18px;
  font-weight: 600;
  border: none;
  box-shadow: none;
  border-radius: 16px;
  position: relative;
  min-height: 58px;
  transition: background 0.2s ease-in-out, color 0.2s ease-in-out;
  margin: 0;
  /* ${({ theme }) => theme.cursor}; */ // TODO: add behind feature flag

  &:focus,
  &:hover,
  &:active {
    box-shadow: none;
    transform: none;
    color: ${`var(${UI.COLOR_BUTTON_TEXT})`};
    background: ${`var(${UI.COLOR_PRIMARY_LIGHTER})`};
  }

  &:disabled {
    background-image: none;
    background-color: ${`var(${UI.COLOR_PAPER_DARKER})`};
    color: ${`var(${UI.COLOR_BUTTON_TEXT_DISABLED})`};
    border: 0;
    cursor: auto;
    animation: none;
    transform: none;
  }
`

export const ButtonLight = styled(ButtonPrimary)`
  // CSS override
  ${({ theme }) => theme.buttonLight.background}
  color: ${({ theme }) => theme.text1};
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
    color: ${({ theme }) => theme.text1};

    &:hover {
      cursor: auto;
      background-color: ${({ theme }) => theme.primary5};
      box-shadow: none;
      border: ${({ theme }) => theme.buttonLight.borderHover};
      outline: none;
    }
  }
`

export const ButtonGray = styled(ButtonGrayMod)`
  box-shadow: none;

  &:hover,
  &:focus {
    box-shadow: 0 6px 8px rgb(0 0 0 / 6%);
  }
`

export const ButtonSecondary = styled(ButtonPrimary)`
  // CSS overrides
  min-height: 0;
  border: 0;
  border-radius: 21px;
  box-shadow: none;
  padding: 6px 8px;
  transform: none;

  &:hover,
  &:focus {
  }
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

export const ButtonConfirmedStyle = styled(ButtonConfirmedStyleMod)`
  // CSS overrides
  background-color: ${({ theme }) => theme.disabled};
  color: var(--cow-color-text1);
  background-image: none;
  border: 0;
  cursor: auto;
  animation: none;
  border: none;
  box-shadow: none;
`

export const ButtonErrorStyle = styled(ButtonPrimary)`
  // CSS overrides
  background: ${`var(${UI.COLOR_DANGER})`};
  color: ${`var(${UI.COLOR_DANGER_TEXT})`};
  transition: background 0.15s ease-in-out;

  &:focus,
  &:hover,
  &:active {
    background: ${`var(${UI.COLOR_DANGER})`};
    color: ${`var(${UI.COLOR_DANGER_TEXT})`};
  }
`

export const ButtonEmpty = styled(ButtonEmptyMod)`
  // CSS overrides
`

export const FancyButton = styled.button`
  background: ${`var(${UI.COLOR_PRIMARY})`};
  color: ${`var(${UI.COLOR_BUTTON_TEXT})`};
  align-items: center;
  height: 2rem;
  border-radius: 36px;
  font-size: 1rem;
  width: auto;
  min-width: 3.5rem;
  border: 0;
  outline: none;

  :hover {
  }
  :focus {
    /* border: 1px solid ${({ theme }) => theme.primary1}; */
  }
`

const HoverIcon = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  margin: 0 8px 0 0;
  opacity: 0.75;
  cursor: pointer;
  transition: opacity 0.2s ease-in-out;

  &:hover {
    opacity: 1;
  }
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

export const ButtonStar = ({
  fill = 'transparent',
  size = '18px',
  stroke,
  ...rest
}: { fill?: string; size?: string; stroke: string } & HTMLAttributes<HTMLDivElement>) => {
  return (
    <HoverIcon {...rest}>
      <Star stroke={stroke} fill={fill} size={size} />
    </HoverIcon>
  )
}
