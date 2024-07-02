import etherscan from 'assets/img/etherscan-logo.svg'
import github from 'assets/img/github-logo.png'
import styled from 'styled-components/macro'

export default styled.img`
  max-width: 1.6rem;
  margin-left: 0.5rem;
  margin-right: 0.5rem;
  filter: brightness(0.5);
  transition: filter 0.2s;

  &:hover {
    filter: brightness(1);
  }

  &.github-logo {
    filter: invert(1) brightness(0.5);

    &:hover {
      filter: invert(1) brightness(1);
    }
  }
`
export const LOGO_MAP = {
  github,
  etherscan,
}
