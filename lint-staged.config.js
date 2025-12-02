module.exports = {
  '*.{ts,tsx,js,jsx,mjs,mts,md,json,css,html,yaml,yml}': (files) => {
    const prettierList = files.map((f) => `"${f}"`).join(' ')
    const eslintList = files
      .filter((f) => f.match(/\.(ts|tsx|js|jsx)$/))
      .map((f) => `"${f}"`)
      .join(' ')
    return [
      `prettier --write ${prettierList}`,
      eslintList.length > 0 && `eslint --fix --max-warnings=0 ${eslintList}`,
    ].filter(Boolean)
  },
  // lint-staged runs `git add` automatically
}
