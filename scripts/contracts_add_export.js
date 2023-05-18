/* eslint-disable @typescript-eslint/no-var-requires */
/* This script adds necessary export of Uniswap abis/types
   to the end of auto-generated abis/types/index.ts file */
const fs = require('fs')
const path = require('path')

const fileTypesIndex = path.resolve(__dirname, '../src/abis/types/index.ts')
const outputBaseAbis = 'export * from "@src/legacy/abis/types";\n'
const outputEthFlowAbis = 'export * from "abis/types/ethflow";\n'

fs.appendFile(fileTypesIndex, outputBaseAbis, function (err) {
  if (err) {
    throw err
  }

  console.log('Successfully added contracts export script targetting @src/abis/types/index.ts!')
})

fs.appendFile(fileTypesIndex, outputEthFlowAbis, function (err) {
  if (err) {
    throw err
  }

  console.log('Successfully added contracts export script targetting ethflow contracts!')
})
