import type { SchemeId } from "./schemes";
import type { LoanTypeId } from "./site";

export interface Faq {
  question: string;
  answer: string;
}

/**
 * FAQ copy lives here so the visible accordion and the FAQPage JSON-LD are
 * generated from one source — Google penalises structured data that does not
 * match the rendered page, which is exactly what happens when the two drift.
 */
export const GENERAL_FAQS: Faq[] = [
  {
    question: "How is EMI calculated?",
    answer:
      "EMI = P × r × (1+r)^n ÷ ((1+r)^n − 1), where P is the principal, r the monthly interest rate (annual rate ÷ 12 ÷ 100) and n the number of monthly instalments. This is the reducing-balance method lenders use: interest each month is charged only on the balance still outstanding, so the interest portion of your EMI shrinks and the principal portion grows as the loan runs down.",
  },
  {
    question: "Should I reduce my tenure or reduce my EMI when I make a part payment?",
    answer:
      "Reducing the tenure almost always saves more money, because you stop paying interest sooner. Reducing the EMI keeps you paying for the original term and only lowers the monthly outgo. Choose tenure reduction if your cash flow is comfortable and you want the maximum interest saving; choose EMI reduction if your monthly budget is tight and breathing room matters more than the total saved. The calculator shows both outcomes side by side.",
  },
  {
    question: "Does a part payment early in the loan save more than one later?",
    answer:
      "Yes, substantially. Interest is charged on the outstanding balance, so a rupee repaid in year 2 avoids interest for the remaining 18 years, while the same rupee in year 15 avoids only five years of it. On a typical 20-year home loan, a lump sum in year 2 can save several times what the identical amount saves in year 12.",
  },
  {
    question: "Are processing fees and tax on them included in the calculation?",
    answer:
      "Yes. The calculator applies your processing fee as a percentage of the sanctioned amount, adds the tax rate you enter on that fee, and reports a Total Cost of Loan that includes both. This matters when comparing lenders: a bank offering a rate 0.1% lower but charging double the processing fee can easily be the more expensive option on a short tenure.",
  },
  {
    question: "Can I compare loan offers from different banks?",
    answer:
      "Yes. The comparison tool takes up to four lenders with independent amounts, rates, tenures, processing fees and part-payment plans, then ranks them by total outflow rather than by headline rate — which is the only comparison that reflects fees honestly. You can prefill the rates from our bank interest rates table.",
  },
  {
    question: "Is my data safe? Do you store what I enter?",
    answer:
      "Every calculation runs entirely in your browser. Loan amounts, rates and tenures are never transmitted to our servers or stored anywhere. We record anonymous page-view counts to understand which tools get used, using a random session identifier that is discarded when you close the tab and a one-way hash of your IP address — never the address itself, and never a tracking cookie. Visitors sending a Do Not Track signal are excluded entirely.",
  },
  {
    question: "Are the bank interest rates on this site current?",
    answer:
      "Every rate row carries the date it was recorded and a link to the lender's own published page. Rates change frequently — floating rates move with the lender's benchmark, and the rate you are actually offered depends on your credit score, income, loan-to-value ratio and existing relationship with the bank. Always confirm on the lender's website or in writing before acting on any figure.",
  },
  {
    question: "Is this financial advice?",
    answer:
      "No. Loan Calculator Pro is a calculation tool, not a lender, broker or financial adviser. It shows you the arithmetic of a loan on the numbers you enter. Whether a particular loan suits your circumstances is a decision for you, and if the amount is significant it is worth discussing with a qualified adviser. Your lender's sanction letter is the only authoritative statement of your EMI, interest and charges.",
  },
];

