// TODO: Add proper return type annotation
// TODO: Replace any with proper type definitions
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-explicit-any
export function logTradeFlow(label: string, ...args: any[]) {
  console.debug(`%c [${label}] `, 'font-weight: bold; color: #1c5dbf', args)
}

// TODO: Add proper return type annotation
// TODO: Replace any with proper type definitions
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-explicit-any
export function logTradeFlowError(label: string, ...args: any[]) {
  console.debug(`%c [${label} ERROR] `, 'font-weight: bold; color: #1c5dbf', args)
}
