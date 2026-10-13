/**
 * Publishes the third batch of guides.
 *
 *   npm run db:guides-3
 *
 * Idempotent: matched on slug, so re-running adds nothing.
 *
 * Every rupee figure was produced by this repository's own engine — run
 * `npm run guide:figures-3` to reproduce them. Where a guide rests on an
 * assumption the engine cannot supply — a car's resale value, a retirement
 * spending level, a withdrawal rate — the assumption is named in the article,
 * because an assumption stated is useful and an assumption presented as a
 * finding is not.
 */
import { all, run } from "../lib/db";
import { AUTHOR } from "../lib/site";

interface Guide {
  slug: string;
  title: string;
  excerpt: string;
  coverVariant: string;
  tags: string;
  keywords: string;
  seoDescription: string;
  content: string;
}

const GUIDES: Guide[] = [
  {
    slug: "real-cost-of-a-car-loan",
    title: "The car loan nobody prices properly",
    excerpt:
      "Stretching a ₹10 lakh car loan from three years to seven drops the EMI by ₹15,689 and adds ₹2,19,708 of interest. It also means that for three years you owe more than the car is worth.",
    coverVariant: "amber",
    tags: "car loan, auto loan, total cost",
    keywords:
      "car loan interest cost, car loan 7 years vs 5 years, is a long car loan bad, car loan EMI calculator, negative equity car loan",
    seoDescription:
      "A ₹10,00,000 car loan at 9.5% costs ₹1,53,186 in interest over three years and ₹3,72,894 over seven. Why the longer term is worse than the EMI difference suggests.",
    content: `A car loan gets compared on the monthly instalment, because that is the number the showroom puts in front of you. It is also the number that conceals the most.

## What the term does

**A ₹10,00,000 car loan at 9.5%:**

| Term | EMI | Total interest | Total paid |
| --- | --- | --- | --- |
| 3 years | ₹32,033 | ₹1,53,186 | ₹11,53,186 |
| 5 years | ₹21,002 | ₹2,60,112 | ₹12,60,112 |
| 7 years | ₹16,344 | ₹3,72,894 | ₹13,72,894 |

Going from three years to seven cuts the instalment by **₹15,689** — which is exactly why it gets offered — and adds **₹2,19,708** in interest. You are buying affordability with a sum roughly equal to a fifth of the car.

That trade is sometimes worth making. What makes a car loan different from a home loan is the second thing happening at the same time.

## The asset is falling while the debt is not

A house may rise in value. A car does not. So alongside the amortisation schedule there is a second line moving in the opposite direction, and where they cross matters.

Here is the seven-year loan against an **assumed** resale decline — 20% in the first year and 12% a year after that. That is an illustration, not a measurement: actual depreciation depends on the model, the mileage, the condition and the market, and nothing in this calculator can tell you what your car will fetch.

| End of year | Assumed value | Still owed |
| --- | --- | --- |
| 1 | ~₹8,00,000 | ₹8,94,351 |
| 2 | ~₹7,04,000 | ₹7,78,216 |
| 3 | ~₹6,19,520 | ₹6,50,555 |
| 4 | ~₹5,45,178 | ₹5,10,224 |
| 5 | ~₹4,79,756 | ₹3,55,966 |

On those assumptions you owe more than the car is worth for the **first three years**. The lines cross somewhere in year four.

## Why that matters practically

It is not an abstraction. It bites in three situations:

**You want to sell.** The sale proceeds do not clear the loan, so you have to find the difference in cash before you can hand over the car. People discover this when a job moves them to another city.

**It is written off.** Insurance settles on the car's value, not your loan balance. If it is stolen or totalled in year two, the payout can leave a shortfall you still owe on a car you no longer have. Some insurers sell cover for exactly this gap; whether it is worth the premium depends on how underwater you would be.

**You want to upgrade.** Rolling a shortfall into the next car loan is how people end up borrowing more than the new car costs — and the cycle gets harder to exit each time.

A shorter term crosses over sooner. On the three-year loan the crossover arrives much earlier, which is a real benefit that never appears in an EMI comparison.

## A more useful way to decide

Rather than asking what instalment you can manage, ask the shortest term whose instalment you can manage. Then check that it leaves room for the running costs — insurance, servicing, fuel, parking — which are not in the loan and are not small.

If the shortest workable term is seven years, that is useful information about the car rather than about the loan.

Run your own figures on the [car loan calculator](/in/car-loan-emi-calculator) and compare total interest across terms rather than the instalment, then look at what lenders are actually publishing on the [car loan rates page](/in/bank-interest-rates/car-loan).`,
  },

  {
    slug: "education-loan-moratorium-interest",
    title: "The education loan moratorium is not a payment holiday",
    excerpt:
      "Pay nothing during a four-year course and a ₹20 lakh loan becomes ₹29.2 lakh before repayment starts. Servicing just the interest meanwhile costs ₹15,833 a month and saves ₹6.69 lakh.",
    coverVariant: "sky",
    tags: "education loan, student loan, moratorium",
    keywords:
      "education loan moratorium interest, student loan simple interest during study, education loan EMI after course, should I pay interest during moratorium, education loan calculator",
    seoDescription:
      "A ₹20,00,000 education loan at 9.5% with a four-year moratorium grows to ₹29,20,196 if nothing is paid. Servicing the interest instead cuts total interest from ₹25,34,396 to ₹18,65,541.",
    content: `An education loan comes with a moratorium — the course period plus a grace spell afterwards, during which no instalment is due. It is described as a payment holiday and treated as one, and that is the expensive misunderstanding.

Interest does not pause. It accrues throughout, and at the end of the moratorium it is usually added to the principal. You then pay interest on that interest for the rest of the loan.

## What it costs to do nothing

**A ₹20,00,000 loan at 9.5%, a four-year course, ten years to repay afterwards.**

Option one, the default: pay nothing until the course ends.

| | |
| --- | --- |
| Balance when repayment starts | ₹29,20,196 |
| EMI from then on | ₹37,787 |
| **Total interest over the life of the loan** | **₹25,34,396** |

The loan grew by **₹9,20,196** before a single instalment was due. Nobody borrowed that; it is four years of interest compounding on itself, and it is now principal.

## What it costs to service the interest

Option two: pay only the interest each month while studying. Nothing toward the principal — just enough to stop it compounding.

| | |
| --- | --- |
| Monthly during the course | ₹15,833 |
| Paid across the four years | ₹7,60,000 |
| EMI from then on | ₹25,880 |
| **Total interest over the life of the loan** | **₹18,65,541** |

## The comparison

| | Pay nothing | Service the interest |
| --- | --- | --- |
| Total interest | ₹25,34,396 | ₹18,65,541 |
| EMI after the course | ₹37,787 | ₹25,880 |

Servicing the interest saves **₹6,68,854** and brings the eventual instalment down by **₹11,907 a month** — which matters enormously to a graduate in their first job, because that instalment arrives whether or not the salary did.

The ₹7,60,000 paid during the course is not free, obviously. But it buys a reduction of ₹6.69 lakh in interest and a far gentler start to repayment.

## Who can actually do this

A student usually cannot. A parent or co-applicant often can, and this is the thing worth discussing before the money is drawn rather than after graduation.

Even partial servicing helps. Paying half the monthly interest halves the compounding, and most lenders accept voluntary payments during the moratorium without any penalty — it is simply not offered unless you ask.

## Other things worth asking before you sign

**Is the interest simple or compounded during the moratorium?** Some schemes charge simple interest on the drawn amount through the study period, which is materially cheaper than monthly compounding. Ask explicitly, and get the answer in writing.

**Is there a concession for servicing?** Several lenders reduce the rate slightly for borrowers who pay interest during the course. It is not always volunteered.

**How is the money drawn?** Education loans usually disburse per semester, not in one lump. Interest accrues only on what has actually been drawn, so the first year's interest is much smaller than the last — which makes early servicing cheap and worth starting straight away.

**What is the grace period after the course?** Six months to a year is typical, and it is part of the moratorium. Interest accrues through it too.

## The point

A moratorium is a deferral, not a discount. Treating it as free is what turns a ₹20 lakh loan into a ₹29 lakh one before repayment begins.

Model both paths on the [education loan calculator](/in/education-loan-emi-calculator) — run the original amount for the repayment term, then run the capitalised balance, and the gap is the cost of the holiday.`,
  },

  {
    slug: "joint-home-loan-what-it-buys",
    title: "What a second income actually adds to a home loan",
    excerpt:
      "A ₹90,000 income supports about ₹46.7 lakh. Add a ₹60,000 earner and it becomes ₹77.8 lakh — a 67% jump from a 67% larger income, and the reason joint applications are so common.",
    coverVariant: "violet",
    tags: "joint home loan, co-applicant, eligibility",
    keywords:
      "joint home loan eligibility, co-applicant home loan, husband wife joint home loan, joint loan tax benefit, add co-applicant increase loan amount",
    seoDescription:
      "At 8.5% over 20 years and a 45% FOIR, ₹90,000 a month supports about ₹46,66,849. Adding a ₹60,000 co-applicant takes it to ₹77,78,082. What that buys and what it commits you to.",
    content: `Eligibility is driven by income, so adding an income raises it. That is the whole mechanism, and it is close to linear.

## What the numbers do

**At 8.5% over 20 years, with lenders allowing instalments to take 45% of combined income:**

| Applicants | Combined income | EMI allowed | Loan supported |
| --- | --- | --- | --- |
| One | ₹90,000 | ₹40,500 | about ₹46,66,849 |
| Two | ₹1,50,000 | ₹67,500 | about ₹77,78,082 |
| Two, equal | ₹1,80,000 | ₹81,000 | about ₹93,33,698 |

Adding a ₹60,000 earner lifts the ceiling by **₹31,11,233**. In many Indian cities that is the difference between two bedrooms and three, or between a long commute and a short one.

## What it commits the co-applicant to

This is where the arithmetic stops being the point. A co-applicant is not a character reference. They are **jointly and severally liable** for the whole debt — not for a half of it.

In practice:

**The lender can pursue either of you for the full amount.** If one stops paying, the other owes everything, not their share.

**It appears on both credit reports.** A missed instalment damages both scores. So does the loan simply existing: it reduces what either of you can borrow separately afterwards, which matters if one of you later wants a car loan or a business loan.

**Exiting is hard.** Removing a co-applicant generally requires the lender's consent and often a refinance, which means fresh underwriting on whoever remains — and if they do not qualify alone, there is no exit. This is the clause people discover during a separation, which is the worst possible time.

Those are not reasons to avoid a joint loan. They are reasons to be deliberate about who the second name belongs to, and to know that "just helping with eligibility" is not what the document says.

## Ownership and the tax question

Two things get conflated constantly: being a **co-applicant** on the loan and being a **co-owner** of the property. They are separate, and the combination determines who may claim what.

Broadly, in India, deductions on a home loan are available to someone who is both an owner of the property and a borrower on the loan, and each such person claims against their own share, within the limits applying to them. Someone on the loan but not on the title generally cannot claim; someone on the title but not the loan has nothing to claim against.

The detail — which sections apply, what the limits are, how a self-occupied property differs from a let one, and how your tax regime affects any of it — changes with the Finance Act and depends on your own circumstances. This is genuinely worth a conversation with a chartered accountant before the paperwork is drawn, because the ownership share is awkward to change afterwards and determines the tax position for the life of the loan.

## Practical points that are easy to get wrong

**Get the ownership share right at the start.** It drives both the tax position and who owns what if things change. Fixing it later means a fresh transfer, with its own stamp duty.

**The weaker credit score can set the rate.** Lenders often price on the lower of the two, so a co-applicant with a poor score can raise the rate on the whole loan — occasionally enough to outweigh the extra eligibility. Check both scores before applying.

**Both incomes have to survive the term.** A ceiling built on two salaries assumes two salaries for twenty years. If one of you plans to stop working — to study, to raise a child, to start something — borrowing to the joint maximum is borrowing against an income that will not be there.

## Decide on the instalment, not the ceiling

The eligibility figure is what a lender will permit, which is a different question from what you should take on. Put the instalment you would actually be comfortable with into the [home loan calculator](/in/home-loan-emi-calculator) and look at the total interest, then compare it against the ceiling the two incomes unlock. The gap between those is a choice, not a constraint.`,
  },

  {
    slug: "top-up-loan-vs-personal-loan",
    title: "Top-up or personal loan? The cheaper rate can cost more",
    excerpt:
      "A ₹8 lakh top-up at 9.25% over ten years costs ₹12.34 lakh in total. A personal loan at 14% over five years costs ₹11.36 lakh. The higher rate is ₹98,078 cheaper.",
    coverVariant: "emerald",
    tags: "top-up loan, personal loan, borrowing",
    keywords:
      "top up loan vs personal loan, home loan top up interest rate, which is better top up or personal loan, top up loan eligibility, cheapest way to borrow",
    seoDescription:
      "₹8,00,000 borrowed: a top-up at 9.25% over 10 years totals ₹12,33,834; a personal loan at 14% over 5 years totals ₹11,35,756. Why the lower rate loses, and when it wins.",
    content: `If you already have a home loan and need money, a top-up on it will almost always carry a lower rate than a personal loan. Most comparisons stop there. That is a mistake, because the rate is not the only thing different about the two products — the term is, and over a long enough term a low rate accumulates more interest than a high rate does over a short one.

## The comparison

**Borrowing ₹8,00,000.** Rates and fees are illustrative; use your own offers.

| | Rate | Term | EMI | Total interest | Total cost |
| --- | --- | --- | --- | --- | --- |
| Top-up | 9.25% | 10 years | ₹10,243 | ₹4,29,114 | ₹12,33,834 |
| Personal | 14.0% | 5 years | ₹18,615 | ₹3,16,876 | ₹11,35,756 |
| Personal | 14.0% | 10 years | ₹12,421 | ₹6,90,558 | ₹15,09,438 |

Read those rows carefully, because they say two different things.

**Over the same ten years, the top-up wins comfortably** — ₹12,33,834 against ₹15,09,438, a saving of **₹2,75,604**. On like-for-like terms the cheaper rate does exactly what you would expect.

**But the five-year personal loan costs less than the ten-year top-up** — ₹11,35,756 against ₹12,33,834. The 14% loan is **₹98,078 cheaper** in total than the 9.25% one, because it is finished in half the time.

## What that actually tells you

Not that personal loans are cheap. It tells you that **the term is doing more work than the rate**, and that comparing a long cheap loan against a short expensive one on rate alone produces the wrong answer.

The honest conclusion: the top-up is better *if you borrow it over a comparable term*. Its advantage evaporates when it is stretched, and stretching is precisely what makes it feel affordable — ₹10,243 a month against ₹18,615 is a large difference in the moment.

If you took the top-up and paid it down on a five-year schedule instead of ten, you would have the low rate *and* the short term, which is the best of both. Whether you would actually do that is a question about you rather than about the products.

## The other differences

Rate and term are not the only things separating them:

**Your house is collateral on a top-up.** A personal loan is unsecured. That is the reason for the rate gap, and it is not a technicality — a default on a secured loan puts the property at risk in a way a default on a personal loan does not.

**A top-up extends your exposure on the home.** It typically runs alongside or within the remaining home loan term, so you are tied to the property debt for longer.

**Eligibility differs.** A top-up depends on how much equity you have built and your repayment record on the existing loan; many lenders require a minimum number of instalments paid before offering one. A personal loan depends on income and score and can usually be arranged faster.

**Fees and prepayment terms differ.** Top-ups generally carry the lower processing fee. Personal loans more often carry foreclosure charges, which matters if you intend to clear it early — check that clause, because it can quietly remove the advantage of a short term.

**Tax treatment can differ by use.** Where a top-up is used for construction, purchase or repair of property, deductions may be available that an unsecured loan would not attract. This depends on documented end use and on rules that change, so confirm it rather than assuming it.

## How to decide

Work out the shortest term you can genuinely service, then price both products over *that* term. Not over the longest term each will allow, which is how the comparison gets rigged in favour of whichever product stretches furthest.

Put both offers into the [comparison tool](/in/compare-loans) with their own rates, fees and terms. It ranks on total money out of your pocket, which is the only basis on which these two products can be compared honestly.`,
  },

  {
    slug: "how-much-do-you-need-to-retire",
    title: "What a retirement corpus actually has to be",
    excerpt:
      "₹60,000 a month today becomes ₹2,57,512 a month in 25 years at 6% inflation. Funding that needs roughly ₹7.73 crore — and ₹40,710 a month to get there, if the assumptions hold.",
    coverVariant: "indigo",
    tags: "retirement, SIP, inflation, planning",
    keywords:
      "retirement corpus calculator India, how much do I need to retire, retirement planning SIP, 4 percent withdrawal rule India, retirement corpus 1 crore enough",
    seoDescription:
      "At 6% inflation, ₹60,000 of monthly spending today costs ₹2,57,512 in 25 years. At a 4% withdrawal rate that needs ₹7,72,53,673 — about ₹40,710 a month at an assumed 12%.",
    content: `"A crore should do it" is the most common retirement plan in India and one of the least likely to work. The reason is not pessimism about returns. It is that the number has to be built from the spending it must fund, in the money of the year it will be spent, and almost nobody does that second part.

Here is the calculation, with every assumption named.

## Step one: what the lifestyle will cost

**Assumption:** your household spends **₹60,000 a month** today, and inflation averages **6%** over the next **25 years**.

| | |
| --- | --- |
| Monthly spending today | ₹60,000 |
| The same lifestyle in 25 years | **₹2,57,512 a month** |

Not a worse lifestyle or a better one. The same one, costing four times as much, because that is what 6% compounding for twenty-five years does to a price.

This is the step people skip. Planning for ₹60,000 a month in 2051 is planning to live on roughly a quarter of what you live on now.

## Step two: the corpus that funds it

**Assumption:** you draw **4%** of the corpus in the first year and adjust it for inflation thereafter — a widely used rule of thumb, derived from historical market data in another country, and not a guarantee anywhere.

₹2,57,512 a month is ₹30,90,147 a year. At a 4% withdrawal rate:

| | |
| --- | --- |
| **Corpus required** | **₹7,72,53,673** |

About **₹7.73 crore**. Against which "a crore should do it" is not a conservative plan; it is roughly an eighth of one.

## Step three: what it takes to get there

**Assumption:** you invest monthly for the full 25 years and earn a steady annual return.

| Assumed return | Monthly investment needed | Total you contribute |
| --- | --- | --- |
| 10% | ₹57,743 | ₹1,73,22,871 |
| 12% | ₹40,710 | ₹1,22,13,150 |

Two points fall out of that table.

**Returns do the heavy lifting.** At 12% you contribute ₹1.22 crore and end with ₹7.73 crore. Roughly 84% of the final corpus is growth, not contribution. That is the entire argument for starting early — compounding needs time more than it needs money.

**Two percentage points cost ₹17,033 a month.** The gap between a 10% and a 12% assumption is not academic; it is a different monthly commitment entirely. Which is why planning on the optimistic number and hoping is the common failure mode.

## Where this calculation is weakest

Being honest about the limits:

**The withdrawal rate is a rule of thumb, not a law.** It came from historical analysis of a different market over a different period. Indian inflation, Indian market behaviour and your own retirement length may not oblige.

**Nobody earns a steady 12%.** Returns arrive unevenly, and the order matters — a severe fall in the first years of retirement, while the corpus is largest and you are drawing from it, does far more damage than the same fall later. This is called sequence risk and a single average return hides it completely.

**Spending is not flat in retirement.** It often falls in the early years as travel reduces and rises later as healthcare grows. Medical inflation in India has generally run ahead of general inflation, which argues for treating health cover as a separate line rather than assuming the corpus absorbs it.

**You may not have 25 years.** If you are 15 years out, the same corpus needs a much larger monthly figure, and the honest options are to save more, work longer or plan to spend less. There is no fourth option that arithmetic permits.

## What to do with the number

Not panic. Use it as a direction rather than a verdict. What matters most is that the figure is built from your spending and your horizon, not borrowed from a headline, and that you revisit it as both change.

Then check the sensitivity. Run the calculation at 10% and at 12%, and at 6% inflation and at 7%. The spread between those runs is the real answer — a range you are working within, rather than a single number that implies a precision nobody has.

Build your own on the [SIP calculator](/in/sip-calculator) for the monthly figure and the [NPS calculator](/in/nps-calculator) if a chunk of your retirement sits there, and read the [inflation guide](/blog/inflation-real-returns-india) for why the first step above is the one that decides everything after it.`,
  },

  {
    slug: "what-happens-if-you-miss-an-emi",
    title: "What actually happens when you miss an instalment",
    excerpt:
      "One missed payment is a late fee and a bounce charge. Three is a credit report entry that outlasts the loan. Knowing the sequence is what lets you act while there are still options.",
    coverVariant: "rose",
    tags: "missed EMI, credit score, loan default",
    keywords:
      "missed EMI consequences, what happens if EMI bounces, EMI default credit score, loan restructuring India, cannot pay EMI what to do",
    seoDescription:
      "The sequence after a missed instalment: late fee, bounce charge, credit report entry at 30 days, NPA classification at 90. What to do at each stage, and what to do before the first one.",
    content: `Most people who miss an instalment do it once, by accident, and resolve it in a week. A few are heading somewhere worse. The difference is almost entirely in how early they talk to the lender — and that depends on knowing what the sequence is.

## The sequence

**Day one.** The auto-debit fails. Your bank charges a return fee and the lender charges a late-payment penalty, typically a percentage of the overdue instalment with a floor. Both are small. Nothing has been reported anywhere.

**Within 30 days.** Still recoverable without lasting damage. Lenders generally report to the credit bureaus on a monthly cycle, so an instalment cleared inside the month often never appears as a delinquency. This window is the one worth using.

**At 30 days.** The account is reported as overdue. This is the point at which a missed payment stops being a private matter between you and the lender and starts being a fact about you that every future lender can see. Payment history is the single largest input into a credit score, and this entry persists for years — typically longer than it takes to clear the loan itself.

**At 90 days.** The account is classified as non-performing. Recovery escalates, the tone of the correspondence changes, and on a secured loan the lender's options begin to include the collateral.

**Beyond that.** On a secured loan — a home or car loan — the lender has a process to take possession of the asset, with statutory notice requirements. On an unsecured loan they have recovery action and the courts. Either way, costs are added to what you owe.

## The cost of one month, on real numbers

Penalties vary by lender, so take the interest instead. On a **₹10,00,000 car loan at 9.5% over seven years**, the instalment is ₹16,344 and **one month's interest alone is ₹7,917**.

That is what the delay costs in interest terms before any penalty. The penalty and bounce charge sit on top, and they are lender-specific — which is itself worth knowing: ask what yours are before you need to.

## What to do, in order

**Before anything goes wrong, know your dates.** The day the debit hits and the day your salary lands. A surprising share of missed instalments are a timing mismatch rather than a shortage, and a lender will usually move the debit date if you ask.

**The moment you know a payment will fail, call them.** Not after. This is the single most useful thing in this article. A borrower who rings in advance is treated differently from one who goes quiet, because the lender's problem is uncertainty as much as money.

**Ask what is available.** Depending on the lender and the loan, there may be a short deferral, a tenure extension that lowers the instalment, a temporary interest-only arrangement, or a formal restructuring. None of these are free — extending the term costs more interest, and a restructuring may be reported — but all of them beat a default.

**Get it in writing.** Whatever is agreed, have it confirmed in writing before the next due date, and check the credit report a month later to see how it was reported.

## What not to do

**Do not borrow at a higher rate to pay a lower one.** Taking a personal loan at 14% to cover a home loan instalment at 8.5%, or worse putting it on a credit card, converts a short problem into a longer and more expensive one.

**Do not ignore the correspondence.** Recovery processes have statutory notice stages, and those notices contain response windows. Rights you do not exercise in time are rights you lose.

**Do not stop paying the secured loan to keep the unsecured one current.** If you have to prioritise, the loan with your house behind it is the one that costs you the most to default on.

## The underlying point

A missed instalment is a process with stages, not a cliff. Almost every stage has an option attached, and the options get worse as you go. The borrowers who come out of this well are not the ones with more money — they are the ones who made the call in the first fortnight.

If you are heading toward trouble, it is worth modelling the alternative before you ring: run your loan on the [home loan calculator](/in/home-loan-emi-calculator) with a longer term to see what a tenure extension would do to the instalment, and what it would add in total interest. Going into that conversation with a specific proposal is considerably better than going in with a problem.`,
  },
];

async function main() {
  const existing = new Set(
    (await all<{ slug: string }>(`SELECT slug FROM posts`)).map((p) => p.slug),
  );

  let added = 0;
  for (const g of GUIDES) {
    if (existing.has(g.slug)) {
      console.log(`  skip   ${g.slug} (already published)`);
      continue;
    }
    await run(
      `INSERT INTO posts
         (slug, title, excerpt, content, cover_variant, tags, author, status,
          seo_description, keywords, country, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'published', ?, ?, 'in', datetime('now'))`,
      [
        g.slug,
        g.title,
        g.excerpt,
        g.content,
        g.coverVariant,
        g.tags,
        AUTHOR.name,
        g.seoDescription,
        g.keywords,
      ],
    );
    console.log(`  added  ${g.slug}`);
    added++;
  }

  const total = await all<{ n: number }>(
    `SELECT COUNT(*) AS n FROM posts WHERE status = 'published'`,
  );
  console.log(`\n${added} added. ${total[0]?.n ?? 0} guides published.\n`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
