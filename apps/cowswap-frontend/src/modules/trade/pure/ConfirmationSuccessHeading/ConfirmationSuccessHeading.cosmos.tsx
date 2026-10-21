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
  twapActive: <HeadingFixture title="Your TWAP is active" subtitle="Track its progress in Orders." />,
}

export default Fixtures
