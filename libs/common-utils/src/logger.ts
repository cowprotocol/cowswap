export function log(category = 'Default', color = '#1c5dbf', ...args: unknown[]): void {
  console.debug(`%c [COW][${category}]`, `font-weight: bold; color: ${color}`, ...args)
}