/** Extra, product-specific questions appended on each calculator landing page. */
export const LOAN_TYPE_FAQS: Record<LoanTypeId, Faq[]> = {
  home: [
    {
      question: "How much of my home loan EMI is interest in the early years?",
      answer:
        "On a 20-year home loan at 8.5%, about 81% of your first year's instalments go to interest and only 19% reduces the principal. The crossover — where principal overtakes interest within a single EMI — does not arrive until month 143, in the twelfth year. This is precisely why prepaying early has such a large effect: the same lump sum is worth roughly three and a half times as much in year two as it is in year twelve. The year-by-year chart on this page shows the split for your own numbers.",
    },
    {
      question: "Can I claim tax deductions on a home loan?",
      answer:
        "Under the old tax regime, Section 24(b) allows a deduction on interest paid for a self-occupied property, and Section 80C covers principal repayment within the overall 80C limit. The new regime largely removes these benefits for self-occupied property. Limits and eligibility change with each Finance Act, so check the current year's rules or ask a tax professional — this calculator does not model tax relief.",
    },
    {
      question: "Should I prepay my home loan or invest the money instead?",
      answer:
        "The arithmetic comparison is your loan's interest rate against the return you would earn elsewhere, after tax and adjusted for risk. Prepaying gives a guaranteed, risk-free return equal to your loan rate; an investment offering more comes with the risk of delivering less. The right answer depends on your rate, tax position, job security and how you feel about carrying debt. This tool quantifies the loan side precisely; it cannot tell you what to do.",
    },
  ],
  car: [
    {
      question: "Why is my car loan rate higher than a home loan rate?",
      answer:
        "A car is a depreciating asset, so the lender's security loses value from the day you drive it away, while property generally does not. That extra risk shows up as a higher rate and a shorter maximum tenure — typically up to seven years for a new car and less for a used one.",
    },
    {
      question: "Is a longer car loan tenure a bad idea?",
      answer:
        "Stretching a car loan lowers the EMI but raises total interest, and it increases the risk of negative equity — owing more than the car is worth, which becomes a problem if you sell or write it off early. Run both tenures in the calculator and compare the Total Cost of Loan figure before choosing the longer term.",
    },
  ],
  personal: [
    {
      question: "Why do personal loan rates vary so much between lenders?",
      answer:
        "Personal loans are unsecured — there is no asset backing them — so pricing is driven almost entirely by the lender's assessment of you: credit score, income stability, employer category and existing obligations. This is why the same borrower can see offers spanning a very wide band, and why comparing the total cost across several lenders is worth the effort.",
    },
    {
      question: "What are foreclosure and part-payment charges on a personal loan?",
      answer:
        "Many lenders levy a fee on early closure of a fixed-rate personal loan, and some impose a lock-in period before any prepayment is allowed. These charges are not modelled by this calculator — check your loan agreement, then compare the fee against the interest saving the calculator shows to decide whether prepaying is worthwhile.",
    },
  ],
  business: [
    {
      question: "What is the difference between a term loan and working capital?",
      answer:
        "A term loan is a fixed amount repaid on a schedule of EMIs — that is what this calculator models. Working capital facilities such as cash credit or overdraft charge interest only on the amount actually drawn, with no fixed repayment schedule, so an EMI calculation does not apply to them.",
    },
  ],
  education: [
    {
      question: "How does the moratorium period on an education loan work?",
      answer:
        "Most education loans allow a moratorium covering the course duration plus six to twelve months, during which you make no EMI payments. Interest usually still accrues and is added to the principal, so the balance you begin repaying is larger than the amount disbursed. This calculator models the repayment phase — enter the post-moratorium balance as the loan amount for an accurate EMI.",
    },
  ],
  gold: [
    {
      question: "How is a gold loan different from other loans?",
      answer:
        "A gold loan is secured against pledged jewellery, so approval is fast and credit history matters far less. Tenures are short — often 6 to 24 months — and some schemes are bullet-repayment (all interest and principal at the end) rather than EMI-based. Use this calculator for EMI-based gold loan schemes.",
    },
  ],
};

