module.exports = {
  '{apps,libs,tools}/**/*.{ts,tsx,js,jsx}': files => [
    `nx affected:lint --files=${files.join(',')}`,   // no --fix → read‑only
    `nx format:write --files=${files.join(',')}`,    // prettier auto‑fix
  ],
};
