const LEGACY_STATE_PREFIX = 'legacy/state'
const DOMAIN_HOOK_IMPORT_LIMIT = 3
const HIGH_MOCK_LIMIT = 3

const SNAPSHOT_KEYS = ['legacyStateImportBindings', 'hookOrchestration', 'highMockRenderTests', 'atomAliasHooks']

const ATOM_READ_CALL = String.raw`use(?:AtomValue|SetAtom|Atom)\(\s*[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)?\s*(?:as\s+[^()]*)?\)`
const ATOM_READ_TAIL = String.raw`\s*!?\s*(?:as\s+[^;]+)?\s*;?`
const ATOM_ALIAS_RETURN = new RegExp(String.raw`^return\s+${ATOM_READ_CALL}${ATOM_READ_TAIL}$`)
const ATOM_ALIAS_EXPR = new RegExp(String.raw`^${ATOM_READ_CALL}${ATOM_READ_TAIL}$`)
const ATOM_ALIAS_TEMP = new RegExp(
  String.raw`^const\s+[A-Za-z_$][\w$]*\s*(?::\s*[^;=]+)?=\s*${ATOM_READ_CALL}${ATOM_READ_TAIL}\s*return\s+[A-Za-z_$][\w$]*\s*;?$`,
)

const FROM_CLAUSE_RE =
  /\b(import|export)\s+type\s+([\s\S]*?)\s+from\s+['"]([^'"]+)['"]|\b(import|export)\s+([\s\S]*?)\s+from\s+['"]([^'"]+)['"]/g

const DYNAMIC_LEGACY_STATE_RE = /import\s*\(\s*['"](legacy\/state(?:\/[^'"]*)?)['"]\s*\)/g

export function stripComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:\\])\/\/.*$/gm, '$1')
}

export function isLegacyStateSource(source) {
  return source === LEGACY_STATE_PREFIX || source.startsWith(`${LEGACY_STATE_PREFIX}/`)
}

export function isExcludedHookSource(source) {
  if (source === 'react' || source.startsWith('react/')) return true
  if (source === 'react-dom' || source.startsWith('react-dom/')) return true
  if (source === 'react-redux') return true
  if (source === 'react-router' || source.startsWith('react-router/')) return true
  if (source === 'react-router-dom') return true
  if (source === 'jotai' || source.startsWith('jotai/') || source.startsWith('jotai-')) return true
  if (source === 'swr' || source.startsWith('swr/')) return true
  if (source.startsWith('@lingui/')) return true
  if (source.startsWith('@testing-library/')) return true
  if (source === 'styled-components' || source.startsWith('styled-components/')) return true
  return false
}

export function parseFromClauses(source) {
  const clauses = []
  const re = new RegExp(FROM_CLAUSE_RE.source, 'g')
  let match = re.exec(source)

  while (match) {
    const isTypeForm = Boolean(match[1])
    clauses.push({
      kind: isTypeForm ? match[1] : match[4],
      clause: isTypeForm ? match[2] : match[5],
      source: isTypeForm ? match[3] : match[6],
    })
    match = re.exec(source)
  }

  return clauses
}

export function countBindings(clause) {
  const namedMatch = clause.match(/\{([^}]*)\}/)
  let count = 0

  if (namedMatch) {
    const parts = namedMatch[1]
      .split(',')
      .map((part) => part.trim())
      .filter((part) => part.length > 0)
    count += parts.length
  }

  const side = clause
    .replace(/\{[^}]*\}/g, ' ')
    .replace(/^type\s+/, '')
    .replace(/,/g, ' ')
    .trim()

  if (side.length > 0) count += 1

  return count
}

