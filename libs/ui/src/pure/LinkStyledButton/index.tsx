import styled from 'styled-components/macro'

type LinkStyledButtonProps = {
  disabled?: boolean
  bg?: boolean
  isCopied?: boolean
  color?: string
  margin?: string
  padding?: string
  fontSize?: string
}

// A button that triggers some onClick result, but looks like a link.
export const LinkStyledButton = styled.button<LinkStyledButtonProps>`
  border: none;
  text-decoration: none;
  background: none;
  cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
  color: ${({ color }) => color ?? 'inherit'};
  font-weight: inherit;
  font-size: ${({ fontSize }) => fontSize ?? 'inherit'};
  opacity: ${({ disabled }) => (disabled ? 0.7 : 1)};
  margin: ${({ margin }) => margin ?? '0'};
  padding: ${({ padding }) => padding ?? '0'};

  :hover {
    text-decoration: ${({ disabled }) => (disabled ? null : 'underline')};
  }

  :focus {
    outline: none;
    text-decoration: ${({ disabled }) => (disabled ? null : 'underline')};
  }

  :active {
    text-decoration: none;
  }
`
