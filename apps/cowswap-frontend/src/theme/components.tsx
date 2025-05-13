import { Command } from '@cowprotocol/types'
import { UI } from '@cowprotocol/ui'

import { X } from 'react-feather'
import { Link } from 'react-router'
import styled from 'styled-components/macro'

export const CloseIcon = styled(X) <{ onClick: Command }>`
  cursor: pointer;
  opacity: 0.6;
  transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;

  &:hover {
    opacity: 1;
  }
`

// A button that triggers some onClick result, but looks like a link.
export const LinkStyledButton = styled.button<{ disabled?: boolean; bg?: boolean; isCopied?: boolean; color?: string }>`
  border: none;
  text-decoration: none;
  background: none;
  cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
  color: ${({ color }) => color || 'inherit'};
  font-weight: 500;
  opacity: ${({ disabled }) => (disabled ? 0.7 : 1)};

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

// An internal link from the react-router-dom library that is correctly styled
export const StyledInternalLink = styled(Link)`
  text-decoration: none;
  cursor: pointer;
  color: var(${UI.COLOR_PRIMARY_PAPER});
  font-weight: 500;

  :hover {
    text-decoration: underline;
    color: var(${UI.COLOR_PRIMARY_DARKER});
  }

  :focus {
    outline: none;
    text-decoration: underline;
  }

  :active {
    text-decoration: none;
  }
`
