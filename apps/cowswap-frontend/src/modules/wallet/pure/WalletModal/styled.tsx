import Close from '@cowprotocol/assets/images/x.svg?react'
import { ExternalLink, Media } from '@cowprotocol/ui'
import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const TermsWrapper = styled.div`
  color: inherit;
  font-size: 13px;
  line-height: 1.5;
  text-align: center;
  padding: 0 32px;

  > a {
    color: inherit;
    text-decoration: underline;
  }

  > a:hover {
    color: var(${UI.COLOR_PRIMARY});
  }
`

export const Blurb = styled.div`
  width: 100%;
  margin: 16px 0 0;
  text-align: center;
  font-size: smaller;
  line-height: 1.5;
`

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const NewToEthereum = () => (
  <Blurb>
    <div>New to decentralised applications?</div>{' '}
    <ExternalLink href="https://ethereum.org/wallets/">Learn more about wallets</ExternalLink>
  </Blurb>
)

export const CloseColor = styled((props) => <Close {...props} />)`
  --size: 16px;
  color: inherit;
  width: var(--size);
  height: var(--size);

  path {
    stroke: currentColor;
  }
`

export const Wrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  margin: 0;
  padding: 0;
  width: 100%;
  color: inherit;
  overflow-y: auto; // fallback for 'overlay'
  overflow-y: overlay;
`

export const UpperSection = styled.div`
  position: relative;
  color: inherit;

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

export const OptionGrid = styled.div<{ itemsCount: number }>`
  display: grid;
  grid-gap: 10px;
  grid-template-columns: ${({ itemsCount }) => `repeat(${Math.min(4, Math.max(itemsCount, 2))}, 1fr)`};
  grid-template-rows: max-content;
  color: inherit;

  ${Media.upToSmall()} {
    grid-template-columns: repeat(3, 1fr);
  }
  ${Media.upToExtraSmall()} {
    grid-template-columns: repeat(2, 1fr);
  }
`

export const IconWrapper = styled.div`
  --size: 42px;
  display: flex;
  width: var(--size);
  height: var(--size);
  border-radius: var(--size);
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid var(${UI.COLOR_BORDER});
  color: inherit;
  padding: 8px;
  margin: 0 12px 0 0;

  > svg {
    width: 100%;
    height: 100%;
    color: inherit;
  }

  > svg > path {
    color: currentColor;
    fill: var(--color);
    stroke: var(--color);
  }
`
