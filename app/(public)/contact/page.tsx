import { SocialLinks } from "@/components/layout/social-icons";
import { ArticleShell } from "@/components/sections/article-shell";
import { JsonLd } from "@/components/seo/json-ld";
import { ButtonLink } from "@/components/ui/button";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";
import { SITE, SITE_URL } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Contact",
  description:
    "How to reach LoanCalc Pro — bug reports, rate corrections, feature requests, press and partnership enquiries.",
  path: "/contact",
  keywords: ["contact LoanCalc Pro", "loan calculator support", "report an error"],
});

const ROUTES = [
  {
    icon: "🐞",
    title: "Bugs and wrong numbers",
    body: "The feedback form is the fastest route — it captures the page you were on, which usually halves the time it takes to reproduce a problem.",
    action: { label: "Open the feedback form", href: "/feedback" },
  },
  {
    icon: "🏦",
    title: "Rate corrections",
    body: "Spotted a lender rate that has changed? Send the link to the lender's published page and the row will be updated and re-dated.",
    action: { label: "Send a correction", href: "/feedback" },
  },
  {
    icon: "📣",
    title: "Press and partnerships",
    body: "For media enquiries, data requests or partnership proposals, email directly and mention the nature of the enquiry in the subject line.",
    action: null,
  },
];

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Contact", path: "/contact" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "ContactPage",
            url: `${SITE_URL}/contact`,
            mainEntity: {
              "@type": "Organization",
              name: SITE.name,
              email: SITE.email,
              url: SITE_URL,
            },
          },
        ]}
      />

      <ArticleShell
        breadcrumb="Contact"
        title="Get in touch"
        lede="One person reads everything that comes in. Here is the quickest route for each kind of message."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {ROUTES.map((r) => (
            <div key={r.title} className="card flex flex-col p-5">
              <span className="text-2xl">{r.icon}</span>
              <h2 className="mt-2.5 font-display text-base font-bold text-[var(--text)]">
                {r.title}
              </h2>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-[var(--text-secondary)]">
                {r.body}
              </p>
              {r.action && (
                <ButtonLink href={r.action.href} variant="outline" size="sm" className="mt-4 w-fit">
                  {r.action.label}
                </ButtonLink>
              )}
            </div>
          ))}

          <div className="card flex flex-col p-5">
            <span className="text-2xl">✉️</span>
            <h2 className="mt-2.5 font-display text-base font-bold text-[var(--text)]">Email</h2>
            <a
              href={`mailto:${SITE.email}`}
              className="mt-1.5 text-sm font-semibold text-brand-600 transition-colors hover:text-brand-500 dark:text-brand-300"
            >
              {SITE.email}
            </a>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--text-secondary)]">
              Expect a reply within a few working days. Messages that need a fix usually get the fix
              before the reply.
            </p>
            <div className="mt-4">
              <SocialLinks size="sm" />
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-xl border-l-4 border-amber-500 bg-amber-50 p-5 dark:bg-amber-950/40">
          <h2 className="font-display text-base font-bold text-amber-900 dark:text-amber-200">
            What we cannot help with
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-amber-800 dark:text-amber-300">
            We are not a lender, a broker or a loan intermediary. We cannot process an application,
            check your eligibility, look up an existing account, change an EMI, or intervene in a
            dispute with your bank. For any of those, contact your lender directly — and please do
            not send us account numbers, PAN, Aadhaar or any other identity document.
          </p>
        </div>
      </ArticleShell>
    </>
  );
}
