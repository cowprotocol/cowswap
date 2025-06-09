import pkg from 'yaml'
const { parse: YAMLparse } = pkg

import * as fs from 'fs'
import * as path from 'path'

const SUPPORTED_EXTENSIONS = 'yaml|yml|json'
const CONFIG_FILE = './config-default.yaml'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function parseJsonOrYaml(filePath: string) {
  const extension = path.extname(filePath)
  if (SUPPORTED_EXTENSIONS.split('|').includes(extension.replace('.', ''))) {
    const content = fs.readFileSync(filePath, 'utf-8')
    return YAMLparse(content)
  } else {
    throw new Error(`Unknown file extension "${extension}". Supported JSON or YAML: ${filePath} `)
  }
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function loadConfig() {
  const configPath = path.resolve(__dirname, CONFIG_FILE)

  return parseJsonOrYaml(configPath)
}
