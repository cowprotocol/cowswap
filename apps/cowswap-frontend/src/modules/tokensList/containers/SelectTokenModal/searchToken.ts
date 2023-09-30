import { TokenWithLogo } from '../../types'

export enum TokenSearchSource {
  Blockchain = 'Blockchain',
  External = 'External',
  InactiveList = 'InactiveList',
}

type TokenSearchResult = {
  source: TokenSearchSource
  tokens: TokenWithLogo[]
}

// TODO: implement search
export async function searchToken(input: string): Promise<TokenSearchResult | undefined> {
  if (input === '0x252d98fab648203aa33310721bbbddfa8f1b6587') {
    return {
      source: TokenSearchSource.Blockchain,
      tokens: [new TokenWithLogo(undefined, 5, '0x252d98fab648203aa33310721bbbddfa8f1b6587', 18, 'GSUc', 'GSU Coin')],
    }
  }

  return undefined
}
