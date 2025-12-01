module.exports = {
  semi: false,
  singleQuote: true,
  printWidth: 120,
  plugins: ['@trivago/prettier-plugin-sort-imports'],

  /**
   * importOrder settings
   *
   * duplicates eslint's import/order rules
   *
   * @see esling.config.js
   */
  importOrder: [
    // react / jotai first
    '^(react|jotai)(/.*)?$',

    // scope packages like @cowprotocol, @uniswap, @safe-global, etc.
    '^@(cowprotocol|uniswap|safe-global|ethersproject|web3-react)(/.*)?$',

    // thirs parties (analogous to group: external)
    '<THIRD_PARTY_MODULES>',

    // legacy/**
    '^legacy/.*$',

    // built-in Node modules (analogous to group: builtin)
    '<BUILTIN_MODULES>',

    // modules/**
    '^modules/.*$',

    // internal project folders: api, abis, common, constants, etc.
    '^(api|abis|common|constants|lib|pages|types|utils)/.*$',

    // sibling imports (without index)
    '^\\./(?!index$).+$',

    // parent imports
    '^\\.\\.(/.*)?$',

    // index imports
    '^\\.(/)?(index)?$',

    // type imports
    '<THIRD_PARTY_TS_TYPES>',
    '<TS_TYPES>^[./]',
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: false,
  importOrderCaseInsensitive: true,
  importOrderSideEffects: false,
}
