import * as path from 'path'
import * as fs from 'fs'
import * as YAML from 'yaml'

const SUPPORTED_EXTENSIONS = 'yaml|yml|json'
const CONFIG_FILE = './config-default.yaml'

function parseJsonOrYaml(filePath: string) {
  const extension = path.extname(filePath)
  if (SUPPORTED_EXTENSIONS.split('|').includes(extension.replace('.', ''))) {
    const content = fs.readFileSync(filePath, 'utf-8')
    return YAML.parse(content)
  } else {
    throw new Error(`Unknown file extension "${extension}". Supported JSON or YAML: ${filePath} `)
  }
}

export function loadConfig() {
  const configPath = path.resolve(__dirname, CONFIG_FILE)
  const CONFIG = parseJsonOrYaml(configPath)

  // TODO: MGR
  // TODO: I have no idea why this is needed, but it is
  CONFIG.appId = 1

  return CONFIG
}
