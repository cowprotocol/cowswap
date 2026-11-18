// jsdom has no layout, so it doesn't implement matchMedia. Nothing matches by default, as on a wide screen
if (typeof window !== 'undefined') {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
  })
}
