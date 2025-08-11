import { ReactNode } from 'react'

import ICON_WALLET from '@cowprotocol/assets/cow-swap/wallet-plus.svg'
import { ButtonPrimary, ButtonSize } from '@cowprotocol/ui'

import { IdentityIcon } from './IdentityIcon'
import { Wrapper, Container } from './styled'

import { BaseAccountCard } from '../BaseAccountCard'
import { CowProtocolIcon } from '../CowProtocolIcon'
import { SkeletonLines } from '../SkeletonLines'

interface WalletNotConnectedProps {
  onConnect(): void
}
export function WalletNotConnected({ onConnect }: WalletNotConnectedProps): ReactNode {
  return (
    <Container>
      <Wrapper>
        <BaseAccountCard width={206} height={116} padding={16} enableScale ariaLabel="Connect wallet banner">
          <IdentityIcon icon={ICON_WALLET} />
          <SkeletonLines />
          <CowProtocolIcon />
        </BaseAccountCard>

        <p>Connect wallet to recover funds</p>
      </Wrapper>
      <ButtonPrimary buttonSize={ButtonSize.BIG} onClick={onConnect}>
        Connect wallet
      </ButtonPrimary>
    </Container>
  )
}
