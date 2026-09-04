import { AdminCountrySwitch } from "@/components/admin/country-switch";
import { RatesEditor } from "@/components/admin/rates-editor";
import { PageHeading } from "@/components/admin/widgets";
import { DEFAULT_COUNTRY, resolveCountry } from "@/lib/countries";
import { getBanks, getRates } from "@/lib/queries";

export default async function AdminRatesPage({
  searchParams,
}: {
  searchParams: Promise<{ country?: string }>;
}) {
  const { country: requested } = await searchParams;
  const country = resolveCountry(requested ?? DEFAULT_COUNTRY);

  const [banks, rates] = await Promise.all([
    getBanks(country.code).catch(() => []),
    getRates(country.code).catch(() => []),
  ]);

  return (
    <>
      <AdminCountrySwitch current={country.code} />

      <PageHeading
        title="Bank rates"
        description="Transcribe each lender's published rate, add the page you took it from, then tick Verified. Only verified rows show a figure on the public site."
      />

      <div className="mb-5 rounded-xl border-l-4 border-amber-500 bg-amber-50 p-4 dark:bg-amber-950/40">
        <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
          Never enter a rate you have not read on the lender&rsquo;s own page
        </p>
        <p className="mt-1 text-sm leading-relaxed text-amber-800 dark:text-amber-300">
          These figures are published on a public finance site, so an invented or half-remembered
          number is a real liability. The Verified checkbox is deliberately refused unless the row
          has both a rate and a source URL — leave a gap rather than filling it with a guess.
        </p>
      </div>

      <RatesEditor banks={banks} rates={rates} country={country.code} />
    </>
  );
}
