import "server-only";

import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

import { slugify } from "./utils";

/**
 * Renders admin-authored Markdown to HTML.
 *
 * Only the admin can write posts, but the output is still sanitised: a stored
 * XSS in blog content would execute for every visitor, so the cost of getting
 * this wrong is far higher than the cost of the allowlist.
 */

marked.setOptions({ gfm: true, breaks: false });

const ALLOWED_TAGS = [
  "h1", "h2", "h3", "h4", "h5", "h6",
  "p", "a", "ul", "ol", "li", "blockquote", "hr", "br",
  "strong", "em", "del", "code", "pre",
  "table", "thead", "tbody", "tr", "th", "td",
  "img", "figure", "figcaption", "span", "div",
];

export interface Heading {
  id: string;
  text: string;
  level: number;
}

export interface RenderedMarkdown {
  html: string;
  headings: Heading[];
}

export async function renderMarkdown(md: string): Promise<RenderedMarkdown> {
  const headings: Heading[] = [];
  const seen = new Map<string, number>();

  const renderer = new marked.Renderer();
  renderer.heading = ({ tokens, depth }) => {
    const text = renderer.parser.parseInline(tokens);
    const plain = text.replace(/<[^>]*>/g, "");
    let id = slugify(plain) || `section-${headings.length + 1}`;
    // De-duplicate ids so anchor links stay unambiguous.
    const count = seen.get(id) ?? 0;
    seen.set(id, count + 1);
    if (count > 0) id = `${id}-${count + 1}`;
    if (depth === 2 || depth === 3) headings.push({ id, text: plain, level: depth });
    return `<h${depth} id="${id}">${text}</h${depth}>\n`;
  };

  const raw = await marked.parse(md, { renderer });

  const html = sanitizeHtml(raw, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "title", "loading", "width", "height"],
      "*": ["id", "class"],
      td: ["colspan", "rowspan"],
      th: ["colspan", "rowspan", "scope"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      // External links open in a new tab and cannot reach back via window.opener.
      a: (tagName, attribs) => {
        const href = attribs.href ?? "";
        const external = /^https?:\/\//i.test(href) && !href.includes("loancalculatorpro.in");
        return {
          tagName,
          attribs: external
            ? { ...attribs, target: "_blank", rel: "noopener noreferrer nofollow" }
            : attribs,
        };
      },
      img: (tagName, attribs) => ({ tagName, attribs: { ...attribs, loading: "lazy" } }),
    },
  });

  return { html, headings };
}

/** First ~30 words of a post, used when the author leaves the excerpt blank. */
export function autoExcerpt(md: string, words = 30): string {
  const plain = md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~|-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const parts = plain.split(" ").slice(0, words);
  return parts.join(" ") + (plain.split(" ").length > words ? "…" : "");
}
