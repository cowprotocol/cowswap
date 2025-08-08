import { ReactNode } from 'react'

import { ButtonPrimary, ButtonSize } from '@cowprotocol/ui'

import SVG from 'react-inlinesvg'

import { Wrapper, Container } from './styled'

import notConnectedImg from '../../img/wallet-not-connected.svg'

interface WalletNotConnectedProps {
  onConnect(): void
}
export function WalletNotConnected({ onConnect }: WalletNotConnectedProps): ReactNode {
  return (
    <Container>
      <Wrapper>
        <SVG src={notConnectedImg} />
        <p>Connect wallet to recover funds</p>
      </Wrapper>
      <ButtonPrimary buttonSize={ButtonSize.BIG} onClick={onConnect}>
        Connect wallet
      </ButtonPrimary>
    </Container>
  )
}
