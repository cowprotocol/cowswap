import { CowSwapTheme } from '@cowprotocol/widget-lib'

export const AMOUNTS_FORMATTING_FEATURE_FLAG = 'highlight-amounts-formatting'
export const SAFE_COW_APP_LINK = 'https://app.safe.global/share/safe-app?appUrl=https%3A%2F%2Fswap.cow.fi&chain=eth'
export const LINK_GUIDE_ADD_CUSTOM_TOKEN = 'https://blog.cow.fi/how-to-add-custom-tokens-on-cow-swap-a72d677c78c0'
export const MY_ORDERS_ID = 'my-orders'

export const Font = {
  family: 'Studio Feixen Sans VF, sans-serif',
  weight: {
    light: 300,
    regular: 400,
    medium: 500,
    bold: 700,
  },
}

export const Color = (theme: CowSwapTheme) => ({
  neutral100: theme === 'dark' ? '#FFFFFF' : '#FFFFFF',
  neutral98: '#FFF8F7',
  neutral95: '#FFEDEC',
  neutral90: '#F0DEDE',
  neutral80: '#D4C3C2',
  neutral70: '#B8A7A7',
  neutral60: '#9C8D8D',
  neutral50: '#827474',
  neutral40: '#685B5B',
  neutral30: '#504444',
  neutral20: '#382E2E',
  neutral10: '#23191A',
  neutral0: '#000000',
})
