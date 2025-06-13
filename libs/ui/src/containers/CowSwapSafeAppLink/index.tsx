import { SAFE_COW_APP_LINK } from '../../consts'
import { ExternalLink } from '../ExternalLink'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function CowSwapSafeAppLink() {
  return <ExternalLink href={SAFE_COW_APP_LINK}>CoW Swap Safe App↗</ExternalLink>
}
