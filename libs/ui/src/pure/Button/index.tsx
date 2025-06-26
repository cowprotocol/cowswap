import { HTMLAttributes } from 'react'

import { ChevronDown, Star } from 'react-feather'
import { ButtonProps } from 'rebass/styled-components'
import styled from 'styled-components/macro'

import {
  ButtonConfirmedStyle as ButtonConfirmedStyleMod,
  ButtonGray as ButtonGrayMod,
  ButtonPrimary as ButtonPrimaryMod,
} from './ButtonMod'
import { ButtonSize } from './types'

import { UI } from '../../enum'
import { RowBetween } from '../Row'

export * from './ButtonMod'
export * from './types'

export const ButtonPrimary = styled(ButtonPrimaryMod)`
  // CSS overrides
  background: var(${UI.COLOR_PRIMARY});
  color: var(${UI.COLOR_BUTTON_TEXT});
  font-size: 18px;
  font-weight: 600;
  border: none;
  box-shadow: none;
  border-radius: 16px;
  position: relative;
  min-height: 58px;
  transition: background var(${UI.ANIMATION_DURATION}) ease-in-out, color var(${UI.ANIMATION_DURATION}) ease-in-out;
  margin: 0;
  flex-flow: row wrap;

  &:focus,
  &:hover,
  &:active {
    box-shadow: none;
    transform: none;
    color: var(${UI.COLOR_BUTTON_TEXT});
    background: var(${UI.COLOR_PRIMARY_LIGHTER});
  }

  &:disabled {
    background-image: none;
    background-color: var(${UI.COLOR_PAPER_DARKER});
    color: var(${UI.COLOR_BUTTON_TEXT_DISABLED});
    border: 0;
    cursor: auto;
    animation: none;
    transform: none;
  }
`

export const ButtonLight = styled(ButtonPrimary)`
  color: ${({ theme }) => theme.text1};
  font-weight: 800;
  border: ${({ theme }) => `4px solid ${theme.black}`};
  box-shadow: ${({ theme }) => `4px 4px 0px ${theme.black}`};
  overflow: hidden;
  position: relative;

  > div {
    font-size: inherit;
    font-weight: inherit;
  }

  &:focus {
    box-shadow: ${({ theme }) => `4px 4px 0px ${theme.black}`};
    background-color: ${({ theme }) => theme.bg2};
  }

  &:hover {
    background-color: ${({ theme }) => theme.bg2};
  }

  &:active {
    box-shadow: ${({ theme }) => `4px 4px 0px ${theme.black}`};
    background-color: ${({ theme }) => theme.bg2};
  }

  &:disabled {
    opacity: 0.4;
    cursor: auto;
    animation: none;
    color: ${({ theme }) => theme.text1};

    &:hover {
      cursor: auto;
      background-color: ${({ theme }) => theme.bg2};
      box-shadow: none;
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
`

export const ButtonOutlined = styled.button<{ disabled?: boolean; margin?: string; minHeight?: number }>`
  --fontSize: 13px;
  cursor: pointer;
  border-radius: 16px;
  background: var(${UI.COLOR_PAPER});
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  border: 1px solid var(${UI.COLOR_TEXT_OPACITY_10});
  font-size: var(--fontSize);
  font-weight: 500;
  padding: 5px 10px;
  min-height: ${({ minHeight }) => (minHeight ? `${minHeight}px` : 'initial')};
  margin: ${({ margin }) => margin || '0'};
  transition: background var(${UI.ANIMATION_DURATION}) ease-in-out, color var(${UI.ANIMATION_DURATION}) ease-in-out,
    border var(${UI.ANIMATION_DURATION}) ease-in-out, opacity var(${UI.ANIMATION_DURATION}) ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  > svg {
    margin: 0;
    color: inherit;
    width: var(--fontSize);
    height: var(--fontSize);
  }

  > svg path {
    fill: currentColor;
  }

  &:hover {
    background: var(${UI.COLOR_PAPER_DARKER});
    color: var(${UI.COLOR_TEXT});
    border: 1px solid var(${UI.COLOR_PAPER_DARKER});
  }

  &:disabled {
    opacity: ${({ disabled }) => (disabled ? 0.4 : 1)};
    cursor: auto;
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
  background: var(${UI.COLOR_DANGER});
  color: var(${UI.COLOR_PAPER});
  transition: background var(${UI.ANIMATION_DURATION}) ease-in-out;

  &:focus,
  &:hover,
  &:active {
    background: var(${UI.COLOR_DANGER});
    color: var(${UI.COLOR_PAPER});
  }
`

export const FancyButton = styled.button`
  background: var(${UI.COLOR_PRIMARY});
  color: var(${UI.COLOR_BUTTON_TEXT});
  align-items: center;
  height: 2rem;
  border-radius: 36px;
  font-size: 1rem;
  width: auto;
  min-width: 3.5rem;
  border: 0;
  outline: none;
`

const HoverIcon = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  margin: 0 8px 0 0;
  opacity: 0.75;
  cursor: pointer;
  transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;

  &:hover {
    opacity: 1;
  }
`

type ButtonCustomProps = ButtonProps & {
  buttonSize?: ButtonSize
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function ButtonError({ error, ...rest }: { error?: boolean } & ButtonCustomProps) {
  if (error) {
    return <ButtonErrorStyle {...rest} />
  } else {
    return <ButtonPrimary {...rest} />
  }
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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

export const ButtonStar = ({
  fill = 'transparent',
  size = '18px',
  stroke,
  ...rest
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
}: { fill?: string; size?: string; stroke: string } & HTMLAttributes<HTMLDivElement>) => {
  return (
    <HoverIcon {...rest}>
      <Star stroke={stroke} fill={fill} size={size} />
    </HoverIcon>
  )
}
