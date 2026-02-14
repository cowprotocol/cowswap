/** Navigate to a URL. Separate module so tests can jest.mock() it cleanly. */
export function navigateTo(url: string): void {
  window.location.href = url
}
