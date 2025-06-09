const SCROLL_OFFSET = 24

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function scrollToElement(el: HTMLElement) {
  const yCoordinate = el.getBoundingClientRect().top + window.pageYOffset
  window.scrollTo({ top: yCoordinate - SCROLL_OFFSET, behavior: 'smooth' })
}
