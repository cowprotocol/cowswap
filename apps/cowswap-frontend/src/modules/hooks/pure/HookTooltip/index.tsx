import { HelpTooltip } from '@cowprotocol/ui'

export function HookTooltip({ isPreHook }: { isPreHook: boolean }) {
  return (
    <HelpTooltip
      text={`${isPreHook ? 'Pre' : 'Post'}-hook allow you to automatically execute any action action ${
        isPreHook ? 'AFTER' : 'BEFORE'
      } your trade is executed`}
    />
  )
}
