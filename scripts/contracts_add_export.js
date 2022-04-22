/* eslint-disable @typescript-eslint/no-var-requires */
/* This script adds necessary export of Uniswap abis/types
   to the end of auto-generated abis/types/index.ts file */
const fs = require('fs')
const path = require('path')

const file = path.resolve(__dirname, '../src/custom/abis/types/index.ts')
const output = 'export * from "@src/abis/types";\n'

fs.appendFile(file, output, function (err) {
  if (err) {
    throw err
  }

  console.log('Successfully added contracts export script!')
})
