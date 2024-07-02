import etherscan from 'assets/img/etherscan-logo.svg'
import github from 'assets/img/github-logo.png'
import styled from 'styled-components/macro'

export default styled.img`
  max-width: 1.6rem;
  margin-left: 0.5rem;
  margin-right: 0.5rem;
  &.github-logo {
    filter: invert(100%);
  }
`
export const LOGO_MAP = {
  github,
  etherscan,
}
