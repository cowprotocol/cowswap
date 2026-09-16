import { readFileSync } from 'node:fs'
import path from 'node:path'

const FIXTURES_DIR = path.join(__dirname, 'fixtures')

export function loadFixture(name: string): unknown {
  return JSON.parse(readFileSync(path.join(FIXTURES_DIR, name), 'utf8')) as unknown
}
