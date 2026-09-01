/**
 * Seeds the lender list and two starter guides.
 *
 *   npm run db:seed
 *
 * Deliberately seeds NO interest rates. Publishing an invented rate on a
 * finance site is a real liability, so every figure has to be transcribed from
 * the lender's own page through /admin/rates (or the CSV import) and ticked
 * Verified. Until then the public tables say "Not published" rather than
 * showing a number nobody has checked.
 *
 * Re-running is safe: banks are matched on slug and posts on slug.
 */
import { all, run } from "../lib/db";
import { slugify } from "../lib/utils";

type SeedBank = {
  name: string;
  short: string;
  category: "public" | "private" | "nbfc" | "sfb" | "housing";
  accent: string;
  order: number;
};

/**
 * Names of real, currently operating Indian lenders — public facts, not data
 * about them. No rates, fees or product claims are asserted here.
 */
const BANKS: SeedBank[] = [
  // Public sector banks
  { name: "State Bank of India", short: "SBI", category: "public", accent: "#22409a", order: 10 },
  { name: "Bank of Baroda", short: "BoB", category: "public", accent: "#f15a22", order: 11 },
  { name: "Punjab National Bank", short: "PNB", category: "public", accent: "#a5237f", order: 12 },
  { name: "Canara Bank", short: "Canara", category: "public", accent: "#00539f", order: 13 },
  { name: "Union Bank of India", short: "Union", category: "public", accent: "#e11b22", order: 14 },
  { name: "Bank of India", short: "BoI", category: "public", accent: "#f37021", order: 15 },
  { name: "Indian Bank", short: "Indian", category: "public", accent: "#1a4f9c", order: 16 },
  { name: "Central Bank of India", short: "CBI", category: "public", accent: "#0b6fb8", order: 17 },
  { name: "Indian Overseas Bank", short: "IOB", category: "public", accent: "#1b3f94", order: 18 },
  { name: "UCO Bank", short: "UCO", category: "public", accent: "#0067b1", order: 19 },
  { name: "Bank of Maharashtra", short: "BoM", category: "public", accent: "#f9a01b", order: 20 },
  { name: "Punjab & Sind Bank", short: "PSB", category: "public", accent: "#8b1a3a", order: 21 },

  // Private banks
  { name: "HDFC Bank", short: "HDFC", category: "private", accent: "#004c8f", order: 30 },
  { name: "ICICI Bank", short: "ICICI", category: "private", accent: "#af272f", order: 31 },
  { name: "Axis Bank", short: "Axis", category: "private", accent: "#97144d", order: 32 },
  { name: "Kotak Mahindra Bank", short: "Kotak", category: "private", accent: "#ed1c24", order: 33 },
  { name: "IndusInd Bank", short: "IndusInd", category: "private", accent: "#98272c", order: 34 },
  { name: "IDFC FIRST Bank", short: "IDFC", category: "private", accent: "#9c1d26", order: 35 },
  { name: "Yes Bank", short: "Yes", category: "private", accent: "#00518f", order: 36 },
  { name: "Federal Bank", short: "Federal", category: "private", accent: "#f7a800", order: 37 },
  { name: "RBL Bank", short: "RBL", category: "private", accent: "#b8232f", order: 38 },
  { name: "Bandhan Bank", short: "Bandhan", category: "private", accent: "#e4002b", order: 39 },
  { name: "IDBI Bank", short: "IDBI", category: "private", accent: "#00844b", order: 40 },
  { name: "Karur Vysya Bank", short: "KVB", category: "private", accent: "#004b8d", order: 41 },
  { name: "South Indian Bank", short: "SIB", category: "private", accent: "#00a04a", order: 42 },
  { name: "City Union Bank", short: "CUB", category: "private", accent: "#e4322b", order: 43 },
  { name: "Karnataka Bank", short: "KBL", category: "private", accent: "#e11f26", order: 44 },
  { name: "DCB Bank", short: "DCB", category: "private", accent: "#00539b", order: 45 },

  // Housing finance companies
  { name: "LIC Housing Finance", short: "LIC HFL", category: "housing", accent: "#00539f", order: 60 },
  { name: "PNB Housing Finance", short: "PNB HFL", category: "housing", accent: "#a5237f", order: 61 },
  { name: "Bajaj Housing Finance", short: "Bajaj HFL", category: "housing", accent: "#0b4da2", order: 62 },
  { name: "Tata Capital Housing Finance", short: "Tata HFL", category: "housing", accent: "#486aae", order: 63 },
  { name: "Godrej Housing Finance", short: "Godrej HF", category: "housing", accent: "#00a0af", order: 64 },
  { name: "Aditya Birla Housing Finance", short: "AB HFL", category: "housing", accent: "#c8102e", order: 65 },
  { name: "Sammaan Capital", short: "Sammaan", category: "housing", accent: "#0a5c8e", order: 66 },
  { name: "Aavas Financiers", short: "Aavas", category: "housing", accent: "#f47920", order: 67 },

  // NBFCs
  { name: "Bajaj Finance", short: "Bajaj", category: "nbfc", accent: "#0b4da2", order: 80 },
  { name: "Tata Capital", short: "Tata Cap", category: "nbfc", accent: "#486aae", order: 81 },
  { name: "Aditya Birla Finance", short: "AB Fin", category: "nbfc", accent: "#c8102e", order: 82 },
  { name: "L&T Finance", short: "L&T Fin", category: "nbfc", accent: "#0091d2", order: 83 },
  { name: "Shriram Finance", short: "Shriram", category: "nbfc", accent: "#ed1c24", order: 84 },
  { name: "Cholamandalam Investment and Finance", short: "Chola", category: "nbfc", accent: "#00539b", order: 85 },
  { name: "Muthoot Finance", short: "Muthoot", category: "nbfc", accent: "#c8102e", order: 86 },
  { name: "Manappuram Finance", short: "Manappuram", category: "nbfc", accent: "#f47920", order: 87 },
  { name: "HDB Financial Services", short: "HDB", category: "nbfc", accent: "#004c8f", order: 88 },
  { name: "Poonawalla Fincorp", short: "Poonawalla", category: "nbfc", accent: "#6d2077", order: 89 },

  // Small finance banks
  { name: "AU Small Finance Bank", short: "AU SFB", category: "sfb", accent: "#5b2d90", order: 100 },
  { name: "Equitas Small Finance Bank", short: "Equitas", category: "sfb", accent: "#e4002b", order: 101 },
  { name: "Ujjivan Small Finance Bank", short: "Ujjivan", category: "sfb", accent: "#00a4e4", order: 102 },
  { name: "Jana Small Finance Bank", short: "Jana", category: "sfb", accent: "#e11f26", order: 103 },
];

