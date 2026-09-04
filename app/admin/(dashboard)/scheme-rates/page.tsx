import { AdminCountrySwitch } from "@/components/admin/country-switch";
import { SchemeRatesEditor } from "@/components/admin/scheme-rates-editor";
import { PageHeading } from "@/components/admin/widgets";
import { DEFAULT_COUNTRY, resolveCountry } from "@/lib/countries";
import { getSchemeRates } from "@/lib/queries";

export default async function AdminSchemeRatesPage({
  searchParams,
}: {
  searchParams: Promise<{ country?: string }>;
}) {
  const { country: requested } = await searchParams;
  const country = resolveCountry(requested ?? DEFAULT_COUNTRY);
  const rates = await getSchemeRates(country.code).catch(() => []);

  return (
    <>
      <AdminCountrySwitch current={country.code} />

      <PageHeading
        title="Scheme rates"
        description="Government-set rates for PPF, Sukanya Samriddhi and EPF. Record the figure with the page you read it on, then confirm it."
      />

      <div className="mb-5 rounded-xl border-l-4 border-amber-500 bg-amber-50 p-4 dark:bg-amber-950/40">
        <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
          Check every figure against its source before confirming
        </p>
        <p className="mt-1 text-sm leading-relaxed text-amber-800 dark:text-amber-300">
          These are statutory rates published on a public finance site, so a wrong one is a real
          liability. The Confirmed tick is refused unless the row has both a rate and a source URL.
          Rates seeded by the setup script start unconfirmed on purpose — during research one source
          reported PPF at 8.2%, which is in fact the Sukanya Samriddhi and SCSS rate.
        </p>
      </div>

      <SchemeRatesEditor rates={rates} country={country.code} />
    </>
  );
}
