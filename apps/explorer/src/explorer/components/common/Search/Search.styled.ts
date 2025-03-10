import { Color, Media } from '@cowprotocol/ui'

import * as CSS from 'csstype'
import SVG from 'react-inlinesvg'
import styled, { css, FlattenSimpleInterpolation } from 'styled-components/macro'

export const Wrapper = styled.form`
  display: flex;
  ${({ className }): FlattenSimpleInterpolation =>
    className === 'home'
      ? css`
          width: 100%;
          max-width: 50rem;
          margin: 0 auto;
          flex-direction: column-reverse;
        `
      : css`
          width: 60rem;
        `}
  position: relative;
`

export const Input = styled.input`
  height: 5rem;
  flex: 1 1 auto;
  background: ${Color.explorer_greyOpacity};
  font-weight: ${({ theme }): string => theme.fontMedium};
  font-size: 1.6rem;
  border-radius: 0.6rem;
  line-height: 1;
  display: flex;
  outline: 0;
  appearance: none;
  align-items: center;
  color: ${Color.explorer_textSecondary2};
  padding: 1.6rem 1.6rem 1.6rem 5rem;
  box-sizing: border-box;
  border: 0.1rem solid transparent;
  transition: border 0.2s ease-in-out;

  &:focus {
    border: 0.1rem solid ${Color.explorer_borderPrimary};
  }

  &::placeholder {
    color: inherit;
    transition: color 0.2s ease-in-out;
    ${Media.upToSmall()} {
      color: transparent;
    }
  }

  &:focus::placeholder {
    color: transparent;
  }
  &:focus ~ span {
    z-index: -1;
    opacity: 0;
    transition: all 0.2s ease-in-out;
  }
`

export const Button = styled.button`
  width: 5rem;
  height: 100%;
  appearance: none;
  border: 0;
  outline: 0;
  background: none;
  position: absolute;
  left: 0;
  cursor: pointer;
  padding: 1.6rem;
  box-sizing: border-box;
`

export const SearchIcon = styled(SVG)`
  fill: ${Color.explorer_textSecondary2};
  opacity: 0.7;
  transition: opacity 0.2s ease-in-out;
  width: 100%;
  height: 100%;

  > path {
    height: 100%;
    width: 100%;
    fill: ${Color.explorer_textSecondary2};
  }

  &:hover {
    opacity: 1;
  }
`

export const Placeholder = styled.span<Partial<CSS.Properties & { isActive: boolean }>>`
  ${Media.upToSmall()} {
    display: flex;
    font-size: 1.4rem;
  }
  display: none;
  font-size: 1.6rem;
  line-height: 1;
  color: ${Color.explorer_textSecondary2};
  transition: all 0.2s ease-in-out;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  padding: 1.6rem 1.6rem 1.6rem 5rem;
  max-height: 5rem;
  pointer-events: none;
  align-items: center;
  justify-content: center;
  ${({ isActive }): string =>
    isActive
      ? 'z-index: -1; opacity: 0; transition: all 0.2s ease-in-out;'
      : 'z-index: 1; opacity: 1; transition: all 0.2s ease-in-out;'};
`
