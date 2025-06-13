import { Content, Page, Title, SectionTitle } from '.'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function Custom() {
  return (
    <Page>
      <Content>
        <Title>This the component Title</Title>
        <SectionTitle>This is the component SectionTitle</SectionTitle>
        <h2>This is an H2</h2>
        <h3>This is an H3</h3>
        <p>This is the first paragraph.</p>
        <p>
          This is the second. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
          ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore
          eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
          mollit anim id est laborum.
        </p>
      </Content>
    </Page>
  )
}

export default Custom
