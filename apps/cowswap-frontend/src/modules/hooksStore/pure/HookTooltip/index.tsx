import { HelpTooltip } from '@cowprotocol/ui'

export function HookTooltip({ isPreHook }: { isPreHook: boolean }) {
  return (
    <HelpTooltip
      text={`${isPreHook ? 'Pre' : 'Post'}-hooks allow you to automatically execute any action action ${
        isPreHook ? 'BEFORE' : 'AFTER'
      } your trade is executed`}
    />
  )
}
