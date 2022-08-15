import { c as createMetadata, $ as $$module1, a as $$module2, b as $$module3, d as $$module5, e as $$module6, f as createAstro, g as createComponent, r as renderTemplate, h as addAttribute, i as renderComponent, j as $$MetaTags, k as renderHead, l as $$Cursor, m as $$Navbar, n as renderSlot, o as $$Footer } from '../entry.mjs';
/* empty css                    */import { $ as $$module4, a as $$Post } from './Post.54382534.mjs';
import 'html-escaper';
import '@astrojs/netlify/netlify-functions.js';
import 'preact';
import 'preact-render-to-string';
import 'solid-js/web';
import 'etag';
import 'mrmime';
import 'sharp';
import 'node:fs/promises';
/* empty css                 *//* empty css                    */import 'solid-js';
import 'node:path';
import 'node:url';
import 'node:fs';
import 'tiny-glob';
import 'slash';
import 'image-size';
/* empty css                  */import 'mime';
import 'kleur/colors';
import 'string-width';
import 'path-browserify';
import 'path-to-regexp';

const $$metadata = createMetadata("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/layouts/BlogPost.astro", { modules: [{ module: $$module1, specifier: "../components/MetaTags.astro", assert: {} }, { module: $$module2, specifier: "../components/Navbar.astro", assert: {} }, { module: $$module3, specifier: "../components/cursorEffect/Cursor.astro", assert: {} }, { module: $$module4, specifier: "../components/blog/Post.astro", assert: {} }, { module: $$module5, specifier: "../components/footer/Footer.astro", assert: {} }, { module: $$module6, specifier: "../utils/types", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
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