export function domainHookLocals(clause) {
  const locals = []
  const namedMatch = clause.match(/\{([^}]*)\}/)

  if (namedMatch) {
    for (const part of namedMatch[1].split(',')) {
      const local = localBindingName(part)
      if (local && /^use[A-Z]/.test(local)) locals.push(local)
    }
  }

  const side = clause
    .replace(/\{[^}]*\}/g, ' ')
    .replace(/^type\s+/, '')
    .replace(/,/g, ' ')
    .trim()
  const defaultMatch = side.match(/^([A-Za-z_$][\w$]*)/)
  if (defaultMatch && /^use[A-Z]/.test(defaultMatch[1]) && defaultMatch[1] !== 'type') {
    locals.push(defaultMatch[1])
  }

  return locals
}

export function analyzeFile(relPath, source) {
  const normalizedPath = relPath.split('\\').join('/')
  const stripped = stripComments(source)
  const clauses = parseFromClauses(stripped)

  return {
    legacyStateImportBindings: countLegacyStateBindings(stripped, clauses),
    hookOrchestration: countHookOrchestration(normalizedPath, stripped, clauses),
    highMockRenderTests: countHighMockRenderTest(normalizedPath, stripped, clauses),
    atomAliasHooks: countAtomAliasHooks(normalizedPath, stripped),
  }
}

export function collectFromSources(files) {
  const snapshot = emptySnapshot()

  for (const file of files) {
    const result = analyzeFile(file.relPath, file.source)
    if (result.legacyStateImportBindings > 0) {
      snapshot.legacyStateImportBindings[file.relPath] = result.legacyStateImportBindings
    }
    if (result.hookOrchestration !== null) {
      snapshot.hookOrchestration[file.relPath] = result.hookOrchestration
    }
    if (result.highMockRenderTests !== null) {
      snapshot.highMockRenderTests[file.relPath] = result.highMockRenderTests
    }
    if (result.atomAliasHooks > 0) {
      snapshot.atomAliasHooks[file.relPath] = result.atomAliasHooks
    }
  }

  return sortSnapshot(snapshot)
}

export function sortSnapshot(snapshot) {
  return {
    legacyStateImportBindings: sortRecord(snapshot.legacyStateImportBindings),
    hookOrchestration: sortRecord(snapshot.hookOrchestration),
    highMockRenderTests: sortRecord(snapshot.highMockRenderTests),
    atomAliasHooks: sortRecord(snapshot.atomAliasHooks),
  }
}

export function emptySnapshot() {
  return {
    legacyStateImportBindings: {},
    hookOrchestration: {},
    highMockRenderTests: {},
    atomAliasHooks: {},
  }
}

export function diffBaseline(current, baseline) {
  const errors = []
  const base = normalizeBaseline(baseline)

  compareMap(errors, current.legacyStateImportBindings, base.legacyStateImportBindings, legacyStateMessage)
  compareMap(errors, current.hookOrchestration, base.hookOrchestration, hookOrchestrationMessage)
  compareMap(errors, current.highMockRenderTests, base.highMockRenderTests, highMockMessage)
  compareMap(errors, current.atomAliasHooks, base.atomAliasHooks, atomAliasMessage)

  return errors
}

function countLegacyStateBindings(source, clauses) {
  let count = 0

  for (const entry of clauses) {
    if (!isLegacyStateSource(entry.source)) continue
    count += Math.max(countBindings(entry.clause), 1)
  }

  const dynamicRe = new RegExp(DYNAMIC_LEGACY_STATE_RE.source, 'g')
  while (dynamicRe.exec(source)) count += 1

  return count
}

function countHookOrchestration(relPath, source, clauses) {
  if (!isDomainHookFile(relPath)) return null
  if (!/\buse(?:Memo|Callback|Effect|LayoutEffect)\b/.test(source)) return null

  let count = 0
  for (const entry of clauses) {
    if (entry.kind !== 'import') continue
    if (isExcludedHookSource(entry.source)) continue
    count += domainHookLocals(entry.clause).length
  }

  return count >= DOMAIN_HOOK_IMPORT_LIMIT ? count : null
}

