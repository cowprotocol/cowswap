import Page, { Content, Title } from 'components/Page'
import { LinkScrollable } from 'components/Link'
import { TocSection } from '.'
import { BackButton } from '.'

export default function Toc(props: { toc: TocSection[]; name: string }) {
  const { toc, name } = props
  return (
    <Page>
      <BackButton />
      <Title id="cowswap-faq">{name}</Title>
      <Content>
        {toc.map(({ section, items }) => (
          <div key={section.id}>
            <LinkScrollable href={'#' + section.id}>{section.label}</LinkScrollable>
            <ul>
              {items.map((tocItem) => (
                <li key={tocItem.id}>
                  <LinkScrollable href={'#' + tocItem.id}>{tocItem.label}</LinkScrollable>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Content>
    </Page>
  )
}
