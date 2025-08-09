import { ReactNode } from 'react'

import ICON_WALLET from '@cowprotocol/assets/cow-swap/wallet-plus.svg'
import { ButtonPrimary, ButtonSize } from '@cowprotocol/ui'

import { Wrapper, Container } from './styled'

import { AccountCard } from '../AccountCard'
import { CowProtocolIcon } from '../AccountCard/CowProtocolIcon'
import { IdentityIcon } from '../AccountCard/IdentityIcon'
import { SkeletonLines } from '../AccountCard/SkeletonLines'

interface WalletNotConnectedProps {
  onConnect(): void
}
export function WalletNotConnected({ onConnect }: WalletNotConnectedProps): ReactNode {
  return (
    <Container>
      <Wrapper>
        <AccountCard width={206} height={116} padding={16} enableScale>
          <IdentityIcon icon={ICON_WALLET} />
          <SkeletonLines />
          <CowProtocolIcon />
        </AccountCard>

        <p>Connect wallet to recover funds</p>
      </Wrapper>
      <ButtonPrimary buttonSize={ButtonSize.BIG} onClick={onConnect}>
        Connect wallet
      </ButtonPrimary>
    </Container>
  )
}