function countHighMockRenderTest(relPath, source, clauses) {
  if (!isUnitTestFile(relPath)) return null
  if (!importsRenderApi(clauses)) return null

  const mockCount = (source.match(/\bjest\.mock\s*\(/g) || []).length
  return mockCount > HIGH_MOCK_LIMIT ? mockCount : null
}

function importsRenderApi(clauses) {
  for (const entry of clauses) {
    if (entry.kind !== 'import' || entry.source !== '@testing-library/react') continue
    if (/\*\s+as\s+[A-Za-z_$][\w$]*/.test(entry.clause)) return true
    if (/\brenderHook\b/.test(entry.clause) || /\brender\b/.test(entry.clause)) return true
  }
  return false
}

function isDomainHookFile(relPath) {
  if (!/^apps\/cowswap-frontend\/src\/(modules|entities|common)\//.test(relPath)) return false
  if (!/\/hooks\//.test(relPath)) return false
  if (/\.test\.tsx?$/.test(relPath)) return false
  if (/\.d\.ts$/.test(relPath)) return false
  return /\.tsx?$/.test(relPath)
}

function isUnitTestFile(relPath) {
  return /^apps\/cowswap-frontend\/src\/.+\.test\.tsx?$/.test(relPath)
}

function countAtomAliasHooks(relPath, source) {
  if (isUnitTestFile(relPath)) return 0

  let count = 0
  const functionRe = /\bfunction\s+use[A-Z]\w*\b/g
  let match = functionRe.exec(source)
  while (match) {
    const body = extractFunctionBody(source, functionRe.lastIndex)
    if (body !== null && isAtomAliasBody(body)) count += 1
    match = functionRe.exec(source)
  }

  const constRe = /\bconst\s+use[A-Z]\w*\b/g
  match = constRe.exec(source)
  while (match) {
    const body = extractArrowBody(source, constRe.lastIndex)
    if (body !== null && isAtomAliasBody(body)) count += 1
    match = constRe.exec(source)
  }

  return count
}

function isAtomAliasBody(body) {
  const compact = body.replace(/\s+/g, ' ').trim()
  return ATOM_ALIAS_RETURN.test(compact) || ATOM_ALIAS_EXPR.test(compact) || ATOM_ALIAS_TEMP.test(compact)
}

function extractFunctionBody(source, from) {
  const parenStart = source.indexOf('(', from)
  if (parenStart < 0) return null
  const parenEnd = matchingCloser(source, parenStart, '(', ')')
  if (parenEnd < 0) return null
  return findImplementationBrace(source, parenEnd + 1)
}

function findImplementationBrace(source, from) {
  let i = from
  while (i < source.length) {
    const ch = source[i]
    if (ch === '"' || ch === "'" || ch === '`') {
      i = skipString(source, i) + 1
      continue
    }
    if (ch === '(' || ch === '<' || ch === '[') {
      const close = ch === '(' ? ')' : ch === '<' ? '>' : ']'
      const end = matchingCloser(source, i, ch, close)
      if (end < 0) return null
      i = end + 1
      continue
    }
    if (ch === '{') {
      const end = matchingCloser(source, i, '{', '}')
      if (end < 0) return null
      const inner = source.slice(i + 1, end)
      if (/\breturn\b/.test(inner) || /\buse(?:AtomValue|SetAtom|Atom)\b/.test(inner)) return inner
      i = end + 1
      continue
    }
    if (ch === ';') return null
    i += 1
  }
  return null
}

function extractArrowBody(source, from) {
  const eq = findTopLevelEquals(source, from)
  if (eq < 0) return null

  let i = eq + 1
  while (i < source.length && /\s/.test(source[i])) i += 1
  if (source.startsWith('async', i) && /\s/.test(source[i + 5] ?? '')) {
    i += 5
    while (i < source.length && /\s/.test(source[i])) i += 1
  }
  if (source.startsWith('function', i)) return extractFunctionBody(source, i + 'function'.length)
  if (source[i] === '<') {
    const end = matchingCloser(source, i, '<', '>')
    if (end < 0) return null
    i = end + 1
    while (i < source.length && /\s/.test(source[i])) i += 1
  }
  if (source[i] !== '(') return null

  const parenEnd = matchingCloser(source, i, '(', ')')
  if (parenEnd < 0) return null
  const arrow = findArrow(source, parenEnd + 1)
  if (arrow < 0) return null

  i = arrow + 2
  while (i < source.length && /\s/.test(source[i])) i += 1
  if (source[i] === '{') {
    const end = matchingCloser(source, i, '{', '}')
    if (end < 0) return null
    return source.slice(i + 1, end)
  }

  return source.slice(i, findExpressionEnd(source, i))
}

function findTopLevelEquals(source, from) {
  let angle = 0
  let paren = 0
  let brace = 0
  let bracket = 0

  for (let i = from; i < source.length; i++) {
    const ch = source[i]
    if (ch === '"' || ch === "'" || ch === '`') {
      i = skipString(source, i)
      continue
    }
    if (ch === '<') angle += 1
    else if (ch === '>') {
      if (source[i - 1] !== '=') angle = Math.max(0, angle - 1)
    } else if (ch === '(') paren += 1
    else if (ch === ')') paren = Math.max(0, paren - 1)
    else if (ch === '{') brace += 1
    else if (ch === '}') brace = Math.max(0, brace - 1)
    else if (ch === '[') bracket += 1
    else if (ch === ']') bracket = Math.max(0, bracket - 1)
    else if (isAssignmentEquals(source, i) && angle === 0 && paren === 0 && brace === 0 && bracket === 0) return i
    else if (ch === ';' && angle === 0 && paren === 0 && brace === 0 && bracket === 0) return -1
  }

  return -1
}

function findArrow(source, from) {
  let angle = 0
  let paren = 0
  let brace = 0
  let bracket = 0

  for (let i = from; i < source.length; i++) {
    const ch = source[i]
    if (ch === '"' || ch === "'" || ch === '`') {
      i = skipString(source, i)
      continue
    }
    if (ch === '(') paren += 1
    else if (ch === ')') paren = Math.max(0, paren - 1)
    else if (ch === '<') angle += 1
    else if (ch === '>') {
      if (source[i - 1] !== '=') angle = Math.max(0, angle - 1)
    } else if (ch === '{') brace += 1
    else if (ch === '}') brace = Math.max(0, brace - 1)
    else if (ch === '[') bracket += 1
    else if (ch === ']') bracket = Math.max(0, bracket - 1)
    else if (ch === '=' && source[i + 1] === '>' && angle === 0 && paren === 0 && brace === 0 && bracket === 0) return i
    else if (ch === ';' && angle === 0 && paren === 0 && brace === 0 && bracket === 0) return -1
  }

  return -1
}

function findExpressionEnd(source, start) {
  let paren = 0
  let bracket = 0
  let brace = 0

  for (let i = start; i < source.length; i++) {
    const ch = source[i]
    if (ch === '"' || ch === "'" || ch === '`') {
      i = skipString(source, i)
      continue
    }
    if (ch === '(') paren += 1
    else if (ch === ')') {
      if (paren === 0) return i
      paren -= 1
    } else if (ch === '[') bracket += 1
    else if (ch === ']') {
      if (bracket === 0) return i
      bracket -= 1
    } else if (ch === '{') brace += 1
    else if (ch === '}') {
      if (brace === 0) return i
      brace -= 1
    } else if ((ch === ';' || ch === '\n' || ch === ',') && paren === 0 && bracket === 0 && brace === 0) return i
  }

  return source.length
}

function isAssignmentEquals(source, index) {
  const ch = source[index]
  if (ch !== '=') return false
  const prev = source[index - 1]
  const next = source[index + 1]
  return next !== '=' && next !== '>' && prev !== '=' && prev !== '!' && prev !== '<' && prev !== '>'
}

function matchingCloser(source, openIndex, open, close) {
  let depth = 0
  for (let i = openIndex; i < source.length; i++) {
    const ch = source[i]
    if (ch === '"' || ch === "'" || ch === '`') {
      i = skipString(source, i)
      continue
    }
    if (ch === open) depth += 1
    else if (ch === close) {
      if (close === '>' && source[i - 1] === '=') continue
      depth -= 1
      if (depth === 0) return i
    }
  }
  return -1
}

function skipString(source, start) {
  const quote = source[start]
  for (let i = start + 1; i < source.length; i++) {
    if (source[i] === '\\') {
      i += 1
      continue
    }
    if (quote === '`' && source[i] === '$' && source[i + 1] === '{') {
      const end = matchingCloser(source, i + 1, '{', '}')
      if (end < 0) return source.length - 1
      i = end
      continue
    }
    if (source[i] === quote) return i
  }
  return source.length - 1
}

function localBindingName(part) {
  const cleaned = part.trim().replace(/^type\s+/, '')
  if (!cleaned) return null

  const asMatch = cleaned.match(/\bas\s+([A-Za-z_$][\w$]*)\s*$/)
  if (asMatch) return asMatch[1]

  const idMatch = cleaned.match(/^([A-Za-z_$][\w$]*)/)
  return idMatch ? idMatch[1] : null
}

function compareMap(errors, current, baseline, messageFor) {
  const files = Object.keys(current).sort((a, b) => a.localeCompare(b))

  for (const file of files) {
    const count = current[file]
    const previous = baseline[file]
    if (previous === undefined) {
      errors.push(messageFor('new', file, count))
    } else if (count > previous) {
      errors.push(messageFor('increased', file, count, previous))
    }
  }
}

function legacyStateMessage(kind, file, count, previous) {
  const change =
    kind === 'new'
      ? `New legacy/state import in ${file} (${count} bindings).`
      : `legacy/state imports in ${file} grew from ${previous} to ${count} bindings.`
  return `${change} Do not add Redux store dependencies. Read or write a Jotai atom, or extend an existing pure helper.`
}

function hookOrchestrationMessage(kind, file, count, previous) {
  const change =
    kind === 'new'
      ? `${file} orchestrates ${count} domain hooks with useMemo/useCallback/useEffect.`
      : `${file} domain-hook imports grew from ${previous} to ${count}.`
  return `${change} Move the derivation into a Jotai atom under state/ or a pure function under utils/.`
}

function highMockMessage(kind, file, count, previous) {
  const change =
    kind === 'new'
      ? `${file} has ${count} jest.mock() calls plus render/renderHook.`
      : `${file} jest.mock() calls grew from ${previous} to ${count} alongside render/renderHook.`
  return `${change} Test the pure function or atom with createStore() in a .test.ts file. render/renderHook is for a complex stateful container or a browser-only hook.`
}

function atomAliasMessage(kind, file, count, previous) {
  const change =
    kind === 'new'
      ? `${file} adds ${count} hook${count === 1 ? '' : 's'} that only forward useAtomValue, useSetAtom, or useAtom.`
      : `${file} atom-alias hooks grew from ${previous} to ${count}.`
  return `${change} Call useAtomValue, useSetAtom, or useAtom on the atom at the component.`
}

function normalizeBaseline(baseline) {
  const normalized = emptySnapshot()
  if (!baseline || typeof baseline !== 'object') return normalized

  for (const key of SNAPSHOT_KEYS) {
    const value = baseline[key]
    if (!value || typeof value !== 'object' || Array.isArray(value)) continue
    normalized[key] = value
  }

  return normalized
}

function sortRecord(record) {
  return Object.fromEntries(Object.entries(record).sort(([a], [b]) => a.localeCompare(b)))
}
