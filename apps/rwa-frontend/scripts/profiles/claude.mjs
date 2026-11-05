import { findDescriptionIssue } from './description.mjs'
import { fetchWithRetry } from './http.mjs'
import { isValidSector, SECTOR_SEPARATOR, SECTORS } from './sectors.mjs'

const MESSAGES_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-5-5'
const MAX_TOKENS = 400
const RETRY_DELAYS_MS = [2000, 4000, 8000]
const MAX_SENTENCES = 2
const ABBREVIATIONS = ['Inc.', 'Corp.', 'Co.', 'Ltd.', 'S.A.', 'N.V.', 'U.S.', 'U.K.', 'plc.', 'L.P.']

export function buildProfilePrompt({ ticker, title, type, sourceText, industry }) {
  const kind = type === 'index' ? 'exchange-traded fund' : 'company'
  const lines = [
    `Write a short profile of the ${kind} behind the US-listed asset "${title}" (ticker ${ticker}) for a trading app.`,
    '',
    'Rules:',
    `- "description": one or two factual sentences about what the ${kind} does. No figures: no numbers, dates, years, percentages, amounts, rankings or employee counts. Plain, neutral tone, no marketing words.`,
    `- "sector": one of these sectors, then "${SECTOR_SEPARATOR}", then a short industry in title case: ${SECTORS.join(', ')}. Use "ETF" for funds and a GICS sector otherwise. Example: "Information Technology${SECTOR_SEPARATOR}Semiconductors", "ETF${SECTOR_SEPARATOR}US Large Cap".`,
  ]

  if (sourceText) {
    lines.push(
      '- Base the profile on the source text below. Reword it in your own words: do not copy its sentences.',
      `- The source industry label is a hint only and can be wrong: "${industry ?? 'none'}".`,
      `- If the source text is not about "${title}", answer {"skip": true}.`,
      '',
      'Source text:',
      sourceText,
    )
  } else {
    lines.push(
      `- If you are not confident you know this exact ${kind} and what it does, answer {"skip": true}. Never guess.`,
    )
  }

  lines.push('', 'Answer with JSON only: {"description": "...", "sector": "..."} or {"skip": true}.')

  return lines.join('\n')
}

/** A profile that passes the description and sector rules, `null` otherwise (including `{"skip": true}`) */
export function parseProfileResponse(text, title) {
  const json = text.match(/\{[\s\S]*\}/)?.[0]
  if (!json) return null

  let parsed
  try {
    parsed = JSON.parse(json)
  } catch {
    return null
  }

  const description = typeof parsed.description === 'string' ? parsed.description.trim() : ''
  const sector = typeof parsed.sector === 'string' ? parsed.sector.trim() : ''

  if (parsed.skip || !description || !sector || !isValidSector(sector)) return null
  if (hasFigures(description, title) || countSentences(description) > MAX_SENTENCES) return null
  if (findDescriptionIssue(description, title)) return null

  return { description, sector }
}

export async function requestProfile(prompt, apiKey) {
  const response = await fetchWithRetry(
    MESSAGES_URL,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        thinking: { type: 'between_tools' },
        messages: [{ role: 'user', content: prompt }],
      }),
    },
    RETRY_DELAYS_MS,
  )
  if (!response.ok) throw new Error(`Claude: HTTP ${response.status} ${await response.text()}`)

  const { content } = await response.json()

  return content.find((block) => block.type === 'text')?.text ?? ''
}

function hasFigures(description, title) {
  const withoutTitle = description.split(title).join('')

  return /\d/.test(withoutTitle)
}

function countSentences(description) {
  const withoutAbbreviations = ABBREVIATIONS.reduce(
    (text, abbreviation) => text.split(abbreviation).join('_'),
    description,
  )

  return withoutAbbreviations.split(/[.!?](?:\s|$)/).filter((sentence) => sentence.trim()).length
}
