import { ArticleShell } from "@/components/sections/article-shell";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "What Loan Calculator Pro collects, what it deliberately does not collect, how Google AdSense fits in, and your rights under India's DPDP Act and the GDPR.",
  path: "/privacy-policy",
  keywords: ["privacy policy", "data protection", "DPDP Act", "cookie policy"],
});

/**
 * NOTE FOR THE OPERATOR
 * This is a solid, accurate baseline that matches how the code actually
 * behaves. Before launch, fill in the legal-entity name and postal address
 * marked below, and have a lawyer review it if you operate at scale or take
 * personal data beyond what is described here.
 */
export default function PrivacyPolicyPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Privacy Policy", path: "/privacy-policy" },
        ])}
      />

      <ArticleShell
        breadcrumb="Privacy Policy"
        title="Privacy Policy"
        lede="What we collect, what we deliberately do not, and what you can ask us to do about it."
        updated="1 September 2026"
      >
        <div className="prose-lcp">
          <h2>The short version</h2>
          <p>
            Your loan calculations never leave your browser. We do not ask you to create an account,
            we do not require an email address to use any tool on this site, and we do not set a
            tracking cookie. The only personal information we ever hold is what you voluntarily type
            into the feedback form.
          </p>

          <h2>What we do not collect</h2>
          <ul>
            <li>
              <strong>Your loan inputs.</strong> Amount, interest rate, tenure, salary, part-payment
              plans — all of it is processed in JavaScript on your device. None of it is sent to our
              servers, and none of it is stored.
            </li>
            <li>
              <strong>Your IP address.</strong> We never store a raw IP. Where one is needed (to
              rate-limit the feedback form and count unique visits) it is put through a one-way
              salted SHA-256 hash first. The hash cannot be reversed into an address.
            </li>
            <li>
              <strong>Tracking cookies.</strong> We set no first-party cookie for analytics,
              advertising or profiling.
            </li>
          </ul>

          <h2>What we do collect</h2>

          <h3>1. Anonymous usage statistics</h3>
          <p>For each page view we record:</p>
          <ul>
            <li>the path you visited (for example <code>/home-loan-emi-calculator</code>);</li>
            <li>the referring website&rsquo;s domain only — never the full URL or its query string;</li>
            <li>
              a random session identifier held in <code>sessionStorage</code>, which is deleted the
              moment you close the tab and cannot follow you to another site or another day;
            </li>
            <li>a coarse device category (mobile, tablet or desktop) and your browser&rsquo;s user-agent string;</li>
            <li>the salted hash of your IP address described above;</li>
            <li>the timestamp.</li>
          </ul>
          <p>
            If your browser sends a <strong>Do Not Track</strong> signal, none of this is recorded at
            all. Requests identified as search-engine crawlers are also excluded.
          </p>

          <h3>2. Feedback you send us</h3>
          <p>
            If you use the feedback form we store the name and message you enter, an email address
            and subject if you choose to provide them, the star rating if you give one, the page you
            sent it from, your browser&rsquo;s user-agent, and the hashed IP. This is used solely to
            read, act on and where appropriate reply to your message. It is never sold, never shared
            with a third party, and never added to a mailing list.
          </p>

          <h2>Advertising — Google AdSense</h2>
          <p>
            This site is funded by advertising served through Google AdSense (publisher ID{" "}
            <code>{SITE.adsensePublisherId}</code>). Google and its partners are independent
            controllers of the data they collect, and they may use cookies or similar technologies to
            serve and measure ads.
          </p>
          <ul>
            <li>
              Google may use advertising cookies to serve ads based on your prior visits to this and
              other websites.
            </li>
            <li>
              You can opt out of personalised advertising in{" "}
              <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer nofollow">
                Google Ads Settings
              </a>
              , or opt out of third-party vendor cookies at{" "}
              <a href="https://optout.aboutads.info" target="_blank" rel="noopener noreferrer nofollow">
                aboutads.info
              </a>
              .
            </li>
            <li>
              Google&rsquo;s own handling of this data is governed by the{" "}
              <a
                href="https://policies.google.com/technologies/partner-sites"
                target="_blank"
                rel="noopener noreferrer nofollow"
              >
                Google Privacy &amp; Terms
              </a>
              , which we cannot vary.
            </li>
          </ul>

          <h2>Where the data lives</h2>
          <p>
            Usage records and feedback are stored in a SQLite-compatible database operated on our
            behalf by our hosting and database providers. Access is restricted to the site operator
            through a password-protected admin console.
          </p>

          <h2>How long we keep it</h2>
          <ul>
            <li><strong>Usage records:</strong> retained for statistical reporting and pruned periodically.</li>
            <li><strong>Feedback:</strong> retained while it remains useful, then deleted on request.</li>
            <li><strong>Failed login records:</strong> automatically deleted after seven days.</li>
          </ul>

          <h2>Your rights</h2>
          <p>
            Under India&rsquo;s Digital Personal Data Protection Act, 2023 — and under the GDPR if
            you are in the EU or UK — you may ask us to give you a copy of the personal data we hold
            about you, correct it, delete it, or withdraw consent for its processing. Because we
            hold so little, in practice this almost always concerns a feedback message.
          </p>
          <p>
            Email <a href={`mailto:${SITE.email}`}>{SITE.email}</a> from the address you used, or
            describe the message clearly, and we will action it within 30 days.
          </p>

          <h2>Children</h2>
          <p>
            This site is not directed at children under 18 and we do not knowingly collect their
            personal data. If you believe a child has sent us information through the feedback form,
            contact us and it will be deleted.
          </p>

          <h2>External links</h2>
          <p>
            The interest-rate tables link to lenders&rsquo; own websites so you can verify each
            figure. Those sites have their own privacy policies, and we are not responsible for
            their content or their data practices.
          </p>

          <h2>Changes</h2>
          <p>
            If this policy changes materially, the date at the top of this page will be updated.
            Continued use of the site after a change constitutes acceptance of the revised policy.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about this policy, or any request about your data:{" "}
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
          </p>
          <p>
            <em>
              Operator: {SITE.legalName}, India. A registered entity name and postal address should
              be added here before launch if you operate this site commercially.
            </em>
          </p>
        </div>
      </ArticleShell>
    </>
  );
}
