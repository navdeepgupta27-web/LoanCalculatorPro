/**
 * Emits a JSON-LD block.
 *
 * The payload is serialised with `<` escaped so a stray "</script>" inside any
 * admin-authored string (a post title, say) cannot break out of the tag.
 */
export function JsonLd({ data }: { data: object | object[] }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      // The value is serialised JSON, never raw user markup.
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
