import { TokenWithLogo } from '@cow/modules/tokensList/state/tokensListAtom'
import { TokenInfo } from '@uniswap/token-lists'

const AUDIO_TOKEN_ADDRESS = '0x18aaa7115705e8be94bffebde57af9bfc265b998'
const AUDIO_TOKEN_DECIMALS = 18

export function fixTokenInfo(token: TokenInfo): TokenWithLogo {
  const addressLowerCase = token.address.toLowerCase()

  return new TokenWithLogo(
    token.logoURI,
    token.chainId,
    token.address,
    // Gemini list contains wrong decimals (0) for AUDIO token
    // https://www.gemini.com/uniswap/manifest.json
    addressLowerCase === AUDIO_TOKEN_ADDRESS ? AUDIO_TOKEN_DECIMALS : token.decimals,
    token.symbol,
    token.name
  )
}
