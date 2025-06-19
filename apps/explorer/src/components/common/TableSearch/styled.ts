import { Media, Color } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { Wrapper, Input, SearchIcon } from '../../../explorer/components/common/Search/Search.styled'

export const SearchWrapped = styled(Wrapper)`
  max-width: 400px;
  margin-left: 1.6rem;

  ${Media.upToSmall()} {
    margin-left: 0;
    max-width: 100%;
    display: flex;
    flex-direction: column;
  }

  ${SearchIcon} {
    width: 1.6rem;
    height: 1.6rem;
    position: absolute;
    left: 2rem;
    top: 1.2rem;
  }

  ${Input} {
    height: 4rem;
    font-size: 1.5rem;

    ${Media.upToExtraSmall()} {
      padding: 0 0.5rem 0 4rem;
    }

    &::placeholder {
      color: ${Color.explorer_greyShade};
      transition: all 0.2s ease-in-out;

      ${Media.upToSmall()} {
        font-size: 1.3rem;
        white-space: pre-line;
      }

      ${Media.upToExtraSmall()} {
        font-size: 1.2rem;
      }
    }
    &:focus::placeholder {
      color: transparent;
    }
  }
`
