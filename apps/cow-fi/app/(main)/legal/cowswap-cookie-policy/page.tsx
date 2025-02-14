'use client'

import { Color } from '@cowprotocol/ui'
import { useCowAnalytics } from '@cowprotocol/analytics'
import { CowFiCategory } from 'src/common/analytics/types'
import styled from 'styled-components/macro'
import { Link } from '@/components/Link'

import {
  ArticleContent,
  ArticleMainTitle,
  BodyContent,
  Breadcrumbs,
  ColorTableContainer,
  ContainerCard,
} from '@/styles/styled'

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
  const title = 'CoW Swap Cookie policy'

  return (
    <Wrapper>
      <ContainerCard bgColor={Color.neutral100} minHeight="70vh" gap={62} gapMobile={42} centerContent touchFooter>
        <ArticleContent maxWidth="100%">
          <Breadcrumbs>
            <Link
              href="/ "
              onClick={() =>
                analytics.sendEvent({
                  category: CowFiCategory.LEGAL,
                  action: 'Click Breadcrumb',
                  label: 'home',
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
                  action: 'Click Breadcrumb',
                  label: 'legal',
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
              As further described in the Privacy Policy, certain statistical information is available to us via our
              internet service provider as well as through the use of special tracking technologies. Such information
              tells us about the pages you are clicking on or the hardware you are using, but not your name, age,
              address or anything we can use to identify you personally.
            </p>
            <p>
              This Cookie Policy sets out some further detail on how and why we use these technologies on our website or
              websites we may host on behalf of clients. The terms &quot;Nomev&quot;, &quot;we&quot;, &quot;us&quot;,
              and &quot;our&quot; include Nomev Labs, Lda and affiliates. The terms "you" and "your" include our
              clients, business partners and users of this website. By using our website, you consent to storage and
              access to cookies and other technologies on your device, in accordance with this Cookie Policy.
            </p>
            <h2 id="1-what-are-cookies-">1. What are cookies?</h2>
            <p>
              Cookies are a feature of web browser software that allows web servers to recognize the computer or device
              used to access a website. A cookie is a small text file that a website saves on your computer or mobile
              device when you visit the site. It enables the website to remember your actions and preferences (such as
              login, language, font size and other display preferences) over a period of time, so you don&#39;t have to
              keep re-entering them whenever you come back to the site or browse from one page to another.
            </p>
            <h2 id="2-what-are-the-different-types-of-cookies-">2. What are the different types of cookies?</h2>
            <p>
              A cookie can be classified by its lifespan and the domain to which it belongs. By lifespan, a cookie is
              either a:
            </p>
            <ul>
              <li>session cookie which is erased when the user closes the browser; or</li>
              <li>
                persistent cookie which is saved to the hard drive and remains on the user&#39;s computer/device for a
                pre-defined period of time.
              </li>
            </ul>
            <p>As for the domain to which it belongs, cookies are either:</p>
            <ul>
              <li>
                first-party cookies which are set by the web server of the visited page and share the same domain (i.e.
                set by us); or
              </li>
              <li>third-party cookies stored by a different domain to the visited page&#39;s domain.</li>
            </ul>
            <h2 id="3-what-cookies-do-we-use-and-why-">3. What cookies do we use and why?</h2>
            <p>We list all the cookies we use on this website in the APPENDIX below.</p>
            <p>
              Cookies are also sometimes classified by reference to their purpose. We use the following cookies for the
              following purposes:
            </p>
            <ul>
              <li>
                Analytical/performance cookies: They allow us to recognize and count the number of visitors and to see
                how visitors move around our website when they are using it, as well as dates and times they visit. This
                helps us to improve the way our website works, for example, by ensuring that users are finding what they
                are looking for easily.
              </li>
              <li>
                Targeting cookies: These cookies record your visit to our website, the pages you have visited and the
                links you have followed, as well as time spent on our website, and the websites visited just before and
                just after our website. We will use this information to make our website and the advertising displayed
                on it more relevant to your interests. We may also share this information with third parties for this
                purpose.
              </li>
            </ul>
            <p>
              In general, we use cookies and other technologies (such as web server logs) on our website to enhance your
              experience and to collect information about how our website is used. This information is put together
              (&#39;aggregated&#39;) and provides general and not individually specific information. None of this
              information is therefore associated with you as an individual and the cookie-related information is not
              used to identify you personally. It is therefore anonymized and &#39;de-identified&#39;. The pattern data
              is fully under our control and these cookies are not used for any purpose other than those described here.
            </p>
            <p>
              We will retain and evaluate information on your recent visits to our website and how you move around
              different sections of our website for analytics purposes to understand how people use our website so that
              we can make it more intuitive. The information also helps us to understand which parts of this website are
              most popular and generally to assess user behaviour and characteristics to measure interest in and use of
              the various areas of our website. This then allows us to improve our website and the way we market our
              business.
            </p>
            <p>
              This information may also be used to help us to improve, administer and diagnose problems with our server
              and website. The information also helps us monitor traffic on our website so that we can manage our
              website&#39;s capacity and efficiency.
            </p>
            <h2 id="4-other-technologies">4. Other Technologies</h2>
            <p>
              We may allow others to provide analytics services and serve advertisements on our behalf. In addition to
              the uses of cookies described above, these entities may use other methods, such as the technologies
              described below, to collect information about your use of our website and other websites and online
              services.
            </p>
            <p>
              Pixels tags. Pixel tags (which are also called clear GIFs, web beacons, or pixels), are small pieces of
              code that can be embedded on websites and emails. Pixels tags may be used to learn how you interact with
              our website pages and emails, and this information helps us, and our partners provide you with a more
              tailored experience.
            </p>
            <p>
              Device Identifiers. A device identifier is a unique label that can be used to identify a mobile device.
              Device identifiers may be used to track, analyse and improve the performance of the website and ads
              delivered.
            </p>
            <h2 id="5-what-data-is-collected-by-cookies-and-other-technologies-on-our-website-">
              5. What data is collected by cookies and other technologies on our website?
            </h2>
            <p>This information may include:</p>
            <ul>
              <li>
                the IP and logical address of the server you are using (but the last digits are anonymized so we cannot
                identify you);
              </li>
              <li>the top level domain name from which you access the internet (for example .ie, .com, etc);</li>
              <li>the type of browser you are using;</li>
              <li>the date and time you access our website;</li>
              <li>the internet address linking to our website;</li>
            </ul>
            <p>This website also uses cookies to:</p>
            <ul>
              <li>remember you and your actions while navigating between pages;</li>
              <li>remember if you have agreed (or not) to our use of cookies on our website;</li>
              <li>ensure the security of the website;</li>
              <li>monitor and improve the performance of servers hosting the site;</li>
              <li>distinguish users and sessions;</li>
              <li>Improving the speed of the site when you access content repeatedly;</li>
              <li>determine new sessions and visits;</li>
              <li>show the traffic source or campaign that explains how you may have reached our website; and</li>
              <li>allow us to store any customization preferences where our website allows this</li>
            </ul>
            <p>
              We may also use other services, such as{' '}
              <a href="https://tagmanager.google.com/" target="_blank" rel="nofollow noopener">
                Google Tag Manager
              </a>{' '}
              (described below) or other third-party cookies, to assist with analysing performance on our website. As
              part of providing these services, these service providers may use cookies and the technologies described
              below to collect and store information about your device, such as time of visit, pages visited, time spent
              on each page of our website, links clicked and conversion information, IP address, browser, mobile network
              information, and type of operating system used.
            </p>
            <h2 id="6-google-tag-manager-cookies">6. Google Tag Manager Cookies</h2>
            <p>
              This website uses{' '}
              <a href="https://tagmanager.google.com/" target="_blank" rel="nofollow noopener">
                Google Tag Manager
              </a>
              , a tag management system provided by Google, Inc. (&quot;Google&quot;).
            </p>
            <p>
              We use Google Tag Manager to track your preferences and also to identify popular sections of our website.
              Use of Google Tag Manager in this way, enables us to adapt the content of our website more specifically to
              your needs and thereby improve what we can offer to you.
            </p>
            <p>
              Google will use this information for the purpose of evaluating your use of our website, compiling reports
              on website activity for website operators and providing other services relating to website activity and
              internet usage. Google may also transfer this information to third parties where required to do so by law,
              or where such third parties process the information on Google&#39;s behalf. Google will not associate your
              IP address with any other data held by Google.
            </p>
            <p>In particular Google Tag Manager tells us:</p>
            <ul>
              <li>your IP address (last 3 digits are masked);</li>
              <li>the number of pages visited;</li>
              <li>the time and duration of the visit;</li>
              <li>your location;</li>
              <li>the website you came from (if any);</li>
              <li>the type of hardware you use (i.e. whether you are browsing from a desktop or a mobile device);</li>
              <li>the software used (type of browser); and</li>
              <li>your general interaction with our website.</li>
            </ul>
            <p>
              As stated above, cookie-related information is not used to identify you personally, and what is compiled
              is only aggregate data that tells us, for example, what countries we are most popular in, but not that you
              live in a particular country or your precise location when you visited our website (this is because we
              have only half the information- we know the country the person is browsing from, but not the name of
              person who is browsing). In such an example Google will analyse the number of users for us, but the
              relevant cookies do not reveal their identities.
            </p>
            <p>
              By using this website, you consent to the processing of data about you by Google in the manner and for the
              purposes set out above. Google Tag Manager, its purpose and function is further explained on the{' '}
              <a href="https://tagmanager.google.com/" target="_blank" rel="nofollow noopener">
                Google Tag Manager website
              </a>
              .
            </p>
            <p>
              For more information about Google Tag Manager cookies, please see Google&#39;s help pages and privacy
              policy:{' '}
              <a href="https://www.google.com/intl/en/policies/privacy/" target="_blank" rel="nofollow noopener">
                Google&#39;s Privacy Policy
              </a>{' '}
              and{' '}
              <a href="https://support.google.com/tagmanager/answer/6102821" target="_blank" rel="nofollow noopener">
                Google Tag Manager Help
              </a>
              .
            </p>
            <h2 id="7-what-if-you-don-t-agree-with-us-monitoring-your-use-of-our-website-even-if-we-don-t-collect-your-personal-data-">
              7. What if you don't agree with us monitoring your use of our website (even if we don't collect your
              personal data)?
            </h2>
            <p>
              Enabling these cookies is not strictly necessary for our website to work but it will provide you with a
              better browsing experience. You can delete or block the cookies we set, but if you do that, some features
              of this website may not work as intended.
            </p>
            <p>
              Most browsers are initially set to accept cookies. If you prefer, you can set your browser to refuse
              cookies and control and/or delete cookies as you wish - for details, see{' '}
              <a href="https://www.aboutcookies.org/" target="_blank" rel="nofollow noopener">
                aboutcookies.org
              </a>
              . You can delete all cookies that are already on your device and you can set most browsers to prevent them
              from being placed. You should be aware that if you do this, you may have to manually adjust some
              preferences every time you visit an Internet site and some services and functionalities may not work if
              you do not accept the cookies they send.
            </p>
            <p>
              Advertisers and business partners that you access on or through our website may also send you cookies. We
              do not control any cookies outside of our website.
            </p>
            <p>
              If you have any further questions regarding disabling cookies you should consult with your preferred
              browser's provider or manufacturer.
            </p>
            <p>
              In order to implement your objection it may be necessary to install an opt-out cookie on your browser.
              This cookie will only indicate that you have opted out. It is important to note, that for technical
              reasons, the opt-out cookie will only affect the browser from which you actively object from. If you
              delete the cookies in your browser or use a different end device or browser, you will need to opt out
              again.
            </p>
            <p>
              To opt out of being tracked by Google Tag Manager across all websites, Google has developed the Google Tag
              Manager opt-out browser add-on. If you would like to opt out of Google Tag Manager, you have the option of
              downloading and installing this browser add-on which can be found under the link:{' '}
              <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="nofollow noopener">
                https://tools.google.com/dlpage/gaoptout
              </a>
              .
            </p>
            <h2 id="8-revisions-to-this-cookie-policy">8. Revisions to this Cookie Policy</h2>
            <p>
              We may modify this Cookie Policy from time to time. If we make changes to this Cookie Policy, we will
              provide notice of such changes, such as by sending an email notification, providing notice through our
              website or updating the 'Last Updated' date at the beginning of this Cookie Policy. The amended Cookie
              Policy will be effective immediately after the date it is posted. By continuing to access or use our
              website after the effective date, you confirm your acceptance of the revised Cookie Policy and all of the
              terms incorporated therein by reference. We encourage you to review our Privacy Policy and our Cookie
              Policy whenever you access or use our website to stay informed about our information practices and the
              choices available to you.
            </p>
            <p>
              If you do not accept changes which are made to this Cookie Policy, or take any measures described above to
              opt-out by removing or rejecting cookies, you may continue to use this website but accept that it may not
              display and/or function as intended by us. Your exercise of any rights to opt-out may also impact how our
              information and content is displayed and/or accessible to you on this website and on other websites.
            </p>
            <h2 id="appendix">APPENDIX</h2>
            <p>Table: Overview of cookies placed and the consequences if the cookies are not placed</p>
            <ColorTableContainer>
              <table>
                <thead>
                  <tr>
                    <th>Name of cookie</th>
                    <th>Purpose(s) of cookie</th>
                    <th>Storage period of cookie</th>
                    <th>Consequences if cookie is not accepted</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>__viewed_cookie_policy</td>
                    <td>
                      Cookie set by GDPR cookie consent plug-in. Cookie used to save the agreement of the use of cookies
                      from the user. No personal data will be saved.
                    </td>
                    <td>1 year from set/update</td>
                    <td>User activity won&#39;t be tracked</td>
                  </tr>
                  <tr>
                    <td>__cookielawinfo_checkbox_performance</td>
                    <td>
                      Cookie set by GDPR cookie consent plug-in. Cookie used to save the agreement of the user for
                      category "performance".
                    </td>
                    <td>1 year from set/update</td>
                    <td>User activity won&#39;t be tracked</td>
                  </tr>
                  <tr>
                    <td>__cookielawinfo_checkbox_other</td>
                    <td>
                      Cookie set by GDPR cookie consent plug-in. Cookie used to save the agreement of the user for
                      category "other".
                    </td>
                    <td>1 year from set/update</td>
                    <td>User activity won&#39;t be tracked</td>
                  </tr>
                  <tr>
                    <td>__cookielawinfo_checkbox_necessary</td>
                    <td>
                      Cookie set by GDPR cookie consent plug-in. Cookie used to save the agreement of the user for
                      category "necessary".
                    </td>
                    <td>1 year from set/update</td>
                    <td>User activity won&#39;t be tracked</td>
                  </tr>
                  <tr>
                    <td>__cookielawinfo_checkbox_functional</td>
                    <td>
                      Cookie set by GDPR cookie consent plug-in. Cookie used to save the agreement of the user for
                      category "functional".
                    </td>
                    <td>1 year from set/update</td>
                    <td>User activity won&#39;t be tracked</td>
                  </tr>
                  <tr>
                    <td>__cookielawinfo_checkbox_analytics</td>
                    <td>
                      Cookie set by GDPR cookie consent plug-in. Cookie used to save the agreement of the user for
                      category "analytics".
                    </td>
                    <td>1 year from set/update</td>
                    <td>User activity won&#39;t be tracked</td>
                  </tr>
                  <tr>
                    <td>__cookielawinfo_checkbox_advertisement</td>
                    <td>
                      Cookie set by GDPR cookie consent plug-in. Cookie used to save the agreement of the user for
                      category "advertisement".
                    </td>
                    <td>1 year from set/update</td>
                    <td>User activity won&#39;t be tracked</td>
                  </tr>
                  <tr>
                    <td>CookieLawInfoConsent</td>
                    <td>
                      Cookie set by GDPR cookie consent plug-in. Cookie used to save the agreement of the user for
                      category "LawInfoConsent".
                    </td>
                    <td>1 year from set/update</td>
                    <td>User activity won&#39;t be tracked</td>
                  </tr>
                </tbody>
              </table>
            </ColorTableContainer>
          </BodyContent>
        </ArticleContent>
      </ContainerCard>
    </Wrapper>
  )
}
