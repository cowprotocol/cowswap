/* eslint-disable @typescript-eslint/no-var-requires */

/* This script adds necessary export of ABI types for ABI library */

// const fs = require('fs')
// const path = require('path')

// const PATH_BASE = path.resolve(__dirname, '../src/lib/')
// const EXPORTED_TYPES = ['custom', 'ethflow', 'legacy', 'univ3']
// // const EXPORTED_TYPES = ['../generated/custom', '../generated/ethflow', '../generated/legacy', '../generated/univ3']

// // Write export statements
// EXPORTED_TYPES.forEach((type) => {
//   // Clear empty file to export types
//   const filePath = `${PATH_BASE}/${type}.ts`
//   fs.writeFileSync(filePath, '')

//   const exportStatement = `export * from "../generated/${type}";\n`

//   fs.appendFileSync(filePath, exportStatement)
//   console.log(`[scripts:abis-export] Successfully exported "${type}" in ${filePath}'`)
// })
