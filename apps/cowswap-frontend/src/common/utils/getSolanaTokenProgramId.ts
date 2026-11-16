import { getIsToken2022 } from '@cowprotocol/common-const'

import { TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'

/**
 * Token program owning the mint's accounts, read from the list's Token-2022 flag. A mint missing from
 * the list falls back to the classic SPL Token program, as it does everywhere else.
 */
export function getSolanaTokenProgramId(token: { tags?: string[] } | undefined): PublicKey {
  return getIsToken2022(token) ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID
}
