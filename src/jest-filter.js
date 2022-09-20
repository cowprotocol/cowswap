const IGNORED_TEST = [
  'components/WalletModal/index.test.tsx',
  'utils/computeUniCirculation.test.ts',
  'components/TextInput/index.test.tsx',
  'components/SearchModal/CurrencyList/index.test.tsx',
  'pages/Pool',
]

function isFiltered(path) {
  // console.log(
  //   `Is ${path} ignored?`,
  //   IGNORED_TEST.some((ignored) => path.includes(ignored))
  // )
  return !IGNORED_TEST.some((ignored) => path.includes(ignored))
}

module.exports = function filter(testPaths) {
  const filtered = testPaths.filter((testPath) => isFiltered(testPath)).map((testPath) => ({ test: testPath }))

  return {
    filtered,
  }
}
