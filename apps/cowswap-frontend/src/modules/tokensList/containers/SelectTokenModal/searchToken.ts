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
  if (input === 'cDAI') {
    return {
      source: TokenSearchSource.InactiveList,
      tokens: [
        new TokenWithLogo(undefined, 5, '0x822397d9a55d0fefd20F5c4bCaB33C5F65bd28Eb', 6, 'cDAI', 'Compound DAI'),
      ],
    }
  }
  if (input === 'Coo') {
    return {
      source: TokenSearchSource.External,
      tokens: [
        new TokenWithLogo(
          'https://etherscan.io/token/images/indexcoop_new_32.png',
          5,
          '0x0954906da0Bf32d5479e25f46056d22f08464cab',
          18,
          'INDEX',
          'Index DAI'
        ),
        new TokenWithLogo(
          'https://etherscan.io/token/images/ETH2x-FLI_32.png',
          5,
          '0xAa6E8127831c9DE45ae56bB1b0d4D4Da6e5665BD',
          18,
          'ETH2x-FLI',
          'ETH 2x Flexible Leverage Index'
        ),
      ],
    }
  }

  return undefined
}
