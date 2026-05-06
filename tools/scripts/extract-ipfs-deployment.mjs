#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

const CID_REGEX = /\b(Qm[1-9A-HJ-NP-Za-km-z]{44}|bafy[a-z2-7]{20,})\b/g

export function extractIpfsCid(output) {
  return Array.from(output.matchAll(CID_REGEX)).at(-1)?.[0] ?? null
}

function main() {
  const output = readFileSync(0, 'utf8')
  const cid = extractIpfsCid(output)

  if (!cid) {
    console.error('Could not find IPFS CID in deployment output')
    process.exit(1)
  }

  console.log(cid)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
