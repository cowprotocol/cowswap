export { IframeRpcProviderBridge } from './iframeRpcProvider/IframeRpcProviderBridge'
export { WidgetEthereumProvider } from './iframeRpcProvider/WidgetEthereumProvider'
export { IframeTransport } from './IframeTransport'
export * from './iframeRpcProvider/iframeRpcProviderEvents'
export * from './types'

// If a hooks dApp lib is using `@cowprotocol/iframe-transport`, ideally they don't need to install an additional
// dependency (`@cowprotocol/types` / `@cowprotocol/common-utils`) or use utility types to extract types used by some of
// the entities exported from this lib.
export * from './url.utils'
