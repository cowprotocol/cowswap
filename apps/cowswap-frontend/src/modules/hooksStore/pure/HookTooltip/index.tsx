import { HelpTooltip } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function HookTooltip({ isPreHook }: { isPreHook: boolean }) {
  const prefix = isPreHook ? 'Pre' : 'Post'
  const position = isPreHook ? 'BEFORE' : 'AFTER'
  return (
    <HelpTooltip
      text={t`${prefix}-hooks allow you to automatically execute any action ${position} your trade is executed`}
    />
  )
}
