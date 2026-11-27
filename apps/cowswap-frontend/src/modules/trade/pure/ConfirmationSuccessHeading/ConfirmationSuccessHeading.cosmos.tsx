import { ReactNode } from 'react'

import { ExternalLink } from '@cowprotocol/ui'

import { DemoContainer } from 'cosmos.decorator'

import { ConfirmationSuccessHeading } from './ConfirmationSuccessHeading.pure'

function HeadingFixture({ title, subtitle }: { title: string; subtitle?: ReactNode }): ReactNode {
  return (
    <DemoContainer>
      <ConfirmationSuccessHeading title={title} subtitle={subtitle} />
    </DemoContainer>
  )
}

const Fixtures = {
  swapComplete: (
    <HeadingFixture
      title="Swap complete"
      subtitle={
        <>
          Your USDC is in your wallet. <ExternalLink href="https://explorer.cow.fi">View on Explorer ↗</ExternalLink>
        </>
      }
    />
  ),
  customRecipient: (
    <HeadingFixture
      title="Swap complete"
      subtitle={
        <>
          Your USDC was sent to{' '}
          <ExternalLink href="https://etherscan.io/address/0xdd9EB88C5C6D2A85A08a96c7F0ccccE27Cb843cb">
            0xdd9E...43cb
          </ExternalLink>
          . <ExternalLink href="https://explorer.cow.fi">View on Explorer ↗</ExternalLink>
        </>
      }
    />
  ),
  twapActive: <HeadingFixture title="Your TWAP is active" subtitle="Track its progress in Orders." />,
}

export default Fixtures
