const SCROLL_OFFSET = 24

export function scrollToElement(el: HTMLElement) {
  const yCoordinate = el.getBoundingClientRect().top + window.pageYOffset
  window.scrollTo({ top: yCoordinate - SCROLL_OFFSET, behavior: 'smooth' })
}
