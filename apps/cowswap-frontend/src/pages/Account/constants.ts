export const DELEGATE_URL = (): string => {
  const url = new URL(
    'https://forum.cow.fi/t/recognised-delegates-scheme/2688#p-5670-current-list-of-recognised-delegates-2',
  )
  url.searchParams.set('utm_source', 'cowswap')
  url.searchParams.set('utm_medium', 'account_page')
  url.searchParams.set('utm_campaign', 'delegate')
  return url.toString()
}
