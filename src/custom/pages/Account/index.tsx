import { Content } from 'components/Page'
import { Wrapper, AccountPageWrapper } from './styled'
import { AccountMenu } from './Menu'

export default function Account() {
  return (
    <Wrapper>
      <AccountMenu />
      <AccountPageWrapper>
        <Content>
          <h2 id="general">General</h2>

          <h3>Subtitle</h3>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Culpa consequuntur, nam modi perferendis dicta
            nobis suscipit molestiae voluptatum quaerat, aliquam expedita aspernatur commodi inventore eos error?
            Exercitationem non similique aperiam a facere, porro nam magni officia et praesentium, quisquam neque
            placeat hic fugit fuga nisi sapiente cupiditate, quo sed architecto.
          </p>

          <h3>Subtitle</h3>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Culpa consequuntur, nam modi perferendis dicta
            nobis suscipit molestiae voluptatum quaerat, aliquam expedita aspernatur commodi inventore eos error?
            Exercitationem non similique aperiam a facere, porro nam magni officia et praesentium, quisquam neque
            placeat hic fugit fuga nisi sapiente cupiditate, quo sed architecto.
          </p>
        </Content>
      </AccountPageWrapper>
    </Wrapper>
  )
}
