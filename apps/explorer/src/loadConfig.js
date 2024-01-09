const path = require('path')
const fs = require('fs')
const YAML = require('yaml')

const CUSTOM_FOLDER_PATH = 'custom/'
const CONFIG_FILE_OVERRIDE_NAME = 'config'
const SUPPORTED_EXTENSIONS = 'yaml|yml|json'
const CONFIG_FILE = 'config-default.yaml'

function parseJsonOrYaml(filePath) {
  const extension = path.extname(filePath)
  if (SUPPORTED_EXTENSIONS.split('|').includes(extension.replace('.', ''))) {
    const content = fs.readFileSync(filePath, 'utf-8')
    return YAML.parse(content)
  } else {
    throw new Error(`Unknown file extension "${extension}". Supported JSON or YAML: ${filePath} `)
  }
}

function getCustomConfigFilePath() {
  const customPath = path.resolve(CUSTOM_FOLDER_PATH)

  const customConfig = SUPPORTED_EXTENSIONS.split('|')
    .map((extension) => path.join(customPath, `${CONFIG_FILE_OVERRIDE_NAME}.${extension}`))
    .find(fs.existsSync)

  return customConfig
}

function loadConfig(isTesting = false) {
  const configPath = path.resolve(CONFIG_FILE)
  let config = parseJsonOrYaml(configPath)

  const configOverridePath = getCustomConfigFilePath()

  if (!isTesting && configOverridePath) {
    const configOverride = parseJsonOrYaml(configOverridePath)
    config = { ...config, ...configOverride }
  } else {
    const customPath =
      path.join(path.resolve(CUSTOM_FOLDER_PATH), CONFIG_FILE_OVERRIDE_NAME) + '.' + SUPPORTED_EXTENSIONS
    console.warn('Using default config from %s. If you want to override, use %s', configPath, customPath)
  }

  return config
}

module.exports = loadConfig
