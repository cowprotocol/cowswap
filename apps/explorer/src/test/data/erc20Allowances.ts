import { ZERO, ALLOWANCE_MAX_VALUE } from 'const'
import { USER_1, TOKEN_1, CONTRACT, TOKEN_2, TOKEN_3, TOKEN_4, TOKEN_5, TOKEN_6, TOKEN_7 } from './basic'
import BN from 'bn.js'

export default {
  [USER_1]: {
    [TOKEN_1]: {
      [CONTRACT]: ZERO, // 0, WETH: decimals=18
    },
    [TOKEN_2]: {
      [CONTRACT]: new BN('500000'), // 0.5, USDT: decimals=6
    },
    [TOKEN_3]: {
      [CONTRACT]: ALLOWANCE_MAX_VALUE, // MAX, TUSD: decimals=18
    },
    [TOKEN_4]: {
      [CONTRACT]: new BN('1000000'), // 1, USDC: decimals=6
    },
    [TOKEN_5]: {
      [CONTRACT]: new BN('1000000000000000000'), // 1, PAX: decimals=18
    },
    [TOKEN_6]: {
      [CONTRACT]: ALLOWANCE_MAX_VALUE, // MAX, GUSD: decimals=2
    },
    [TOKEN_7]: {
      [CONTRACT]: ZERO, // 0, DAI: decimals=18
    },
  },
}
