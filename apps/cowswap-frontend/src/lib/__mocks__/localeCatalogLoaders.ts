export const localeCatalogLoaders = {
  '../locales/en-US.po': () => Promise.resolve({ messages: {} }),
  '../locales/en-US.js': () => Promise.resolve({ default: { messages: {} } }),
  '../locales/pseudo.js': () => Promise.resolve({ default: { messages: {} } }),
}

export default localeCatalogLoaders
