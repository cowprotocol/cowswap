export function logAffiliate(...args: unknown[]): void {
  console.debug(`%c [Affiliate]`, 'font-weight: bold; color: #1c5dbf', ...args)
}
