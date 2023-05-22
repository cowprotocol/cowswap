import { default as ZengoImage } from 'modules/wallet/api/assets/zengo.svg'
import { ExternalLink } from 'legacy/theme'
import { Trans } from '@lingui/macro'
import * as styled from './styled'

const GET_ZENGO_LINK = 'https://zengo.com/'
const HOW_TO_USE_ZENGO = 'https://help.zengo.com/en/collections/1646183-how-to-guides'

export function ZengoBanner() {
  return (
    <styled.Wrapper>
      <styled.Icon>
        <img src={ZengoImage} alt="" />
      </styled.Icon>

      <styled.Content>
        <h4>
          <Trans>Need a crypto wallet?</Trans>
        </h4>
        <p>
          <Trans>Download ZenGo: The most secure crypto wallet.</Trans>
        </p>
      </styled.Content>

      <styled.Actions>
        <styled.GetZengoButton>
          <ExternalLink target="_blank" href={GET_ZENGO_LINK}>
            <Trans>Get ZenGo</Trans>
          </ExternalLink>
        </styled.GetZengoButton>

        <styled.HowToUse target="_blank" href={HOW_TO_USE_ZENGO}>
          <Trans>How to use ZenGo</Trans>
        </styled.HowToUse>
      </styled.Actions>
    </styled.Wrapper>
  )
}
