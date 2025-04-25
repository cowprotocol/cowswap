import { TokensPageComponent } from '@/components/TokensPageComponent'
import { getTokensInfo } from '../../../services/tokens'

export default async function Page() {
  const tokens = await getTokensInfo()

  return <TokensPageComponent tokens={tokens} />
}
