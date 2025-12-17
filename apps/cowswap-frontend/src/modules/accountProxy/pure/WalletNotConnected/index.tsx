import { ReactNode } from 'react'

import ICON_WALLET from '@cowprotocol/assets/cow-swap/wallet-plus.svg'
import { ButtonPrimary, ButtonSize } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import SVG from 'react-inlinesvg'

import { Wrapper, Container, WalletIcon } from './styled'

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
        <BaseAccountCard width={206} height={116} padding={16} enableScale ariaLabel={t`Connect wallet banner`}>
          <WalletIcon>
            <SVG src={ICON_WALLET} />
          </WalletIcon>
          <SkeletonLines />
          <CowProtocolIcon />
        </BaseAccountCard>
        <p>
          <Trans>Connect wallet to recover funds</Trans>
        </p>
      </Wrapper>
      <ButtonPrimary buttonSize={ButtonSize.BIG} onClick={onConnect}>
        Connect wallet
      </ButtonPrimary>
    </Container>
  )
}
