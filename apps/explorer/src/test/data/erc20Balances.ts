import BN from 'bn.js'
import { ZERO, ALLOWANCE_MAX_VALUE } from 'const'
import { USER_1, TOKEN_1, TOKEN_2, TOKEN_3, TOKEN_4, TOKEN_5, TOKEN_6, TOKEN_7, CONTRACT } from './basic'

export default {
  [USER_1]: {
    [TOKEN_1]: new BN('20567734622375610000'), // 20.56, WETH: decimals=18
    [TOKEN_2]: new BN('725683288'), // 725.68, USDT: decimals=6
    [TOKEN_3]: new BN('50236865434692578541'), // 50.20, TUSD: decimals=18
    [TOKEN_4]: ZERO, // USDC: decimals=6
    [TOKEN_5]: ZERO, // PAX: decimals=18
    [TOKEN_6]: new BN('2050000'), // 20,500 GUSD: decimals=2
    [TOKEN_7]: undefined, // 0, DAI: decimals=18
  },
  [CONTRACT]: {
    // Set contract tokens to max for performing mock withdraws
    [TOKEN_1]: ALLOWANCE_MAX_VALUE,
    [TOKEN_2]: ALLOWANCE_MAX_VALUE,
    [TOKEN_3]: ALLOWANCE_MAX_VALUE,
    [TOKEN_4]: ALLOWANCE_MAX_VALUE,
    [TOKEN_5]: ALLOWANCE_MAX_VALUE,
    [TOKEN_6]: ALLOWANCE_MAX_VALUE,
    [TOKEN_7]: ALLOWANCE_MAX_VALUE,
  },
}
