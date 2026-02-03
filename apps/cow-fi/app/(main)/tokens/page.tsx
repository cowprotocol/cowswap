import { getTokensInfo } from '../../../services/tokens'

import { TokensPageComponent } from '@/components/TokensPageComponent'

export default async function Page() {
  const tokens = await getTokensInfo()

  return <TokensPageComponent tokens={tokens} />
}
