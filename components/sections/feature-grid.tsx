import { Reveal } from "@/components/ui/reveal";

interface Feature {
  icon: string;
  title: string;
  body: string;
}

const FEATURES: Feature[] = [
  {
    icon: "🎯",
    title: "Part payments, modelled properly",
    body: "Add as many lump sums as you like, plus a standing extra payment, and see the exact rupee saving. Most calculators allow one prepayment; real borrowers make several.",
  },
  {
    icon: "⚖️",
    title: "Tenure vs EMI, side by side",
    body: "The same ₹5 lakh saves wildly different amounts depending on what the bank does with it. Switch between cutting the term and cutting the instalment and watch both numbers move.",
  },
  {
    icon: "🏦",
    title: "Four lenders at once",
    body: "Compare up to four offers ranked by total outflow — not headline rate. A lower rate with a fatter processing fee is often the more expensive loan, and this makes that obvious.",
  },
  {
    icon: "🧾",
    title: "Fees and GST counted in",
    body: "Processing fee plus 18% GST is folded into a Total Cost of Loan figure, so you are comparing what actually leaves your account rather than an advertised rate.",
  },
  {
    icon: "📅",
    title: "A schedule you can actually read",
    body: "Real calendar months, collapsible by year, with the principal-interest split for every instalment. Export to CSV for your own spreadsheet, or print a clean PDF.",
  },
  {
    icon: "🔒",
    title: "Nothing leaves your browser",
    body: "Every calculation runs on your device. Your loan amount, salary and rates are never transmitted or stored — there is no account to create and no cookie to accept.",
  },
];

export function FeatureGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {FEATURES.map((f, i) => (
        <Reveal key={f.title} delay={i * 55}>
          <div className="card card-lift h-full p-5">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--bg-subtle)] text-xl">
              {f.icon}
            </span>
            <h3 className="mt-3.5 font-display text-base font-bold text-[var(--text)]">{f.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-secondary)]">{f.body}</p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
