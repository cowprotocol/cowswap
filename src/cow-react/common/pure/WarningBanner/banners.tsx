import Important from 'assets/cow-swap/important.svg'

import { WarningBanner } from '@cow/common/pure/WarningBanner'

export function BundleTxApprovalBanner() {
  return (
    <WarningBanner
      icon={Important}
      content={
        <>
          <strong>Token approval</strong>: For your convenience, token approval and order placement will be bundled into
          a single transaction, streamlining your experience!
        </>
      }
    />
  )
}
