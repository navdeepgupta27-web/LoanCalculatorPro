import { ArticleShell } from "@/components/sections/article-shell";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Terms of Service",
  description:
    "The terms governing your use of the Loan Calculator Pro EMI calculator, comparison tools and interest rate tables.",
  path: "/terms",
  keywords: ["terms of service", "terms and conditions", "website terms"],
});

export default function TermsPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Terms of Service", path: "/terms" },
        ])}
      />

      <ArticleShell
        breadcrumb="Terms of Service"
        title="Terms of Service"
        lede="The rules for using this site. Plain language, no traps."
        updated="1 September 2026"
      >
        <div className="prose-lcp">
          <h2>1. Agreement</h2>
          <p>
            By using {SITE.domain} you agree to these terms. If you do not agree with them, please
            do not use the site. These terms are governed by the laws of India, and the courts of
            India have exclusive jurisdiction over any dispute arising from them.
          </p>

          <h2>2. What this site is</h2>
          <p>
            Loan Calculator Pro is a free calculation and information tool. It computes loan repayment
            figures from numbers you supply and publishes interest rate information transcribed from
            lenders&rsquo; own websites.
          </p>
          <p>
            <strong>It is not:</strong> a lender, a broker, a lending intermediary, a deposit-taking
            institution, an investment adviser, or a provider of personalised financial advice. We
            do not arrange loans, we do not accept applications, and we cannot influence any
            lending decision.
          </p>

          <h2>3. No advice, no warranty of accuracy</h2>
          <p>
            All figures are estimates generated from the inputs you enter using standard
            reducing-balance formulas. They are provided for general information and planning only.
          </p>
          <p>
            We make no warranty that any figure matches what a lender will quote or charge you. Your
            actual EMI, interest, fees and total cost are determined solely by your lender and are
            set out in your sanction letter and loan agreement. <strong>Always verify with your
            lender before making a financial decision.</strong>
          </p>
          <p>
            Interest rates shown on this site are transcribed from lenders&rsquo; published pages at
            the date shown on each row. Rates change frequently, floating rates move with external
            benchmarks, and the rate you are personally offered depends on your credit profile.
            Treat every rate here as an indicative starting point requiring independent
            verification.
          </p>

          <h2>4. Limitation of liability</h2>
          <p>
            To the fullest extent permitted by law, {SITE.legalName} is not liable for any loss or
            damage — direct, indirect, incidental, consequential or otherwise — arising from your
            use of, or reliance on, this site or anything on it. This includes financial loss
            resulting from a borrowing decision informed by figures produced here.
          </p>
          <p>The site is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;, without warranties of any kind.</p>

          <h2>5. Acceptable use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>use automated means to scrape, harvest or bulk-download content at a rate that burdens the service;</li>
            <li>attempt to gain unauthorised access to the admin area, the database or any other restricted part of the site;</li>
            <li>submit unlawful, defamatory, misleading or abusive material through the feedback form;</li>
            <li>interfere with, disrupt or overload the service or the networks it runs on;</li>
            <li>republish substantial portions of the content as your own.</li>
          </ul>

          <h2>6. Intellectual property</h2>
          <p>
            The design, code, written guides and presentation of this site are the property of{" "}
            {SITE.legalName}. You may reference and link to pages freely, and quote short extracts
            with attribution and a link. You may not reproduce substantial portions of the content
            without written permission.
          </p>
          <p>
            Bank and lender names are the trademarks of their respective owners and are used here
            for identification and comparison only. Their appearance does not imply any partnership,
            sponsorship or endorsement in either direction.
          </p>

          <h2>7. Your submissions</h2>
          <p>
            When you send feedback, you grant us permission to read it, act on it, and use it to
            improve the site — including publishing anonymised, aggregated observations about the
            kinds of requests we receive. We will not publish your name or email address without
            your explicit consent.
          </p>

          <h2>8. Advertising</h2>
          <p>
            This site displays advertising served by Google AdSense. We do not control which
            advertisers appear, and the presence of an advertisement is not an endorsement. Any
            dealing you have with an advertiser is strictly between you and them.
          </p>

          <h2>9. External links</h2>
          <p>
            Links to lender websites are provided so you can verify rate information at source. We
            are not responsible for the content, accuracy, security or practices of any external
            site, and a link is not an endorsement.
          </p>

          <h2>10. Availability and changes</h2>
          <p>
            We may modify, suspend or discontinue any part of the site at any time without notice,
            and we do not guarantee uninterrupted availability. We may also revise these terms;
            material changes will be reflected in the date at the top of this page, and continued
            use constitutes acceptance.
          </p>

          <h2>11. Contact</h2>
          <p>
            Questions about these terms: <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
          </p>
        </div>
      </ArticleShell>
    </>
  );
}
