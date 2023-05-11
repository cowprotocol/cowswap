import { Page, Content } from '@cow/modules/application/pure/Page'

import { Wrapper } from './styled'
import { Footer } from '.'
import { useToC } from './hooks'
import ToC from './ToC'
import { FaqMenu } from './Menu'
import { PageTitle } from '@cow/modules/application/containers/PageTitle'

// AmplitudeAnalytics
import { PageName } from 'components/AmplitudeAnalytics/constants'
import { Trace } from 'components/AmplitudeAnalytics/Trace'

const { default: query } = require('static-source-data/query')

export default function ProtocolFaq() {
  const { toc, faqRef } = useToC()

  return (
    <Trace page={PageName.FAQ_PROTOCOL_PAGE} shouldLogImpression>
      <Wrapper ref={faqRef}>
        <PageTitle title="Protocol FAQ" />
        <FaqMenu />
        <Page>
          <ToC toc={toc} name="Protocol FAQ" />
          <Content>
            {query('test').data.faqs.data[0].attributes.categories.data[1].attributes.Questions.data.map(
              ({ attributes }: { attributes: any }) => {
                return (
                  <div>
                    <h1>{attributes.Title}</h1>
                    <div dangerouslySetInnerHTML={{ __html: attributes.Answer }} />
                  </div>
                )
              }
            )}
            <Footer />
          </Content>
        </Page>
      </Wrapper>
    </Trace>
  )
}
