import { HelpTooltip } from '@cowprotocol/ui'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function HookTooltip({ isPreHook }: { isPreHook: boolean }) {
  return (
    <HelpTooltip
      text={`${isPreHook ? 'Pre' : 'Post'}-hooks allow you to automatically execute any action action ${
        isPreHook ? 'BEFORE' : 'AFTER'
      } your trade is executed`}
    />
  )
}
