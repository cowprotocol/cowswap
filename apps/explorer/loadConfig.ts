import * as YAML from 'yaml'

import * as fs from 'fs'
import * as path from 'path'

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

  return parseJsonOrYaml(configPath)
}