/* ------------------------------------------------------------------ */
/* Starter guides                                                      */
/*                                                                     */
/* Every figure below was produced by this repository's own engine —   */
/* run `npm run verify:examples` to reproduce them.                    */
/* ------------------------------------------------------------------ */

const POSTS = [
  {
    title: "When to prepay a home loan: why timing beats size",
    slug: "when-to-prepay-a-home-loan",
    excerpt:
      "The same ₹5 lakh can save you ₹14.6 lakh or ₹4.2 lakh, depending only on when you pay it. Here is why the early years matter so much more.",
    coverVariant: "indigo",
    tags: "home loan, prepayment, part payment",
    keywords:
      "home loan prepayment, when to prepay home loan, part payment calculator, prepay early or late",
    seoDescription:
      "On a ₹50 lakh 20-year home loan at 8.5%, a ₹5 lakh part-payment in month 24 saves ₹14.6 lakh in interest — the same amount in month 144 saves ₹4.2 lakh. Here is the arithmetic.",
    content: `Most advice about prepaying a home loan focuses on *how much* to pay. The more useful question is *when*.

## The arithmetic that drives everything

Indian lenders charge interest on the reducing balance: each month, interest is calculated on what you still owe, and whatever is left of your EMI reduces the principal.

Early in a loan you owe almost the whole principal, so almost the whole instalment is interest. On a **₹50,00,000 loan at 8.5% over 20 years**, the EMI is **₹43,391** — and in the first year, **81% of what you pay is interest**. Only 19% touches the principal.

That ratio only inverts in month 143 — the twelfth year. Until then, every EMI is mostly rent on money you have already borrowed.

## What that means for a lump sum

A prepayment does not just reduce your balance. It cancels every future interest charge that balance would have generated. Pay early, and you cancel two decades of compounding. Pay late, and there is barely anything left to cancel.

The same ₹5,00,000, on the same loan, keeping the EMI unchanged and cutting the tenure:

| Paid in | Interest saved |
| --- | --- |
| Month 24 (year 2) | **₹14,57,301** |
| Month 144 (year 12) | **₹4,16,239** |

Same money. Same loan. Three and a half times the benefit, decided purely by timing.

The month-24 prepayment also ends the loan **3 years 9 months early** — 45 EMIs of ₹43,391 that simply never happen.

> A ₹5 lakh prepayment in year two returns ₹14.57 lakh in avoided interest. That is a guaranteed, tax-free return of nearly 3x on money you were going to hand the bank anyway.

## Cut the tenure, not the EMI

When you make a part-payment, your lender will ask what to do with it. This choice matters more than most borrowers realise.

- **Reduce the tenure.** Your EMI stays the same and the loan finishes sooner. Maximum interest saved.
- **Reduce the EMI.** The term stays put and your monthly outgo falls. Easier on cash flow, far less saved overall.

If you can comfortably keep paying the current EMI, cutting the tenure is almost always the better deal. Reducing the EMI makes sense when your monthly budget is genuinely tight — breathing room has value too, just not financial value.

You can see both outcomes side by side in the [home loan calculator](/home-loan-emi-calculator): enter your loan, add a part-payment, and switch between the two modes.

## Before you prepay, check three things

1. **Prepayment charges.** Floating-rate home loans to individuals generally carry no prepayment penalty in India, but fixed-rate loans and most non-housing loans do. Read your agreement.
2. **Your emergency fund.** Money sent to the bank is gone. Do not prepay your way out of a cash cushion — a job loss six months later is far more expensive than the interest you saved.
3. **The alternative use.** Prepaying earns you a guaranteed return equal to your loan rate. An investment that *might* beat it also might not. Compare after tax, and be honest about risk.

## The one-line version

If you are going to prepay, prepay early and cut the tenure. Waiting a decade to make the same payment throws away most of the benefit.

*This is general information about how loan arithmetic works, not financial advice. Your circumstances, agreement and tax position all matter — check with your lender and, for a decision this size, a qualified adviser.*`,
  },
  {
    title: "The lowest interest rate is often the more expensive loan",
    slug: "lowest-interest-rate-is-not-cheapest-loan",
    excerpt:
      "Processing fees, GST and tenure differences routinely flip which offer is genuinely cheaper. Here is how to compare two loans properly.",
    coverVariant: "emerald",
    tags: "loan comparison, processing fee, bank comparison",
    keywords:
      "compare bank loans, processing fee comparison, lowest interest rate, total cost of loan, which bank is cheaper",
    seoDescription:
      "A lower headline rate can easily cost more once processing fees and GST are counted. How to compare loan offers on total cost instead of advertised rate.",
    content: `Every lender advertises a rate. Almost none advertise what the loan actually costs. Those are different numbers, and the gap between them is where borrowers lose money.

## What the headline rate leaves out

The advertised rate is the *starting* rate — the best price, usually reserved for borrowers with an excellent credit score, stable salaried income and a conservative loan-to-value ratio. It is a marketing figure, not a quotation.

On top of it sit costs that never appear in the advertisement:

- **Processing fee** — commonly a percentage of the sanctioned amount, sometimes capped, sometimes flat.
- **GST at 18%** on that fee, because it is a financial service.
- **Documentation, legal, valuation and CERSAI charges.**
- **Insurance** bundled into the loan, sometimes without much discussion.
- **Prepayment or foreclosure penalties**, which decide whether you can escape later.

A 1% processing fee on ₹50 lakh is ₹50,000, plus ₹9,000 of GST. That is real money that never shows up in the rate you were quoted.

## Why the ranking can flip

The interaction to watch is **fee versus tenure**. A processing fee is paid once, up front. Interest accrues every month for years. So:

- On a **long** loan, the rate dominates. A fee is spread thin across 240 instalments, and even a small rate difference compounds into lakhs.
- On a **short** loan, the fee dominates. There are not enough months for a rate advantage to overtake a fee twice the size.

This is exactly why a lender quoting 8.40% with a 1% fee can be more expensive than one quoting 8.55% with a flat ₹10,000 — on a five-year loan, the fee gap never gets repaid by the rate gap.

## Compare on total outflow

The only number that settles it is every rupee that leaves your account:

> **Total cost = (EMI × number of instalments) + processing fee + GST + any other upfront charge**

That is the figure the [comparison tool](/compare-loans) ranks on. Put up to four offers in, each with its own rate, tenure and fee, and it will tell you which is genuinely cheapest and exactly how much extra the runner-up costs.

## Four questions worth asking every lender

1. **What is the all-in processing fee, in rupees, including GST?** Not a percentage — a number.
2. **What other one-time charges apply?** Legal, valuation, documentation, stamp duty, CERSAI.
3. **Is any insurance being added to the sanctioned amount?** If so, is it optional?
4. **What are the prepayment terms?** Any lock-in, any penalty, any cap on how much you can pay early.

Get the answers in writing. A rate quoted verbally over the phone is worth precisely nothing when the sanction letter arrives.

## Keep the tenure fixed while you compare

If one offer is over 15 years and another over 20, the 20-year EMI will always look smaller — and will always cost more in total. Compare like with like: same amount, same tenure, then look at total cost. Only vary the tenure once you have decided which lender you are dealing with.

*Rates and fees change frequently and vary by borrower profile. Always confirm current terms directly with the lender before deciding.*`,
  },
] as const;

