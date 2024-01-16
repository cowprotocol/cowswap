export function logTradeFlow(label: string, ...args: any[]) {
  console.debug(`%c [${label}] `, 'font-weight: bold; color: #1c5dbf', args)
}

export function logTradeFlowError(label: string, ...args: any[]) {
  console.debug(`%c [${label} ERROR] `, 'font-weight: bold; color: #1c5dbf', args)
}
