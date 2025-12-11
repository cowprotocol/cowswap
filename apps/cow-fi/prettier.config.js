const config = {
  ...require('../../prettier.config'),
}

// cow-fi eslint config has been ignoring import/order rules, so we disable prettier import order rules
config.plugins = [...config.plugins].filter((p) => !p.includes('@trivago/prettier-plugin-sort-imports'))

Object.keys(config)
  .filter((key) => key.includes('importOrder'))
  .forEach((key) => {
    // remove all "importOrder" rules
    delete config[key]
  })

module.exports = config
