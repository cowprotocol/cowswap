export const DELEGATE_URL = (): string => {
  const url = new URL('https://cow.fi/learn/cow-dao-launches-delegate-program-for-token-holders')
  url.searchParams.set('utm_source', 'cowswap')
  url.searchParams.set('utm_medium', 'account_page')
  url.searchParams.set('utm_campaign', 'delegate')
  return url.toString()
}
