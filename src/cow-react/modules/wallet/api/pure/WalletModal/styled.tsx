import { ReactComponent as Close } from 'assets/images/x.svg'

import styled from 'styled-components/macro'
import { ExternalLink } from 'theme'

export const TermsWrapper = styled.div`
  color: ${({ theme }) => theme.text1};
`

export const Blurb = styled.div`
  width: 100%;
  margin: 16px 0 0;
  text-align: center;
  font-size: smaller;
  line-height: 1.5;
`

export const NewToEthereum = () => (
  <Blurb>
    <div>New to decentralised applications?</div>{' '}
    <ExternalLink href="https://ethereum.org/wallets/">Learn more about wallets</ExternalLink>
  </Blurb>
)

export const CloseColor = styled(Close)`
  path {
    stroke: ${({ theme }) => theme.text4};
  }
`

export const Wrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  margin: 0;
  padding: 0;
  width: 100%;
  /* MOD */
  overflow-y: auto; // fallback for 'overlay'
  overflow-y: overlay;
`

export const UpperSection = styled.div`
  position: relative;
  h5 {
    margin: 0;
    margin-bottom: 0.5rem;
    font-size: 1rem;
    font-weight: 400;
  }
  h5:last-child {
    margin-bottom: 0px;
  }
  h4 {
    margin-top: 0;
    font-weight: 500;
  }
`

export const OptionGrid = styled.div`
  display: grid;
  grid-gap: 10px;
  grid-template-columns: repeat(4, 1fr);
  ${({ theme }) => theme.mediaWidth.upToSmall`
    grid-template-columns: repeat(3, 1fr);
  `};
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
        grid-template-columns: repeat(2, 1fr);
  `}
`
