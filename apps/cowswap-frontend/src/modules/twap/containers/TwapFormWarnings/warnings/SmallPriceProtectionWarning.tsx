import { InlineBanner } from '@cowprotocol/ui'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function SmallPriceProtectionWarning() {
  return (
    <InlineBanner>
      <strong>Attention</strong>
      <p>
        Since prices can change significantly over time, we suggest increasing your price protection for orders with
        long deadlines.
      </p>
    </InlineBanner>
  )
}
