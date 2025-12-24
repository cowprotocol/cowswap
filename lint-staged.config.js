module.exports = {
  '*.{ts,tsx,js,jsx,mts}': (files) => {
    const list = files.map((f) => `"${f}"`).join(' ')
    return [
      `eslint --fix --concurrency auto ${list}`,
      // `git add ${list}`, // lint-staged automatically adds files
    ]
  },
}
