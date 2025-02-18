'use client'

import { Color } from '@cowprotocol/ui'
import { useCowAnalytics } from '@cowprotocol/analytics'
import { CowFiCategory } from 'src/common/analytics/types'

import styled from 'styled-components/macro'
import { Link } from '@/components/Link'

import { ArticleContent, ArticleMainTitle, BodyContent, Breadcrumbs, ContainerCard } from '@/styles/styled'

const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  justify-content: flex-start;
  align-items: center;
  max-width: 1000px;
  width: 100%;
  margin: 24px auto 0;
  gap: 24px;
`

export default function Page() {
  const analytics = useCowAnalytics()
  const title = 'CoW Swap Privacy policy'

  return (
    <Wrapper>
      <ContainerCard bgColor={Color.neutral100} minHeight="70vh" gap={62} gapMobile={42} centerContent touchFooter>
        <ArticleContent maxWidth="100%">
          <Breadcrumbs>
            <Link
              href="/"
              onClick={() =>
                analytics.sendEvent({
                  category: CowFiCategory.LEGAL,
                  action: 'click-legal-breadcrumbs',
                })
              }
            >
              Home
            </Link>
            <Link
              href="/legal"
              onClick={() =>
                analytics.sendEvent({
                  category: CowFiCategory.LEGAL,
                  action: 'click-legal-breadcrumbs',
                })
              }
            >
              Legal
            </Link>
            <span>{title}</span>
          </Breadcrumbs>

          <ArticleMainTitle margin={'0 0 62px'} fontSize={52}>
            {title}
          </ArticleMainTitle>

          <BodyContent>
            <p>
              <strong>Last updated: November 2022</strong>
            </p>
            <p>
              This Policy sets out what Personal Data we collect, how we process it and how long we retain it. This
              Policy applies to all of our processing activities where we act as a data controller or where we act as
              data controller on behalf of clients. In this policy, "we", "us" and "our" refers to Nomev Labs, Lda and
              affiliates. For more information about us, see the "Our Details" section at the end of this policy.
            </p>
            <p>
              In this Policy, "personal data" means any information relating to you as an identified or identifiable
              natural person ("Data Subject"); an identifiable natural person is one who can be identified, directly or
              indirectly, in particular by reference to an identifier such as a name, an online identifier or to one or
              more factors specific to your physical, physiological, genetic, mental, economic, cultural or social
              identity.
            </p>
            <p>
              In this Policy, "processing" means any operation or set of operations which is performed on personal data
              (as defined in this Privacy Policy) or on sets of personal data, whether or not by automated means, such
              as collection, recording, organisation, structuring, storage, adaptation or alteration, retrieval,
              consultation, use, disclosure by transmission, dissemination or otherwise making available, alignment or
              combination, restriction, erasure or destruction.
            </p>
            <h2 id="1-your-information-and-the-blockchain">1. Your information and the Blockchain</h2>
            <p>
              Blockchain technology, also known as distributed ledger technology (or simply 'DLT'), is at the core of
              the business of our clients. Blockchains are decentralised and made up of digitally recorded data in a
              chain of packages called 'blocks'. The manner in which these blocks are linked is chronological, meaning
              that the data is very difficult to alter once recorded. Since the ledger may be distributed all over the
              world (across several 'nodes' which usually replicate the ledger), this means there is no single person
              making decisions or otherwise administering the system (such as an operator of a cloud computing system),
              and that there is no centralised place where it is located either.
            </p>
            <p>
              Accordingly, by design, a blockchains records cannot be changed or deleted and is said to be 'immutable'.
              This may affect your ability to exercise your rights such as your right to erasure ('right to be
              forgotten'), or your rights to object or restrict processing of your personal data. Data on the blockchain
              cannot be erased and cannot be changed. Although smart contracts may be used to revoke certain access
              rights, and some content may be made invisible to others, it is not deleted.
            </p>
            <p>
              In certain circumstances, it will be necessary to write certain personal data, such as your wallet
              address, onto the blockchain; this is done through a smart contract and requires you to execute such
              transactions using your wallet's private key.
            </p>
            <p>
              In most cases ultimate decisions to (i) transact on the blockchain using your wallet address, as well as
              (ii) share the public key relating to your wallet address with anyone (including us) rests with you.
            </p>
            <p className={'warn'}>
              IF YOU WANT TO ENSURE YOUR PRIVACY RIGHTS ARE NOT AFFECTED IN ANY WAY, YOU SHOULD NOT TRANSACT ON
              BLOCKCHAINS AS CERTAIN RIGHTS MAY NOT BE FULLY AVAILABLE OR EXERCISABLE BY YOU OR US DUE TO THE
              TECHNOLOGICAL INFRASTRUCTURE OF THE BLOCKCHAIN. IN PARTICULAR THE BLOCKCHAIN IS AVAILABLE TO THE PUBLIC
              AND ANY PERSONAL DATA SHARED ON THE BLOCKCHAIN WILL BECOME PUBLICLY AVAILABLE
            </p>
            <h2 id="2-how-we-use-personal-data">2. How We Use Personal Data</h2>
            <p>
              <strong>When visiting our website or websites we host on behalf of clients</strong>
            </p>
            <p>
              We may collect and process Personal Data about your use of our website or websites we host on behalf of
              clients. This data may include:
            </p>
            <ul>
              <li>The browser types and versions used;</li>
              <li>The operating system used by the accessing system;</li>
              <li>The website from which an accessing system reaches the website (so-called referrers);</li>
              <li>Behaviour: subpage, duration, and revisit;</li>
              <li>The date and time of access to the website, The Internet protocol address ("IP address");</li>
              <li>The Internet service provider of the accessing system;</li>
              <li>Connected wallet type and wallet address;</li>
              <li>Session by device; and</li>
              <li>
                Any other similar data and information that may be used in the event of attacks on our information
                technology systems.
              </li>
            </ul>
            <p>
              This data may be processed in order to deliver the content of our website or websites we host on behalf of
              clients correctly, to optimise the content of our website or websites we host on behalf of clients to
              ensure the long-term viability of our information technology systems and website technology, and to
              provide law enforcement authorities with the information necessary for criminal prosecution in case of a
              cyber-attack. The legal basis for this processing is the legitimate business interests, namely monitoring
              and improving our website or websites we host on behalf of clients and the proper protection against
              risks.
            </p>
            <p>
              <strong>
                When using swap.cow.fi or other interfaces of a decentralised exchange protocol hosted by us on behalf
                of clients
              </strong>
            </p>
            <p>We may collect and process personal data. The data will be stored in different instances.</p>
            <ul>
              <li>
                In our Amazon Webserver we will store the following data with respect to your intent to trade:
                <ul>
                  <li>Your wallet address;</li>
                  <li>Application used to connect to the site;</li>
                  <li>Blockchain used;</li>
                  <li>Submission time and expiration time.</li>
                  <li>Type of your order (sell order of Fill &amp; Kill)</li>
                  <li>Tokens part of the swap and their amounts</li>
                  <li>Slippage tolerance, set transaction deadline and recipient's wallet address;</li>
                  <li>Fee and applicable fee discount.</li>
                  <li>
                    AppData including:
                    <ul>
                      <li>AppCode;</li>
                      <li>Environment;</li>
                      <li>Metadata: quote, slippage and referrer information.</li>
                    </ul>
                  </li>
                </ul>
              </li>
            </ul>
            <p>
              The legal basis for this processing is that it is necessary to transact according to your indicated
              preferences and to show the order details to you and the explorer.
            </p>
            <ul>
              <li>
                On the Blockchain the following data will be stored if your intent to trade is successfully included in
                a transaction:
                <ul>
                  <li>Your wallet address;</li>
                  <li>Recipient's wallet address;</li>
                  <li>Both sides of the swapped tokens;</li>
                  <li>Prices;</li>
                  <li>
                    AppData hash (hash of the IPFS content pointing to the appData submitted with the intent to trade).
                  </li>
                </ul>
              </li>
            </ul>
            <p>
              The legal basis for this processing is that it is necessary to transact successfully according to your
              wishes. The data will be stored on the Blockchain. Given the technological design of the blockchain, as
              explained above, this data will become public and it will not likely be possible to delete or change the
              data at any given time.
            </p>
            <ul>
              <li>
                Log Data
                <ul>
                  <li>Your wallet address;</li>
                  <li>The Internet protocol address ("IP address"); and</li>
                  <li>Transaction id/ Hash.</li>
                </ul>
              </li>
            </ul>
            <p>
              The legal basis for this processing is that it is necessary to transact according to your indicated
              preferences.
            </p>
            <p>
              <strong>Participating in User Experience Research</strong>
            </p>
            <p>
              When you participate in our user experience research - or user experience research we conduct on behalf of
              our clients - we may collect and process some personal data. This data may include:
            </p>
            <ul>
              <li>Your name or pseudonym;</li>
              <li>Your wallet address(es);</li>
              <li>Your email address, Telegram handle or Twitter handle;</li>
              <li>Your occupation;</li>
              <li>Range of funds you transact with regularly;</li>
              <li>Usage of tokens, blockchains, exchanges.</li>
            </ul>
            <p>
              In addition, we may take a recording of you while testing the website or website we host on behalf of our
              clients for internal use. The basis for this collection and processing is our legitimate business interest
              or that of our clients in monitoring and improving our services. You are never required to share
              information you are not comfortable sharing.
            </p>
            <p>
              The legal basis for this processing is your consent as provided before participating in user experience
              research.
            </p>
            <p>
              <strong>Participating in our Bug Bounties and Challenges or those of our clients</strong>
            </p>
            <p>
              When participating in bug bounties or challenges we may collect and process personal data. This data may
              include:
            </p>
            <ul>
              <li>Your email address;</li>
              <li>Your name;</li>
              <li>
                The data is used and processed in order to credit the participant the right payment for the reported
                bug.
              </li>
            </ul>
            <p>
              <strong>When visiting our Twitter, Medium or other social media or those of our clients</strong>
            </p>
            <p>
              We may collect and process Personal Data about your use of our Twitter, Medium or other social media. This
              data may include:
            </p>
            <ul>
              <li>Clicks on a shortened URL;</li>
              <li>A history of referral URLs for clicks of a shortened URL; and</li>
              <li>A history of IP addresses used to access a shortened URL.</li>
              <li>
                This data is collected and processed for the purposes to track the success of the marketing campaigns,
                blog posts, and other marketing material; and for user demographics in order to identify target markets.
                This data is collected and processed for the purpose of improving the content of our shared links
                pursuant to our legitimate interests (or those of our clients). When visiting the mentioned services
                different data protection regulations apply, please familiarise yourself with their Privacy Policies.
              </li>
            </ul>
            <p>
              <strong>Other uses of your Personal Data</strong>
            </p>
            <p>
              We may process any of your Personal Data where it is necessary to establish, exercise, or defend legal
              claims. The legal basis for this process is our legitimate interests, namely the protection and assertion
              of our legal rights, your legal rights and the legal rights of others, including our clients.
            </p>
            <p>
              Further, we may process your Personal data where such processing is necessary in order for us to comply
              with a legal obligation to which we are subject. The legal basis for this processing is our legitimate
              interests, namely the protection and assertion of our legal rights.
            </p>
            <h2 id="3-use-of-third-party-applications">3. Use of Third Party Applications</h2>
            <p>
              <strong>Amazon Webserver</strong>
            </p>
            <p>
              We may use the Amazon Web Server (AWS) to store log and database data. For further information and the
              applicable data protection provisions of AWS please visit{' '}
              <a href="https://aws.amazon.com/privacy/?nc1=f_pr" target="_blank" rel="nofollow noopener">
                https://aws.amazon.com/privacy/?nc1=f_pr
              </a>
            </p>
            <p>
              <strong>Blockchain</strong>
            </p>
            <p>
              Refer to the Section "Your information and the Blockchain" above. Intents to trade submitted - if
              successful - will be stored on the blockchain and will be displayed permanently and public, this is part
              of the nature of the blockchain. If you are new to this field, we highly recommend informing yourself
              about blockchain technology before using the website.
            </p>
            <p>
              <strong>Calendly</strong>
            </p>
            <p>
              We may use Calendly for scheduling. For further information and the applicable data protection provisions
              please visit{' '}
              <a href="https://calendly.com/privacy" target="_blank" rel="nofollow noopener">
                https://calendly.com/privacy
              </a>
            </p>
            <p>
              <strong>Discord</strong>
            </p>
            <p>
              We may use Discord for community management for our clients. For further information and the applicable
              data protection provisions of Discord please visit{' '}
              <a href="https://discord.com/privacy" target="_blank" rel="nofollow noopener">
                https://discord.com/privacy
              </a>
            </p>
            <p>
              <strong>Discourse</strong>
            </p>
            <p>
              We may use Discourse for discussion. For further information and the applicable data protection provisions
              of Discourse please visit{' '}
              <a href="https://www.discourse.org/privacy" target="_blank" rel="nofollow noopener">
                https://www.discourse.org/privacy
              </a>
            </p>
            <p>
              <strong>Dovetail</strong>
            </p>
            <p>
              We may use Dovetail for storing recordings and interviews as a user testing tool. For further information
              and the applicable data protection provisions please visit{' '}
              <a href="https://dovetailapp.com/help/privacy-policy/" target="_blank" rel="nofollow noopener">
                https://dovetailapp.com/help/privacy-policy/
              </a>
            </p>
            <p>
              <strong>Google Workspace</strong>
            </p>
            <p>
              We may use Google Workspace (Drive, Sheets etc.) for storing user interviews and other personal data. For
              further{' '}
              <a href="https://policies.google.com/privacy" target="_blank" rel="nofollow noopener">
                https://policies.google.com/privacy
              </a>
            </p>
            <p>
              <strong>Infura</strong>
            </p>
            <p>
              We may use Infura to easily take blockchain applications from testing to scaled deployment. For further
              information and the applicable data protection provisions of Infura{' '}
              <a href="https://consensys.net/privacy-policy/" target="_blank" rel="nofollow noopener">
                https://consensys.net/privacy-policy/
              </a>
            </p>
            <p>
              <strong>Maze</strong>
            </p>
            <p>
              We may use Maze as a user testing tool. For further information and the applicable data protection
              provisions of Maze please visit{' '}
              <a href="https://maze.co/privacy-policy/" target="_blank" rel="nofollow noopener">
                https://maze.co/privacy-policy/
              </a>
            </p>
            <p>
              <strong>Miro</strong>
            </p>
            <p>
              We may use Miro for whiteboard and other collaborative visualisation. For further information and the
              applicable data protection provisions please visit{' '}
              <a href="https://miro.com/legal/privacy-policy/" target="_blank" rel="nofollow noopener">
                https://miro.com/legal/privacy-policy/
              </a>
            </p>
            <p>
              <strong>Support Channels</strong>
            </p>
            <p>
              In order to provide user support on our behalf or on behalf of our clients, we will use different channels
              like Discord, Discourse, Github or Telegram to facilitate the resolution of any questions and concerns
              should these arise. By accepting this Privacy Policy, you are deemed to consent to providing the following
              Personal Data to persons looking to resolve any dispute:
            </p>
            <ul>
              <li>Name and surname;</li>
              <li>Detailed enquiry description;</li>
              <li>The date and time that the issue arose;</li>
              <li>The outcome sought.</li>
            </ul>
            <p>
              <strong>Transmitting Social Media Links</strong>
            </p>
            <p>
              When linking social media links, those services might also collect Personal Data. Please refer to their
              privacy policies for more information.
            </p>
            <p>
              <strong>Typeform</strong>
            </p>
            <p>
              We use typeform for the registration and submission process. Typeform allows the creation of customised
              forms for several purposes. Further information and the applicable data protection provisions of typeform
              please visit{' '}
              <a href="https://admin.typeform.com/to/dwk6gt" target="_blank" rel="nofollow noopener">
                https://admin.typeform.com/to/dwk6gt
              </a>
              . Typeform's purpose and function is further explained under the following link{' '}
              <a href="https://www.typeform.com/product/" target="_blank" rel="nofollow noopener">
                https://www.typeform.com/product/
              </a>
            </p>
            <p>
              <strong>Vercel</strong>
            </p>
            <p>
              We may use Vercel for optimising website development. For further information and the applicable data
              protection provisions of Vercel please visit{' '}
              <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="nofollow noopener">
                https://vercel.com/legal/privacy-policy
              </a>
            </p>
            <p>
              <strong>Zoom</strong>
            </p>
            <p>
              We may use Zoom for active user research interviews and taking recordings. These records may be stored on
              Zoom Cloud. For further information and the applicable data protection provisions please visit{' '}
              <a href="https://explore.zoom.us/en/privacy/" target="_blank" rel="nofollow noopener">
                https://explore.zoom.us/en/privacy/
              </a>
            </p>
            <h2 id="4-sharing-your-personal-data">4. Sharing Your Personal Data</h2>
            <p>
              We may pass your information to our clients, Business Partners, administration centres, third party
              service providers, agents, subcontractors and other associated organisations for the purposes of
              completing tasks and providing our services to you.
            </p>
            <p>
              In addition, when we use any other third-party service providers, we will disclose only the personal
              information that is necessary to deliver the service required and we will ensure that they keep your
              information secure and not use it for their own direct marketing purposes.
            </p>
            <p>
              In addition, we may transfer your personal information to a third party as part of a sale of some, or all,
              of our business and assets or as part of any business restructuring or reorganisation, or if we are under
              a duty to disclose or share your personal data in order to comply with any legal obligation. However, we
              will take steps to ensure that your privacy rights continue to be protected.
            </p>
            <h2 id="5-data-security">5. Data Security</h2>
            <p>
              We have put in place appropriate security measures to prevent your personal data from being accidentally
              lost, used or accessed in an unauthorised way, altered or disclosed. In addition, we limit access to your
              personal data to those employees (if applicable), agents, contractors and other third parties who have a
              business need to know. They will only process your personal data on our instructions and they are subject
              to a duty of confidentiality. Please note that intents to trade are publicly accessible via the
              API/Explorer, SDK and may be stored on the Blockchain as per applicable paragraphs above.
            </p>
            <p>
              We have put in place procedures to deal with any suspected personal data breach and will notify you and
              any applicable regulator of a breach where we are legally required to do so.
            </p>
            <h2 id="6-your-rights-as-a-data-subject">6. Your Rights as a Data Subject</h2>
            <p>
              You have certain rights under applicable legislation, and in particular under Regulation EU 2016/679
              (General Data Protection Regulation or 'GDPR'). We explain these below. You can find out more about the
              GDPR and your rights by accessing the European Commission's website.
            </p>
            <ul>
              <li>
                <h3 id="right-information-and-access">Right Information and access</h3>
                <p>
                  You have a right to be informed about the processing of your personal data (and if you did not give it
                  to us, information as to the source) and this Privacy Policy intends to provide the information. Of
                  course, if you have any further questions you can contact us on the below details.
                </p>
              </li>
              <li>
                <h3 id="right-to-rectification">Right to rectification</h3>
                <p>
                  You have the right to have any inaccurate personal information about you rectified and to have any
                  incomplete personal information about you completed. You may also request that we restrict the
                  processing of that information. The accuracy of your information is important to us. If you do not
                  want us to use your Personal Information in the manner set out in this Privacy Policy, or need to
                  advise us of any changes to your personal information, or would like any more information about the
                  way in which we collect and use your Personal Information, please contact us at the above details.
                </p>
              </li>
              <li>
                <h3 id="right-to-erasure-right-to-be-forgotten-">Right to erasure (right to be 'forgotten')</h3>
                <p>
                  You have the general right to request the erasure of your personal information in the following
                  circumstances:
                </p>
                <ul>
                  <li>The personal information is no longer necessary for the purpose for which it was collected;</li>
                  <li>
                    You withdraw your consent to consent-based processing and no other legal justification for
                    processing applies;
                  </li>
                  <li>You object to processing for direct marketing purposes;</li>
                  <li>We unlawfully processed your personal information; and</li>
                  <li>Erasure is required to comply with a legal obligation that applies to us.</li>
                </ul>
                <p className={'warn'}>
                  However, when interacting with the blockchain we may not be able to ensure that your personal data is
                  deleted. This is because the blockchain is a public decentralised network and blockchain technology
                  does not generally allow for data to be deleted and your right to erasure may not be able to be fully
                  enforced. In these circumstances we will only be able to ensure that all personal data that is held by
                  us is permanently deleted.
                </p>
                <p>
                  We will proceed to comply with an erasure request without delay unless continued retention is
                  necessary for:
                </p>
                <ul>
                  <li>Exercising the right of freedom of expression and information;</li>
                  <li>Complying with a legal obligation under EU or other applicable law;</li>
                  <li>The performance of a task carried out in the public interest;</li>
                  <li>
                    Archiving purposes in the public interest, scientific or historical research purposes, or
                    statistical purposes, under certain circumstances; and/or
                  </li>
                  <li>The establishment, exercise, or defence of legal claims.</li>
                </ul>
                <p>You can exercise this right at any time by contacting us on the below details.</p>
              </li>
              <li>
                <h3 id="right-to-restrict-processing-and-right-to-object-to-processing">
                  Right to restrict processing and right to object to processing
                </h3>
                <p>You have a right to restrict processing of your personal information, such as where:</p>
                <ul>
                  <li>You contest the accuracy of the personal information;</li>
                  <li>
                    Where processing is unlawful you may request, instead of requesting erasure, that we restrict the
                    use of the unlawfully processed personal information;
                  </li>
                  <li>
                    We no longer need to process your personal information but need to retain your information for the
                    establishment, exercise, or defence of legal claims.
                  </li>
                </ul>
                <p>
                  You also have the right to object to processing of your personal information under certain
                  circumstances, such as where the processing is based on your consent and you withdraw that consent.
                  This may impact the services we can provide and we will explain this to you if you decide to exercise
                  this right.
                </p>
              </li>
              <li>
                <h3 id="right-to-data-portability">Right to data portability</h3>
                <p>
                  Where the legal basis for our processing is your consent or the processing is necessary for the
                  performance of a contract to which you are party or in order to take steps at your request prior to
                  entering into a contract, you have a right to receive the personal information you provided to us in a
                  structured, commonly used and machine-readable format, or ask us to send it to another person.
                </p>
              </li>
              <li>
                <h3 id="right-to-freedom-from-automated-decision-making">
                  Right to freedom from automated decision-making
                </h3>
                <p>
                  We do not use automated decision-making, but where any automated decision-making takes place, you have
                  the right in this case to express your point of view and to contest the decision, as well as request
                  that decisions based on automated processing concerning you or significantly affecting you and based
                  on your personal data are made by natural persons, not only by computers.
                </p>
              </li>
              <li>
                <h3 id="right-to-object-to-direct-marketing-opting-out-">
                  Right to object to direct marketing ('opting out')
                </h3>
                <p>
                  You have a choice about whether or not you wish to receive information from us. We will not contact
                  you for marketing purposes unless:
                </p>
                <p>
                  You have a business relationship with us or one of our clients, and we rely on our legitimate
                  interests or that of our clients as the lawful basis for processing (as described above) you have
                  otherwise given your prior consent.
                </p>
                <p>
                  You can change your marketing preferences at any time by contacting us. On each and every marketing
                  communication, we will always provide the option for you to exercise your right to object to the
                  processing of your personal data for marketing purposes (known as 'opting-out') by clicking on the
                  'unsubscribe' button on our marketing emails or choosing a similar opt-out option on any forms we use
                  to collect your data. You may also opt-out at any time by contacting us on the below details. Please
                  note that any administrative or service-related communications (to offer our services, or notify you
                  of an update to this Privacy Policy or applicable terms of business, etc.) will solely be directed at
                  our clients or business partners, and such communications generally do not offer an option to
                  unsubscribe as they are necessary to provide the services requested. Therefore, please be aware that
                  your ability to opt-out from receiving marketing and promotional materials does not change our right
                  to contact you regarding your use of our website or websites we host on behalf of clients or as part
                  of a contractual relationship we may have with you.
                </p>
              </li>
              <li>
                <h3 id="right-to-request-access">Right to request access</h3>
                <p>
                  You also have a right to access information we hold about you. We are happy to provide you with
                  details of your Personal Information that we hold or process. To protect your personal information, we
                  follow set storage and disclosure procedures, which mean that we will require proof of identity from
                  you prior to disclosing such information. You can exercise this right at any time by contacting us on
                  the below details.
                </p>
              </li>
              <li>
                <h3 id="right-to-withdraw-consent">Right to withdraw consent</h3>
                <p>
                  Where the legal basis for processing your personal information is your consent, you have the right to
                  withdraw that consent at any time by contacting us on the below details.
                </p>
              </li>
              <li>
                <h3 id="raising-a-complaint-about-how-we-have-handled-your-personal-data">
                  Raising a complaint about how we have handled your personal data
                </h3>
                <p>
                  If you wish to raise a complaint on how we have handled your personal data, you can contact us as set
                  out below and we will then investigate the matter.
                </p>
              </li>
              <li>
                <h3 id="right-to-complain-with-a-relevant-supervisory-authority">
                  Right to complain with a relevant supervisory authority
                </h3>
                <p>
                  If we have not responded to you within a reasonable time or if you feel that your complaint has not
                  been resolved to your satisfaction, you are entitled to make a complaint to the Data Protection
                  Commissioner under the Data Protection Act. You may do so in the EU member state of your habitual
                  residence, your place of work or the place of the alleged infringement. In Portugal, the supervisory
                  authority is the:
                </p>
                <p>
                  CNPD - Comissão Nacional de Proteção de Dados
                  <br />
                  Av. D. Carlos I, 134, 1º
                  <br />
                  1200-651 Lisboa
                  <br />T (+351) 213 928 400
                  <br />F (+351) 213 976 832
                  <br />
                  <a href="mailto:geral@cnpd.pt">geral@cnpd.pt</a>
                  <br />
                  <a href="https://www.cnpd.pt/" target="_blank" rel="nofollow noopener">
                    https://www.cnpd.pt/
                  </a>
                </p>
                <p>
                  You also have the right to lodge a complaint with the supervisory authority in the country of your
                  habitual residence, place of work, or the place where you allege an infringement of one or more of our
                  rights has taken place, if that is based in the EEA.
                </p>
              </li>
            </ul>
            <h2 id="7-storing-personal-data">7. Storing Personal Data</h2>
            <p>
              We retain your information only for as long as is necessary for the purposes for which we process the
              information as set out in this policy. However, we may retain your Personal Data for a longer period of
              time where such retention is necessary for compliance with a legal obligation to which we are subject, or
              in order to protect your vital interests or the vital interests of another natural person.
            </p>
            <h2 id="8-changes-to-this-privacy-policy">8. Changes to This Privacy Policy</h2>
            <p>
              We may make changes to this Policy from time to time. Where we do so, we will notify those who have a
              business relationship with us or who are subscribed to our emailing lists directly of the changes, and
              change the 'Last updated' date above. We encourage you to review the Policy whenever you access or use our
              website or websites we host on behalf of clients to stay informed about information practices and the
              choices available to you. If you do not agree to the revised Policy, you should discontinue your use of
              this website.
            </p>
            <h2 id="9-our-details">9. Our Details</h2>
            <p>
              This website is hosted by Nomev Labs, Lda on behalf of a client. We are registered in Portugal under
              registration number PT516811924, and our registered office is located at Rua António Maria Cardoso, No 25,
              piso 4, 1200-027 Lisboa.
            </p>
            <p>
              If you have any queries concerning your rights under this Privacy Policy, please contact us at{' '}
              <a href="mailto:legal@nomev.io">legal@nomev.io</a>
            </p>
          </BodyContent>
        </ArticleContent>
      </ContainerCard>
    </Wrapper>
  )
}
