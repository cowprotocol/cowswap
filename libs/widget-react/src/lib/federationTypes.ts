import type { CowSwapWidgetProps } from '@cowprotocol/widget-lib'

export interface CowSwapFederatedWidgetHandle {
  update(props: CowSwapWidgetProps): void
  unmount(): void
}

export interface CowSwapFederatedWidgetRemote {
  mount(container: HTMLElement, props: CowSwapWidgetProps): CowSwapFederatedWidgetHandle
}
