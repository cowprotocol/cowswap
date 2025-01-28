import { WarningCard } from 'common/pure/WarningCard'

export function WrapDisabledWarning({ nativeCurrency }: { nativeCurrency: string }) {
  return (
    <WarningCard>
      Wrapping {nativeCurrency} is temporarily disabled, but will be back very soon! In the meantime, you can still
      trade {nativeCurrency} directly
    </WarningCard>
  )
}
