export function clickDomElement(selector: string): void {
  const el = document.querySelector<HTMLElement>(selector)

  if (el) {
    el.click()
  } else {
    console.warn('[UI Guide] no element found: ' + selector)
  }
}
