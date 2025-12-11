module.exports = {
  '*.{ts,tsx,js,jsx}': (files) => {
    const list = files.map((f) => `"${f}"`).join(' ')
    return [`eslint --fix  ${list}`, `git add ${list}`]
  },
}
