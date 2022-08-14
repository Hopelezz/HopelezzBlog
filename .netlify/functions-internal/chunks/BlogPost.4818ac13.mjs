import { c as createMetadata, $ as $$module1, a as createAstro, b as createComponent, r as renderTemplate, m as maybeRenderHead, d as renderComponent, e as $$Aside, f as addAttribute, g as renderSlot, h as $$module1$1, i as $$module2, j as $$module3, k as $$module5, l as $$module6, n as $$MetaTags, o as renderHead, p as $$Cursor, q as $$Navbar, s as $$Footer } from '../entry.mjs';
/* empty css                    */import 'html-escaper';
import '@astrojs/netlify/netlify-functions.js';
import 'preact';
import 'preact-render-to-string';
import 'solid-js/web';
import 'etag';
import 'mrmime';
import 'sharp';
import 'node:fs/promises';
/* empty css                 */import 'solid-js';
import 'node:path';
import 'node:url';
import 'node:fs';
import 'tiny-glob';
import 'slash';
import 'image-size';
/* empty css                    */import 'mime';
import 'kleur/colors';
import 'string-width';
import 'path-browserify';
import 'path-to-regexp';

const $$metadata$1 = createMetadata("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/blog/Post.astro", { modules: [{ module: $$module1, specifier: "../Aside.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$1 = createAstro("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/blog/Post.astro", "https://blackskies.vercel.app/", "file:///C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/");
const $$Post = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$Post;
  const { title, writer, publishDate, alt, img, tags } = Astro2.props;
  const STYLES = [];
  for (const STYLE of STYLES)
    $$result.styles.add(STYLE);
  return renderTemplate`${maybeRenderHead($$result)}<div class="page-container astro-LACCVUR3">
	${renderComponent($$result, "Aside", $$Aside, { "writter": writer, "class": "astro-LACCVUR3" })}
	<article class="article astro-LACCVUR3">
		<img class="center-cropped astro-LACCVUR3"${addAttribute(img, "src")}${addAttribute(alt, "alt")}${addAttribute(200, "height")}>
		<div class="astro-LACCVUR3">
			<div class="coffee astro-LACCVUR3">
			</div>
			<div class="details astro-LACCVUR3">
				<h1 class="astro-LACCVUR3">${title}</h1>
				<p class="astro-LACCVUR3">${writer}</p>
				<span class="astro-LACCVUR3">${publishDate}  |  ${tags}</span>
				<p class="reading astro-LACCVUR3">📖</p>
			</div>
		</div>
		<main class="astro-LACCVUR3">
			${renderSlot($$result, $$slots["default"])}
		</main>
	</article>
</div>


`;
});

const $$file$1 = "C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/blog/Post.astro";
const $$url$1 = undefined;

const $$module4 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$1,
	default: $$Post,
	file: $$file$1,
	url: $$url$1
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata = createMetadata("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/layouts/BlogPost.astro", { modules: [{ module: $$module1$1, specifier: "../components/MetaTags.astro", assert: {} }, { module: $$module2, specifier: "../components/Navbar.astro", assert: {} }, { module: $$module3, specifier: "../components/cursorEffect/Cursor.astro", assert: {} }, { module: $$module4, specifier: "../components/blog/Post.astro", assert: {} }, { module: $$module5, specifier: "../components/footer/Footer.astro", assert: {} }, { module: $$module6, specifier: "../utils/types", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro = createAstro("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/layouts/BlogPost.astro", "https://blackskies.vercel.app/", "file:///C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/");
const $$BlogPost = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$BlogPost;
  const { content } = Astro2.props;
  const { title, publishDate, writer, href, description, img, alt, permalink } = content;
  const { minutesRead } = Astro2.props.content;
  const STYLES = [];
  for (const STYLE of STYLES)
    $$result.styles.add(STYLE);
  return renderTemplate`<html${addAttribute(content.lang || "en", "lang")} class="astro-F4UQDMN3">
	<head>
		${renderComponent($$result, "Meta", $$MetaTags, { "title": title, "description": description, "permalink": permalink, "class": "astro-F4UQDMN3" })}
	${renderHead($$result)}</head>

	<body class="astro-F4UQDMN3">
		${renderComponent($$result, "Cursor", $$Cursor, { "class": "astro-F4UQDMN3" })}
		${renderComponent($$result, "Navbar", $$Navbar, { "class": "astro-F4UQDMN3" })}
		<div class="container astro-F4UQDMN3">
			<main class="body home_content astro-F4UQDMN3">
				<div class="container astro-F4UQDMN3">
					<div class="grid astro-F4UQDMN3">
						${renderComponent($$result, "BlogPost", $$Post, { "title": title, "publishDate": publishDate, "writer": writer, "href": href, "img": img, "description": description, "alt": alt, "class": "astro-F4UQDMN3" }, { "default": () => renderTemplate`<p class="astro-F4UQDMN3">${minutesRead}</p>${renderSlot($$result, $$slots["default"])}` })}
					</div>
				</div>
			</main>
		</div>
	${renderComponent($$result, "Footer", $$Footer, { "class": "astro-F4UQDMN3" })}

</body></html>`;
});

const $$file = "C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/layouts/BlogPost.astro";
const $$url = undefined;

export { $$metadata, $$BlogPost as default, $$file as file, $$url as url };
