import { TokenWarning } from '@cowprotocol/tokens'

import { plural } from '@lingui/core/macro'

/**
 * "4 risks · 1 serious", or "2 risks to check" when nothing is serious.
 *
 * Each form is one whole message rather than a count joined to a sentence, so a translator sees
 * the sentence a reader sees.
 */
export function getRiskCountSummary(warnings: TokenWarning[]): string {
  const total = warnings.length
  const serious = warnings.filter((warning) => warning.tier === 'serious').length

  if (!serious) {
    return plural(total, {
      one: '# risk to check',
      few: '# risks to check',
      many: '# risks to check',
      other: '# risks to check',
    })
  }

  return plural(total, {
    one: `# risk · ${serious} serious`,
    few: `# risks · ${serious} serious`,
    many: `# risks · ${serious} serious`,
    other: `# risks · ${serious} serious`,
  })
}
