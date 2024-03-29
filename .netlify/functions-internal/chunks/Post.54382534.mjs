import { c as createMetadata, p as $$module1, f as createAstro, g as createComponent, r as renderTemplate, q as maybeRenderHead, i as renderComponent, s as $$Aside, n as renderSlot } from '../entry.mjs';
/* empty css                    */import 'html-escaper';

const $$metadata = createMetadata("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/blog/Post.astro", { modules: [{ module: $$module1, specifier: "../Aside.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro = createAstro("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/blog/Post.astro", "https://blackskies.vercel.app/", "file:///C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/");
const $$Post = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Post;
  const { title, writer, publishDate, alt, img, tags } = Astro2.props;
  const { minutesRead } = Astro2.props;
  console.log(minutesRead);
  const STYLES = [];
  for (const STYLE of STYLES)
    $$result.styles.add(STYLE);
  return renderTemplate`${maybeRenderHead($$result)}<div class="page-container astro-7OC53IYW">
	${renderComponent($$result, "Aside", $$Aside, { "writter": writer, "class": "astro-7OC53IYW" })}
	<article class="article astro-7OC53IYW">
		<!-- <img class="center-cropped" src={img} alt={alt} height={200} /> -->
		<div class="astro-7OC53IYW">
			<div class="coffee astro-7OC53IYW">
			</div>
			<div class="details astro-7OC53IYW">
				<h1 class="astro-7OC53IYW">${title}</h1>
				<p class="astro-7OC53IYW">${writer}</p>
				<span class="astro-7OC53IYW">${publishDate}  |  ${tags}</span>
				<p class="reading astro-7OC53IYW">📖${minutesRead}</p>
			</div>
		</div>
		<main class="astro-7OC53IYW">
			${renderSlot($$result, $$slots["default"])}
		</main>
	</article>
</div>


`;
});

const $$file = "C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/blog/Post.astro";
const $$url = undefined;

const $$module4 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata,
	default: $$Post,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

export { $$module4 as $, $$Post as a };
