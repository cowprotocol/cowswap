/**
 * Dispatch a custom DOM event that can be picked up by GTM
 * This is the core function that all tracking should use
 *
 * @param eventName Name of the custom event
 * @param detail Additional details for the event
 */
export function dispatchCustomEvent(eventName: string, detail?: { [key: string]: string | number | boolean }): void {
  if (typeof document !== 'undefined') {
    document.dispatchEvent(
      new CustomEvent(eventName, {
        detail,
        bubbles: true,
        cancelable: true,
      }),
    )
  }
}
