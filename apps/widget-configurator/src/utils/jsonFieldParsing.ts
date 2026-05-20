export function jsonHelperText(hasError: boolean): string {
  return hasError ? 'Invalid JSON.' : 'Optional. CamelCase CSS properties as JSON, e.g. {"padding": "12px"}'
}