export function faqsFor(loanType: LoanTypeId): Faq[] {
  return [...LOAN_TYPE_FAQS[loanType], ...GENERAL_FAQS.slice(0, 5)];
}

/* ------------------------------------------------------------------ */
/* Investment and savings schemes                                      */
/* ------------------------------------------------------------------ */

/**
 * Questions for each savings and investment calculator.
 *
 * These exist because the scheme pages had a calculator and almost no prose
 * around it, while the loan pages carried FAQs and an accuracy note — roughly
 * half the readable content for the same kind of page. A tool with a thin
 * wrapper is what "low value content" describes, and these pages were the
 * thinnest on the site.
 *
 * Deliberately no rates, limits or thresholds in the copy. Those are set by
 * government and change; they are stored with a source and an effective date
 * and rendered from the database. What is written here is mechanism, which
 * does not move: how the arithmetic works, what the projection assumes, and
 * where people misread the output.
 *
 * Tax answers describe character rather than rates, and say so — the Finance
 * Act rewrites the detail most years.
 */
export const SCHEME_FAQS: Record<SchemeId, Faq[]> = {
  sip: [
    {
      question: "What does a SIP projection actually assume?",
      answer:
        "That every instalment is paid on time, that none is missed, and that the return you entered is earned steadily, every month, for the whole term. Real markets do none of that. A fund returning an average of 12% over ten years will have had years of 30% and years of −20%, and the order those arrive in changes what you end up with. Treat the figure as the arithmetic consequence of your assumption, not a forecast.",
    },
    {
      question: "Is the projected return guaranteed?",
      answer:
        "No. A SIP is a way of buying into a mutual fund on a schedule, not a product with a promised rate. Nothing about the instalment structure guarantees anything — the money is in the market, and the value can be lower than the amount you put in, including on the day you need it. This is the single most important difference between this calculator and the PPF or fixed-deposit ones, where the rate is contractual or set by government.",
    },
    {
      question: "Why does this page show XIRR rather than CAGR?",
      answer:
        "CAGR describes one sum held for one period. A SIP is dozens of separate sums, each held for a different length of time — the first instalment compounds for the full term, the last for a month. XIRR is the rate that makes all of those cash flows, on their actual dates, add up to the final value. Quoting CAGR on a SIP overstates the return, because it credits the whole corpus with the full term.",
    },
    {
      question: "Does investing monthly protect me from a market fall?",
      answer:
        "It changes your average purchase price, not your exposure. Buying on a schedule means you buy more units when prices are low and fewer when they are high, which smooths the price you paid in. It does nothing about the value of what you already hold: a portfolio built over ten years falls with the market in year ten, and by then the accumulated balance is far larger than any single instalment.",
    },
    {
      question: "What happens if I stop or pause the instalments?",
      answer:
        "Stopping ends the contributions; it does not sell what you hold, which stays invested and keeps rising or falling with the fund. The lasting cost is compounding you no longer get — an instalment missed early in the term had the most time to grow, so it is worth more than the same amount missed near the end. Model it by shortening the term and comparing the two maturity figures.",
    },
  ],

  lumpsum: [
    {
      question: "How is the maturity value worked out?",
      answer:
        "One sum, compounded annually at the rate you enter, for the number of years you enter — the standard future-value calculation. Because there is a single investment held for a single period, the growth rate is directly meaningful, which is why this page reports CAGR while the SIP page reports XIRR.",
    },
    {
      question: "Is a lump sum better than investing the same amount monthly?",
      answer:
        "The arithmetic favours the lump sum, because every rupee is exposed for the full term rather than being phased in. That is not the same as it being the better decision: it also means the entire amount is exposed to whatever the market does immediately after you invest. The comparison tool puts both side by side so you can see the size of the difference on your own numbers, and it deliberately does not name a winner.",
    },
    {
      question: "What does the projection leave out?",
      answer:
        "Expense ratios, exit loads, transaction costs and tax. A fund's published return is usually net of its expense ratio but nothing else. If you want a figure closer to what reaches your bank account, reduce the rate you enter to account for costs, and treat the result as pre-tax.",
    },
    {
      question: "How much does the assumed rate change the answer?",
      answer:
        "Far more than most people expect, and more the longer the term. Compounding is exponential, so a one-point difference in the assumed rate is a small gap over three years and a large one over twenty. It is worth running the calculator twice — once at the rate you hope for and once two or three points lower — and treating the lower figure as the planning number.",
    },
    {
      question: "What is absolute return and why show it alongside CAGR?",
      answer:
        "Absolute return is simply how much more you have than you put in, as a percentage, with no reference to time. It answers \"how much did this grow\", while CAGR answers \"how fast\". A 60% absolute return is good over three years and poor over twenty, and showing only one of the two numbers is how people end up comparing investments that are not comparable.",
    },
  ],

  fd: [
    {
      question: "How is the maturity amount calculated?",
      answer:
        "By compounding the deposit at the contracted rate for the full term. The default here is quarterly compounding, which is the common convention for cumulative deposits — interest is added to the balance every quarter and then earns interest itself. A deposit that pays interest out monthly or quarterly instead of reinvesting it will mature at a lower figure, because nothing is compounding.",
    },
    {
      question: "Does compounding frequency change the result much?",
      answer:
        "A little, and predictably. More frequent compounding on the same nominal rate produces a slightly higher maturity value, because interest starts earning sooner. The gap between quarterly and annual compounding is real but small next to the gap between two different rates, so it is rarely the thing worth optimising for.",
    },
    {
      question: "Is the rate fixed for the whole term?",
      answer:
        "That is the defining feature of the product: the rate is agreed on the day you open the deposit and does not move afterwards, whatever happens to rates in the market. That protects you if rates fall and works against you if they rise. Renewal is a fresh decision at whatever rate is being offered then.",
    },
    {
      question: "How is the interest taxed in India?",
      answer:
        "Interest on a bank fixed deposit is added to your income and taxed at your slab rate, and banks deduct tax at source once the interest crosses an annual threshold. This calculator reports the pre-tax maturity value, so your actual return is lower — how much lower depends on your slab. Thresholds and rules change with each Finance Act, so check the current year's position.",
    },
    {
      question: "What happens if I break the deposit before maturity?",
      answer:
        "Most banks pay interest at the rate that applied to the shorter period the money was actually held for, and many apply a penalty on top. The effect is that an early exit can return meaningfully less than the projection on this page, which assumes the deposit runs its full term. If there is a real chance you will need the money, that is worth weighing before locking a long tenure for a slightly better rate.",
    },
  ],

  rd: [
    {
      question: "How does a recurring deposit differ from a fixed deposit?",
      answer:
        "A fixed deposit is one sum placed once. A recurring deposit is a fixed amount paid in every month, each instalment earning interest from the date it lands. The rate is contractual in both cases, but because your later instalments are only invested for a few months, the return on the total amount you paid in is lower than the headline rate suggests.",
    },
    {
      question: "Why is my effective return lower than the advertised rate?",
      answer:
        "Because not all of your money is invested for the full term. The first instalment earns interest for the whole period; the last earns it for one month. The advertised rate is correct — it is applied to each instalment for however long that instalment is held — but the return measured against your total contribution is necessarily lower. This is the same reason a SIP reports XIRR rather than a simple growth rate.",
    },
    {
      question: "What happens if I miss a monthly instalment?",
      answer:
        "Banks generally charge a small penalty and, if instalments are missed repeatedly, may close the account early and pay a reduced rate. The projection here assumes every instalment is paid on schedule, so a patchy record produces a lower maturity value than the figure shown.",
    },
    {
      question: "How is recurring deposit interest taxed in India?",
      answer:
        "The same way as a fixed deposit: interest is added to your income and taxed at your slab rate, with tax deducted at source above an annual threshold. The figure on this page is before tax. The specifics change with the Finance Act, so confirm the current year's rules rather than relying on last year's.",
    },
    {
      question: "Recurring deposit or SIP?",
      answer:
        "They answer different questions. A recurring deposit gives a contractual rate and a known maturity value, and the bank carries the risk. A SIP puts the same monthly amount into a market where the outcome is unknown in both directions. The comparison tool shows both on the same amount and term, with risk, lock-in and guarantee stated alongside, precisely because the maturity figures alone are not comparable.",
    },
  ],

  ppf: [
    {
      question: "How is PPF interest calculated?",
      answer:
        "On the lowest balance in the account between the fifth day and the last day of each month, credited once at the end of the financial year. The practical consequence is that a deposit made on or before the fifth earns interest for that month, and the same deposit made on the sixth does not. Over fifteen years, consistently depositing early in the month is worth a noticeable amount for no extra money.",
    },
    {
      question: "Who sets the rate, and how often does it change?",
      answer:
        "The government notifies small-savings rates quarterly, so the rate is not fixed for the life of the account the way a bank deposit rate is — it applies to the quarter and can be revised. This calculator projects forward at a single rate, which is a simplification: the real account will have earned several different rates across its term. The rate shown on this page is recorded with the source it was read from and the date it was checked.",
    },
    {
      question: "What happens at the end of fifteen years?",
      answer:
        "The account matures and you can withdraw the whole balance, or extend in blocks of five years — with or without continuing to contribute. An extended account keeps earning the notified rate, which is why some people leave a matured PPF running rather than closing it. Extension has to be requested within a window after maturity.",
    },
    {
      question: "Can I take money out before maturity?",
      answer:
        "Only within limits. Partial withdrawals become available after a number of years and are capped by a formula based on the earlier balance, and loans against the balance are possible in the early years. A full exit before maturity is allowed only in specific circumstances and carries an interest penalty. Treat the money as locked for planning purposes.",
    },
    {
      question: "How is PPF taxed?",
      answer:
        "PPF has historically been exempt at all three stages in India — the deposit qualifies for deduction, the interest is not taxed as it accrues, and the maturity amount is not taxed on withdrawal. That treatment is set by legislation and can be amended, and the deduction depends on which tax regime you are under. Confirm the current year's position before relying on it.",
    },
  ],

  ssy: [
    {
      question: "Who can open a Sukanya Samriddhi account?",
      answer:
        "A parent or legal guardian, for a girl child below a specified age, with a limit on how many accounts a family can hold. The account is in the child's name and she operates it herself once she reaches adulthood. Eligibility rules are set by the scheme and are worth confirming at the post office or bank before you plan around it.",
    },
    {
      question: "Why does the calculator show a gap between deposits and maturity?",
      answer:
        "Because the scheme has one. Deposits are made for the first fifteen years from opening, but the account matures at twenty-one years. In those final years no further deposits are required and the balance simply keeps earning the notified rate. That gap is modelled here, which is why the maturity figure is meaningfully higher than a fifteen-year projection would suggest.",
    },
    {
      question: "Can money be withdrawn before maturity?",
      answer:
        "A partial withdrawal is allowed once the girl reaches a set age or stage of education, capped as a share of the previous year's balance, and the account can be closed early on marriage after a specified age. Outside those cases the balance stays locked, which is the trade for the rate.",
    },
    {
      question: "What happens if a year's deposit is missed?",
      answer:
        "The account is treated as in default and has to be regularised with a small penalty per missed year, paid along with the minimum deposit for each. Until it is regularised the account can lose its entitlement to the notified rate. The projection here assumes an unbroken deposit record.",
    },
    {
      question: "How is it taxed?",
      answer:
        "Sukanya Samriddhi has historically had the same exempt treatment as PPF at all three stages in India, with the deposit qualifying for deduction under the applicable section. As with any statutory scheme, this is set by legislation, depends on your tax regime, and can change — check the current year's rules.",
    },
  ],

  nps: [
    {
      question: "What does the corpus projection assume?",
      answer:
        "That you contribute the amount you entered, every year, until retirement, and that the blended portfolio returns the rate you entered throughout. NPS invests across equity and debt in proportions you choose, so the realistic return depends heavily on that mix — an equity-heavy allocation has a wider range of outcomes in both directions than a debt-heavy one.",
    },
    {
      question: "Can I take the whole corpus as cash at retirement?",
      answer:
        "No. A minimum share of the corpus must be used to buy an annuity that pays a pension; the rest can be withdrawn as a lump sum. That is the defining constraint of the product and the main thing that separates it from an ordinary retirement portfolio. The calculator shows the split so the lump sum is not mistaken for the whole balance.",
    },
    {
      question: "Why doesn't the calculator show my monthly pension?",
      answer:
        "Because it would be a guess. The pension depends on annuity rates on the day you retire, decades from now, and on which annuity variant you choose — whether it continues to a spouse, whether the purchase price is returned. Projecting a monthly figure would mean inventing a rate for a future market, so the calculator stops at the corpus and the split.",
    },
    {
      question: "What does the choice of fund and allocation change?",
      answer:
        "The distribution of outcomes, not just the average. A higher equity share raises the expected corpus and widens the range around it; the lifecycle options reduce equity automatically as you approach retirement, which narrows the range late on when there is no time to recover from a fall. Running the calculator at two or three different rates shows how much that choice matters over your remaining term.",
    },
    {
      question: "How is NPS taxed in India?",
      answer:
        "Contributions attract deductions, including one available over and above the general limit; at exit the lump-sum portion has been tax-free within limits while the annuity income is taxed as income in the year it is received. The detail depends on your tax regime and is revisited in Finance Acts, so treat this as the shape of the treatment and confirm the current rules.",
    },
  ],

  epf: [
    {
      question: "How does an EPF balance build up?",
      answer:
        "From three things: your contribution, your employer's contribution, and interest on the accumulated balance. Part of the employer's share is directed to the linked pension scheme rather than the provident fund itself, so the amount landing in your EPF is smaller than the headline percentages imply. The rate is declared annually rather than fixed for the term.",
    },
    {
      question: "Does the projection account for salary increases?",
      answer:
        "Only if you tell it to. Contributions are a percentage of salary, so a career of rising salaries produces a much larger balance than a flat projection suggests. Entering an annual growth assumption gives a more realistic figure — and comparing it against a no-growth run shows how much of the eventual balance comes from raises rather than returns.",
    },
    {
      question: "What happens to the balance when I change jobs?",
      answer:
        "It should be transferred to the new employer's account against the same universal account number, which keeps the balance and the service history intact. Withdrawing instead of transferring resets the compounding that makes the later years worth so much — the balance in the final years of a career is doing most of the work, and it can only get there uninterrupted.",
    },
    {
      question: "When can I withdraw?",
      answer:
        "The full balance is normally available at retirement or after a continuous period without employment. Partial withdrawals are permitted for specified purposes — housing, medical treatment, education, marriage — each with its own conditions on service length and amount. The projection assumes nothing is withdrawn along the way.",
    },
    {
      question: "How is EPF taxed?",
      answer:
        "EPF has historically been exempt at all three stages in India, subject to conditions — notably a minimum period of continuous service, and a cap above which interest on large employee contributions becomes taxable. Withdrawing before completing that service period can make the amount taxable. The conditions change, so confirm the current year's rules before planning a withdrawal.",
    },
  ],
};

/** FAQs for a scheme page, general questions appended as on the loan pages. */
export function schemeFaqsFor(id: SchemeId): Faq[] {
  return SCHEME_FAQS[id] ?? [];
}
