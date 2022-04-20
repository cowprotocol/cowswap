/* This script adds necessary export of Uniswap abis/types
   to the end of auto-generated abis/types/index.ts file */
import fs from 'fs'
import path, { dirname } from 'path'

import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const file = path.resolve(__dirname, '../src/custom/abis/types/index.ts')
const output = 'export * from "@src/abis/types";\n'

fs.appendFile(file, output, function (err) {
  if (err) {
    throw err
  }

  console.log('Successfully added contracts export script!')
})