/* ------------------------------------------------------------------ */

async function main() {
  console.log("Seeding database…\n");

  const existingBanks = await all<{ slug: string }>(`SELECT slug FROM banks`);
  const bankSlugs = new Set(existingBanks.map((b) => b.slug));

  let inserted = 0;
  for (const bank of BANKS) {
    const slug = slugify(bank.name);
    if (bankSlugs.has(slug)) continue;
    await run(
      `INSERT INTO banks (slug, name, short_name, category, accent, sort_order)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [slug, bank.name, bank.short, bank.category, bank.accent, bank.order],
    );
    inserted++;
  }
  console.log(`  Lenders: ${inserted} added, ${bankSlugs.size} already present`);

  const existingPosts = await all<{ slug: string }>(`SELECT slug FROM posts`);
  const postSlugs = new Set(existingPosts.map((p) => p.slug));

  let postsAdded = 0;
  for (const post of POSTS) {
    if (postSlugs.has(post.slug)) continue;
    await run(
      `INSERT INTO posts
         (slug, title, excerpt, content, cover_variant, tags, author, status,
          seo_description, keywords, published_at)
       VALUES (?, ?, ?, ?, ?, ?, 'LoanCalc Pro', 'published', ?, ?, datetime('now'))`,
      [
        post.slug,
        post.title,
        post.excerpt,
        post.content,
        post.coverVariant,
        post.tags,
        post.seoDescription,
        post.keywords,
      ],
    );
    postsAdded++;
  }
  console.log(`  Guides:  ${postsAdded} added, ${postSlugs.size} already present`);

  console.log(`
  No interest rates were seeded — on purpose.

  Add them at /admin/rates, or paste a CSV into the bulk importer there.
  A row only displays a figure on the public site once it has both a rate
  and the lender's own source URL, and has been ticked Verified.
`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
