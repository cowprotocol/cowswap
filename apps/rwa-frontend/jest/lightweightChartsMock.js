// lightweight-charts is ESM-only and needs canvas, neither works in jsdom
module.exports = {
  AreaSeries: {},
  createChart: () => ({
    addSeries: () => ({ setData: () => undefined }),
    applyOptions: () => undefined,
    remove: () => undefined,
    timeScale: () => ({ applyOptions: () => undefined, fitContent: () => undefined }),
  }),
}
