import * as adapter from '@astrojs/vercel/serverless/entrypoint';
import { ssr, renderToString, createComponent as createComponent$1, ssrHydrationKey, ssrAttribute, escape as escape$1 } from 'solid-js/web';
/* empty css                           *//* empty css                           *//* empty css                           */import { createSignal, Show, For } from 'solid-js';
/* empty css                           */import * as $$module1$2 from '@astrojs/markdown-remark/ssr-utils';

const slotName = (str) => str.trim().replace(/[-_]([a-z])/g, (_, w) => w.toUpperCase());

function check(Component, props, children) {
	if (typeof Component !== 'function') return false;
	const { html } = renderToStaticMarkup(Component, props, children);
	return typeof html === 'string';
}

function renderToStaticMarkup(Component, props, { default: children, ...slotted }) {
	const slots = {};
	for (const [key, value] of Object.entries(slotted)) {
		const name = slotName(key);
		slots[name] = ssr(`<astro-slot name="${name}">${value}</astro-slot>`);
	}
	// Note: create newProps to avoid mutating `props` before they are serialized
	const newProps = {
		...props,
		...slots,
		// In Solid SSR mode, `ssr` creates the expected structure for `children`.
		children: children != null ? ssr(`<astro-slot>${children}</astro-slot>`) : children,
	};
	const html = renderToString(() => createComponent$1(Component, newProps));
	return { html };
}

var _renderer0 = {
	check,
	renderToStaticMarkup,
};

/**
 * Copyright (C) 2017-present by Andrea Giammarchi - @WebReflection
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

const {replace} = '';
const ca = /[&<>'"]/g;

const esca = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  "'": '&#39;',
  '"': '&quot;'
};
const pe = m => esca[m];

/**
 * Safely escape HTML entities such as `&`, `<`, `>`, `"`, and `'`.
 * @param {string} es the input to safely escape
 * @returns {string} the escaped input, and it **throws** an error if
 *  the input type is unexpected, except for boolean and numbers,
 *  converted as string.
 */
const escape = es => replace.call(es, ca, pe);

const escapeHTML = escape;
class HTMLString extends String {
}
const markHTMLString = (value) => {
  if (value instanceof HTMLString) {
    return value;
  }
  if (typeof value === "string") {
    return new HTMLString(value);
  }
  return value;
};

const PROP_TYPE = {
  Value: 0,
  JSON: 1,
  RegExp: 2,
  Date: 3,
  Map: 4,
  Set: 5,
  BigInt: 6,
  URL: 7
};
function serializeArray(value) {
  return value.map((v) => convertToSerializedForm(v));
}
function serializeObject(value) {
  return Object.fromEntries(Object.entries(value).map(([k, v]) => {
    return [k, convertToSerializedForm(v)];
  }));
}
function convertToSerializedForm(value) {
  const tag = Object.prototype.toString.call(value);
  switch (tag) {
    case "[object Date]": {
      return [PROP_TYPE.Date, value.toISOString()];
    }
    case "[object RegExp]": {
      return [PROP_TYPE.RegExp, value.source];
    }
    case "[object Map]": {
      return [PROP_TYPE.Map, Array.from(value)];
    }
    case "[object Set]": {
      return [PROP_TYPE.Set, Array.from(value)];
    }
    case "[object BigInt]": {
      return [PROP_TYPE.BigInt, value.toString()];
    }
    case "[object URL]": {
      return [PROP_TYPE.URL, value.toString()];
    }
    case "[object Array]": {
      return [PROP_TYPE.JSON, JSON.stringify(serializeArray(value))];
    }
    default: {
      if (value !== null && typeof value === "object") {
        return [PROP_TYPE.Value, serializeObject(value)];
      } else {
        return [PROP_TYPE.Value, value];
      }
    }
  }
}
function serializeProps(props) {
  return JSON.stringify(serializeObject(props));
}

function serializeListValue(value) {
  const hash = {};
  push(value);
  return Object.keys(hash).join(" ");
  function push(item) {
    if (item && typeof item.forEach === "function")
      item.forEach(push);
    else if (item === Object(item))
      Object.keys(item).forEach((name) => {
        if (item[name])
          push(name);
      });
    else {
      item = item == null ? "" : String(item).trim();
      if (item) {
        item.split(/\s+/).forEach((name) => {
          hash[name] = true;
        });
      }
    }
  }
}

const HydrationDirectives = ["load", "idle", "media", "visible", "only"];
function extractDirectives(inputProps) {
  let extracted = {
    isPage: false,
    hydration: null,
    props: {}
  };
  for (const [key, value] of Object.entries(inputProps)) {
    if (key.startsWith("server:")) {
      if (key === "server:root") {
        extracted.isPage = true;
      }
    }
    if (key.startsWith("client:")) {
      if (!extracted.hydration) {
        extracted.hydration = {
          directive: "",
          value: "",
          componentUrl: "",
          componentExport: { value: "" }
        };
      }
      switch (key) {
        case "client:component-path": {
          extracted.hydration.componentUrl = value;
          break;
        }
        case "client:component-export": {
          extracted.hydration.componentExport.value = value;
          break;
        }
        case "client:component-hydration": {
          break;
        }
        default: {
          extracted.hydration.directive = key.split(":")[1];
          extracted.hydration.value = value;
          if (HydrationDirectives.indexOf(extracted.hydration.directive) < 0) {
            throw new Error(`Error: invalid hydration directive "${key}". Supported hydration methods: ${HydrationDirectives.map((d) => `"client:${d}"`).join(", ")}`);
          }
          if (extracted.hydration.directive === "media" && typeof extracted.hydration.value !== "string") {
            throw new Error('Error: Media query must be provided for "client:media", similar to client:media="(max-width: 600px)"');
          }
          break;
        }
      }
    } else if (key === "class:list") {
      extracted.props[key.slice(0, -5)] = serializeListValue(value);
    } else {
      extracted.props[key] = value;
    }
  }
  return extracted;
}
async function generateHydrateScript(scriptOptions, metadata) {
  const { renderer, result, astroId, props } = scriptOptions;
  const { hydrate, componentUrl, componentExport } = metadata;
  if (!componentExport) {
    throw new Error(`Unable to resolve a componentExport for "${metadata.displayName}"! Please open an issue.`);
  }
  const island = {
    children: "",
    props: {
      uid: astroId
    }
  };
  island.props["component-url"] = await result.resolve(componentUrl);
  if (renderer.clientEntrypoint) {
    island.props["component-export"] = componentExport.value;
    island.props["renderer-url"] = await result.resolve(renderer.clientEntrypoint);
    island.props["props"] = escapeHTML(serializeProps(props));
  }
  island.props["ssr"] = "";
  island.props["client"] = hydrate;
  island.props["before-hydration-url"] = await result.resolve("astro:scripts/before-hydration.js");
  island.props["opts"] = escapeHTML(JSON.stringify({
    name: metadata.displayName,
    value: metadata.hydrateArgs || ""
  }));
  return island;
}

typeof process === "object" && Object.prototype.toString.call(process) === "[object process]";

var idle_prebuilt_default = `(self.Astro=self.Astro||{}).idle=a=>{const e=async()=>{await(await a())()};"requestIdleCallback"in window?window.requestIdleCallback(e):setTimeout(e,200)};`;

var load_prebuilt_default = `(self.Astro=self.Astro||{}).load=a=>{(async()=>await(await a())())()};`;

var media_prebuilt_default = `(self.Astro=self.Astro||{}).media=(s,a)=>{const t=async()=>{await(await s())()};if(a.value){const e=matchMedia(a.value);e.matches?t():e.addEventListener("change",t,{once:!0})}};`;

var only_prebuilt_default = `(self.Astro=self.Astro||{}).only=a=>{(async()=>await(await a())())()};`;

var visible_prebuilt_default = `(self.Astro=self.Astro||{}).visible=(i,c,n)=>{const r=async()=>{await(await i())()};let s=new IntersectionObserver(e=>{for(const t of e)if(!!t.isIntersecting){s.disconnect(),r();break}});for(let e=0;e<n.children.length;e++){const t=n.children[e];s.observe(t)}};`;

var astro_island_prebuilt_default = `var a;{const l={0:t=>t,1:t=>JSON.parse(t,o),2:t=>new RegExp(t),3:t=>new Date(t),4:t=>new Map(JSON.parse(t,o)),5:t=>new Set(JSON.parse(t,o)),6:t=>BigInt(t),7:t=>new URL(t)},o=(t,s)=>{if(t===""||!Array.isArray(s))return s;const[e,i]=s;return e in l?l[e](i):void 0};customElements.get("astro-island")||customElements.define("astro-island",(a=class extends HTMLElement{constructor(){super(...arguments);this.hydrate=()=>{if(!this.hydrator||this.parentElement?.closest("astro-island[ssr]"))return;const s=this.querySelectorAll("astro-slot"),e={},i=this.querySelectorAll("template[data-astro-template]");for(const r of i)!r.closest(this.tagName)?.isSameNode(this)||(e[r.getAttribute("data-astro-template")||"default"]=r.innerHTML,r.remove());for(const r of s)!r.closest(this.tagName)?.isSameNode(this)||(e[r.getAttribute("name")||"default"]=r.innerHTML);const n=this.hasAttribute("props")?JSON.parse(this.getAttribute("props"),o):{};this.hydrator(this)(this.Component,n,e,{client:this.getAttribute("client")}),this.removeAttribute("ssr"),window.removeEventListener("astro:hydrate",this.hydrate),window.dispatchEvent(new CustomEvent("astro:hydrate"))}}async connectedCallback(){window.addEventListener("astro:hydrate",this.hydrate),await import(this.getAttribute("before-hydration-url"));const s=JSON.parse(this.getAttribute("opts"));Astro[this.getAttribute("client")](async()=>{const e=this.getAttribute("renderer-url"),[i,{default:n}]=await Promise.all([import(this.getAttribute("component-url")),e?import(e):()=>()=>{}]);return this.Component=i[this.getAttribute("component-export")||"default"],this.hydrator=n,this.hydrate},s,this)}attributeChangedCallback(){this.hydrator&&this.hydrate()}},a.observedAttributes=["props"],a))}`;

const resultsWithHydrationScript = /* @__PURE__ */ new WeakSet();
function determineIfNeedsHydrationScript(result) {
  if (resultsWithHydrationScript.has(result)) {
    return false;
  }
  resultsWithHydrationScript.add(result);
  return true;
}
const hydrationScripts = {
  idle: idle_prebuilt_default,
  load: load_prebuilt_default,
  only: only_prebuilt_default,
  media: media_prebuilt_default,
  visible: visible_prebuilt_default
};
const resultsWithDirectiveScript = /* @__PURE__ */ new Map();
function determinesIfNeedsDirectiveScript(result, directive) {
  if (!resultsWithDirectiveScript.has(directive)) {
    resultsWithDirectiveScript.set(directive, /* @__PURE__ */ new WeakSet());
  }
  const set = resultsWithDirectiveScript.get(directive);
  if (set.has(result)) {
    return false;
  }
  set.add(result);
  return true;
}
function getDirectiveScriptText(directive) {
  if (!(directive in hydrationScripts)) {
    throw new Error(`Unknown directive: ${directive}`);
  }
  const directiveScriptText = hydrationScripts[directive];
  return directiveScriptText;
}
function getPrescripts(type, directive) {
  switch (type) {
    case "both":
      return `<style>astro-island,astro-slot{display:contents}</style><script>${getDirectiveScriptText(directive) + astro_island_prebuilt_default}<\/script>`;
    case "directive":
      return `<script>${getDirectiveScriptText(directive)}<\/script>`;
  }
  return "";
}

/**
 * shortdash - https://github.com/bibig/node-shorthash
 *
 * @license
 *
 * (The MIT License)
 *
 * Copyright (c) 2013 Bibig <bibig@me.com>
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */
const dictionary = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXY";
const binary = dictionary.length;
function bitwise(str) {
  let hash = 0;
  if (str.length === 0)
    return hash;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = (hash << 5) - hash + ch;
    hash = hash & hash;
  }
  return hash;
}
function shorthash(text) {
  let num;
  let result = "";
  let integer = bitwise(text);
  const sign = integer < 0 ? "Z" : "";
  integer = Math.abs(integer);
  while (integer >= binary) {
    num = integer % binary;
    integer = Math.floor(integer / binary);
    result = dictionary[num] + result;
  }
  if (integer > 0) {
    result = dictionary[integer] + result;
  }
  return sign + result;
}

class Metadata {
  constructor(filePathname, opts) {
    this.modules = opts.modules;
    this.hoisted = opts.hoisted;
    this.hydratedComponents = opts.hydratedComponents;
    this.clientOnlyComponents = opts.clientOnlyComponents;
    this.hydrationDirectives = opts.hydrationDirectives;
    this.mockURL = new URL(filePathname, "http://example.com");
    this.metadataCache = /* @__PURE__ */ new Map();
  }
  resolvePath(specifier) {
    if (specifier.startsWith(".")) {
      const resolved = new URL(specifier, this.mockURL).pathname;
      if (resolved.startsWith("/@fs") && resolved.endsWith(".jsx")) {
        return resolved.slice(0, resolved.length - 4);
      }
      return resolved;
    }
    return specifier;
  }
  getPath(Component) {
    const metadata = this.getComponentMetadata(Component);
    return (metadata == null ? void 0 : metadata.componentUrl) || null;
  }
  getExport(Component) {
    const metadata = this.getComponentMetadata(Component);
    return (metadata == null ? void 0 : metadata.componentExport) || null;
  }
  *hoistedScriptPaths() {
    for (const metadata of this.deepMetadata()) {
      let i = 0, pathname = metadata.mockURL.pathname;
      while (i < metadata.hoisted.length) {
        yield `${pathname.replace("/@fs", "")}?astro&type=script&index=${i}&lang.ts`;
        i++;
      }
    }
  }
  *deepMetadata() {
    yield this;
    const seen = /* @__PURE__ */ new Set();
    for (const { module: mod } of this.modules) {
      if (typeof mod.$$metadata !== "undefined") {
        const md = mod.$$metadata;
        for (const childMetdata of md.deepMetadata()) {
          if (!seen.has(childMetdata)) {
            seen.add(childMetdata);
            yield childMetdata;
          }
        }
      }
    }
  }
  getComponentMetadata(Component) {
    if (this.metadataCache.has(Component)) {
      return this.metadataCache.get(Component);
    }
    const metadata = this.findComponentMetadata(Component);
    this.metadataCache.set(Component, metadata);
    return metadata;
  }
  findComponentMetadata(Component) {
    const isCustomElement = typeof Component === "string";
    for (const { module, specifier } of this.modules) {
      const id = this.resolvePath(specifier);
      for (const [key, value] of Object.entries(module)) {
        if (isCustomElement) {
          if (key === "tagName" && Component === value) {
            return {
              componentExport: key,
              componentUrl: id
            };
          }
        } else if (Component === value) {
          return {
            componentExport: key,
            componentUrl: id
          };
        }
      }
    }
    return null;
  }
}
function createMetadata(filePathname, options) {
  return new Metadata(filePathname, options);
}

const voidElementNames = /^(area|base|br|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)$/i;
const htmlBooleanAttributes = /^(allowfullscreen|async|autofocus|autoplay|controls|default|defer|disabled|disablepictureinpicture|disableremoteplayback|formnovalidate|hidden|loop|nomodule|novalidate|open|playsinline|readonly|required|reversed|scoped|seamless|itemscope)$/i;
const htmlEnumAttributes = /^(contenteditable|draggable|spellcheck|value)$/i;
const svgEnumAttributes = /^(autoReverse|externalResourcesRequired|focusable|preserveAlpha)$/i;
async function* _render(child) {
  child = await child;
  if (child instanceof HTMLString) {
    yield child;
  } else if (Array.isArray(child)) {
    for (const value of child) {
      yield markHTMLString(await _render(value));
    }
  } else if (typeof child === "function") {
    yield* _render(child());
  } else if (typeof child === "string") {
    yield markHTMLString(escapeHTML(child));
  } else if (!child && child !== 0) ; else if (child instanceof AstroComponent || Object.prototype.toString.call(child) === "[object AstroComponent]") {
    yield* renderAstroComponent(child);
  } else if (typeof child === "object" && Symbol.asyncIterator in child) {
    yield* child;
  } else {
    yield child;
  }
}
class AstroComponent {
  constructor(htmlParts, expressions) {
    this.htmlParts = htmlParts;
    this.expressions = expressions;
  }
  get [Symbol.toStringTag]() {
    return "AstroComponent";
  }
  async *[Symbol.asyncIterator]() {
    const { htmlParts, expressions } = this;
    for (let i = 0; i < htmlParts.length; i++) {
      const html = htmlParts[i];
      const expression = expressions[i];
      yield markHTMLString(html);
      yield* _render(expression);
    }
  }
}
function isAstroComponent(obj) {
  return typeof obj === "object" && Object.prototype.toString.call(obj) === "[object AstroComponent]";
}
async function render(htmlParts, ...expressions) {
  return new AstroComponent(htmlParts, expressions);
}
function createComponent(cb) {
  cb.isAstroComponentFactory = true;
  return cb;
}
async function renderSlot(_result, slotted, fallback) {
  if (slotted) {
    let iterator = _render(slotted);
    let content = "";
    for await (const chunk of iterator) {
      content += chunk;
    }
    return markHTMLString(content);
  }
  return fallback;
}
const Fragment = Symbol("Astro.Fragment");
function guessRenderers(componentUrl) {
  const extname = componentUrl == null ? void 0 : componentUrl.split(".").pop();
  switch (extname) {
    case "svelte":
      return ["@astrojs/svelte"];
    case "vue":
      return ["@astrojs/vue"];
    case "jsx":
    case "tsx":
      return ["@astrojs/react", "@astrojs/preact"];
    default:
      return ["@astrojs/react", "@astrojs/preact", "@astrojs/vue", "@astrojs/svelte"];
  }
}
function formatList(values) {
  if (values.length === 1) {
    return values[0];
  }
  return `${values.slice(0, -1).join(", ")} or ${values[values.length - 1]}`;
}
const rendererAliases = /* @__PURE__ */ new Map([["solid", "solid-js"]]);
async function renderComponent(result, displayName, Component, _props, slots = {}) {
  var _a;
  Component = await Component;
  if (Component === Fragment) {
    const children2 = await renderSlot(result, slots == null ? void 0 : slots.default);
    if (children2 == null) {
      return children2;
    }
    return markHTMLString(children2);
  }
  if (Component && Component.isAstroComponentFactory) {
    async function* renderAstroComponentInline() {
      let iterable = await renderToIterable(result, Component, _props, slots);
      if (result.styles.size && alreadyHeadRenderedResults.has(result)) {
        let styles = Array.from(result.styles);
        result.styles.clear();
        for (const style of styles) {
          if ("define:vars" in style.props) {
            style.children = "";
            yield markHTMLString(renderElement("style", style));
          }
        }
      }
      yield* iterable;
    }
    return renderAstroComponentInline();
  }
  if (!Component && !_props["client:only"]) {
    throw new Error(`Unable to render ${displayName} because it is ${Component}!
Did you forget to import the component or is it possible there is a typo?`);
  }
  const { renderers } = result._metadata;
  const metadata = { displayName };
  const { hydration, isPage, props } = extractDirectives(_props);
  let html = "";
  let needsHydrationScript = hydration && determineIfNeedsHydrationScript(result);
  let needsDirectiveScript = hydration && determinesIfNeedsDirectiveScript(result, hydration.directive);
  if (hydration) {
    metadata.hydrate = hydration.directive;
    metadata.hydrateArgs = hydration.value;
    metadata.componentExport = hydration.componentExport;
    metadata.componentUrl = hydration.componentUrl;
  }
  const probableRendererNames = guessRenderers(metadata.componentUrl);
  if (Array.isArray(renderers) && renderers.length === 0 && typeof Component !== "string" && !componentIsHTMLElement(Component)) {
    const message = `Unable to render ${metadata.displayName}!

There are no \`integrations\` set in your \`astro.config.mjs\` file.
Did you mean to add ${formatList(probableRendererNames.map((r) => "`" + r + "`"))}?`;
    throw new Error(message);
  }
  const children = {};
  if (slots) {
    await Promise.all(Object.entries(slots).map(([key, value]) => renderSlot(result, value).then((output) => {
      children[key] = output;
    })));
  }
  let renderer;
  if (metadata.hydrate !== "only") {
    let error;
    for (const r of renderers) {
      try {
        if (await r.ssr.check.call({ result }, Component, props, children)) {
          renderer = r;
          break;
        }
      } catch (e) {
        error ?? (error = e);
      }
    }
    if (error) {
      throw error;
    }
    if (!renderer && typeof HTMLElement === "function" && componentIsHTMLElement(Component)) {
      const output = renderHTMLElement(result, Component, _props, slots);
      return output;
    }
  } else {
    if (metadata.hydrateArgs) {
      const passedName = metadata.hydrateArgs;
      const rendererName = rendererAliases.has(passedName) ? rendererAliases.get(passedName) : passedName;
      renderer = renderers.filter(({ name }) => name === `@astrojs/${rendererName}` || name === rendererName)[0];
    }
    if (!renderer && renderers.length === 1) {
      renderer = renderers[0];
    }
    if (!renderer) {
      const extname = (_a = metadata.componentUrl) == null ? void 0 : _a.split(".").pop();
      renderer = renderers.filter(({ name }) => name === `@astrojs/${extname}` || name === extname)[0];
    }
  }
  if (!renderer) {
    if (metadata.hydrate === "only") {
      throw new Error(`Unable to render ${metadata.displayName}!

Using the \`client:only\` hydration strategy, Astro needs a hint to use the correct renderer.
Did you mean to pass <${metadata.displayName} client:only="${probableRendererNames.map((r) => r.replace("@astrojs/", "")).join("|")}" />
`);
    } else if (typeof Component !== "string") {
      const matchingRenderers = renderers.filter((r) => probableRendererNames.includes(r.name));
      const plural = renderers.length > 1;
      if (matchingRenderers.length === 0) {
        throw new Error(`Unable to render ${metadata.displayName}!

There ${plural ? "are" : "is"} ${renderers.length} renderer${plural ? "s" : ""} configured in your \`astro.config.mjs\` file,
but ${plural ? "none were" : "it was not"} able to server-side render ${metadata.displayName}.

Did you mean to enable ${formatList(probableRendererNames.map((r) => "`" + r + "`"))}?`);
      } else if (matchingRenderers.length === 1) {
        renderer = matchingRenderers[0];
        ({ html } = await renderer.ssr.renderToStaticMarkup.call({ result }, Component, props, children, metadata));
      } else {
        throw new Error(`Unable to render ${metadata.displayName}!

This component likely uses ${formatList(probableRendererNames)},
but Astro encountered an error during server-side rendering.

Please ensure that ${metadata.displayName}:
1. Does not unconditionally access browser-specific globals like \`window\` or \`document\`.
   If this is unavoidable, use the \`client:only\` hydration directive.
2. Does not conditionally return \`null\` or \`undefined\` when rendered on the server.

If you're still stuck, please open an issue on GitHub or join us at https://astro.build/chat.`);
      }
    }
  } else {
    if (metadata.hydrate === "only") {
      html = await renderSlot(result, slots == null ? void 0 : slots.fallback);
    } else {
      ({ html } = await renderer.ssr.renderToStaticMarkup.call({ result }, Component, props, children, metadata));
    }
  }
  if (renderer && !renderer.clientEntrypoint && renderer.name !== "@astrojs/lit" && metadata.hydrate) {
    throw new Error(`${metadata.displayName} component has a \`client:${metadata.hydrate}\` directive, but no client entrypoint was provided by ${renderer.name}!`);
  }
  if (!html && typeof Component === "string") {
    const childSlots = Object.values(children).join("");
    const iterable = renderAstroComponent(await render`<${Component}${internalSpreadAttributes(props)}${markHTMLString(childSlots === "" && voidElementNames.test(Component) ? `/>` : `>${childSlots}</${Component}>`)}`);
    html = "";
    for await (const chunk of iterable) {
      html += chunk;
    }
  }
  if (!hydration) {
    if (isPage || (renderer == null ? void 0 : renderer.name) === "astro:jsx") {
      return html;
    }
    return markHTMLString(html.replace(/\<\/?astro-slot\>/g, ""));
  }
  const astroId = shorthash(`<!--${metadata.componentExport.value}:${metadata.componentUrl}-->
${html}
${serializeProps(props)}`);
  const island = await generateHydrateScript({ renderer, result, astroId, props }, metadata);
  let unrenderedSlots = [];
  if (html) {
    if (Object.keys(children).length > 0) {
      for (const key of Object.keys(children)) {
        if (!html.includes(key === "default" ? `<astro-slot>` : `<astro-slot name="${key}">`)) {
          unrenderedSlots.push(key);
        }
      }
    }
  } else {
    unrenderedSlots = Object.keys(children);
  }
  const template = unrenderedSlots.length > 0 ? unrenderedSlots.map((key) => `<template data-astro-template${key !== "default" ? `="${key}"` : ""}>${children[key]}</template>`).join("") : "";
  island.children = `${html ?? ""}${template}`;
  let prescriptType = needsHydrationScript ? "both" : needsDirectiveScript ? "directive" : null;
  let prescripts = getPrescripts(prescriptType, hydration.directive);
  return markHTMLString(prescripts + renderElement("astro-island", island, false));
}
function createDeprecatedFetchContentFn() {
  return () => {
    throw new Error("Deprecated: Astro.fetchContent() has been replaced with Astro.glob().");
  };
}
function createAstroGlobFn() {
  const globHandler = (importMetaGlobResult, globValue) => {
    let allEntries = [...Object.values(importMetaGlobResult)];
    if (allEntries.length === 0) {
      throw new Error(`Astro.glob(${JSON.stringify(globValue())}) - no matches found.`);
    }
    return Promise.all(allEntries.map((fn) => fn()));
  };
  return globHandler;
}
function createAstro(filePathname, _site, projectRootStr) {
  const site = new URL(_site);
  const url = new URL(filePathname, site);
  const projectRoot = new URL(projectRootStr);
  return {
    site,
    fetchContent: createDeprecatedFetchContentFn(),
    glob: createAstroGlobFn(),
    resolve(...segments) {
      let resolved = segments.reduce((u, segment) => new URL(segment, u), url).pathname;
      if (resolved.startsWith(projectRoot.pathname)) {
        resolved = "/" + resolved.slice(projectRoot.pathname.length);
      }
      return resolved;
    }
  };
}
const toAttributeString = (value, shouldEscape = true) => shouldEscape ? String(value).replace(/&/g, "&#38;").replace(/"/g, "&#34;") : value;
const STATIC_DIRECTIVES = /* @__PURE__ */ new Set(["set:html", "set:text"]);
function addAttribute(value, key, shouldEscape = true) {
  if (value == null) {
    return "";
  }
  if (value === false) {
    if (htmlEnumAttributes.test(key) || svgEnumAttributes.test(key)) {
      return markHTMLString(` ${key}="false"`);
    }
    return "";
  }
  if (STATIC_DIRECTIVES.has(key)) {
    console.warn(`[astro] The "${key}" directive cannot be applied dynamically at runtime. It will not be rendered as an attribute.

Make sure to use the static attribute syntax (\`${key}={value}\`) instead of the dynamic spread syntax (\`{...{ "${key}": value }}\`).`);
    return "";
  }
  if (key === "class:list") {
    return markHTMLString(` ${key.slice(0, -5)}="${toAttributeString(serializeListValue(value))}"`);
  }
  if (value === true && (key.startsWith("data-") || htmlBooleanAttributes.test(key))) {
    return markHTMLString(` ${key}`);
  } else {
    return markHTMLString(` ${key}="${toAttributeString(value, shouldEscape)}"`);
  }
}
function internalSpreadAttributes(values, shouldEscape = true) {
  let output = "";
  for (const [key, value] of Object.entries(values)) {
    output += addAttribute(value, key, shouldEscape);
  }
  return markHTMLString(output);
}
function defineStyleVars(selector, vars) {
  let output = "\n";
  for (const [key, value] of Object.entries(vars)) {
    output += `  --${key}: ${value};
`;
  }
  return markHTMLString(`${selector} {${output}}`);
}
function defineScriptVars(vars) {
  let output = "";
  for (const [key, value] of Object.entries(vars)) {
    output += `let ${key} = ${JSON.stringify(value)};
`;
  }
  return markHTMLString(output);
}
async function renderToIterable(result, componentFactory, props, children) {
  const Component = await componentFactory(result, props, children);
  if (!isAstroComponent(Component)) {
    console.warn(`Returning a Response is only supported inside of page components. Consider refactoring this logic into something like a function that can be used in the page.`);
    const response = Component;
    throw response;
  }
  return renderAstroComponent(Component);
}
new TextEncoder();
const uniqueElements = (item, index, all) => {
  const props = JSON.stringify(item.props);
  const children = item.children;
  return index === all.findIndex((i) => JSON.stringify(i.props) === props && i.children == children);
};
const alreadyHeadRenderedResults = /* @__PURE__ */ new WeakSet();
async function renderHead(result) {
  alreadyHeadRenderedResults.add(result);
  const styles = Array.from(result.styles).filter(uniqueElements).map((style) => renderElement("style", style));
  result.styles.clear();
  const scripts = Array.from(result.scripts).filter(uniqueElements).map((script, i) => {
    return renderElement("script", script);
  });
  const links = Array.from(result.links).filter(uniqueElements).map((link) => renderElement("link", link, false));
  return markHTMLString(links.join("\n") + styles.join("\n") + scripts.join("\n"));
}
function maybeRenderHead(result) {
  if (alreadyHeadRenderedResults.has(result)) {
    return "";
  }
  return renderHead(result);
}
async function* renderAstroComponent(component) {
  for await (const value of component) {
    if (value || value === 0) {
      for await (const chunk of _render(value)) {
        yield markHTMLString(chunk);
      }
    }
  }
}
function componentIsHTMLElement(Component) {
  return typeof HTMLElement !== "undefined" && HTMLElement.isPrototypeOf(Component);
}
async function renderHTMLElement(result, constructor, props, slots) {
  const name = getHTMLElementName(constructor);
  let attrHTML = "";
  for (const attr in props) {
    attrHTML += ` ${attr}="${toAttributeString(await props[attr])}"`;
  }
  return markHTMLString(`<${name}${attrHTML}>${await renderSlot(result, slots == null ? void 0 : slots.default)}</${name}>`);
}
function getHTMLElementName(constructor) {
  const definedName = customElements.getName(constructor);
  if (definedName)
    return definedName;
  const assignedName = constructor.name.replace(/^HTML|Element$/g, "").replace(/[A-Z]/g, "-$&").toLowerCase().replace(/^-/, "html-");
  return assignedName;
}
function renderElement(name, { props: _props, children = "" }, shouldEscape = true) {
  const { lang: _, "data-astro-id": astroId, "define:vars": defineVars, ...props } = _props;
  if (defineVars) {
    if (name === "style") {
      if (props["is:global"]) {
        children = defineStyleVars(`:root`, defineVars) + "\n" + children;
      } else {
        children = defineStyleVars(`.astro-${astroId}`, defineVars) + "\n" + children;
      }
      delete props["is:global"];
      delete props["is:scoped"];
    }
    if (name === "script") {
      delete props.hoist;
      children = defineScriptVars(defineVars) + "\n" + children;
    }
  }
  if ((children == null || children == "") && voidElementNames.test(name)) {
    return `<${name}${internalSpreadAttributes(props, shouldEscape)} />`;
  }
  return `<${name}${internalSpreadAttributes(props, shouldEscape)}>${children}</${name}>`;
}

const $$metadata$u = createMetadata("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/MetaTags.astro", { modules: [], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$u = createAstro("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/MetaTags.astro", "http://localhost:3000/", "file:///C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/");
const $$MetaTags = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$u, $$props, $$slots);
  Astro2.self = $$MetaTags;
  const { title, description, permalink } = Astro2.props;
  return render`<!-- Global Metadata --><meta charset="utf-8">
<meta name="viewport" content="width=device-width">
<link rel="icon" type="image/x-icon" href="/favicon.ico">

<!-- Primary Meta Tags -->
<title>${title}</title>
<meta name="title"${addAttribute(title, "content")}>
<meta name="description"${addAttribute(description, "content")}>

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url"${addAttribute(permalink, "content")}>
<meta property="og:title"${addAttribute(title, "content")}>
<meta property="og:description"${addAttribute(description, "content")}>
<meta property="og:image" content="https://astro.build/social.png?v=1">

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:url"${addAttribute(permalink, "content")}>
<meta property="twitter:title"${addAttribute(title, "content")}>
<meta property="twitter:description"${addAttribute(description, "content")}>
<meta property="twitter:image" content="https://astro.build/social.png?v=1">

<!-- Fonts -->
<link rel="preconnect" href="https://fonts.gstatic.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono&family=IBM+Plex+Sans:wght@400;700&display=swap">

<!-- "Boxicons CDN" Link -->
<link href="https://unpkg.com/boxicons@2.1.2/css/boxicons.min.css" rel="stylesheet">
`;
});

const $$file$f = "C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/MetaTags.astro";
const $$url$f = undefined;

var $$module1$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$u,
	'default': $$MetaTags,
	file: $$file$f,
	url: $$url$f
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$t = createMetadata("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/CursorEffect/Cursor.astro", { modules: [], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [{ type: "inline", value: `
    const canvas = document.getElementById('canvas');
    canvas.width = window.innerWidth;   // set canvas width to window width
    canvas.height = window.innerHeight; // set canvas height to window height
    const ctx = canvas.getContext('2d');    // 2d context
    let spots = []; // creates an array of spots
    let hue = 274;    // Sets the color of the particles
    
    const mouse = {  
        x: undefined,   // mouse position
        y: undefined    // mouse position
    }

    window.addEventListener('mousemove', function(event: MouseEvent) { // listens for mouse movement
        mouse.x = event.x;  //event.x is the x coordinate of the mouse
        mouse.y = event.y; //event.y is the y coordinate of the mouse
        for (let i = 0; i < 3; i++) { // 3 is the number of particles
            spots.push(new Particle()); // add a new particle
        }
    });

    class Particle {
        constructor() {
            this.x = mouse.x;
            this.y = mouse.y;
            this.size = Math.random() * 2 + 0.1;    
            this.speedX = Math.random() * 2 - 1;    
            this.speedY = Math.random() * 2 - 1;
            this.color = \`hsl(170, 100%, 50%)\`;
        }
        update(){
            this.x += this.speedX;  //update speedX
            this.y += this.speedY;  //update speedY
            if (this.size > 0.1) this.size -= 0.03; //update size
        }
        draw(){
            ctx.fillStyle = this.color; // color of the particle
            ctx.beginPath(); // start a new path
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); // x, y, radius, startAngle, endAngle
            ctx.fill(); // fill the circle
        }
    }

    function handleParticle(){
        for (let i = 0; i < spots.length; i++) {    
            spots[i].update();  // update position
            spots[i].draw();    // draw the particle
            for (let j = i; j< spots.length; j++) { // check for collisions
                const dx = spots[i].x - spots[j].x; // x distance
                const dy = spots[i].y - spots[j].y; // distance between two particles
                const distance = Math.sqrt(dx * dx + dy * dy);  // distance between two points
                if (distance < 90){
                    ctx.beginPath(); // start a new path
                    ctx.strokeStyle = spots[i].color; // color of the lines
                    ctx.lineWidth = spots[i].size / 10; // width of the line
                    ctx.moveTo(spots[i].x, spots[i].y); // start point
                    ctx.lineTo(spots[j].x, spots[j].y); // end point
                    ctx.stroke(); // draw the line
                }
            }
            if (spots[i].size <= 0.3){
                spots.splice(i, 1); i--;    // remove the particle
            }
        }
    }

    function animate(){
        ctx.clearRect(0, 0, canvas.width, canvas.height); // clear the canvas
        handleParticle();
        //change hue between #7E52A0 and #FFF8E1
        // hue += 0.1;
        // if (hue >= 360) hue = 0;        
        requestAnimationFrame(animate); // call animate again
    }

    window.addEventListener("resize", function(){
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    window.addEventListener('mouseout', function(){
        mouse.x = undefined;
        mouse.y = undefined;
        Infinity/0;
    });

    animate();
    
` }] });
const $$Astro$t = createAstro("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/CursorEffect/Cursor.astro", "http://localhost:3000/", "file:///C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/");
const $$Cursor = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$t, $$props, $$slots);
  Astro2.self = $$Cursor;
  const STYLES = [];
  for (const STYLE of STYLES)
    $$result.styles.add(STYLE);
  return render`${maybeRenderHead($$result)}<canvas id="canvas" class="astro-5U2GWB7U"></canvas>

`;
});

const $$file$e = "C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/CursorEffect/Cursor.astro";
const $$url$e = undefined;

var $$module3$3 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$t,
	'default': $$Cursor,
	file: $$file$e,
	url: $$url$e
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$s = createMetadata("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/Header.astro", { modules: [], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$s = createAstro("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/Header.astro", "http://localhost:3000/", "file:///C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/");
const $$Header = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$s, $$props, $$slots);
  Astro2.self = $$Header;
  const STYLES = [];
  for (const STYLE of STYLES)
    $$result.styles.add(STYLE);
  return render`${maybeRenderHead($$result)}<header class="wrapper astro-5QXF2QAY">
	<article class="astro-5QXF2QAY">
		<h1 class="astro-5QXF2QAY">
			<a href="/" class="astro-5QXF2QAY">
				<img class="logo astro-5QXF2QAY" src="/assets/images/LOGO.png" alt="logo">
				<span class="astro-5QXF2QAY">&lt;BLACKSKIES &#47;&gt;</span>
			</a>
		</h1>
	</article>
</header>

`;
});

const $$file$d = "C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/Header.astro";
const $$url$d = undefined;

var $$module2$2 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$s,
	'default': $$Header,
	file: $$file$d,
	url: $$url$d
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$r = createMetadata("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/blog/PostPreview.astro", { modules: [], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$r = createAstro("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/blog/PostPreview.astro", "http://localhost:3000/", "file:///C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/");
const $$PostPreview$1 = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$r, $$props, $$slots);
  Astro2.self = $$PostPreview$1;
  let { post } = Astro2.props;
  return render`${maybeRenderHead($$result)}<article class="post-preview">
	<header>
		<p class="publish-date">${post.frontmatter.publishDate}</p>
		<a${addAttribute(post.url, "href")}><h1 id="title">${post.frontmatter.title}</h1></a>
	</header>
	<p>${post.frontmatter.description}</p>
	<a${addAttribute(post.url, "href")} aria-label="Read more about the post">Read more</a>
</article>`;
});

const $$file$c = "C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/blog/PostPreview.astro";
const $$url$c = undefined;

var $$module4$2 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$r,
	'default': $$PostPreview$1,
	file: $$file$c,
	url: $$url$c
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$q = createMetadata("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/sidebar/LeftSidebar.astro", { modules: [], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [{ type: "inline", value: `
// Toggle Sidebar
    let btn = document.querySelector('#btn');
    let sidebar = document.querySelector('.sidebar');
    let sidebarSpacer = document.querySelector('.sidebar-spacer');
    let searchBtn = document.querySelector('.bx-search-alt');

    btn.addEventListener('click', () => {
        // TODO: Add \`aria-expanded\`
        sidebar.classList.toggle('active');     
        sidebarSpacer.classList.toggle('active');
    })

    // searchBtn.addEventListener('click', () => {
    //     sidebar.classList.toggle('active');
    //     sidebarSpacer.classList.toggle('active');
    // })
` }] });
const $$Astro$q = createAstro("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/sidebar/LeftSidebar.astro", "http://localhost:3000/", "file:///C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/");
const $$LeftSidebar = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$q, $$props, $$slots);
  Astro2.self = $$LeftSidebar;
  const { mostRecentBlogPost, mostRecentBookPost } = Astro2.props;
  return render`<!--Icons from https://boxicons.com/  -->${maybeRenderHead($$result)}<nav class="sidebar">
<!-- SIDEBAR HEADER -->
        <div class="logo_content">
            <div class="logo">
                <i class="bx bxs-quote-alt-left "></i>
                <span class="logo_name">BlackSkies</span>
            </div>
                <i class="bx bx-menu" id="btn"></i>
                <span class="tooltipMenu">Menu</span>
        </div>
<!--NAV LIST -->        
        <ul class="nav_list">
            <!-- <li>
                <i class='bx bx-search-alt'  ></i>
                <Search client:load posts={ allPosts } />
                <span class="tooltip">Search</span>
            </li> -->
            <li>
                <a href="/">
                    <i class="bx bxs-book-content"></i>
                    <span class="links_name">Blogs</span>
                </a>
                <span class="tooltip">Blogs</span>
            </li>
            <li>
                <a${addAttribute(mostRecentBlogPost.url, "href")}>
                    <i class="bx bx-book-content"></i>
                    <span class="links_name">Recent Blog</span>
                </a>
                <span class="tooltip">Recent Blog</span>
            </li>
            <li>
                <a href="/bookreview">
                    <i class="bx bxs-book"></i>
                    <span class="links_name">Books</span>
                </a>
                <span class="tooltip">Books</span>
            </li>
            <li>
                <a${addAttribute(mostRecentBookPost.url, "href")}>
                    <i class="bx bx-book"></i>
                    <span class="links_name">Recent Book</span>
                </a>
                <span class="tooltip">Recent Book</span>
            </li>
        </ul>
    </nav>
    <div class="sidebar-spacer"></div>

`;
});

const $$file$b = "C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/sidebar/LeftSidebar.astro";
const $$url$b = undefined;

var $$module4$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$q,
	'default': $$LeftSidebar,
	file: $$file$b,
	url: $$url$b
}, Symbol.toStringTag, { value: 'Module' }));

const _tmpl$ = ["<div", ' class="listContainer">', "</div>"], _tmpl$2 = ["<div", ' class="searchContainer"><input type="text" placeholder="Search..."', ' class="searchBar"><!--#-->', "<!--/--></div>"], _tmpl$3 = ["<div", ">No results found</div>"], _tmpl$4 = ["<div", ' class="searchlist" data-index="', '"><a', ">", "</a></div>"];
function Search(props) {
  const [search, setSearch] = createSignal("");
  const [filteredPosts, setFilteredPosts] = createSignal(props.posts);
  return ssr(_tmpl$2, ssrHydrationKey(), ssrAttribute("value", escape$1(search(), true), false), escape$1(createComponent$1(Show, {
    get when() {
      return search();
    },
    get children() {
      return ssr(_tmpl$, ssrHydrationKey(), escape$1(createComponent$1(For, {
        get each() {
          return filteredPosts();
        },
        get fallback() {
          return ssr(_tmpl$3, ssrHydrationKey());
        },
        children: (post, i) => ssr(_tmpl$4, ssrHydrationKey(), escape$1(i(), true) + 1, ssrAttribute("href", escape$1(post.url, true), false), escape$1(post.frontmatter.title))
      })));
    }
  })));
}

var $$module6$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	'default': Search
}, Symbol.toStringTag, { value: 'Module' }));

async function getBlogPosts() {
  let allBlogPosts = await Astro.glob({ "../pages/blog/1-password.md": () => import('./chunks/1-password.49457bc9.mjs'), "../pages/blog/2-two-factor-auth.md": () => import('./chunks/2-two-factor-auth.36fb6b72.mjs'), "../pages/blog/3-starting-astro.md": () => import('./chunks/3-starting-astro.71d6a123.mjs'), "../pages/blog/4-most-recent-post-button.md": () => import('./chunks/4-most-recent-post-button.a3f823c2.mjs'),}, () => "../pages/blog/*.md");
  allBlogPosts = allBlogPosts.sort((a, b) => new Date(b.frontmatter.publishDate).valueOf() - new Date(a.frontmatter.publishDate).valueOf());
  let mostRecentBlogPost = allBlogPosts[0];
  return { allBlogPosts, mostRecentBlogPost };
}
async function getBookPosts() {
  let allBookPosts = await Astro.glob({ "../pages/book/1-Slaughterhouse-Five.md": () => import('./chunks/1-Slaughterhouse-Five.b6b1564b.mjs'), "../pages/book/10-never-let-me-go.md": () => import('./chunks/10-never-let-me-go.111e7ffd.mjs'), "../pages/book/11-communist-manifesto.md": () => import('./chunks/11-communist-manifesto.70aff368.mjs'), "../pages/book/2-ready-player-one.md": () => import('./chunks/2-ready-player-one.771cea39.mjs'), "../pages/book/3-armada.md": () => import('./chunks/3-armada.e5509789.mjs'), "../pages/book/4-the-bell-jar.md": () => import('./chunks/4-the-bell-jar.4a9921b8.mjs'), "../pages/book/5-lord-of-the-flies.md": () => import('./chunks/5-lord-of-the-flies.dc92c2a8.mjs'), "../pages/book/6-slapstick.md": () => import('./chunks/6-slapstick.d09e3350.mjs'), "../pages/book/7-the-martian.md": () => import('./chunks/7-the-martian.146d8896.mjs'), "../pages/book/8-old-mans-war.md": () => import('./chunks/8-old-mans-war.2421aca0.mjs'), "../pages/book/9-supermarket.md": () => import('./chunks/9-supermarket.8a992e57.mjs'),}, () => "../pages/book/*.md");
  allBookPosts = allBookPosts.sort((a, b) => new Date(b.frontmatter.publishDate).valueOf() - new Date(a.frontmatter.publishDate).valueOf());
  let mostRecentBookPost = allBookPosts[0];
  return { allBookPosts, mostRecentBookPost };
}
async function getPosts() {
  let blogPosts = await getBlogPosts();
  let bookPosts = await getBookPosts();
  let allPosts = blogPosts.allBlogPosts.concat(bookPosts.allBookPosts);
  return { allPosts };
}
const $$metadata$p = createMetadata("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/utils/api.astro", { modules: [], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$p = createAstro("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/utils/api.astro", "http://localhost:3000/", "file:///C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/");
const Astro = $$Astro$p;
const $$Api = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$p, $$props, $$slots);
  Astro2.self = $$Api;
  return render``;
});

const $$file$a = "C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/utils/api.astro";
const $$url$a = undefined;

var $$module6 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	getBlogPosts: getBlogPosts,
	getBookPosts: getBookPosts,
	getPosts: getPosts,
	$$metadata: $$metadata$p,
	'default': $$Api,
	file: $$file$a,
	url: $$url$a
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$o = createMetadata("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/index.astro", { modules: [{ module: $$module1$1, specifier: "../components/MetaTags.astro", assert: {} }, { module: $$module3$3, specifier: "../components/CursorEffect/Cursor.astro", assert: {} }, { module: $$module2$2, specifier: "../components/Header.astro", assert: {} }, { module: $$module4$2, specifier: "../components/blog/PostPreview.astro", assert: {} }, { module: $$module4$1, specifier: "../components/sidebar/LeftSidebar.astro", assert: {} }, { module: $$module6$1, specifier: "../components/Search/Search", assert: {} }, { module: $$module6, specifier: "../utils/api.astro", assert: {} }], hydratedComponents: [Search], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set(["load"]), hoisted: [] });
const $$Astro$o = createAstro("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/index.astro", "http://localhost:3000/", "file:///C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/");
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$o, $$props, $$slots);
  Astro2.self = $$Index;
  const { allBlogPosts, mostRecentBlogPost } = await getBlogPosts();
  const { mostRecentBookPost } = await getBookPosts();
  const { allPosts } = await getPosts();
  const title = "<BLOG />";
  const description = "Hi! My name is Mark Spratt. I am a software engineer who started a blog!";
  const permalink = "#";
  const STYLES = [];
  for (const STYLE of STYLES)
    $$result.styles.add(STYLE);
  return render`<html lang="en" class="astro-W34OXMNM">
	
	<head>
		${renderComponent($$result, "Meta", $$MetaTags, { "title": title, "description": description, "permalink": permalink, "class": "astro-W34OXMNM" })}
	${renderHead($$result)}</head>
	<body>
		${renderComponent($$result, "Cursor", $$Cursor, { "class": "astro-W34OXMNM" })}
		<div class="body astro-W34OXMNM">
			${renderComponent($$result, "LeftSidebar", $$LeftSidebar, { "mostRecentBlogPost": mostRecentBlogPost, "mostRecentBookPost": mostRecentBookPost, "class": "astro-W34OXMNM" })}

			<div class="home_content astro-W34OXMNM">
				${renderComponent($$result, "BlogHeader", $$Header, { "class": "astro-W34OXMNM" })}
				<main class="content astro-W34OXMNM">
					<section class="intro astro-W34OXMNM">
						<h1 class="latest astro-W34OXMNM">${title}</h1>
						<p class="astro-W34OXMNM">"If you're afraid of something then do things in fear."</p>
						<p class="astro-W34OXMNM">${description}</p>
						${renderComponent($$result, "Search", Search, { "client:load": true, "posts": allPosts, "client:component-hydration": "load", "client:component-path": $$metadata$o.getPath(Search), "client:component-export": $$metadata$o.getExport(Search), "class": "astro-W34OXMNM" })}
					</section>
					<section aria-label="Blog post list" class="astro-W34OXMNM">
						${allBlogPosts.map((p) => render`${renderComponent($$result, "BlogPostPreview", $$PostPreview$1, { "post": p, "class": "astro-W34OXMNM" })}`)}
					</section>
				</main>
			</div>
		</div>
	</body>
</html>

`;
});

const $$file$9 = "C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/index.astro";
const $$url$9 = "";

var _page0 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$o,
	'default': $$Index,
	file: $$file$9,
	url: $$url$9
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$n = createMetadata("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/bookShelf/PostPreview.astro", { modules: [], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$n = createAstro("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/bookShelf/PostPreview.astro", "http://localhost:3000/", "file:///C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/");
const $$PostPreview = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$n, $$props, $$slots);
  Astro2.self = $$PostPreview;
  let { post } = Astro2.props;
  return render`<!-- TODO: Change to have the images from the post used from (public\\assets\\bookreview) -->${maybeRenderHead($$result)}<article class="post-preview">
	<header>
		<p class="publish-date">${post.frontmatter.publishDate}</p>
		<a${addAttribute(post.url, "href")}><h1 id="title">${post.frontmatter.title}</h1></a>
		<img${addAttribute(post.frontmatter.img, "src")}>
	</header>
	<p>${post.frontmatter.description}</p>
	<a${addAttribute(post.url, "href")}>Read more</a>
</article>`;
});

const $$file$8 = "C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/bookShelf/PostPreview.astro";
const $$url$8 = undefined;

var $$module3$2 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$n,
	'default': $$PostPreview,
	file: $$file$8,
	url: $$url$8
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$m = createMetadata("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/bookreview.astro", { modules: [{ module: $$module1$1, specifier: "../components/MetaTags.astro", assert: {} }, { module: $$module2$2, specifier: "../components/Header.astro", assert: {} }, { module: $$module3$2, specifier: "../components/bookShelf/PostPreview.astro", assert: {} }, { module: $$module4$1, specifier: "../components/sidebar/LeftSidebar.astro", assert: {} }, { module: $$module6, specifier: "../utils/api.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$m = createAstro("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/bookreview.astro", "http://localhost:3000/", "file:///C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/");
const $$Bookreview = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$m, $$props, $$slots);
  Astro2.self = $$Bookreview;
  const { allBookPosts, mostRecentBookPost } = await getBookPosts();
  const { mostRecentBlogPost } = await getBlogPosts();
  let title = "<BOOKSHELF />";
  let description = "Looking for something to read next? Consider checking out my book shelf!";
  let permalink = "#";
  const STYLES = [];
  for (const STYLE of STYLES)
    $$result.styles.add(STYLE);
  return render`<html lang="en" class="astro-JWZGZER2">
	
	<head>
		${renderComponent($$result, "Meta", $$MetaTags, { "title": title, "description": description, "permalink": permalink, "class": "astro-JWZGZER2" })}

		
	${renderHead($$result)}</head>
	
	<body>
		<div class="body astro-JWZGZER2">
			${renderComponent($$result, "LeftSidebar", $$LeftSidebar, { "mostRecentBlogPost": mostRecentBlogPost, "mostRecentBookPost": mostRecentBookPost, "class": "astro-JWZGZER2" })}
			
			<div class="home_content astro-JWZGZER2">
				${renderComponent($$result, "Header", $$Header, { "class": "astro-JWZGZER2" })}
				<main class="content astro-JWZGZER2">
					<section class="intro astro-JWZGZER2">
						<h1 class="latest astro-JWZGZER2">${title}</h1>
						<p class="astro-JWZGZER2">"If you're afraid of something then do things in fear."</p>
						<br class="astro-JWZGZER2">
						<p class="astro-JWZGZER2">${description}</p>
					</section>
					<section aria-label="Book post list" class="astro-JWZGZER2">
						${allBookPosts.map((p) => render`${renderComponent($$result, "BookPostPreview", $$PostPreview, { "post": p, "class": "astro-JWZGZER2" })}`)}
					</section>
				</main>
			</div>
		</div>
	</body>
</html>`;
});

const $$file$7 = "C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/bookreview.astro";
const $$url$7 = "/bookreview";

var _page1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$m,
	'default': $$Bookreview,
	file: $$file$7,
	url: $$url$7
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$l = createMetadata("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/Author.astro", { modules: [], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$l = createAstro("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/Author.astro", "http://localhost:3000/", "file:///C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/");
const $$Author = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$l, $$props, $$slots);
  Astro2.self = $$Author;
  const { name, href } = Astro2.props;
  const STYLES = [];
  for (const STYLE of STYLES)
    $$result.styles.add(STYLE);
  return render`${maybeRenderHead($$result)}<div class="author astro-M6X5ATLW">
	<p class="astro-M6X5ATLW"><a${addAttribute(href, "href")} class="astro-M6X5ATLW">${name}</a></p>
</div>

`;
});

const $$file$6 = "C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/Author.astro";
const $$url$6 = undefined;

var $$module3$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$l,
	'default': $$Author,
	file: $$file$6,
	url: $$url$6
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$k = createMetadata("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/blog/Post.astro", { modules: [{ module: $$module3$1, specifier: "../Author.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$k = createAstro("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/blog/Post.astro", "http://localhost:3000/", "file:///C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/");
const $$Post$1 = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$k, $$props, $$slots);
  Astro2.self = $$Post$1;
  const { title, author, publishDate, heroImage, alt } = Astro2.props;
  const STYLES = [];
  for (const STYLE of STYLES)
    $$result.styles.add(STYLE);
  return render`${maybeRenderHead($$result)}<div class="layout astro-AJD2XUSM">
	<article class="content astro-AJD2XUSM">
		<div class="astro-AJD2XUSM">
			<header class="astro-AJD2XUSM">
				${heroImage && render`<img width="720" height="420" class="hero-image astro-AJD2XUSM" loading="lazy"${addAttribute(heroImage, "src")}${addAttribute(alt, "alt")}>`}
				<p class="publish-date astro-AJD2XUSM">${publishDate}</p>
				<h1 class="title astro-AJD2XUSM">${title}</h1>
				${renderComponent($$result, "Author", $$Author, { "name": "Mark Spratt", "href": "https://twitter.com/_Hopelezz", "class": "astro-AJD2XUSM" })}
			</header>
			<main class="astro-AJD2XUSM">
				${renderSlot($$result, $$slots["default"])}
			</main>
		</div>
	</article>
</div>

`;
});

const $$file$5 = "C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/blog/Post.astro";
const $$url$5 = undefined;

var $$module4 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$k,
	'default': $$Post$1,
	file: $$file$5,
	url: $$url$5
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$j = createMetadata("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/Footer/Social.astro", { modules: [], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$j = createAstro("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/Footer/Social.astro", "http://localhost:3000/", "file:///C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/");
const $$Social = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$j, $$props, $$slots);
  Astro2.self = $$Social;
  const STYLES = [];
  for (const STYLE of STYLES)
    $$result.styles.add(STYLE);
  return render`${maybeRenderHead($$result)}<div class="icons astro-P4XWWKMK">
    <a href="https://twitter.com/_Hopelezz" class="ml-4 astro-P4XWWKMK" aria-label="Twitter" rel="noopener">
      <svg class="h-6 w-6 hover:text-hot-pink astro-P4XWWKMK" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs" viewBox="0 0 16 16" width="16" height="16">
        <g transform="matrix(0.6666666666666666,0,0,0.6666666666666666,0,0)" class="astro-P4XWWKMK">
          <path d="M23.32,6.44c0.212-0.177,0.241-0.492,0.065-0.704c-0.068-0.082-0.161-0.14-0.265-0.166l-0.79-0.2 c-0.268-0.067-0.431-0.339-0.364-0.606C21.974,4.731,21.986,4.7,22,4.67l0.44-0.89c0.12-0.249,0.015-0.548-0.233-0.668 C22.099,3.06,21.976,3.049,21.86,3.08l-2,0.56c-0.151,0.044-0.314,0.014-0.44-0.08c-0.865-0.649-1.918-1-3-1c-2.761,0-5,2.239-5,5 l0,0v0.36c0.001,0.127-0.094,0.235-0.22,0.25C8.39,8.5,5.7,7.07,2.8,3.73c-0.128-0.142-0.325-0.2-0.51-0.15 C2.124,3.656,2.013,3.817,2,4C1.599,5.645,1.761,7.377,2.46,8.92c0.062,0.123,0.013,0.274-0.11,0.336 C2.303,9.279,2.251,9.288,2.2,9.28L1.08,9.06C0.807,9.016,0.551,9.202,0.507,9.474C0.498,9.533,0.499,9.592,0.51,9.65 c0.175,1.555,1.047,2.945,2.37,3.78c0.124,0.06,0.176,0.21,0.116,0.334c-0.025,0.051-0.065,0.092-0.116,0.116l-0.53,0.21 c-0.256,0.103-0.381,0.394-0.278,0.65c0.005,0.014,0.011,0.027,0.018,0.04c0.595,1.302,1.791,2.229,3.2,2.48 c0.13,0.047,0.197,0.191,0.15,0.32c-0.025,0.07-0.08,0.124-0.15,0.15C3.93,18.292,2.471,18.575,1,18.56 c-0.276-0.055-0.545,0.124-0.6,0.4s0.124,0.545,0.4,0.6l0,0c2.548,1.208,5.321,1.866,8.14,1.93c2.479,0.038,4.915-0.658,7-2 c3.484-2.326,5.571-6.241,5.56-10.43V8.19c0.001-0.147,0.067-0.286,0.18-0.38L23.32,6.44z" stroke="none" fill="currentColor" stroke-width="0" stroke-linecap="round" stroke-linejoin="round" class="astro-P4XWWKMK"></path>
        </g>
      </svg>
    </a>
    <a href="https://www.youtube.com/user/panzerlink" class="ml-4 astro-P4XWWKMK" aria-label="YouTube" rel="noopener">
      <svg class="h-6 w-6 hover:text-hot-pink astro-P4XWWKMK" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs" viewBox="0 0 16 16" width="16" height="16">
        <g transform="matrix(0.6666666666666666,0,0,0.6666666666666666,0,0)" class="astro-P4XWWKMK">
          <path d="M20.06,3.5H3.94C1.764,3.5,0,5.264,0,7.44v9.12c0,2.176,1.764,3.94,3.94,3.94c0,0,0,0,0,0h16.12 c2.176,0,3.94-1.764,3.94-3.94l0,0V7.44C24,5.264,22.236,3.5,20.06,3.5L20.06,3.5z M16.54,12l-6.77,4.36 c-0.232,0.149-0.542,0.082-0.691-0.151C9.028,16.129,9,16.035,9,15.94V7.28c0-0.276,0.225-0.5,0.501-0.499 c0.095,0,0.189,0.028,0.269,0.079l6.77,4.33c0.232,0.15,0.299,0.459,0.149,0.691c-0.038,0.06-0.089,0.11-0.149,0.149V12z" stroke="none" fill="currentColor" stroke-width="0" stroke-linecap="round" stroke-linejoin="round" class="astro-P4XWWKMK"></path>
        </g>
      </svg>
    </a>
    <a href="https://github.com/Hopelezz" class="ml-4 astro-P4XWWKMK" aria-label="Github" rel="noopener">
      <svg class="h-6 w-6 hover:text-hot-pink astro-P4XWWKMK" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs" viewBox="0 0 16 16" width="16" height="16">&gt;<g transform="matrix(0.6666666666666666,0,0,0.6666666666666666,0,0)" class="astro-P4XWWKMK">
          <path d="M12,0.28C5.373,0.278-0.002,5.649-0.004,12.276c-0.002,5.197,3.342,9.804,8.284,11.414h0.29 c0.551,0.034,1.026-0.385,1.06-0.936c0.003-0.041,0.003-0.083,0-0.124v-0.21c0-0.17,0-0.4,0-1.09c-0.02-0.132-0.092-0.251-0.2-0.33 c-0.118-0.095-0.272-0.132-0.42-0.1c-2.68,0.58-3.25-1.1-3.29-1.21C5.384,18.801,4.784,18.037,4,17.5 c-0.047-0.041-0.097-0.077-0.15-0.11c0.116-0.063,0.249-0.087,0.38-0.07c0.511,0.071,0.948,0.405,1.15,0.88 c0.804,1.4,2.572,1.913,4,1.16c0.15-0.065,0.258-0.2,0.29-0.36c0.038-0.463,0.236-0.897,0.56-1.23 c0.206-0.183,0.225-0.499,0.042-0.706c-0.081-0.091-0.191-0.149-0.312-0.164c-2.37-0.27-4.79-1.1-4.79-5.19 c-0.02-1.027,0.356-2.023,1.05-2.78C6.351,8.786,6.386,8.579,6.31,8.4C6.032,7.624,6.036,6.774,6.32,6 c0.924,0.164,1.791,0.559,2.52,1.15c0.122,0.086,0.277,0.112,0.42,0.07c0.893-0.242,1.814-0.367,2.74-0.37 c0.929,0.001,1.854,0.125,2.75,0.37c0.14,0.039,0.291,0.013,0.41-0.07c0.73-0.589,1.597-0.984,2.52-1.15 c0.272,0.77,0.272,1.61,0,2.38c-0.076,0.179-0.041,0.386,0.09,0.53c0.687,0.75,1.062,1.733,1.05,2.75c0,4.09-2.43,4.91-4.81,5.18 c-0.275,0.029-0.474,0.274-0.446,0.549c0.013,0.129,0.076,0.248,0.176,0.331c0.448,0.463,0.671,1.099,0.61,1.74v3.18 c-0.01,0.317,0.122,0.621,0.36,0.83c0.303,0.227,0.696,0.298,1.06,0.19c6.285-2.103,9.676-8.902,7.573-15.187 C21.71,3.592,17.147,0.296,12,0.28z" stroke="none" fill="currentColor" stroke-width="0" stroke-linecap="round" stroke-linejoin="round" class="astro-P4XWWKMK"></path>
        </g></svg>
    </a>
    <a href="#" class="ml-4 astro-P4XWWKMK" aria-label="Email" rel="noopener">
      <svg class="h-6 w-6 astro-P4XWWKMK" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs" viewBox="0 0 16 16" width="16" height="16">&gt;<g transform="matrix(0.6666666666666666,0,0,0.6666666666666666,0,0)" class="astro-P4XWWKMK">
          <path d="M 2.25,4.5h19.5c0.828,0,1.5,0.672,1.5,1.5v12c0,0.828-0.672,1.5-1.5,1.5H2.25c-0.828,0-1.5-0.672-1.5-1.5V6 C0.75,5.172,1.422,4.5,2.25,4.5z " stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="astro-P4XWWKMK"></path>
          <path d="M 15.687,9.975L19.5,13.5 " stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="astro-P4XWWKMK"></path>
          <path d="M 8.313,9.975L4.5,13.5 " stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="astro-P4XWWKMK"></path>
          <path d="M 22.88,5.014l-9.513,6.56 c-0.823,0.568-1.911,0.568-2.734,0L1.12,5.014" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="astro-P4XWWKMK"></path>
        </g></svg>
    </a>
  </div>`;
});

const $$file$4 = "C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/Footer/Social.astro";
const $$url$4 = undefined;

var $$module1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$j,
	'default': $$Social,
	file: $$file$4,
	url: $$url$4
}, Symbol.toStringTag, { value: 'Module' }));

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const $$metadata$i = createMetadata("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/Footer/Footer.astro", { modules: [{ module: $$module1, specifier: "./Social.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [{ type: "remote", src: "https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/plugins/autoloader/prism-autoloader.min.js" }, { type: "remote", src: "https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/plugins/copy-to-clipboard/prism-copy-to-clipboard.min.js" }, { type: "remote", src: "https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/plugins/toolbar/prism-toolbar.min.js" }, { type: "remote", src: "https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/prism.min.js" }] });
const $$Astro$i = createAstro("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/Footer/Footer.astro", "http://localhost:3000/", "file:///C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/");
const $$Footer = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$i, $$props, $$slots);
  Astro2.self = $$Footer;
  const STYLES = [];
  for (const STYLE of STYLES)
    $$result.styles.add(STYLE);
  return render(_a || (_a = __template(["", '<footer class="center astro-T5PY4WX2">\n  <div class="text-sm astro-T5PY4WX2" data-test="footer-text">&copy;<script type="text/javascript"> document.write(new Date().getFullYear()); <\/script> &lt;BLACKSKIES &#47;&gt;</div>\n  ', "\n</footer>\n\n\n\n<!-- Prism JS -->\n\n\n\n"])), maybeRenderHead($$result), renderComponent($$result, "Social", $$Social, { "class": "astro-T5PY4WX2" }));
});

const $$file$3 = "C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/Footer/Footer.astro";
const $$url$3 = undefined;

var $$module5 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$i,
	'default': $$Footer,
	file: $$file$3,
	url: $$url$3
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$h = createMetadata("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/layouts/BlogPost.astro", { modules: [{ module: $$module1$1, specifier: "../components/MetaTags.astro", assert: {} }, { module: $$module2$2, specifier: "../components/Header.astro", assert: {} }, { module: $$module3$3, specifier: "../components/CursorEffect/Cursor.astro", assert: {} }, { module: $$module4, specifier: "../components/blog/Post.astro", assert: {} }, { module: $$module4$1, specifier: "../components/sidebar/LeftSidebar.astro", assert: {} }, { module: $$module5, specifier: "../components/Footer/Footer.astro", assert: {} }, { module: $$module6, specifier: "../utils/api.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$h = createAstro("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/layouts/BlogPost.astro", "http://localhost:3000/", "file:///C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/");
const $$BlogPost = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$h, $$props, $$slots);
  Astro2.self = $$BlogPost;
  const { mostRecentBlogPost } = await getBlogPosts();
  const { mostRecentBookPost } = await getBookPosts();
  const { content } = Astro2.props;
  const { title, description, publishDate, author, heroImage, permalink, alt } = content;
  const STYLES = [];
  for (const STYLE of STYLES)
    $$result.styles.add(STYLE);
  return render`<html${addAttribute(content.lang || "en", "lang")} class="astro-K2YMBBPL">
	<head>
		${renderComponent($$result, "Meta", $$MetaTags, { "title": title, "description": description, "permalink": permalink, "class": "astro-K2YMBBPL" })}
	${renderHead($$result)}</head>

	<body>
		${renderComponent($$result, "Cursor", $$Cursor, { "class": "astro-K2YMBBPL" })}
		<div class="body astro-K2YMBBPL">
			${renderComponent($$result, "LeftSidebar", $$LeftSidebar, { "mostRecentBlogPost": mostRecentBlogPost, "mostRecentBookPost": mostRecentBookPost, "class": "astro-K2YMBBPL" })}
		<main class="home_content astro-K2YMBBPL">
			${renderComponent($$result, "Header", $$Header, { "class": "astro-K2YMBBPL" })}
			<div class="wrapper astro-K2YMBBPL">
				${renderComponent($$result, "BlogPost", $$Post$1, { "title": title, "author": author, "heroImage": heroImage, "publishDate": publishDate, "alt": alt, "class": "astro-K2YMBBPL" }, { "default": () => render`${renderSlot($$result, $$slots["default"])}` })}
			</div>
		</main>
	</div>
	${renderComponent($$result, "Footer", $$Footer, { "class": "astro-K2YMBBPL" })}
</body></html>`;
});

const $$file$2 = "C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/layouts/BlogPost.astro";
const $$url$2 = undefined;

var $$module2$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$h,
	'default': $$BlogPost,
	file: $$file$2,
	url: $$url$2
}, Symbol.toStringTag, { value: 'Module' }));

const metadata$e = { "headers": [{ "depth": 1, "slug": "the-concept", "text": "The Concept" }, { "depth": 2, "slug": "how-it-works", "text": "How it works" }], "source": "\r\n# The Concept\r\n\r\nSo I had a navigation bar but nothing really posted to it aside from what I was refereing to as Dashboard that took you to the frontpage and links to my social sites. I wanted to add a bit of complexity and decided on something faily simple just to get my head around the way Astros framework works.\r\n\r\n## How it works\r\n\r\nAs soon as you press the `Most Recent` button on the Nav bar its linked to the latest posts published dates of all the posts. This is done by using the `publishDate` propert field in the frontmatter of the `.md` file. This is a date in the format `DD MM YYYY`. \r\n\r\n```astro\r\n---\r\nlayout: ../../layouts/BlogPost.astro\r\nsetup: |\r\n  import Author from '../../components/Author.astro'\r\ntitle: Most Recent Post Button... A Start\r\npublishDate: 16 JUL 2022   <-- //This is the date of the post of this post. \r\nname: Mark Spratt\r\nhref: https://twitter.com/_Hopelezz\r\ndescription: A simple button, to navigate to the most recent post.\r\ntags: framework, astro, react, svelte, vue, solidjs, preact, alpine, lit, vanilla\r\n---\r\n```\r\n\r\nThis `publishDate` field is already used to sort all the posts by date to show the users the most recent post first on the fronpage. This bit of code was already supplied with the Basic Blog template provided by the Astro community. \r\n\r\n```js\r\n  let allPosts = await Astro.glob('../pages/*.md');\r\n  // sorts the blog posts by publishedDate\r\n  allPosts = allPosts.sort((a, b) => new Date(b.frontmatter.publishDate).valueOf() - new Date(a.frontmatter.publishDate).valueOf());\r\n```\r\n\r\nI then use:\r\n```js\r\n  let mostRecentPost = allPosts[0];\r\n```\r\nTo get all the information about the most recent post. With this I can return the url route to the button.\r\n\r\nNow that I have a variable with just a single post object I can pass it's url property to the components `href` property. This will then link the button to the most recent post.\r\n\r\n```js\r\n<LeftSidebar mostRecentBlogPost={mostRecentBlogPost} />\r\n```\r\n\r\nI decided to name the href property `mostRecentPost` because inside the LeftSidebar component I have an anchor that will read:\r\n```html\r\n    <a href={mostRecentPost.url}>Most Recent Post</a>\r\n```\r\n\r\nmaking the href property more concise.\r\n\r\n> Update: I have since modified this by moving the fetch command inside a function of an api.astro file and split my blog into blog and bookreview folders. This is to make it easier to manage the blog and bookreview posts seperately. When I need the props for my posts I import the function from the utils file and pass it the `blogPosts` object.\r\n\r\n```js\r\n  import { getBlogPosts } from '../utils/api.astro';\r\n  const blogPosts = await getBlogPosts(blogPosts);\r\n```\r\n\r\n> This has to be in an async function because it is a promise. It also has to be housed inside a .astro file since it's using astro props to fetch the post routes.", "html": '<h1 id="the-concept">The Concept</h1>\n<p>So I had a navigation bar but nothing really posted to it aside from what I was refereing to as Dashboard that took you to the frontpage and links to my social sites. I wanted to add a bit of complexity and decided on something faily simple just to get my head around the way Astros framework works.</p>\n<h2 id="how-it-works">How it works</h2>\n<p>As soon as you press the <code is:raw>Most Recent</code> button on the Nav bar its linked to the latest posts published dates of all the posts. This is done by using the <code is:raw>publishDate</code> propert field in the frontmatter of the <code is:raw>.md</code> file. This is a date in the format <code is:raw>DD MM YYYY</code>.</p>\n<pre is:raw class="astro-code" style="background-color: #0d1117; overflow-x: auto;"><code><span class="line"><span style="color: #8B949E">---</span></span>\n<span class="line"><span style="color: #FFA657">layout</span><span style="color: #C9D1D9">: ..</span><span style="color: #FF7B72">/</span><span style="color: #C9D1D9">..</span><span style="color: #FF7B72">/</span><span style="color: #C9D1D9">layouts</span><span style="color: #FF7B72">/</span><span style="color: #C9D1D9">BlogPost.astro</span></span>\n<span class="line"><span style="color: #FFA657">setup</span><span style="color: #C9D1D9">: </span><span style="color: #FF7B72">|</span></span>\n<span class="line"><span style="color: #C9D1D9">  </span><span style="color: #FF7B72">import</span><span style="color: #C9D1D9"> Author </span><span style="color: #FF7B72">from</span><span style="color: #C9D1D9"> </span><span style="color: #A5D6FF">&#39;../../components/Author.astro&#39;</span></span>\n<span class="line"><span style="color: #FFA657">title</span><span style="color: #C9D1D9">: Most Recent Post Button</span><span style="color: #FF7B72">...</span><span style="color: #C9D1D9"> </span><span style="color: #79C0FF">A</span><span style="color: #C9D1D9"> Start</span></span>\n<span class="line"><span style="color: #FFA657">publishDate</span><span style="color: #C9D1D9">: </span><span style="color: #79C0FF">16</span><span style="color: #C9D1D9"> </span><span style="color: #79C0FF">JUL</span><span style="color: #C9D1D9"> </span><span style="color: #79C0FF">2022</span><span style="color: #C9D1D9">   </span><span style="color: #FF7B72">&lt;--</span><span style="color: #C9D1D9"> </span><span style="color: #8B949E">//This is the date of the post of this post. </span></span>\n<span class="line"><span style="color: #FFA657">name</span><span style="color: #C9D1D9">: Mark Spratt</span></span>\n<span class="line"><span style="color: #FFA657">href</span><span style="color: #C9D1D9">: </span><span style="color: #FFA657">https</span><span style="color: #C9D1D9">:</span><span style="color: #8B949E">//twitter.com/_Hopelezz</span></span>\n<span class="line"><span style="color: #FFA657">description</span><span style="color: #C9D1D9">: </span><span style="color: #79C0FF">A</span><span style="color: #C9D1D9"> simple button, to navigate to the most recent post.</span></span>\n<span class="line"><span style="color: #FFA657">tags</span><span style="color: #C9D1D9">: framework, astro, react, svelte, vue, solidjs, preact, alpine, lit, vanilla</span></span>\n<span class="line"><span style="color: #8B949E">---</span></span></code></pre>\n<p>This <code is:raw>publishDate</code> field is already used to sort all the posts by date to show the users the most recent post first on the fronpage. This bit of code was already supplied with the Basic Blog template provided by the Astro community.</p>\n<pre is:raw class="astro-code" style="background-color: #0d1117; overflow-x: auto;"><code><span class="line"><span style="color: #C9D1D9">  </span><span style="color: #FF7B72">let</span><span style="color: #C9D1D9"> allPosts </span><span style="color: #FF7B72">=</span><span style="color: #C9D1D9"> </span><span style="color: #FF7B72">await</span><span style="color: #C9D1D9"> Astro.</span><span style="color: #D2A8FF">glob</span><span style="color: #C9D1D9">(</span><span style="color: #A5D6FF">&#39;../pages/*.md&#39;</span><span style="color: #C9D1D9">);</span></span>\n<span class="line"><span style="color: #C9D1D9">  </span><span style="color: #8B949E">// sorts the blog posts by publishedDate</span></span>\n<span class="line"><span style="color: #C9D1D9">  allPosts </span><span style="color: #FF7B72">=</span><span style="color: #C9D1D9"> allPosts.</span><span style="color: #D2A8FF">sort</span><span style="color: #C9D1D9">((</span><span style="color: #FFA657">a</span><span style="color: #C9D1D9">, </span><span style="color: #FFA657">b</span><span style="color: #C9D1D9">) </span><span style="color: #FF7B72">=&gt;</span><span style="color: #C9D1D9"> </span><span style="color: #FF7B72">new</span><span style="color: #C9D1D9"> </span><span style="color: #79C0FF">Date</span><span style="color: #C9D1D9">(b.frontmatter.publishDate).</span><span style="color: #D2A8FF">valueOf</span><span style="color: #C9D1D9">() </span><span style="color: #FF7B72">-</span><span style="color: #C9D1D9"> </span><span style="color: #FF7B72">new</span><span style="color: #C9D1D9"> </span><span style="color: #79C0FF">Date</span><span style="color: #C9D1D9">(a.frontmatter.publishDate).</span><span style="color: #D2A8FF">valueOf</span><span style="color: #C9D1D9">());</span></span></code></pre>\n<p>I then use:</p>\n<pre is:raw class="astro-code" style="background-color: #0d1117; overflow-x: auto;"><code><span class="line"><span style="color: #C9D1D9">  </span><span style="color: #FF7B72">let</span><span style="color: #C9D1D9"> mostRecentPost </span><span style="color: #FF7B72">=</span><span style="color: #C9D1D9"> allPosts[</span><span style="color: #79C0FF">0</span><span style="color: #C9D1D9">];</span></span></code></pre>\n<p>To get all the information about the most recent post. With this I can return the url route to the button.</p>\n<p>Now that I have a variable with just a single post object I can pass it\u2019s url property to the components <code is:raw>href</code> property. This will then link the button to the most recent post.</p>\n<pre is:raw class="astro-code" style="background-color: #0d1117; overflow-x: auto;"><code><span class="line"><span style="color: #C9D1D9">&lt;</span><span style="color: #7EE787">LeftSidebar</span><span style="color: #C9D1D9"> </span><span style="color: #79C0FF">mostRecentBlogPost</span><span style="color: #FF7B72">=</span><span style="color: #C9D1D9">{mostRecentBlogPost} /&gt;</span></span></code></pre>\n<p>I decided to name the href property <code is:raw>mostRecentPost</code> because inside the LeftSidebar component I have an anchor that will read:</p>\n<pre is:raw class="astro-code" style="background-color: #0d1117; overflow-x: auto;"><code><span class="line"><span style="color: #C9D1D9">    &lt;</span><span style="color: #7EE787">a</span><span style="color: #C9D1D9"> </span><span style="color: #79C0FF">href</span><span style="color: #C9D1D9">=</span><span style="color: #A5D6FF">{mostRecentPost.url}</span><span style="color: #C9D1D9">&gt;Most Recent Post&lt;/</span><span style="color: #7EE787">a</span><span style="color: #C9D1D9">&gt;</span></span></code></pre>\n<p>making the href property more concise.</p>\n<blockquote>\n<p>Update: I have since modified this by moving the fetch command inside a function of an api.astro file and split my blog into blog and bookreview folders. This is to make it easier to manage the blog and bookreview posts seperately. When I need the props for my posts I import the function from the utils file and pass it the <code is:raw>blogPosts</code> object.</p>\n</blockquote>\n<pre is:raw class="astro-code" style="background-color: #0d1117; overflow-x: auto;"><code><span class="line"><span style="color: #C9D1D9">  </span><span style="color: #FF7B72">import</span><span style="color: #C9D1D9"> { getBlogPosts } </span><span style="color: #FF7B72">from</span><span style="color: #C9D1D9"> </span><span style="color: #A5D6FF">&#39;../utils/api.astro&#39;</span><span style="color: #C9D1D9">;</span></span>\n<span class="line"><span style="color: #C9D1D9">  </span><span style="color: #FF7B72">const</span><span style="color: #C9D1D9"> </span><span style="color: #79C0FF">blogPosts</span><span style="color: #C9D1D9"> </span><span style="color: #FF7B72">=</span><span style="color: #C9D1D9"> </span><span style="color: #FF7B72">await</span><span style="color: #C9D1D9"> </span><span style="color: #D2A8FF">getBlogPosts</span><span style="color: #C9D1D9">(blogPosts);</span></span></code></pre>\n<blockquote>\n<p>This has to be in an async function because it is a promise. It also has to be housed inside a .astro file since it\u2019s using astro props to fetch the post routes.</p>\n</blockquote>' };
const frontmatter$e = { "title": "Most Recent Post Button... A Start", "publishDate": "16 JUL 2022", "name": "Mark Spratt", "href": "https://twitter.com/_Hopelezz", "description": "A simple button, to navigate to the most recent post.", "tags": "framework, astro, react, svelte, vue, solidjs, preact, alpine, lit, vanilla", "astro": { "headers": [{ "depth": 1, "slug": "the-concept", "text": "The Concept" }, { "depth": 2, "slug": "how-it-works", "text": "How it works" }], "source": "\r\n# The Concept\r\n\r\nSo I had a navigation bar but nothing really posted to it aside from what I was refereing to as Dashboard that took you to the frontpage and links to my social sites. I wanted to add a bit of complexity and decided on something faily simple just to get my head around the way Astros framework works.\r\n\r\n## How it works\r\n\r\nAs soon as you press the `Most Recent` button on the Nav bar its linked to the latest posts published dates of all the posts. This is done by using the `publishDate` propert field in the frontmatter of the `.md` file. This is a date in the format `DD MM YYYY`. \r\n\r\n```astro\r\n---\r\nlayout: ../../layouts/BlogPost.astro\r\nsetup: |\r\n  import Author from '../../components/Author.astro'\r\ntitle: Most Recent Post Button... A Start\r\npublishDate: 16 JUL 2022   <-- //This is the date of the post of this post. \r\nname: Mark Spratt\r\nhref: https://twitter.com/_Hopelezz\r\ndescription: A simple button, to navigate to the most recent post.\r\ntags: framework, astro, react, svelte, vue, solidjs, preact, alpine, lit, vanilla\r\n---\r\n```\r\n\r\nThis `publishDate` field is already used to sort all the posts by date to show the users the most recent post first on the fronpage. This bit of code was already supplied with the Basic Blog template provided by the Astro community. \r\n\r\n```js\r\n  let allPosts = await Astro.glob('../pages/*.md');\r\n  // sorts the blog posts by publishedDate\r\n  allPosts = allPosts.sort((a, b) => new Date(b.frontmatter.publishDate).valueOf() - new Date(a.frontmatter.publishDate).valueOf());\r\n```\r\n\r\nI then use:\r\n```js\r\n  let mostRecentPost = allPosts[0];\r\n```\r\nTo get all the information about the most recent post. With this I can return the url route to the button.\r\n\r\nNow that I have a variable with just a single post object I can pass it's url property to the components `href` property. This will then link the button to the most recent post.\r\n\r\n```js\r\n<LeftSidebar mostRecentBlogPost={mostRecentBlogPost} />\r\n```\r\n\r\nI decided to name the href property `mostRecentPost` because inside the LeftSidebar component I have an anchor that will read:\r\n```html\r\n    <a href={mostRecentPost.url}>Most Recent Post</a>\r\n```\r\n\r\nmaking the href property more concise.\r\n\r\n> Update: I have since modified this by moving the fetch command inside a function of an api.astro file and split my blog into blog and bookreview folders. This is to make it easier to manage the blog and bookreview posts seperately. When I need the props for my posts I import the function from the utils file and pass it the `blogPosts` object.\r\n\r\n```js\r\n  import { getBlogPosts } from '../utils/api.astro';\r\n  const blogPosts = await getBlogPosts(blogPosts);\r\n```\r\n\r\n> This has to be in an async function because it is a promise. It also has to be housed inside a .astro file since it's using astro props to fetch the post routes.", "html": '<h1 id="the-concept">The Concept</h1>\n<p>So I had a navigation bar but nothing really posted to it aside from what I was refereing to as Dashboard that took you to the frontpage and links to my social sites. I wanted to add a bit of complexity and decided on something faily simple just to get my head around the way Astros framework works.</p>\n<h2 id="how-it-works">How it works</h2>\n<p>As soon as you press the <code is:raw>Most Recent</code> button on the Nav bar its linked to the latest posts published dates of all the posts. This is done by using the <code is:raw>publishDate</code> propert field in the frontmatter of the <code is:raw>.md</code> file. This is a date in the format <code is:raw>DD MM YYYY</code>.</p>\n<pre is:raw class="astro-code" style="background-color: #0d1117; overflow-x: auto;"><code><span class="line"><span style="color: #8B949E">---</span></span>\n<span class="line"><span style="color: #FFA657">layout</span><span style="color: #C9D1D9">: ..</span><span style="color: #FF7B72">/</span><span style="color: #C9D1D9">..</span><span style="color: #FF7B72">/</span><span style="color: #C9D1D9">layouts</span><span style="color: #FF7B72">/</span><span style="color: #C9D1D9">BlogPost.astro</span></span>\n<span class="line"><span style="color: #FFA657">setup</span><span style="color: #C9D1D9">: </span><span style="color: #FF7B72">|</span></span>\n<span class="line"><span style="color: #C9D1D9">  </span><span style="color: #FF7B72">import</span><span style="color: #C9D1D9"> Author </span><span style="color: #FF7B72">from</span><span style="color: #C9D1D9"> </span><span style="color: #A5D6FF">&#39;../../components/Author.astro&#39;</span></span>\n<span class="line"><span style="color: #FFA657">title</span><span style="color: #C9D1D9">: Most Recent Post Button</span><span style="color: #FF7B72">...</span><span style="color: #C9D1D9"> </span><span style="color: #79C0FF">A</span><span style="color: #C9D1D9"> Start</span></span>\n<span class="line"><span style="color: #FFA657">publishDate</span><span style="color: #C9D1D9">: </span><span style="color: #79C0FF">16</span><span style="color: #C9D1D9"> </span><span style="color: #79C0FF">JUL</span><span style="color: #C9D1D9"> </span><span style="color: #79C0FF">2022</span><span style="color: #C9D1D9">   </span><span style="color: #FF7B72">&lt;--</span><span style="color: #C9D1D9"> </span><span style="color: #8B949E">//This is the date of the post of this post. </span></span>\n<span class="line"><span style="color: #FFA657">name</span><span style="color: #C9D1D9">: Mark Spratt</span></span>\n<span class="line"><span style="color: #FFA657">href</span><span style="color: #C9D1D9">: </span><span style="color: #FFA657">https</span><span style="color: #C9D1D9">:</span><span style="color: #8B949E">//twitter.com/_Hopelezz</span></span>\n<span class="line"><span style="color: #FFA657">description</span><span style="color: #C9D1D9">: </span><span style="color: #79C0FF">A</span><span style="color: #C9D1D9"> simple button, to navigate to the most recent post.</span></span>\n<span class="line"><span style="color: #FFA657">tags</span><span style="color: #C9D1D9">: framework, astro, react, svelte, vue, solidjs, preact, alpine, lit, vanilla</span></span>\n<span class="line"><span style="color: #8B949E">---</span></span></code></pre>\n<p>This <code is:raw>publishDate</code> field is already used to sort all the posts by date to show the users the most recent post first on the fronpage. This bit of code was already supplied with the Basic Blog template provided by the Astro community.</p>\n<pre is:raw class="astro-code" style="background-color: #0d1117; overflow-x: auto;"><code><span class="line"><span style="color: #C9D1D9">  </span><span style="color: #FF7B72">let</span><span style="color: #C9D1D9"> allPosts </span><span style="color: #FF7B72">=</span><span style="color: #C9D1D9"> </span><span style="color: #FF7B72">await</span><span style="color: #C9D1D9"> Astro.</span><span style="color: #D2A8FF">glob</span><span style="color: #C9D1D9">(</span><span style="color: #A5D6FF">&#39;../pages/*.md&#39;</span><span style="color: #C9D1D9">);</span></span>\n<span class="line"><span style="color: #C9D1D9">  </span><span style="color: #8B949E">// sorts the blog posts by publishedDate</span></span>\n<span class="line"><span style="color: #C9D1D9">  allPosts </span><span style="color: #FF7B72">=</span><span style="color: #C9D1D9"> allPosts.</span><span style="color: #D2A8FF">sort</span><span style="color: #C9D1D9">((</span><span style="color: #FFA657">a</span><span style="color: #C9D1D9">, </span><span style="color: #FFA657">b</span><span style="color: #C9D1D9">) </span><span style="color: #FF7B72">=&gt;</span><span style="color: #C9D1D9"> </span><span style="color: #FF7B72">new</span><span style="color: #C9D1D9"> </span><span style="color: #79C0FF">Date</span><span style="color: #C9D1D9">(b.frontmatter.publishDate).</span><span style="color: #D2A8FF">valueOf</span><span style="color: #C9D1D9">() </span><span style="color: #FF7B72">-</span><span style="color: #C9D1D9"> </span><span style="color: #FF7B72">new</span><span style="color: #C9D1D9"> </span><span style="color: #79C0FF">Date</span><span style="color: #C9D1D9">(a.frontmatter.publishDate).</span><span style="color: #D2A8FF">valueOf</span><span style="color: #C9D1D9">());</span></span></code></pre>\n<p>I then use:</p>\n<pre is:raw class="astro-code" style="background-color: #0d1117; overflow-x: auto;"><code><span class="line"><span style="color: #C9D1D9">  </span><span style="color: #FF7B72">let</span><span style="color: #C9D1D9"> mostRecentPost </span><span style="color: #FF7B72">=</span><span style="color: #C9D1D9"> allPosts[</span><span style="color: #79C0FF">0</span><span style="color: #C9D1D9">];</span></span></code></pre>\n<p>To get all the information about the most recent post. With this I can return the url route to the button.</p>\n<p>Now that I have a variable with just a single post object I can pass it\u2019s url property to the components <code is:raw>href</code> property. This will then link the button to the most recent post.</p>\n<pre is:raw class="astro-code" style="background-color: #0d1117; overflow-x: auto;"><code><span class="line"><span style="color: #C9D1D9">&lt;</span><span style="color: #7EE787">LeftSidebar</span><span style="color: #C9D1D9"> </span><span style="color: #79C0FF">mostRecentBlogPost</span><span style="color: #FF7B72">=</span><span style="color: #C9D1D9">{mostRecentBlogPost} /&gt;</span></span></code></pre>\n<p>I decided to name the href property <code is:raw>mostRecentPost</code> because inside the LeftSidebar component I have an anchor that will read:</p>\n<pre is:raw class="astro-code" style="background-color: #0d1117; overflow-x: auto;"><code><span class="line"><span style="color: #C9D1D9">    &lt;</span><span style="color: #7EE787">a</span><span style="color: #C9D1D9"> </span><span style="color: #79C0FF">href</span><span style="color: #C9D1D9">=</span><span style="color: #A5D6FF">{mostRecentPost.url}</span><span style="color: #C9D1D9">&gt;Most Recent Post&lt;/</span><span style="color: #7EE787">a</span><span style="color: #C9D1D9">&gt;</span></span></code></pre>\n<p>making the href property more concise.</p>\n<blockquote>\n<p>Update: I have since modified this by moving the fetch command inside a function of an api.astro file and split my blog into blog and bookreview folders. This is to make it easier to manage the blog and bookreview posts seperately. When I need the props for my posts I import the function from the utils file and pass it the <code is:raw>blogPosts</code> object.</p>\n</blockquote>\n<pre is:raw class="astro-code" style="background-color: #0d1117; overflow-x: auto;"><code><span class="line"><span style="color: #C9D1D9">  </span><span style="color: #FF7B72">import</span><span style="color: #C9D1D9"> { getBlogPosts } </span><span style="color: #FF7B72">from</span><span style="color: #C9D1D9"> </span><span style="color: #A5D6FF">&#39;../utils/api.astro&#39;</span><span style="color: #C9D1D9">;</span></span>\n<span class="line"><span style="color: #C9D1D9">  </span><span style="color: #FF7B72">const</span><span style="color: #C9D1D9"> </span><span style="color: #79C0FF">blogPosts</span><span style="color: #C9D1D9"> </span><span style="color: #FF7B72">=</span><span style="color: #C9D1D9"> </span><span style="color: #FF7B72">await</span><span style="color: #C9D1D9"> </span><span style="color: #D2A8FF">getBlogPosts</span><span style="color: #C9D1D9">(blogPosts);</span></span></code></pre>\n<blockquote>\n<p>This has to be in an async function because it is a promise. It also has to be housed inside a .astro file since it\u2019s using astro props to fetch the post routes.</p>\n</blockquote>' } };
function rawContent$e() {
  return "\r\n# The Concept\r\n\r\nSo I had a navigation bar but nothing really posted to it aside from what I was refereing to as Dashboard that took you to the frontpage and links to my social sites. I wanted to add a bit of complexity and decided on something faily simple just to get my head around the way Astros framework works.\r\n\r\n## How it works\r\n\r\nAs soon as you press the `Most Recent` button on the Nav bar its linked to the latest posts published dates of all the posts. This is done by using the `publishDate` propert field in the frontmatter of the `.md` file. This is a date in the format `DD MM YYYY`. \r\n\r\n```astro\r\n---\r\nlayout: ../../layouts/BlogPost.astro\r\nsetup: |\r\n  import Author from '../../components/Author.astro'\r\ntitle: Most Recent Post Button... A Start\r\npublishDate: 16 JUL 2022   <-- //This is the date of the post of this post. \r\nname: Mark Spratt\r\nhref: https://twitter.com/_Hopelezz\r\ndescription: A simple button, to navigate to the most recent post.\r\ntags: framework, astro, react, svelte, vue, solidjs, preact, alpine, lit, vanilla\r\n---\r\n```\r\n\r\nThis `publishDate` field is already used to sort all the posts by date to show the users the most recent post first on the fronpage. This bit of code was already supplied with the Basic Blog template provided by the Astro community. \r\n\r\n```js\r\n  let allPosts = await Astro.glob('../pages/*.md');\r\n  // sorts the blog posts by publishedDate\r\n  allPosts = allPosts.sort((a, b) => new Date(b.frontmatter.publishDate).valueOf() - new Date(a.frontmatter.publishDate).valueOf());\r\n```\r\n\r\nI then use:\r\n```js\r\n  let mostRecentPost = allPosts[0];\r\n```\r\nTo get all the information about the most recent post. With this I can return the url route to the button.\r\n\r\nNow that I have a variable with just a single post object I can pass it's url property to the components `href` property. This will then link the button to the most recent post.\r\n\r\n```js\r\n<LeftSidebar mostRecentBlogPost={mostRecentBlogPost} />\r\n```\r\n\r\nI decided to name the href property `mostRecentPost` because inside the LeftSidebar component I have an anchor that will read:\r\n```html\r\n    <a href={mostRecentPost.url}>Most Recent Post</a>\r\n```\r\n\r\nmaking the href property more concise.\r\n\r\n> Update: I have since modified this by moving the fetch command inside a function of an api.astro file and split my blog into blog and bookreview folders. This is to make it easier to manage the blog and bookreview posts seperately. When I need the props for my posts I import the function from the utils file and pass it the `blogPosts` object.\r\n\r\n```js\r\n  import { getBlogPosts } from '../utils/api.astro';\r\n  const blogPosts = await getBlogPosts(blogPosts);\r\n```\r\n\r\n> This has to be in an async function because it is a promise. It also has to be housed inside a .astro file since it's using astro props to fetch the post routes.";
}
function compiledContent$e() {
  return '<h1 id="the-concept">The Concept</h1>\n<p>So I had a navigation bar but nothing really posted to it aside from what I was refereing to as Dashboard that took you to the frontpage and links to my social sites. I wanted to add a bit of complexity and decided on something faily simple just to get my head around the way Astros framework works.</p>\n<h2 id="how-it-works">How it works</h2>\n<p>As soon as you press the <code is:raw>Most Recent</code> button on the Nav bar its linked to the latest posts published dates of all the posts. This is done by using the <code is:raw>publishDate</code> propert field in the frontmatter of the <code is:raw>.md</code> file. This is a date in the format <code is:raw>DD MM YYYY</code>.</p>\n<pre is:raw class="astro-code" style="background-color: #0d1117; overflow-x: auto;"><code><span class="line"><span style="color: #8B949E">---</span></span>\n<span class="line"><span style="color: #FFA657">layout</span><span style="color: #C9D1D9">: ..</span><span style="color: #FF7B72">/</span><span style="color: #C9D1D9">..</span><span style="color: #FF7B72">/</span><span style="color: #C9D1D9">layouts</span><span style="color: #FF7B72">/</span><span style="color: #C9D1D9">BlogPost.astro</span></span>\n<span class="line"><span style="color: #FFA657">setup</span><span style="color: #C9D1D9">: </span><span style="color: #FF7B72">|</span></span>\n<span class="line"><span style="color: #C9D1D9">  </span><span style="color: #FF7B72">import</span><span style="color: #C9D1D9"> Author </span><span style="color: #FF7B72">from</span><span style="color: #C9D1D9"> </span><span style="color: #A5D6FF">&#39;../../components/Author.astro&#39;</span></span>\n<span class="line"><span style="color: #FFA657">title</span><span style="color: #C9D1D9">: Most Recent Post Button</span><span style="color: #FF7B72">...</span><span style="color: #C9D1D9"> </span><span style="color: #79C0FF">A</span><span style="color: #C9D1D9"> Start</span></span>\n<span class="line"><span style="color: #FFA657">publishDate</span><span style="color: #C9D1D9">: </span><span style="color: #79C0FF">16</span><span style="color: #C9D1D9"> </span><span style="color: #79C0FF">JUL</span><span style="color: #C9D1D9"> </span><span style="color: #79C0FF">2022</span><span style="color: #C9D1D9">   </span><span style="color: #FF7B72">&lt;--</span><span style="color: #C9D1D9"> </span><span style="color: #8B949E">//This is the date of the post of this post. </span></span>\n<span class="line"><span style="color: #FFA657">name</span><span style="color: #C9D1D9">: Mark Spratt</span></span>\n<span class="line"><span style="color: #FFA657">href</span><span style="color: #C9D1D9">: </span><span style="color: #FFA657">https</span><span style="color: #C9D1D9">:</span><span style="color: #8B949E">//twitter.com/_Hopelezz</span></span>\n<span class="line"><span style="color: #FFA657">description</span><span style="color: #C9D1D9">: </span><span style="color: #79C0FF">A</span><span style="color: #C9D1D9"> simple button, to navigate to the most recent post.</span></span>\n<span class="line"><span style="color: #FFA657">tags</span><span style="color: #C9D1D9">: framework, astro, react, svelte, vue, solidjs, preact, alpine, lit, vanilla</span></span>\n<span class="line"><span style="color: #8B949E">---</span></span></code></pre>\n<p>This <code is:raw>publishDate</code> field is already used to sort all the posts by date to show the users the most recent post first on the fronpage. This bit of code was already supplied with the Basic Blog template provided by the Astro community.</p>\n<pre is:raw class="astro-code" style="background-color: #0d1117; overflow-x: auto;"><code><span class="line"><span style="color: #C9D1D9">  </span><span style="color: #FF7B72">let</span><span style="color: #C9D1D9"> allPosts </span><span style="color: #FF7B72">=</span><span style="color: #C9D1D9"> </span><span style="color: #FF7B72">await</span><span style="color: #C9D1D9"> Astro.</span><span style="color: #D2A8FF">glob</span><span style="color: #C9D1D9">(</span><span style="color: #A5D6FF">&#39;../pages/*.md&#39;</span><span style="color: #C9D1D9">);</span></span>\n<span class="line"><span style="color: #C9D1D9">  </span><span style="color: #8B949E">// sorts the blog posts by publishedDate</span></span>\n<span class="line"><span style="color: #C9D1D9">  allPosts </span><span style="color: #FF7B72">=</span><span style="color: #C9D1D9"> allPosts.</span><span style="color: #D2A8FF">sort</span><span style="color: #C9D1D9">((</span><span style="color: #FFA657">a</span><span style="color: #C9D1D9">, </span><span style="color: #FFA657">b</span><span style="color: #C9D1D9">) </span><span style="color: #FF7B72">=&gt;</span><span style="color: #C9D1D9"> </span><span style="color: #FF7B72">new</span><span style="color: #C9D1D9"> </span><span style="color: #79C0FF">Date</span><span style="color: #C9D1D9">(b.frontmatter.publishDate).</span><span style="color: #D2A8FF">valueOf</span><span style="color: #C9D1D9">() </span><span style="color: #FF7B72">-</span><span style="color: #C9D1D9"> </span><span style="color: #FF7B72">new</span><span style="color: #C9D1D9"> </span><span style="color: #79C0FF">Date</span><span style="color: #C9D1D9">(a.frontmatter.publishDate).</span><span style="color: #D2A8FF">valueOf</span><span style="color: #C9D1D9">());</span></span></code></pre>\n<p>I then use:</p>\n<pre is:raw class="astro-code" style="background-color: #0d1117; overflow-x: auto;"><code><span class="line"><span style="color: #C9D1D9">  </span><span style="color: #FF7B72">let</span><span style="color: #C9D1D9"> mostRecentPost </span><span style="color: #FF7B72">=</span><span style="color: #C9D1D9"> allPosts[</span><span style="color: #79C0FF">0</span><span style="color: #C9D1D9">];</span></span></code></pre>\n<p>To get all the information about the most recent post. With this I can return the url route to the button.</p>\n<p>Now that I have a variable with just a single post object I can pass it\u2019s url property to the components <code is:raw>href</code> property. This will then link the button to the most recent post.</p>\n<pre is:raw class="astro-code" style="background-color: #0d1117; overflow-x: auto;"><code><span class="line"><span style="color: #C9D1D9">&lt;</span><span style="color: #7EE787">LeftSidebar</span><span style="color: #C9D1D9"> </span><span style="color: #79C0FF">mostRecentBlogPost</span><span style="color: #FF7B72">=</span><span style="color: #C9D1D9">{mostRecentBlogPost} /&gt;</span></span></code></pre>\n<p>I decided to name the href property <code is:raw>mostRecentPost</code> because inside the LeftSidebar component I have an anchor that will read:</p>\n<pre is:raw class="astro-code" style="background-color: #0d1117; overflow-x: auto;"><code><span class="line"><span style="color: #C9D1D9">    &lt;</span><span style="color: #7EE787">a</span><span style="color: #C9D1D9"> </span><span style="color: #79C0FF">href</span><span style="color: #C9D1D9">=</span><span style="color: #A5D6FF">{mostRecentPost.url}</span><span style="color: #C9D1D9">&gt;Most Recent Post&lt;/</span><span style="color: #7EE787">a</span><span style="color: #C9D1D9">&gt;</span></span></code></pre>\n<p>making the href property more concise.</p>\n<blockquote>\n<p>Update: I have since modified this by moving the fetch command inside a function of an api.astro file and split my blog into blog and bookreview folders. This is to make it easier to manage the blog and bookreview posts seperately. When I need the props for my posts I import the function from the utils file and pass it the <code is:raw>blogPosts</code> object.</p>\n</blockquote>\n<pre is:raw class="astro-code" style="background-color: #0d1117; overflow-x: auto;"><code><span class="line"><span style="color: #C9D1D9">  </span><span style="color: #FF7B72">import</span><span style="color: #C9D1D9"> { getBlogPosts } </span><span style="color: #FF7B72">from</span><span style="color: #C9D1D9"> </span><span style="color: #A5D6FF">&#39;../utils/api.astro&#39;</span><span style="color: #C9D1D9">;</span></span>\n<span class="line"><span style="color: #C9D1D9">  </span><span style="color: #FF7B72">const</span><span style="color: #C9D1D9"> </span><span style="color: #79C0FF">blogPosts</span><span style="color: #C9D1D9"> </span><span style="color: #FF7B72">=</span><span style="color: #C9D1D9"> </span><span style="color: #FF7B72">await</span><span style="color: #C9D1D9"> </span><span style="color: #D2A8FF">getBlogPosts</span><span style="color: #C9D1D9">(blogPosts);</span></span></code></pre>\n<blockquote>\n<p>This has to be in an async function because it is a promise. It also has to be housed inside a .astro file since it\u2019s using astro props to fetch the post routes.</p>\n</blockquote>';
}
const $$metadata$g = createMetadata("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/blog/4-most-recent-post-button.md", { modules: [{ module: $$module1$2, specifier: "@astrojs/markdown-remark/ssr-utils", assert: {} }, { module: $$module2$1, specifier: "../../layouts/BlogPost.astro", assert: {} }, { module: $$module3$1, specifier: "../../components/Author.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$g = createAstro("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/blog/4-most-recent-post-button.md", "http://localhost:3000/", "file:///C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/");
const $$4MostRecentPostButton = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$g, $$props, $$slots);
  Astro2.self = $$4MostRecentPostButton;
  const $$content = { "title": "Most Recent Post Button... A Start", "publishDate": "16 JUL 2022", "name": "Mark Spratt", "href": "https://twitter.com/_Hopelezz", "description": "A simple button, to navigate to the most recent post.", "tags": "framework, astro, react, svelte, vue, solidjs, preact, alpine, lit, vanilla", "astro": { "headers": [{ "depth": 1, "slug": "the-concept", "text": "The Concept" }, { "depth": 2, "slug": "how-it-works", "text": "How it works" }], "source": "\r\n# The Concept\r\n\r\nSo I had a navigation bar but nothing really posted to it aside from what I was refereing to as Dashboard that took you to the frontpage and links to my social sites. I wanted to add a bit of complexity and decided on something faily simple just to get my head around the way Astros framework works.\r\n\r\n## How it works\r\n\r\nAs soon as you press the `Most Recent` button on the Nav bar its linked to the latest posts published dates of all the posts. This is done by using the `publishDate` propert field in the frontmatter of the `.md` file. This is a date in the format `DD MM YYYY`. \r\n\r\n```astro\r\n---\r\nlayout: ../../layouts/BlogPost.astro\r\nsetup: |\r\n  import Author from '../../components/Author.astro'\r\ntitle: Most Recent Post Button... A Start\r\npublishDate: 16 JUL 2022   <-- //This is the date of the post of this post. \r\nname: Mark Spratt\r\nhref: https://twitter.com/_Hopelezz\r\ndescription: A simple button, to navigate to the most recent post.\r\ntags: framework, astro, react, svelte, vue, solidjs, preact, alpine, lit, vanilla\r\n---\r\n```\r\n\r\nThis `publishDate` field is already used to sort all the posts by date to show the users the most recent post first on the fronpage. This bit of code was already supplied with the Basic Blog template provided by the Astro community. \r\n\r\n```js\r\n  let allPosts = await Astro.glob('../pages/*.md');\r\n  // sorts the blog posts by publishedDate\r\n  allPosts = allPosts.sort((a, b) => new Date(b.frontmatter.publishDate).valueOf() - new Date(a.frontmatter.publishDate).valueOf());\r\n```\r\n\r\nI then use:\r\n```js\r\n  let mostRecentPost = allPosts[0];\r\n```\r\nTo get all the information about the most recent post. With this I can return the url route to the button.\r\n\r\nNow that I have a variable with just a single post object I can pass it's url property to the components `href` property. This will then link the button to the most recent post.\r\n\r\n```js\r\n<LeftSidebar mostRecentBlogPost={mostRecentBlogPost} />\r\n```\r\n\r\nI decided to name the href property `mostRecentPost` because inside the LeftSidebar component I have an anchor that will read:\r\n```html\r\n    <a href={mostRecentPost.url}>Most Recent Post</a>\r\n```\r\n\r\nmaking the href property more concise.\r\n\r\n> Update: I have since modified this by moving the fetch command inside a function of an api.astro file and split my blog into blog and bookreview folders. This is to make it easier to manage the blog and bookreview posts seperately. When I need the props for my posts I import the function from the utils file and pass it the `blogPosts` object.\r\n\r\n```js\r\n  import { getBlogPosts } from '../utils/api.astro';\r\n  const blogPosts = await getBlogPosts(blogPosts);\r\n```\r\n\r\n> This has to be in an async function because it is a promise. It also has to be housed inside a .astro file since it's using astro props to fetch the post routes.", "html": '<h1 id="the-concept">The Concept</h1>\n<p>So I had a navigation bar but nothing really posted to it aside from what I was refereing to as Dashboard that took you to the frontpage and links to my social sites. I wanted to add a bit of complexity and decided on something faily simple just to get my head around the way Astros framework works.</p>\n<h2 id="how-it-works">How it works</h2>\n<p>As soon as you press the <code is:raw>Most Recent</code> button on the Nav bar its linked to the latest posts published dates of all the posts. This is done by using the <code is:raw>publishDate</code> propert field in the frontmatter of the <code is:raw>.md</code> file. This is a date in the format <code is:raw>DD MM YYYY</code>.</p>\n<pre is:raw class="astro-code" style="background-color: #0d1117; overflow-x: auto;"><code><span class="line"><span style="color: #8B949E">---</span></span>\n<span class="line"><span style="color: #FFA657">layout</span><span style="color: #C9D1D9">: ..</span><span style="color: #FF7B72">/</span><span style="color: #C9D1D9">..</span><span style="color: #FF7B72">/</span><span style="color: #C9D1D9">layouts</span><span style="color: #FF7B72">/</span><span style="color: #C9D1D9">BlogPost.astro</span></span>\n<span class="line"><span style="color: #FFA657">setup</span><span style="color: #C9D1D9">: </span><span style="color: #FF7B72">|</span></span>\n<span class="line"><span style="color: #C9D1D9">  </span><span style="color: #FF7B72">import</span><span style="color: #C9D1D9"> Author </span><span style="color: #FF7B72">from</span><span style="color: #C9D1D9"> </span><span style="color: #A5D6FF">&#39;../../components/Author.astro&#39;</span></span>\n<span class="line"><span style="color: #FFA657">title</span><span style="color: #C9D1D9">: Most Recent Post Button</span><span style="color: #FF7B72">...</span><span style="color: #C9D1D9"> </span><span style="color: #79C0FF">A</span><span style="color: #C9D1D9"> Start</span></span>\n<span class="line"><span style="color: #FFA657">publishDate</span><span style="color: #C9D1D9">: </span><span style="color: #79C0FF">16</span><span style="color: #C9D1D9"> </span><span style="color: #79C0FF">JUL</span><span style="color: #C9D1D9"> </span><span style="color: #79C0FF">2022</span><span style="color: #C9D1D9">   </span><span style="color: #FF7B72">&lt;--</span><span style="color: #C9D1D9"> </span><span style="color: #8B949E">//This is the date of the post of this post. </span></span>\n<span class="line"><span style="color: #FFA657">name</span><span style="color: #C9D1D9">: Mark Spratt</span></span>\n<span class="line"><span style="color: #FFA657">href</span><span style="color: #C9D1D9">: </span><span style="color: #FFA657">https</span><span style="color: #C9D1D9">:</span><span style="color: #8B949E">//twitter.com/_Hopelezz</span></span>\n<span class="line"><span style="color: #FFA657">description</span><span style="color: #C9D1D9">: </span><span style="color: #79C0FF">A</span><span style="color: #C9D1D9"> simple button, to navigate to the most recent post.</span></span>\n<span class="line"><span style="color: #FFA657">tags</span><span style="color: #C9D1D9">: framework, astro, react, svelte, vue, solidjs, preact, alpine, lit, vanilla</span></span>\n<span class="line"><span style="color: #8B949E">---</span></span></code></pre>\n<p>This <code is:raw>publishDate</code> field is already used to sort all the posts by date to show the users the most recent post first on the fronpage. This bit of code was already supplied with the Basic Blog template provided by the Astro community.</p>\n<pre is:raw class="astro-code" style="background-color: #0d1117; overflow-x: auto;"><code><span class="line"><span style="color: #C9D1D9">  </span><span style="color: #FF7B72">let</span><span style="color: #C9D1D9"> allPosts </span><span style="color: #FF7B72">=</span><span style="color: #C9D1D9"> </span><span style="color: #FF7B72">await</span><span style="color: #C9D1D9"> Astro.</span><span style="color: #D2A8FF">glob</span><span style="color: #C9D1D9">(</span><span style="color: #A5D6FF">&#39;../pages/*.md&#39;</span><span style="color: #C9D1D9">);</span></span>\n<span class="line"><span style="color: #C9D1D9">  </span><span style="color: #8B949E">// sorts the blog posts by publishedDate</span></span>\n<span class="line"><span style="color: #C9D1D9">  allPosts </span><span style="color: #FF7B72">=</span><span style="color: #C9D1D9"> allPosts.</span><span style="color: #D2A8FF">sort</span><span style="color: #C9D1D9">((</span><span style="color: #FFA657">a</span><span style="color: #C9D1D9">, </span><span style="color: #FFA657">b</span><span style="color: #C9D1D9">) </span><span style="color: #FF7B72">=&gt;</span><span style="color: #C9D1D9"> </span><span style="color: #FF7B72">new</span><span style="color: #C9D1D9"> </span><span style="color: #79C0FF">Date</span><span style="color: #C9D1D9">(b.frontmatter.publishDate).</span><span style="color: #D2A8FF">valueOf</span><span style="color: #C9D1D9">() </span><span style="color: #FF7B72">-</span><span style="color: #C9D1D9"> </span><span style="color: #FF7B72">new</span><span style="color: #C9D1D9"> </span><span style="color: #79C0FF">Date</span><span style="color: #C9D1D9">(a.frontmatter.publishDate).</span><span style="color: #D2A8FF">valueOf</span><span style="color: #C9D1D9">());</span></span></code></pre>\n<p>I then use:</p>\n<pre is:raw class="astro-code" style="background-color: #0d1117; overflow-x: auto;"><code><span class="line"><span style="color: #C9D1D9">  </span><span style="color: #FF7B72">let</span><span style="color: #C9D1D9"> mostRecentPost </span><span style="color: #FF7B72">=</span><span style="color: #C9D1D9"> allPosts[</span><span style="color: #79C0FF">0</span><span style="color: #C9D1D9">];</span></span></code></pre>\n<p>To get all the information about the most recent post. With this I can return the url route to the button.</p>\n<p>Now that I have a variable with just a single post object I can pass it\u2019s url property to the components <code is:raw>href</code> property. This will then link the button to the most recent post.</p>\n<pre is:raw class="astro-code" style="background-color: #0d1117; overflow-x: auto;"><code><span class="line"><span style="color: #C9D1D9">&lt;</span><span style="color: #7EE787">LeftSidebar</span><span style="color: #C9D1D9"> </span><span style="color: #79C0FF">mostRecentBlogPost</span><span style="color: #FF7B72">=</span><span style="color: #C9D1D9">{mostRecentBlogPost} /&gt;</span></span></code></pre>\n<p>I decided to name the href property <code is:raw>mostRecentPost</code> because inside the LeftSidebar component I have an anchor that will read:</p>\n<pre is:raw class="astro-code" style="background-color: #0d1117; overflow-x: auto;"><code><span class="line"><span style="color: #C9D1D9">    &lt;</span><span style="color: #7EE787">a</span><span style="color: #C9D1D9"> </span><span style="color: #79C0FF">href</span><span style="color: #C9D1D9">=</span><span style="color: #A5D6FF">{mostRecentPost.url}</span><span style="color: #C9D1D9">&gt;Most Recent Post&lt;/</span><span style="color: #7EE787">a</span><span style="color: #C9D1D9">&gt;</span></span></code></pre>\n<p>making the href property more concise.</p>\n<blockquote>\n<p>Update: I have since modified this by moving the fetch command inside a function of an api.astro file and split my blog into blog and bookreview folders. This is to make it easier to manage the blog and bookreview posts seperately. When I need the props for my posts I import the function from the utils file and pass it the <code is:raw>blogPosts</code> object.</p>\n</blockquote>\n<pre is:raw class="astro-code" style="background-color: #0d1117; overflow-x: auto;"><code><span class="line"><span style="color: #C9D1D9">  </span><span style="color: #FF7B72">import</span><span style="color: #C9D1D9"> { getBlogPosts } </span><span style="color: #FF7B72">from</span><span style="color: #C9D1D9"> </span><span style="color: #A5D6FF">&#39;../utils/api.astro&#39;</span><span style="color: #C9D1D9">;</span></span>\n<span class="line"><span style="color: #C9D1D9">  </span><span style="color: #FF7B72">const</span><span style="color: #C9D1D9"> </span><span style="color: #79C0FF">blogPosts</span><span style="color: #C9D1D9"> </span><span style="color: #FF7B72">=</span><span style="color: #C9D1D9"> </span><span style="color: #FF7B72">await</span><span style="color: #C9D1D9"> </span><span style="color: #D2A8FF">getBlogPosts</span><span style="color: #C9D1D9">(blogPosts);</span></span></code></pre>\n<blockquote>\n<p>This has to be in an async function because it is a promise. It also has to be housed inside a .astro file since it\u2019s using astro props to fetch the post routes.</p>\n</blockquote>' } };
  return render`${renderComponent($$result, "Layout", $$BlogPost, { "content": $$content }, { "default": () => render`${maybeRenderHead($$result)}<h1 id="the-concept">The Concept</h1><p>So I had a navigation bar but nothing really posted to it aside from what I was refereing to as Dashboard that took you to the frontpage and links to my social sites. I wanted to add a bit of complexity and decided on something faily simple just to get my head around the way Astros framework works.</p><h2 id="how-it-works">How it works</h2><p>As soon as you press the <code>Most Recent</code> button on the Nav bar its linked to the latest posts published dates of all the posts. This is done by using the <code>publishDate</code> propert field in the frontmatter of the <code>.md</code> file. This is a date in the format <code>DD MM YYYY</code>.</p><pre class="astro-code" style="background-color: #0d1117; overflow-x: auto;"><code><span class="line"><span style="color: #8B949E">---</span></span>
<span class="line"><span style="color: #FFA657">layout</span><span style="color: #C9D1D9">: ..</span><span style="color: #FF7B72">/</span><span style="color: #C9D1D9">..</span><span style="color: #FF7B72">/</span><span style="color: #C9D1D9">layouts</span><span style="color: #FF7B72">/</span><span style="color: #C9D1D9">BlogPost.astro</span></span>
<span class="line"><span style="color: #FFA657">setup</span><span style="color: #C9D1D9">: </span><span style="color: #FF7B72">|</span></span>
<span class="line"><span style="color: #C9D1D9">  </span><span style="color: #FF7B72">import</span><span style="color: #C9D1D9"> Author </span><span style="color: #FF7B72">from</span><span style="color: #C9D1D9"> </span><span style="color: #A5D6FF">&#39;../../components/Author.astro&#39;</span></span>
<span class="line"><span style="color: #FFA657">title</span><span style="color: #C9D1D9">: Most Recent Post Button</span><span style="color: #FF7B72">...</span><span style="color: #C9D1D9"> </span><span style="color: #79C0FF">A</span><span style="color: #C9D1D9"> Start</span></span>
<span class="line"><span style="color: #FFA657">publishDate</span><span style="color: #C9D1D9">: </span><span style="color: #79C0FF">16</span><span style="color: #C9D1D9"> </span><span style="color: #79C0FF">JUL</span><span style="color: #C9D1D9"> </span><span style="color: #79C0FF">2022</span><span style="color: #C9D1D9">   </span><span style="color: #FF7B72">&lt;--</span><span style="color: #C9D1D9"> </span><span style="color: #8B949E">//This is the date of the post of this post. </span></span>
<span class="line"><span style="color: #FFA657">name</span><span style="color: #C9D1D9">: Mark Spratt</span></span>
<span class="line"><span style="color: #FFA657">href</span><span style="color: #C9D1D9">: </span><span style="color: #FFA657">https</span><span style="color: #C9D1D9">:</span><span style="color: #8B949E">//twitter.com/_Hopelezz</span></span>
<span class="line"><span style="color: #FFA657">description</span><span style="color: #C9D1D9">: </span><span style="color: #79C0FF">A</span><span style="color: #C9D1D9"> simple button, to navigate to the most recent post.</span></span>
<span class="line"><span style="color: #FFA657">tags</span><span style="color: #C9D1D9">: framework, astro, react, svelte, vue, solidjs, preact, alpine, lit, vanilla</span></span>
<span class="line"><span style="color: #8B949E">---</span></span></code></pre><p>This <code>publishDate</code> field is already used to sort all the posts by date to show the users the most recent post first on the fronpage. This bit of code was already supplied with the Basic Blog template provided by the Astro community.</p><pre class="astro-code" style="background-color: #0d1117; overflow-x: auto;"><code><span class="line"><span style="color: #C9D1D9">  </span><span style="color: #FF7B72">let</span><span style="color: #C9D1D9"> allPosts </span><span style="color: #FF7B72">=</span><span style="color: #C9D1D9"> </span><span style="color: #FF7B72">await</span><span style="color: #C9D1D9"> Astro.</span><span style="color: #D2A8FF">glob</span><span style="color: #C9D1D9">(</span><span style="color: #A5D6FF">&#39;../pages/*.md&#39;</span><span style="color: #C9D1D9">);</span></span>
<span class="line"><span style="color: #C9D1D9">  </span><span style="color: #8B949E">// sorts the blog posts by publishedDate</span></span>
<span class="line"><span style="color: #C9D1D9">  allPosts </span><span style="color: #FF7B72">=</span><span style="color: #C9D1D9"> allPosts.</span><span style="color: #D2A8FF">sort</span><span style="color: #C9D1D9">((</span><span style="color: #FFA657">a</span><span style="color: #C9D1D9">, </span><span style="color: #FFA657">b</span><span style="color: #C9D1D9">) </span><span style="color: #FF7B72">=&gt;</span><span style="color: #C9D1D9"> </span><span style="color: #FF7B72">new</span><span style="color: #C9D1D9"> </span><span style="color: #79C0FF">Date</span><span style="color: #C9D1D9">(b.frontmatter.publishDate).</span><span style="color: #D2A8FF">valueOf</span><span style="color: #C9D1D9">() </span><span style="color: #FF7B72">-</span><span style="color: #C9D1D9"> </span><span style="color: #FF7B72">new</span><span style="color: #C9D1D9"> </span><span style="color: #79C0FF">Date</span><span style="color: #C9D1D9">(a.frontmatter.publishDate).</span><span style="color: #D2A8FF">valueOf</span><span style="color: #C9D1D9">());</span></span></code></pre><p>I then use:</p><pre class="astro-code" style="background-color: #0d1117; overflow-x: auto;"><code><span class="line"><span style="color: #C9D1D9">  </span><span style="color: #FF7B72">let</span><span style="color: #C9D1D9"> mostRecentPost </span><span style="color: #FF7B72">=</span><span style="color: #C9D1D9"> allPosts[</span><span style="color: #79C0FF">0</span><span style="color: #C9D1D9">];</span></span></code></pre><p>To get all the information about the most recent post. With this I can return the url route to the button.</p><p>Now that I have a variable with just a single post object I can pass it’s url property to the components <code>href</code> property. This will then link the button to the most recent post.</p><pre class="astro-code" style="background-color: #0d1117; overflow-x: auto;"><code><span class="line"><span style="color: #C9D1D9">&lt;</span><span style="color: #7EE787">LeftSidebar</span><span style="color: #C9D1D9"> </span><span style="color: #79C0FF">mostRecentBlogPost</span><span style="color: #FF7B72">=</span><span style="color: #C9D1D9">{mostRecentBlogPost} /&gt;</span></span></code></pre><p>I decided to name the href property <code>mostRecentPost</code> because inside the LeftSidebar component I have an anchor that will read:</p><pre class="astro-code" style="background-color: #0d1117; overflow-x: auto;"><code><span class="line"><span style="color: #C9D1D9">    &lt;</span><span style="color: #7EE787">a</span><span style="color: #C9D1D9"> </span><span style="color: #79C0FF">href</span><span style="color: #C9D1D9">=</span><span style="color: #A5D6FF">{mostRecentPost.url}</span><span style="color: #C9D1D9">&gt;Most Recent Post&lt;/</span><span style="color: #7EE787">a</span><span style="color: #C9D1D9">&gt;</span></span></code></pre><p>making the href property more concise.</p><blockquote>
<p>Update: I have since modified this by moving the fetch command inside a function of an api.astro file and split my blog into blog and bookreview folders. This is to make it easier to manage the blog and bookreview posts seperately. When I need the props for my posts I import the function from the utils file and pass it the <code>blogPosts</code> object.</p>
</blockquote><pre class="astro-code" style="background-color: #0d1117; overflow-x: auto;"><code><span class="line"><span style="color: #C9D1D9">  </span><span style="color: #FF7B72">import</span><span style="color: #C9D1D9"> { getBlogPosts } </span><span style="color: #FF7B72">from</span><span style="color: #C9D1D9"> </span><span style="color: #A5D6FF">&#39;../utils/api.astro&#39;</span><span style="color: #C9D1D9">;</span></span>
<span class="line"><span style="color: #C9D1D9">  </span><span style="color: #FF7B72">const</span><span style="color: #C9D1D9"> </span><span style="color: #79C0FF">blogPosts</span><span style="color: #C9D1D9"> </span><span style="color: #FF7B72">=</span><span style="color: #C9D1D9"> </span><span style="color: #FF7B72">await</span><span style="color: #C9D1D9"> </span><span style="color: #D2A8FF">getBlogPosts</span><span style="color: #C9D1D9">(blogPosts);</span></span></code></pre><blockquote>
<p>This has to be in an async function because it is a promise. It also has to be housed inside a .astro file since it’s using astro props to fetch the post routes.</p>
</blockquote>` })}`;
});

var _page2 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	metadata: metadata$e,
	frontmatter: frontmatter$e,
	rawContent: rawContent$e,
	compiledContent: compiledContent$e,
	$$metadata: $$metadata$g,
	'default': $$4MostRecentPostButton
}, Symbol.toStringTag, { value: 'Module' }));

const metadata$d = { "headers": [{ "depth": 1, "slug": "todo-create-post-on-two-factor-authentication-to-go-with-password", "text": "TODO: Create Post on Two Factor Authentication to go With Password" }, { "depth": 2, "slug": "content", "text": "Content" }, { "depth": 3, "slug": "sub-content", "text": "Sub Content" }], "source": "\r\n# TODO: Create Post on Two Factor Authentication to go With Password\r\n\r\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui offic\r\n\r\n## Content\r\n\r\n  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui\r\n\r\n  ### Sub Content\r\n\r\n    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, \r\n    \r\n    consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. \r\n    \r\n    Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui\r\n\r\n    List: \r\n    - something, \r\n    - something, \r\n    - something", "html": '<h1 id="todo-create-post-on-two-factor-authentication-to-go-with-password">TODO: Create Post on Two Factor Authentication to go With Password</h1>\n<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui offic</p>\n<h2 id="content">Content</h2>\n<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui</p>\n<h3 id="sub-content">Sub Content</h3>\n<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet,</p>\n<p>consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>\n<p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui</p>\n<p>List:</p>\n<ul>\n<li>something,</li>\n<li>something,</li>\n<li>something</li>\n</ul>' };
const frontmatter$d = { "title": "Two Factor Authentication", "publishDate": "09 JUL 2022", "name": "Mark Spratt", "href": "https://twitter.com/_Hopelezz", "description": "How does Two Factor Authentication protect your account?", "tags": "template page", "astro": { "headers": [{ "depth": 1, "slug": "todo-create-post-on-two-factor-authentication-to-go-with-password", "text": "TODO: Create Post on Two Factor Authentication to go With Password" }, { "depth": 2, "slug": "content", "text": "Content" }, { "depth": 3, "slug": "sub-content", "text": "Sub Content" }], "source": "\r\n# TODO: Create Post on Two Factor Authentication to go With Password\r\n\r\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui offic\r\n\r\n## Content\r\n\r\n  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui\r\n\r\n  ### Sub Content\r\n\r\n    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, \r\n    \r\n    consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. \r\n    \r\n    Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui\r\n\r\n    List: \r\n    - something, \r\n    - something, \r\n    - something", "html": '<h1 id="todo-create-post-on-two-factor-authentication-to-go-with-password">TODO: Create Post on Two Factor Authentication to go With Password</h1>\n<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui offic</p>\n<h2 id="content">Content</h2>\n<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui</p>\n<h3 id="sub-content">Sub Content</h3>\n<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet,</p>\n<p>consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>\n<p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui</p>\n<p>List:</p>\n<ul>\n<li>something,</li>\n<li>something,</li>\n<li>something</li>\n</ul>' } };
function rawContent$d() {
  return "\r\n# TODO: Create Post on Two Factor Authentication to go With Password\r\n\r\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui offic\r\n\r\n## Content\r\n\r\n  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui\r\n\r\n  ### Sub Content\r\n\r\n    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, \r\n    \r\n    consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. \r\n    \r\n    Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui\r\n\r\n    List: \r\n    - something, \r\n    - something, \r\n    - something";
}
function compiledContent$d() {
  return '<h1 id="todo-create-post-on-two-factor-authentication-to-go-with-password">TODO: Create Post on Two Factor Authentication to go With Password</h1>\n<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui offic</p>\n<h2 id="content">Content</h2>\n<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui</p>\n<h3 id="sub-content">Sub Content</h3>\n<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet,</p>\n<p>consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>\n<p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui</p>\n<p>List:</p>\n<ul>\n<li>something,</li>\n<li>something,</li>\n<li>something</li>\n</ul>';
}
const $$metadata$f = createMetadata("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/blog/2-two-factor-auth.md", { modules: [{ module: $$module1$2, specifier: "@astrojs/markdown-remark/ssr-utils", assert: {} }, { module: $$module2$1, specifier: "../../layouts/BlogPost.astro", assert: {} }, { module: $$module3$1, specifier: "../../components/Author.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$f = createAstro("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/blog/2-two-factor-auth.md", "http://localhost:3000/", "file:///C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/");
const $$2TwoFactorAuth = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$f, $$props, $$slots);
  Astro2.self = $$2TwoFactorAuth;
  const $$content = { "title": "Two Factor Authentication", "publishDate": "09 JUL 2022", "name": "Mark Spratt", "href": "https://twitter.com/_Hopelezz", "description": "How does Two Factor Authentication protect your account?", "tags": "template page", "astro": { "headers": [{ "depth": 1, "slug": "todo-create-post-on-two-factor-authentication-to-go-with-password", "text": "TODO: Create Post on Two Factor Authentication to go With Password" }, { "depth": 2, "slug": "content", "text": "Content" }, { "depth": 3, "slug": "sub-content", "text": "Sub Content" }], "source": "\r\n# TODO: Create Post on Two Factor Authentication to go With Password\r\n\r\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui offic\r\n\r\n## Content\r\n\r\n  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui\r\n\r\n  ### Sub Content\r\n\r\n    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, \r\n    \r\n    consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. \r\n    \r\n    Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui\r\n\r\n    List: \r\n    - something, \r\n    - something, \r\n    - something", "html": '<h1 id="todo-create-post-on-two-factor-authentication-to-go-with-password">TODO: Create Post on Two Factor Authentication to go With Password</h1>\n<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui offic</p>\n<h2 id="content">Content</h2>\n<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui</p>\n<h3 id="sub-content">Sub Content</h3>\n<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet,</p>\n<p>consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>\n<p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui</p>\n<p>List:</p>\n<ul>\n<li>something,</li>\n<li>something,</li>\n<li>something</li>\n</ul>' } };
  return render`${renderComponent($$result, "Layout", $$BlogPost, { "content": $$content }, { "default": () => render`${maybeRenderHead($$result)}<h1 id="todo-create-post-on-two-factor-authentication-to-go-with-password">TODO: Create Post on Two Factor Authentication to go With Password</h1><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui offic</p><h2 id="content">Content</h2><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui</p><h3 id="sub-content">Sub Content</h3><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet,</p><p>consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p><p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui</p><p>List:</p><ul>
<li>something,</li>
<li>something,</li>
<li>something</li>
</ul>` })}`;
});

var _page3 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	metadata: metadata$d,
	frontmatter: frontmatter$d,
	rawContent: rawContent$d,
	compiledContent: compiledContent$d,
	$$metadata: $$metadata$f,
	'default': $$2TwoFactorAuth
}, Symbol.toStringTag, { value: 'Module' }));

const metadata$c = { "headers": [{ "depth": 2, "slug": "motivation", "text": "Motivation" }, { "depth": 2, "slug": "what-frameworks-does-this-site-use", "text": "What Frameworks Does This Site Use?" }, { "depth": 2, "slug": "the-start", "text": "The Start" }, { "depth": 2, "slug": "100devs", "text": "100Devs" }, { "depth": 2, "slug": "a-new-journey", "text": "A New Journey" }, { "depth": 2, "slug": "learn-how-to-learn", "text": "Learn How To Learn" }, { "depth": 1, "slug": "things-i-want-to-do", "text": "Things I Want To Do:" }], "source": "\r\n## Motivation\r\n\r\nAt the time of writing this I'm 3 month into my `Web Development` journey. Details of what I'm capable of can be found here in my [About Me](aboutMe). If that link doesn't work I've either not created the page or a custom 404 Page... they're still under construction. See [Things I want to Do](#things-i-want-to-do) for more details. \r\n\r\n_Not gonna lie, I just learned how to make this link to a different header on the page._\r\n\r\n```\r\n[Things I want to Do](#things-i-want-to-do)\r\n```\r\n\r\nA description plus in the url part has to have #all-words-in-lower-case with hiphens between each words.\r\n\r\nIf you are struggling with the idea of `How To` for something like this I hope I can inspires you with this journey. Admittedly, I'm winging it...enjoying the process. If I break something I try to learn why it broke and how to fix it.\r\n\r\n## What Frameworks Does This Site Use?\r\n\r\nThis is purely Astro at the time of writting this post. However, Astro natively supports every popular framework.\r\n\r\n- [React](https://reactjs.org/)\r\n- [Svelte](https://svelte.dev/)\r\n- [Vue](https://vuejs.org/)\r\n- [Solidjs](https://solidjs.com/)\r\n- [Preact](https://preactjs.com/)\r\n- [Alpine](https://alpinejs.dev/)\r\n- [Lit](https://lit.dev/)\r\n- [Vanilla](https://www.javascript.com/)\r\n\r\nMeaning, if I wanted to come back later and add anything specific I could with little to no issues!\r\n\r\nThis site started out with a basic [Blog template](https://stackblitz.com/github/withastro/astro/tree/latest/examples/blog?file=README.md). By comparing the two I hope just how drastically this site has changed.\r\n\r\n## The Start\r\n\r\nAt the time of writing this I'm an Electrical Engineer. I love the type of work I do, but I see a figurative wall for growth.\r\nWas listening one day to a Jordan Harbringer podcast on gaining wealth the discussion pertained to the idea of skill stacking. The idea is to take multiple disciplins and combine them to gain a unquie set of skills. \r\n\r\nI started into Software Development with the idea that I could modify Eplan to boost my personal productivity. Eplan is an electrical CAD. It's designed to simplify the process for creating electrical schematics. Eplan has the ability to run scripts that uses its Application Programming Interface (API). Knowing this I set out to learn C# the language of Eplan. \r\n\r\nHalf way through my course on C# my lead and coworker quit. Leaving me the last electrical engineer on the team for a multi million dollar company. Taking over the department I had more on my plate than just a few scripts. I had been on the team for a little over a year and had been strugling to use the templates that had been created by my previous team. Just a month prior I had given a presentation for a new development process. Management approved!\r\n\r\nTheir departure gave me the clean slate to archive all the depricated templates, clean up the parts library, and create bring forward my new templates design scheme. This took roughly 3 months to complete along with the massive workload I had just been given. That sounds like a lot of time, but I had effectively shaved off a weeks worth of time per project, increase accuracy, and readability of the schematics. Half a year later my company finally hired new replacements. I was able to for the most part keep up with the pace of the company.\r\n\r\nTowards the end of 2020, I was still spending my weekends slowly learning C#. Along the way I had my coworker telling me I should be looking into python. Took the bait to try and learn it. I was hooked! I quickly flew through the Code Academy course. The language felt natural to me. The only downside was that I had no real decernable direction on how to use it in my work.\r\n\r\n## 100Devs\r\n\r\nI would from time to time watch this programmer on Twitch called MidnightSimon. One evening he wasn't on so I went looking for some other streamer to watch. I stumbled onto a streamer who went by LearnWithLeon. He was talking about how to network and market yourself. This seemed to be exactly what I was looking for... except something seemed off. Leon was teaching Web Development. \r\n\r\n## A New Journey\r\n\r\nHere I am, a newly minted Python programmer watching a course on how to get a job as a FullStack JavaScript Developer. A few classes later I finally caved in and started from class one on his youtube channel.\r\n\r\n## Learn How To Learn\r\n\r\nThe first couple of classes were focused on learning how to learn and dealing with mental and physical health. This became pretty relavent when going through the course. Its set at a pretty decent pace, but the workload was heavy. I went into it knowing the basic software logics from my previous courses. \r\n\r\n\r\n\r\n{/*<!-- \r\nThe first post I wrote actually started back in 2011 as a facebook post. My mom asked me one morning \"[What is a Password Vault](1-password)\". Now we're here in 2022 creating a blog. I started programming about 2 years prior learning C#. Making some tournament tracker and a  Shortly after that my roomate & my Co-worker both suggested I start learning Python. I ran through the course. I love writting in python but had no decernable direction. It feels the most intuitive to me. I even created a [Card Game](https://replit.com/@Hopelezz/War?v=1) from scratch.\r\n\r\nOne evening on Twitch I stumbled on a bootcamp called #100Devs. An instructor who goes by the name Leon was teaching about JavaScript. Honestly, at first I was just going to use the platform to hustle my way into a job, but using python instead. That was until I saw the different projects that were being built. \r\n\r\n## Baby Steps\r\n\r\nFirst thing I did was make a Logo! Sure, it's not tied directly to programming the blog or anything, but I wanted to set a theme around a `brand`. It's not a bran YET, but it could be. I still have to work on creating an SVG version of it. That'll come when I have some creative headroom. For now I'll be using a simple PNG.\r\n\r\n>SVG stands for Scalable Vector Graphics. It's a way to draw images that can be scaled, colored, and rotated.\r\n\r\n## The Road\r\n\r\nI wanted to add some flexibilty to my site. One thing it was missing was a navigation bar. So I created one! This is what it looked like originally:\r\n\r\n<blockquote class=\"imgur-embed-pub\" lang=\"en\" data-id=\"a/88TWvWO\"  ><a href=\"//imgur.com/a/88TWvWO\">Sidebar</a></blockquote><script async src=\"//s.imgur.com/min/embed.js\" charset=\"utf-8\"><\/script>\r\n\r\nI've since redesigned it, adding and removing features based on what I need.\r\n\r\nFor the icons I used this website [Boxicons](https://boxicons.com/). You can search over 1600 icons. You can even use the icons as fonts! Because of this I was able to rather easily modify the CSS of the icons.\r\n\r\nI also added search (that doesn't work yet. I head that's hard...), -->*/}\r\n\r\n{/*<!-- TODO -->*/}\r\n\r\n# Things I Want To Do:\r\n\r\n- [ ] Turn the Logo into an SVG version\r\n- [x] Create a section for Book Reviews\r\n  - [ ] Add images to Post Preview.\r\n- [ ] Add a `About Me` page\r\n- [ ] Add a `Hire Me` page\r\n- [ ] Add a `404` page\r\n- [ ] Add a Dark Theme.\r\n- [ ] Searchbar for posts.\r\n  - Invert the colors and make everything Glow.\r\n- [x] Fix the `Most Recent Posts` button on the LeftSideBar\r\n- [ ] Add a Search Feature to query the posts for keywords\r\n- [ ] Change the way `Lists` look\r\n- [ ] Change the way `Check Boxes` look\r\n- [ ] Make the Page More responsive to Mobile.\r\n- [ ] Make the Page More accessible to everyone.\r\n- [ ] Add a RightSideBar that shows the `In This Post` headers.\r\n- [ ] Create a template for the Astro Framework based on what I've learned here\r\n", "html": `<h2 id="motivation">Motivation</h2>
<p>At the time of writing this I\u2019m 3 month into my <code is:raw>Web Development</code> journey. Details of what I\u2019m capable of can be found here in my <a href="aboutMe">About Me</a>. If that link doesn\u2019t work I\u2019ve either not created the page or a custom 404 Page\u2026 they\u2019re still under construction. See <a href="#things-i-want-to-do">Things I want to Do</a> for more details.</p>
<p><em>Not gonna lie, I just learned how to make this link to a different header on the page.</em></p>
<pre is:raw class="astro-code" style="background-color: #0d1117; overflow-x: auto;"><code><span class="line"><span style="color: #c9d1d9">[Things I want to Do](#things-i-want-to-do)</span></span></code></pre>
<p>A description plus in the url part has to have #all-words-in-lower-case with hiphens between each words.</p>
<p>If you are struggling with the idea of <code is:raw>How To</code> for something like this I hope I can inspires you with this journey. Admittedly, I\u2019m winging it\u2026enjoying the process. If I break something I try to learn why it broke and how to fix it.</p>
<h2 id="what-frameworks-does-this-site-use">What Frameworks Does This Site Use?</h2>
<p>This is purely Astro at the time of writting this post. However, Astro natively supports every popular framework.</p>
<ul>
<li><a href="https://reactjs.org/">React</a></li>
<li><a href="https://svelte.dev/">Svelte</a></li>
<li><a href="https://vuejs.org/">Vue</a></li>
<li><a href="https://solidjs.com/">Solidjs</a></li>
<li><a href="https://preactjs.com/">Preact</a></li>
<li><a href="https://alpinejs.dev/">Alpine</a></li>
<li><a href="https://lit.dev/">Lit</a></li>
<li><a href="https://www.javascript.com/">Vanilla</a></li>
</ul>
<p>Meaning, if I wanted to come back later and add anything specific I could with little to no issues!</p>
<p>This site started out with a basic <a href="https://stackblitz.com/github/withastro/astro/tree/latest/examples/blog?file=README.md">Blog template</a>. By comparing the two I hope just how drastically this site has changed.</p>
<h2 id="the-start">The Start</h2>
<p>At the time of writing this I\u2019m an Electrical Engineer. I love the type of work I do, but I see a figurative wall for growth.\r
Was listening one day to a Jordan Harbringer podcast on gaining wealth the discussion pertained to the idea of skill stacking. The idea is to take multiple disciplins and combine them to gain a unquie set of skills.</p>
<p>I started into Software Development with the idea that I could modify Eplan to boost my personal productivity. Eplan is an electrical CAD. It\u2019s designed to simplify the process for creating electrical schematics. Eplan has the ability to run scripts that uses its Application Programming Interface (API). Knowing this I set out to learn C# the language of Eplan.</p>
<p>Half way through my course on C# my lead and coworker quit. Leaving me the last electrical engineer on the team for a multi million dollar company. Taking over the department I had more on my plate than just a few scripts. I had been on the team for a little over a year and had been strugling to use the templates that had been created by my previous team. Just a month prior I had given a presentation for a new development process. Management approved!</p>
<p>Their departure gave me the clean slate to archive all the depricated templates, clean up the parts library, and create bring forward my new templates design scheme. This took roughly 3 months to complete along with the massive workload I had just been given. That sounds like a lot of time, but I had effectively shaved off a weeks worth of time per project, increase accuracy, and readability of the schematics. Half a year later my company finally hired new replacements. I was able to for the most part keep up with the pace of the company.</p>
<p>Towards the end of 2020, I was still spending my weekends slowly learning C#. Along the way I had my coworker telling me I should be looking into python. Took the bait to try and learn it. I was hooked! I quickly flew through the Code Academy course. The language felt natural to me. The only downside was that I had no real decernable direction on how to use it in my work.</p>
<h2 id="100devs">100Devs</h2>
<p>I would from time to time watch this programmer on Twitch called MidnightSimon. One evening he wasn\u2019t on so I went looking for some other streamer to watch. I stumbled onto a streamer who went by LearnWithLeon. He was talking about how to network and market yourself. This seemed to be exactly what I was looking for\u2026 except something seemed off. Leon was teaching Web Development.</p>
<h2 id="a-new-journey">A New Journey</h2>
<p>Here I am, a newly minted Python programmer watching a course on how to get a job as a FullStack JavaScript Developer. A few classes later I finally caved in and started from class one on his youtube channel.</p>
<h2 id="learn-how-to-learn">Learn How To Learn</h2>
<p>The first couple of classes were focused on learning how to learn and dealing with mental and physical health. This became pretty relavent when going through the course. Its set at a pretty decent pace, but the workload was heavy. I went into it knowing the basic software logics from my previous courses.</p>
{/*<!-- \r
The first post I wrote actually started back in 2011 as a facebook post. My mom asked me one morning "[What is a Password Vault](1-password)". Now we're here in 2022 creating a blog. I started programming about 2 years prior learning C#. Making some tournament tracker and a  Shortly after that my roomate & my Co-worker both suggested I start learning Python. I ran through the course. I love writting in python but had no decernable direction. It feels the most intuitive to me. I even created a [Card Game](https://replit.com/@Hopelezz/War?v=1) from scratch.\r
\r
One evening on Twitch I stumbled on a bootcamp called #100Devs. An instructor who goes by the name Leon was teaching about JavaScript. Honestly, at first I was just going to use the platform to hustle my way into a job, but using python instead. That was until I saw the different projects that were being built. \r
\r
## Baby Steps\r
\r
First thing I did was make a Logo! Sure, it's not tied directly to programming the blog or anything, but I wanted to set a theme around a \`brand\`. It's not a bran YET, but it could be. I still have to work on creating an SVG version of it. That'll come when I have some creative headroom. For now I'll be using a simple PNG.\r
\r
>SVG stands for Scalable Vector Graphics. It's a way to draw images that can be scaled, colored, and rotated.\r
\r
## The Road\r
\r
I wanted to add some flexibilty to my site. One thing it was missing was a navigation bar. So I created one! This is what it looked like originally:\r
\r
<blockquote class="imgur-embed-pub" lang="en" data-id="a/88TWvWO"  ><a href="//imgur.com/a/88TWvWO">Sidebar</a></blockquote><script async src="//s.imgur.com/min/embed.js" charset="utf-8"><\/script>\r
\r
I've since redesigned it, adding and removing features based on what I need.\r
\r
For the icons I used this website [Boxicons](https://boxicons.com/). You can search over 1600 icons. You can even use the icons as fonts! Because of this I was able to rather easily modify the CSS of the icons.\r
\r
I also added search (that doesn't work yet. I head that's hard...), -->*/}
{/*<!-- TODO -->*/}
<h1 id="things-i-want-to-do">Things I Want To Do:</h1>
<ul class="contains-task-list">
<li class="task-list-item"><input type="checkbox" disabled> Turn the Logo into an SVG version</li>
<li class="task-list-item"><input type="checkbox" checked disabled> Create a section for Book Reviews
<ul class="contains-task-list">
<li class="task-list-item"><input type="checkbox" disabled> Add images to Post Preview.</li>
</ul>
</li>
<li class="task-list-item"><input type="checkbox" disabled> Add a <code is:raw>About Me</code> page</li>
<li class="task-list-item"><input type="checkbox" disabled> Add a <code is:raw>Hire Me</code> page</li>
<li class="task-list-item"><input type="checkbox" disabled> Add a <code is:raw>404</code> page</li>
<li class="task-list-item"><input type="checkbox" disabled> Add a Dark Theme.</li>
<li class="task-list-item"><input type="checkbox" disabled> Searchbar for posts.
<ul>
<li>Invert the colors and make everything Glow.</li>
</ul>
</li>
<li class="task-list-item"><input type="checkbox" checked disabled> Fix the <code is:raw>Most Recent Posts</code> button on the LeftSideBar</li>
<li class="task-list-item"><input type="checkbox" disabled> Add a Search Feature to query the posts for keywords</li>
<li class="task-list-item"><input type="checkbox" disabled> Change the way <code is:raw>Lists</code> look</li>
<li class="task-list-item"><input type="checkbox" disabled> Change the way <code is:raw>Check Boxes</code> look</li>
<li class="task-list-item"><input type="checkbox" disabled> Make the Page More responsive to Mobile.</li>
<li class="task-list-item"><input type="checkbox" disabled> Make the Page More accessible to everyone.</li>
<li class="task-list-item"><input type="checkbox" disabled> Add a RightSideBar that shows the <code is:raw>In This Post</code> headers.</li>
<li class="task-list-item"><input type="checkbox" disabled> Create a template for the Astro Framework based on what I\u2019ve learned here</li>
</ul>` };
const frontmatter$c = { "title": "Part 1 - Starting an Astro Blog", "publishDate": "10 JUL 2022", "name": "Mark Spratt", "href": "https://twitter.com/_Hopelezz", "description": "Documenting my journey in creating this website.", "tags": "framework, astro, react, svelte, vue, solidjs, preact, alpine, lit, vanilla", "astro": { "headers": [{ "depth": 2, "slug": "motivation", "text": "Motivation" }, { "depth": 2, "slug": "what-frameworks-does-this-site-use", "text": "What Frameworks Does This Site Use?" }, { "depth": 2, "slug": "the-start", "text": "The Start" }, { "depth": 2, "slug": "100devs", "text": "100Devs" }, { "depth": 2, "slug": "a-new-journey", "text": "A New Journey" }, { "depth": 2, "slug": "learn-how-to-learn", "text": "Learn How To Learn" }, { "depth": 1, "slug": "things-i-want-to-do", "text": "Things I Want To Do:" }], "source": "\r\n## Motivation\r\n\r\nAt the time of writing this I'm 3 month into my `Web Development` journey. Details of what I'm capable of can be found here in my [About Me](aboutMe). If that link doesn't work I've either not created the page or a custom 404 Page... they're still under construction. See [Things I want to Do](#things-i-want-to-do) for more details. \r\n\r\n_Not gonna lie, I just learned how to make this link to a different header on the page._\r\n\r\n```\r\n[Things I want to Do](#things-i-want-to-do)\r\n```\r\n\r\nA description plus in the url part has to have #all-words-in-lower-case with hiphens between each words.\r\n\r\nIf you are struggling with the idea of `How To` for something like this I hope I can inspires you with this journey. Admittedly, I'm winging it...enjoying the process. If I break something I try to learn why it broke and how to fix it.\r\n\r\n## What Frameworks Does This Site Use?\r\n\r\nThis is purely Astro at the time of writting this post. However, Astro natively supports every popular framework.\r\n\r\n- [React](https://reactjs.org/)\r\n- [Svelte](https://svelte.dev/)\r\n- [Vue](https://vuejs.org/)\r\n- [Solidjs](https://solidjs.com/)\r\n- [Preact](https://preactjs.com/)\r\n- [Alpine](https://alpinejs.dev/)\r\n- [Lit](https://lit.dev/)\r\n- [Vanilla](https://www.javascript.com/)\r\n\r\nMeaning, if I wanted to come back later and add anything specific I could with little to no issues!\r\n\r\nThis site started out with a basic [Blog template](https://stackblitz.com/github/withastro/astro/tree/latest/examples/blog?file=README.md). By comparing the two I hope just how drastically this site has changed.\r\n\r\n## The Start\r\n\r\nAt the time of writing this I'm an Electrical Engineer. I love the type of work I do, but I see a figurative wall for growth.\r\nWas listening one day to a Jordan Harbringer podcast on gaining wealth the discussion pertained to the idea of skill stacking. The idea is to take multiple disciplins and combine them to gain a unquie set of skills. \r\n\r\nI started into Software Development with the idea that I could modify Eplan to boost my personal productivity. Eplan is an electrical CAD. It's designed to simplify the process for creating electrical schematics. Eplan has the ability to run scripts that uses its Application Programming Interface (API). Knowing this I set out to learn C# the language of Eplan. \r\n\r\nHalf way through my course on C# my lead and coworker quit. Leaving me the last electrical engineer on the team for a multi million dollar company. Taking over the department I had more on my plate than just a few scripts. I had been on the team for a little over a year and had been strugling to use the templates that had been created by my previous team. Just a month prior I had given a presentation for a new development process. Management approved!\r\n\r\nTheir departure gave me the clean slate to archive all the depricated templates, clean up the parts library, and create bring forward my new templates design scheme. This took roughly 3 months to complete along with the massive workload I had just been given. That sounds like a lot of time, but I had effectively shaved off a weeks worth of time per project, increase accuracy, and readability of the schematics. Half a year later my company finally hired new replacements. I was able to for the most part keep up with the pace of the company.\r\n\r\nTowards the end of 2020, I was still spending my weekends slowly learning C#. Along the way I had my coworker telling me I should be looking into python. Took the bait to try and learn it. I was hooked! I quickly flew through the Code Academy course. The language felt natural to me. The only downside was that I had no real decernable direction on how to use it in my work.\r\n\r\n## 100Devs\r\n\r\nI would from time to time watch this programmer on Twitch called MidnightSimon. One evening he wasn't on so I went looking for some other streamer to watch. I stumbled onto a streamer who went by LearnWithLeon. He was talking about how to network and market yourself. This seemed to be exactly what I was looking for... except something seemed off. Leon was teaching Web Development. \r\n\r\n## A New Journey\r\n\r\nHere I am, a newly minted Python programmer watching a course on how to get a job as a FullStack JavaScript Developer. A few classes later I finally caved in and started from class one on his youtube channel.\r\n\r\n## Learn How To Learn\r\n\r\nThe first couple of classes were focused on learning how to learn and dealing with mental and physical health. This became pretty relavent when going through the course. Its set at a pretty decent pace, but the workload was heavy. I went into it knowing the basic software logics from my previous courses. \r\n\r\n\r\n\r\n{/*<!-- \r\nThe first post I wrote actually started back in 2011 as a facebook post. My mom asked me one morning \"[What is a Password Vault](1-password)\". Now we're here in 2022 creating a blog. I started programming about 2 years prior learning C#. Making some tournament tracker and a  Shortly after that my roomate & my Co-worker both suggested I start learning Python. I ran through the course. I love writting in python but had no decernable direction. It feels the most intuitive to me. I even created a [Card Game](https://replit.com/@Hopelezz/War?v=1) from scratch.\r\n\r\nOne evening on Twitch I stumbled on a bootcamp called #100Devs. An instructor who goes by the name Leon was teaching about JavaScript. Honestly, at first I was just going to use the platform to hustle my way into a job, but using python instead. That was until I saw the different projects that were being built. \r\n\r\n## Baby Steps\r\n\r\nFirst thing I did was make a Logo! Sure, it's not tied directly to programming the blog or anything, but I wanted to set a theme around a `brand`. It's not a bran YET, but it could be. I still have to work on creating an SVG version of it. That'll come when I have some creative headroom. For now I'll be using a simple PNG.\r\n\r\n>SVG stands for Scalable Vector Graphics. It's a way to draw images that can be scaled, colored, and rotated.\r\n\r\n## The Road\r\n\r\nI wanted to add some flexibilty to my site. One thing it was missing was a navigation bar. So I created one! This is what it looked like originally:\r\n\r\n<blockquote class=\"imgur-embed-pub\" lang=\"en\" data-id=\"a/88TWvWO\"  ><a href=\"//imgur.com/a/88TWvWO\">Sidebar</a></blockquote><script async src=\"//s.imgur.com/min/embed.js\" charset=\"utf-8\"><\/script>\r\n\r\nI've since redesigned it, adding and removing features based on what I need.\r\n\r\nFor the icons I used this website [Boxicons](https://boxicons.com/). You can search over 1600 icons. You can even use the icons as fonts! Because of this I was able to rather easily modify the CSS of the icons.\r\n\r\nI also added search (that doesn't work yet. I head that's hard...), -->*/}\r\n\r\n{/*<!-- TODO -->*/}\r\n\r\n# Things I Want To Do:\r\n\r\n- [ ] Turn the Logo into an SVG version\r\n- [x] Create a section for Book Reviews\r\n  - [ ] Add images to Post Preview.\r\n- [ ] Add a `About Me` page\r\n- [ ] Add a `Hire Me` page\r\n- [ ] Add a `404` page\r\n- [ ] Add a Dark Theme.\r\n- [ ] Searchbar for posts.\r\n  - Invert the colors and make everything Glow.\r\n- [x] Fix the `Most Recent Posts` button on the LeftSideBar\r\n- [ ] Add a Search Feature to query the posts for keywords\r\n- [ ] Change the way `Lists` look\r\n- [ ] Change the way `Check Boxes` look\r\n- [ ] Make the Page More responsive to Mobile.\r\n- [ ] Make the Page More accessible to everyone.\r\n- [ ] Add a RightSideBar that shows the `In This Post` headers.\r\n- [ ] Create a template for the Astro Framework based on what I've learned here\r\n", "html": `<h2 id="motivation">Motivation</h2>
<p>At the time of writing this I\u2019m 3 month into my <code is:raw>Web Development</code> journey. Details of what I\u2019m capable of can be found here in my <a href="aboutMe">About Me</a>. If that link doesn\u2019t work I\u2019ve either not created the page or a custom 404 Page\u2026 they\u2019re still under construction. See <a href="#things-i-want-to-do">Things I want to Do</a> for more details.</p>
<p><em>Not gonna lie, I just learned how to make this link to a different header on the page.</em></p>
<pre is:raw class="astro-code" style="background-color: #0d1117; overflow-x: auto;"><code><span class="line"><span style="color: #c9d1d9">[Things I want to Do](#things-i-want-to-do)</span></span></code></pre>
<p>A description plus in the url part has to have #all-words-in-lower-case with hiphens between each words.</p>
<p>If you are struggling with the idea of <code is:raw>How To</code> for something like this I hope I can inspires you with this journey. Admittedly, I\u2019m winging it\u2026enjoying the process. If I break something I try to learn why it broke and how to fix it.</p>
<h2 id="what-frameworks-does-this-site-use">What Frameworks Does This Site Use?</h2>
<p>This is purely Astro at the time of writting this post. However, Astro natively supports every popular framework.</p>
<ul>
<li><a href="https://reactjs.org/">React</a></li>
<li><a href="https://svelte.dev/">Svelte</a></li>
<li><a href="https://vuejs.org/">Vue</a></li>
<li><a href="https://solidjs.com/">Solidjs</a></li>
<li><a href="https://preactjs.com/">Preact</a></li>
<li><a href="https://alpinejs.dev/">Alpine</a></li>
<li><a href="https://lit.dev/">Lit</a></li>
<li><a href="https://www.javascript.com/">Vanilla</a></li>
</ul>
<p>Meaning, if I wanted to come back later and add anything specific I could with little to no issues!</p>
<p>This site started out with a basic <a href="https://stackblitz.com/github/withastro/astro/tree/latest/examples/blog?file=README.md">Blog template</a>. By comparing the two I hope just how drastically this site has changed.</p>
<h2 id="the-start">The Start</h2>
<p>At the time of writing this I\u2019m an Electrical Engineer. I love the type of work I do, but I see a figurative wall for growth.\r
Was listening one day to a Jordan Harbringer podcast on gaining wealth the discussion pertained to the idea of skill stacking. The idea is to take multiple disciplins and combine them to gain a unquie set of skills.</p>
<p>I started into Software Development with the idea that I could modify Eplan to boost my personal productivity. Eplan is an electrical CAD. It\u2019s designed to simplify the process for creating electrical schematics. Eplan has the ability to run scripts that uses its Application Programming Interface (API). Knowing this I set out to learn C# the language of Eplan.</p>
<p>Half way through my course on C# my lead and coworker quit. Leaving me the last electrical engineer on the team for a multi million dollar company. Taking over the department I had more on my plate than just a few scripts. I had been on the team for a little over a year and had been strugling to use the templates that had been created by my previous team. Just a month prior I had given a presentation for a new development process. Management approved!</p>
<p>Their departure gave me the clean slate to archive all the depricated templates, clean up the parts library, and create bring forward my new templates design scheme. This took roughly 3 months to complete along with the massive workload I had just been given. That sounds like a lot of time, but I had effectively shaved off a weeks worth of time per project, increase accuracy, and readability of the schematics. Half a year later my company finally hired new replacements. I was able to for the most part keep up with the pace of the company.</p>
<p>Towards the end of 2020, I was still spending my weekends slowly learning C#. Along the way I had my coworker telling me I should be looking into python. Took the bait to try and learn it. I was hooked! I quickly flew through the Code Academy course. The language felt natural to me. The only downside was that I had no real decernable direction on how to use it in my work.</p>
<h2 id="100devs">100Devs</h2>
<p>I would from time to time watch this programmer on Twitch called MidnightSimon. One evening he wasn\u2019t on so I went looking for some other streamer to watch. I stumbled onto a streamer who went by LearnWithLeon. He was talking about how to network and market yourself. This seemed to be exactly what I was looking for\u2026 except something seemed off. Leon was teaching Web Development.</p>
<h2 id="a-new-journey">A New Journey</h2>
<p>Here I am, a newly minted Python programmer watching a course on how to get a job as a FullStack JavaScript Developer. A few classes later I finally caved in and started from class one on his youtube channel.</p>
<h2 id="learn-how-to-learn">Learn How To Learn</h2>
<p>The first couple of classes were focused on learning how to learn and dealing with mental and physical health. This became pretty relavent when going through the course. Its set at a pretty decent pace, but the workload was heavy. I went into it knowing the basic software logics from my previous courses.</p>
{/*<!-- \r
The first post I wrote actually started back in 2011 as a facebook post. My mom asked me one morning "[What is a Password Vault](1-password)". Now we're here in 2022 creating a blog. I started programming about 2 years prior learning C#. Making some tournament tracker and a  Shortly after that my roomate & my Co-worker both suggested I start learning Python. I ran through the course. I love writting in python but had no decernable direction. It feels the most intuitive to me. I even created a [Card Game](https://replit.com/@Hopelezz/War?v=1) from scratch.\r
\r
One evening on Twitch I stumbled on a bootcamp called #100Devs. An instructor who goes by the name Leon was teaching about JavaScript. Honestly, at first I was just going to use the platform to hustle my way into a job, but using python instead. That was until I saw the different projects that were being built. \r
\r
## Baby Steps\r
\r
First thing I did was make a Logo! Sure, it's not tied directly to programming the blog or anything, but I wanted to set a theme around a \`brand\`. It's not a bran YET, but it could be. I still have to work on creating an SVG version of it. That'll come when I have some creative headroom. For now I'll be using a simple PNG.\r
\r
>SVG stands for Scalable Vector Graphics. It's a way to draw images that can be scaled, colored, and rotated.\r
\r
## The Road\r
\r
I wanted to add some flexibilty to my site. One thing it was missing was a navigation bar. So I created one! This is what it looked like originally:\r
\r
<blockquote class="imgur-embed-pub" lang="en" data-id="a/88TWvWO"  ><a href="//imgur.com/a/88TWvWO">Sidebar</a></blockquote><script async src="//s.imgur.com/min/embed.js" charset="utf-8"><\/script>\r
\r
I've since redesigned it, adding and removing features based on what I need.\r
\r
For the icons I used this website [Boxicons](https://boxicons.com/). You can search over 1600 icons. You can even use the icons as fonts! Because of this I was able to rather easily modify the CSS of the icons.\r
\r
I also added search (that doesn't work yet. I head that's hard...), -->*/}
{/*<!-- TODO -->*/}
<h1 id="things-i-want-to-do">Things I Want To Do:</h1>
<ul class="contains-task-list">
<li class="task-list-item"><input type="checkbox" disabled> Turn the Logo into an SVG version</li>
<li class="task-list-item"><input type="checkbox" checked disabled> Create a section for Book Reviews
<ul class="contains-task-list">
<li class="task-list-item"><input type="checkbox" disabled> Add images to Post Preview.</li>
</ul>
</li>
<li class="task-list-item"><input type="checkbox" disabled> Add a <code is:raw>About Me</code> page</li>
<li class="task-list-item"><input type="checkbox" disabled> Add a <code is:raw>Hire Me</code> page</li>
<li class="task-list-item"><input type="checkbox" disabled> Add a <code is:raw>404</code> page</li>
<li class="task-list-item"><input type="checkbox" disabled> Add a Dark Theme.</li>
<li class="task-list-item"><input type="checkbox" disabled> Searchbar for posts.
<ul>
<li>Invert the colors and make everything Glow.</li>
</ul>
</li>
<li class="task-list-item"><input type="checkbox" checked disabled> Fix the <code is:raw>Most Recent Posts</code> button on the LeftSideBar</li>
<li class="task-list-item"><input type="checkbox" disabled> Add a Search Feature to query the posts for keywords</li>
<li class="task-list-item"><input type="checkbox" disabled> Change the way <code is:raw>Lists</code> look</li>
<li class="task-list-item"><input type="checkbox" disabled> Change the way <code is:raw>Check Boxes</code> look</li>
<li class="task-list-item"><input type="checkbox" disabled> Make the Page More responsive to Mobile.</li>
<li class="task-list-item"><input type="checkbox" disabled> Make the Page More accessible to everyone.</li>
<li class="task-list-item"><input type="checkbox" disabled> Add a RightSideBar that shows the <code is:raw>In This Post</code> headers.</li>
<li class="task-list-item"><input type="checkbox" disabled> Create a template for the Astro Framework based on what I\u2019ve learned here</li>
</ul>` } };
function rawContent$c() {
  return "\r\n## Motivation\r\n\r\nAt the time of writing this I'm 3 month into my `Web Development` journey. Details of what I'm capable of can be found here in my [About Me](aboutMe). If that link doesn't work I've either not created the page or a custom 404 Page... they're still under construction. See [Things I want to Do](#things-i-want-to-do) for more details. \r\n\r\n_Not gonna lie, I just learned how to make this link to a different header on the page._\r\n\r\n```\r\n[Things I want to Do](#things-i-want-to-do)\r\n```\r\n\r\nA description plus in the url part has to have #all-words-in-lower-case with hiphens between each words.\r\n\r\nIf you are struggling with the idea of `How To` for something like this I hope I can inspires you with this journey. Admittedly, I'm winging it...enjoying the process. If I break something I try to learn why it broke and how to fix it.\r\n\r\n## What Frameworks Does This Site Use?\r\n\r\nThis is purely Astro at the time of writting this post. However, Astro natively supports every popular framework.\r\n\r\n- [React](https://reactjs.org/)\r\n- [Svelte](https://svelte.dev/)\r\n- [Vue](https://vuejs.org/)\r\n- [Solidjs](https://solidjs.com/)\r\n- [Preact](https://preactjs.com/)\r\n- [Alpine](https://alpinejs.dev/)\r\n- [Lit](https://lit.dev/)\r\n- [Vanilla](https://www.javascript.com/)\r\n\r\nMeaning, if I wanted to come back later and add anything specific I could with little to no issues!\r\n\r\nThis site started out with a basic [Blog template](https://stackblitz.com/github/withastro/astro/tree/latest/examples/blog?file=README.md). By comparing the two I hope just how drastically this site has changed.\r\n\r\n## The Start\r\n\r\nAt the time of writing this I'm an Electrical Engineer. I love the type of work I do, but I see a figurative wall for growth.\r\nWas listening one day to a Jordan Harbringer podcast on gaining wealth the discussion pertained to the idea of skill stacking. The idea is to take multiple disciplins and combine them to gain a unquie set of skills. \r\n\r\nI started into Software Development with the idea that I could modify Eplan to boost my personal productivity. Eplan is an electrical CAD. It's designed to simplify the process for creating electrical schematics. Eplan has the ability to run scripts that uses its Application Programming Interface (API). Knowing this I set out to learn C# the language of Eplan. \r\n\r\nHalf way through my course on C# my lead and coworker quit. Leaving me the last electrical engineer on the team for a multi million dollar company. Taking over the department I had more on my plate than just a few scripts. I had been on the team for a little over a year and had been strugling to use the templates that had been created by my previous team. Just a month prior I had given a presentation for a new development process. Management approved!\r\n\r\nTheir departure gave me the clean slate to archive all the depricated templates, clean up the parts library, and create bring forward my new templates design scheme. This took roughly 3 months to complete along with the massive workload I had just been given. That sounds like a lot of time, but I had effectively shaved off a weeks worth of time per project, increase accuracy, and readability of the schematics. Half a year later my company finally hired new replacements. I was able to for the most part keep up with the pace of the company.\r\n\r\nTowards the end of 2020, I was still spending my weekends slowly learning C#. Along the way I had my coworker telling me I should be looking into python. Took the bait to try and learn it. I was hooked! I quickly flew through the Code Academy course. The language felt natural to me. The only downside was that I had no real decernable direction on how to use it in my work.\r\n\r\n## 100Devs\r\n\r\nI would from time to time watch this programmer on Twitch called MidnightSimon. One evening he wasn't on so I went looking for some other streamer to watch. I stumbled onto a streamer who went by LearnWithLeon. He was talking about how to network and market yourself. This seemed to be exactly what I was looking for... except something seemed off. Leon was teaching Web Development. \r\n\r\n## A New Journey\r\n\r\nHere I am, a newly minted Python programmer watching a course on how to get a job as a FullStack JavaScript Developer. A few classes later I finally caved in and started from class one on his youtube channel.\r\n\r\n## Learn How To Learn\r\n\r\nThe first couple of classes were focused on learning how to learn and dealing with mental and physical health. This became pretty relavent when going through the course. Its set at a pretty decent pace, but the workload was heavy. I went into it knowing the basic software logics from my previous courses. \r\n\r\n\r\n\r\n{/*<!-- \r\nThe first post I wrote actually started back in 2011 as a facebook post. My mom asked me one morning \"[What is a Password Vault](1-password)\". Now we're here in 2022 creating a blog. I started programming about 2 years prior learning C#. Making some tournament tracker and a  Shortly after that my roomate & my Co-worker both suggested I start learning Python. I ran through the course. I love writting in python but had no decernable direction. It feels the most intuitive to me. I even created a [Card Game](https://replit.com/@Hopelezz/War?v=1) from scratch.\r\n\r\nOne evening on Twitch I stumbled on a bootcamp called #100Devs. An instructor who goes by the name Leon was teaching about JavaScript. Honestly, at first I was just going to use the platform to hustle my way into a job, but using python instead. That was until I saw the different projects that were being built. \r\n\r\n## Baby Steps\r\n\r\nFirst thing I did was make a Logo! Sure, it's not tied directly to programming the blog or anything, but I wanted to set a theme around a `brand`. It's not a bran YET, but it could be. I still have to work on creating an SVG version of it. That'll come when I have some creative headroom. For now I'll be using a simple PNG.\r\n\r\n>SVG stands for Scalable Vector Graphics. It's a way to draw images that can be scaled, colored, and rotated.\r\n\r\n## The Road\r\n\r\nI wanted to add some flexibilty to my site. One thing it was missing was a navigation bar. So I created one! This is what it looked like originally:\r\n\r\n<blockquote class=\"imgur-embed-pub\" lang=\"en\" data-id=\"a/88TWvWO\"  ><a href=\"//imgur.com/a/88TWvWO\">Sidebar</a></blockquote><script async src=\"//s.imgur.com/min/embed.js\" charset=\"utf-8\"><\/script>\r\n\r\nI've since redesigned it, adding and removing features based on what I need.\r\n\r\nFor the icons I used this website [Boxicons](https://boxicons.com/). You can search over 1600 icons. You can even use the icons as fonts! Because of this I was able to rather easily modify the CSS of the icons.\r\n\r\nI also added search (that doesn't work yet. I head that's hard...), -->*/}\r\n\r\n{/*<!-- TODO -->*/}\r\n\r\n# Things I Want To Do:\r\n\r\n- [ ] Turn the Logo into an SVG version\r\n- [x] Create a section for Book Reviews\r\n  - [ ] Add images to Post Preview.\r\n- [ ] Add a `About Me` page\r\n- [ ] Add a `Hire Me` page\r\n- [ ] Add a `404` page\r\n- [ ] Add a Dark Theme.\r\n- [ ] Searchbar for posts.\r\n  - Invert the colors and make everything Glow.\r\n- [x] Fix the `Most Recent Posts` button on the LeftSideBar\r\n- [ ] Add a Search Feature to query the posts for keywords\r\n- [ ] Change the way `Lists` look\r\n- [ ] Change the way `Check Boxes` look\r\n- [ ] Make the Page More responsive to Mobile.\r\n- [ ] Make the Page More accessible to everyone.\r\n- [ ] Add a RightSideBar that shows the `In This Post` headers.\r\n- [ ] Create a template for the Astro Framework based on what I've learned here\r\n";
}
function compiledContent$c() {
  return `<h2 id="motivation">Motivation</h2>
<p>At the time of writing this I\u2019m 3 month into my <code is:raw>Web Development</code> journey. Details of what I\u2019m capable of can be found here in my <a href="aboutMe">About Me</a>. If that link doesn\u2019t work I\u2019ve either not created the page or a custom 404 Page\u2026 they\u2019re still under construction. See <a href="#things-i-want-to-do">Things I want to Do</a> for more details.</p>
<p><em>Not gonna lie, I just learned how to make this link to a different header on the page.</em></p>
<pre is:raw class="astro-code" style="background-color: #0d1117; overflow-x: auto;"><code><span class="line"><span style="color: #c9d1d9">[Things I want to Do](#things-i-want-to-do)</span></span></code></pre>
<p>A description plus in the url part has to have #all-words-in-lower-case with hiphens between each words.</p>
<p>If you are struggling with the idea of <code is:raw>How To</code> for something like this I hope I can inspires you with this journey. Admittedly, I\u2019m winging it\u2026enjoying the process. If I break something I try to learn why it broke and how to fix it.</p>
<h2 id="what-frameworks-does-this-site-use">What Frameworks Does This Site Use?</h2>
<p>This is purely Astro at the time of writting this post. However, Astro natively supports every popular framework.</p>
<ul>
<li><a href="https://reactjs.org/">React</a></li>
<li><a href="https://svelte.dev/">Svelte</a></li>
<li><a href="https://vuejs.org/">Vue</a></li>
<li><a href="https://solidjs.com/">Solidjs</a></li>
<li><a href="https://preactjs.com/">Preact</a></li>
<li><a href="https://alpinejs.dev/">Alpine</a></li>
<li><a href="https://lit.dev/">Lit</a></li>
<li><a href="https://www.javascript.com/">Vanilla</a></li>
</ul>
<p>Meaning, if I wanted to come back later and add anything specific I could with little to no issues!</p>
<p>This site started out with a basic <a href="https://stackblitz.com/github/withastro/astro/tree/latest/examples/blog?file=README.md">Blog template</a>. By comparing the two I hope just how drastically this site has changed.</p>
<h2 id="the-start">The Start</h2>
<p>At the time of writing this I\u2019m an Electrical Engineer. I love the type of work I do, but I see a figurative wall for growth.\r
Was listening one day to a Jordan Harbringer podcast on gaining wealth the discussion pertained to the idea of skill stacking. The idea is to take multiple disciplins and combine them to gain a unquie set of skills.</p>
<p>I started into Software Development with the idea that I could modify Eplan to boost my personal productivity. Eplan is an electrical CAD. It\u2019s designed to simplify the process for creating electrical schematics. Eplan has the ability to run scripts that uses its Application Programming Interface (API). Knowing this I set out to learn C# the language of Eplan.</p>
<p>Half way through my course on C# my lead and coworker quit. Leaving me the last electrical engineer on the team for a multi million dollar company. Taking over the department I had more on my plate than just a few scripts. I had been on the team for a little over a year and had been strugling to use the templates that had been created by my previous team. Just a month prior I had given a presentation for a new development process. Management approved!</p>
<p>Their departure gave me the clean slate to archive all the depricated templates, clean up the parts library, and create bring forward my new templates design scheme. This took roughly 3 months to complete along with the massive workload I had just been given. That sounds like a lot of time, but I had effectively shaved off a weeks worth of time per project, increase accuracy, and readability of the schematics. Half a year later my company finally hired new replacements. I was able to for the most part keep up with the pace of the company.</p>
<p>Towards the end of 2020, I was still spending my weekends slowly learning C#. Along the way I had my coworker telling me I should be looking into python. Took the bait to try and learn it. I was hooked! I quickly flew through the Code Academy course. The language felt natural to me. The only downside was that I had no real decernable direction on how to use it in my work.</p>
<h2 id="100devs">100Devs</h2>
<p>I would from time to time watch this programmer on Twitch called MidnightSimon. One evening he wasn\u2019t on so I went looking for some other streamer to watch. I stumbled onto a streamer who went by LearnWithLeon. He was talking about how to network and market yourself. This seemed to be exactly what I was looking for\u2026 except something seemed off. Leon was teaching Web Development.</p>
<h2 id="a-new-journey">A New Journey</h2>
<p>Here I am, a newly minted Python programmer watching a course on how to get a job as a FullStack JavaScript Developer. A few classes later I finally caved in and started from class one on his youtube channel.</p>
<h2 id="learn-how-to-learn">Learn How To Learn</h2>
<p>The first couple of classes were focused on learning how to learn and dealing with mental and physical health. This became pretty relavent when going through the course. Its set at a pretty decent pace, but the workload was heavy. I went into it knowing the basic software logics from my previous courses.</p>
{/*<!-- \r
The first post I wrote actually started back in 2011 as a facebook post. My mom asked me one morning "[What is a Password Vault](1-password)". Now we're here in 2022 creating a blog. I started programming about 2 years prior learning C#. Making some tournament tracker and a  Shortly after that my roomate & my Co-worker both suggested I start learning Python. I ran through the course. I love writting in python but had no decernable direction. It feels the most intuitive to me. I even created a [Card Game](https://replit.com/@Hopelezz/War?v=1) from scratch.\r
\r
One evening on Twitch I stumbled on a bootcamp called #100Devs. An instructor who goes by the name Leon was teaching about JavaScript. Honestly, at first I was just going to use the platform to hustle my way into a job, but using python instead. That was until I saw the different projects that were being built. \r
\r
## Baby Steps\r
\r
First thing I did was make a Logo! Sure, it's not tied directly to programming the blog or anything, but I wanted to set a theme around a \`brand\`. It's not a bran YET, but it could be. I still have to work on creating an SVG version of it. That'll come when I have some creative headroom. For now I'll be using a simple PNG.\r
\r
>SVG stands for Scalable Vector Graphics. It's a way to draw images that can be scaled, colored, and rotated.\r
\r
## The Road\r
\r
I wanted to add some flexibilty to my site. One thing it was missing was a navigation bar. So I created one! This is what it looked like originally:\r
\r
<blockquote class="imgur-embed-pub" lang="en" data-id="a/88TWvWO"  ><a href="//imgur.com/a/88TWvWO">Sidebar</a></blockquote><script async src="//s.imgur.com/min/embed.js" charset="utf-8"><\/script>\r
\r
I've since redesigned it, adding and removing features based on what I need.\r
\r
For the icons I used this website [Boxicons](https://boxicons.com/). You can search over 1600 icons. You can even use the icons as fonts! Because of this I was able to rather easily modify the CSS of the icons.\r
\r
I also added search (that doesn't work yet. I head that's hard...), -->*/}
{/*<!-- TODO -->*/}
<h1 id="things-i-want-to-do">Things I Want To Do:</h1>
<ul class="contains-task-list">
<li class="task-list-item"><input type="checkbox" disabled> Turn the Logo into an SVG version</li>
<li class="task-list-item"><input type="checkbox" checked disabled> Create a section for Book Reviews
<ul class="contains-task-list">
<li class="task-list-item"><input type="checkbox" disabled> Add images to Post Preview.</li>
</ul>
</li>
<li class="task-list-item"><input type="checkbox" disabled> Add a <code is:raw>About Me</code> page</li>
<li class="task-list-item"><input type="checkbox" disabled> Add a <code is:raw>Hire Me</code> page</li>
<li class="task-list-item"><input type="checkbox" disabled> Add a <code is:raw>404</code> page</li>
<li class="task-list-item"><input type="checkbox" disabled> Add a Dark Theme.</li>
<li class="task-list-item"><input type="checkbox" disabled> Searchbar for posts.
<ul>
<li>Invert the colors and make everything Glow.</li>
</ul>
</li>
<li class="task-list-item"><input type="checkbox" checked disabled> Fix the <code is:raw>Most Recent Posts</code> button on the LeftSideBar</li>
<li class="task-list-item"><input type="checkbox" disabled> Add a Search Feature to query the posts for keywords</li>
<li class="task-list-item"><input type="checkbox" disabled> Change the way <code is:raw>Lists</code> look</li>
<li class="task-list-item"><input type="checkbox" disabled> Change the way <code is:raw>Check Boxes</code> look</li>
<li class="task-list-item"><input type="checkbox" disabled> Make the Page More responsive to Mobile.</li>
<li class="task-list-item"><input type="checkbox" disabled> Make the Page More accessible to everyone.</li>
<li class="task-list-item"><input type="checkbox" disabled> Add a RightSideBar that shows the <code is:raw>In This Post</code> headers.</li>
<li class="task-list-item"><input type="checkbox" disabled> Create a template for the Astro Framework based on what I\u2019ve learned here</li>
</ul>`;
}
const $$metadata$e = createMetadata("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/blog/3-starting-astro.md", { modules: [{ module: $$module1$2, specifier: "@astrojs/markdown-remark/ssr-utils", assert: {} }, { module: $$module2$1, specifier: "../../layouts/BlogPost.astro", assert: {} }, { module: $$module3$1, specifier: "../../components/Author.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$e = createAstro("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/blog/3-starting-astro.md", "http://localhost:3000/", "file:///C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/");
const $$3StartingAstro = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$e, $$props, $$slots);
  Astro2.self = $$3StartingAstro;
  const $$content = { "title": "Part 1 - Starting an Astro Blog", "publishDate": "10 JUL 2022", "name": "Mark Spratt", "href": "https://twitter.com/_Hopelezz", "description": "Documenting my journey in creating this website.", "tags": "framework, astro, react, svelte, vue, solidjs, preact, alpine, lit, vanilla", "astro": { "headers": [{ "depth": 2, "slug": "motivation", "text": "Motivation" }, { "depth": 2, "slug": "what-frameworks-does-this-site-use", "text": "What Frameworks Does This Site Use?" }, { "depth": 2, "slug": "the-start", "text": "The Start" }, { "depth": 2, "slug": "100devs", "text": "100Devs" }, { "depth": 2, "slug": "a-new-journey", "text": "A New Journey" }, { "depth": 2, "slug": "learn-how-to-learn", "text": "Learn How To Learn" }, { "depth": 1, "slug": "things-i-want-to-do", "text": "Things I Want To Do:" }], "source": "\r\n## Motivation\r\n\r\nAt the time of writing this I'm 3 month into my `Web Development` journey. Details of what I'm capable of can be found here in my [About Me](aboutMe). If that link doesn't work I've either not created the page or a custom 404 Page... they're still under construction. See [Things I want to Do](#things-i-want-to-do) for more details. \r\n\r\n_Not gonna lie, I just learned how to make this link to a different header on the page._\r\n\r\n```\r\n[Things I want to Do](#things-i-want-to-do)\r\n```\r\n\r\nA description plus in the url part has to have #all-words-in-lower-case with hiphens between each words.\r\n\r\nIf you are struggling with the idea of `How To` for something like this I hope I can inspires you with this journey. Admittedly, I'm winging it...enjoying the process. If I break something I try to learn why it broke and how to fix it.\r\n\r\n## What Frameworks Does This Site Use?\r\n\r\nThis is purely Astro at the time of writting this post. However, Astro natively supports every popular framework.\r\n\r\n- [React](https://reactjs.org/)\r\n- [Svelte](https://svelte.dev/)\r\n- [Vue](https://vuejs.org/)\r\n- [Solidjs](https://solidjs.com/)\r\n- [Preact](https://preactjs.com/)\r\n- [Alpine](https://alpinejs.dev/)\r\n- [Lit](https://lit.dev/)\r\n- [Vanilla](https://www.javascript.com/)\r\n\r\nMeaning, if I wanted to come back later and add anything specific I could with little to no issues!\r\n\r\nThis site started out with a basic [Blog template](https://stackblitz.com/github/withastro/astro/tree/latest/examples/blog?file=README.md). By comparing the two I hope just how drastically this site has changed.\r\n\r\n## The Start\r\n\r\nAt the time of writing this I'm an Electrical Engineer. I love the type of work I do, but I see a figurative wall for growth.\r\nWas listening one day to a Jordan Harbringer podcast on gaining wealth the discussion pertained to the idea of skill stacking. The idea is to take multiple disciplins and combine them to gain a unquie set of skills. \r\n\r\nI started into Software Development with the idea that I could modify Eplan to boost my personal productivity. Eplan is an electrical CAD. It's designed to simplify the process for creating electrical schematics. Eplan has the ability to run scripts that uses its Application Programming Interface (API). Knowing this I set out to learn C# the language of Eplan. \r\n\r\nHalf way through my course on C# my lead and coworker quit. Leaving me the last electrical engineer on the team for a multi million dollar company. Taking over the department I had more on my plate than just a few scripts. I had been on the team for a little over a year and had been strugling to use the templates that had been created by my previous team. Just a month prior I had given a presentation for a new development process. Management approved!\r\n\r\nTheir departure gave me the clean slate to archive all the depricated templates, clean up the parts library, and create bring forward my new templates design scheme. This took roughly 3 months to complete along with the massive workload I had just been given. That sounds like a lot of time, but I had effectively shaved off a weeks worth of time per project, increase accuracy, and readability of the schematics. Half a year later my company finally hired new replacements. I was able to for the most part keep up with the pace of the company.\r\n\r\nTowards the end of 2020, I was still spending my weekends slowly learning C#. Along the way I had my coworker telling me I should be looking into python. Took the bait to try and learn it. I was hooked! I quickly flew through the Code Academy course. The language felt natural to me. The only downside was that I had no real decernable direction on how to use it in my work.\r\n\r\n## 100Devs\r\n\r\nI would from time to time watch this programmer on Twitch called MidnightSimon. One evening he wasn't on so I went looking for some other streamer to watch. I stumbled onto a streamer who went by LearnWithLeon. He was talking about how to network and market yourself. This seemed to be exactly what I was looking for... except something seemed off. Leon was teaching Web Development. \r\n\r\n## A New Journey\r\n\r\nHere I am, a newly minted Python programmer watching a course on how to get a job as a FullStack JavaScript Developer. A few classes later I finally caved in and started from class one on his youtube channel.\r\n\r\n## Learn How To Learn\r\n\r\nThe first couple of classes were focused on learning how to learn and dealing with mental and physical health. This became pretty relavent when going through the course. Its set at a pretty decent pace, but the workload was heavy. I went into it knowing the basic software logics from my previous courses. \r\n\r\n\r\n\r\n{/*<!-- \r\nThe first post I wrote actually started back in 2011 as a facebook post. My mom asked me one morning \"[What is a Password Vault](1-password)\". Now we're here in 2022 creating a blog. I started programming about 2 years prior learning C#. Making some tournament tracker and a  Shortly after that my roomate & my Co-worker both suggested I start learning Python. I ran through the course. I love writting in python but had no decernable direction. It feels the most intuitive to me. I even created a [Card Game](https://replit.com/@Hopelezz/War?v=1) from scratch.\r\n\r\nOne evening on Twitch I stumbled on a bootcamp called #100Devs. An instructor who goes by the name Leon was teaching about JavaScript. Honestly, at first I was just going to use the platform to hustle my way into a job, but using python instead. That was until I saw the different projects that were being built. \r\n\r\n## Baby Steps\r\n\r\nFirst thing I did was make a Logo! Sure, it's not tied directly to programming the blog or anything, but I wanted to set a theme around a `brand`. It's not a bran YET, but it could be. I still have to work on creating an SVG version of it. That'll come when I have some creative headroom. For now I'll be using a simple PNG.\r\n\r\n>SVG stands for Scalable Vector Graphics. It's a way to draw images that can be scaled, colored, and rotated.\r\n\r\n## The Road\r\n\r\nI wanted to add some flexibilty to my site. One thing it was missing was a navigation bar. So I created one! This is what it looked like originally:\r\n\r\n<blockquote class=\"imgur-embed-pub\" lang=\"en\" data-id=\"a/88TWvWO\"  ><a href=\"//imgur.com/a/88TWvWO\">Sidebar</a></blockquote><script async src=\"//s.imgur.com/min/embed.js\" charset=\"utf-8\"><\/script>\r\n\r\nI've since redesigned it, adding and removing features based on what I need.\r\n\r\nFor the icons I used this website [Boxicons](https://boxicons.com/). You can search over 1600 icons. You can even use the icons as fonts! Because of this I was able to rather easily modify the CSS of the icons.\r\n\r\nI also added search (that doesn't work yet. I head that's hard...), -->*/}\r\n\r\n{/*<!-- TODO -->*/}\r\n\r\n# Things I Want To Do:\r\n\r\n- [ ] Turn the Logo into an SVG version\r\n- [x] Create a section for Book Reviews\r\n  - [ ] Add images to Post Preview.\r\n- [ ] Add a `About Me` page\r\n- [ ] Add a `Hire Me` page\r\n- [ ] Add a `404` page\r\n- [ ] Add a Dark Theme.\r\n- [ ] Searchbar for posts.\r\n  - Invert the colors and make everything Glow.\r\n- [x] Fix the `Most Recent Posts` button on the LeftSideBar\r\n- [ ] Add a Search Feature to query the posts for keywords\r\n- [ ] Change the way `Lists` look\r\n- [ ] Change the way `Check Boxes` look\r\n- [ ] Make the Page More responsive to Mobile.\r\n- [ ] Make the Page More accessible to everyone.\r\n- [ ] Add a RightSideBar that shows the `In This Post` headers.\r\n- [ ] Create a template for the Astro Framework based on what I've learned here\r\n", "html": `<h2 id="motivation">Motivation</h2>
<p>At the time of writing this I\u2019m 3 month into my <code is:raw>Web Development</code> journey. Details of what I\u2019m capable of can be found here in my <a href="aboutMe">About Me</a>. If that link doesn\u2019t work I\u2019ve either not created the page or a custom 404 Page\u2026 they\u2019re still under construction. See <a href="#things-i-want-to-do">Things I want to Do</a> for more details.</p>
<p><em>Not gonna lie, I just learned how to make this link to a different header on the page.</em></p>
<pre is:raw class="astro-code" style="background-color: #0d1117; overflow-x: auto;"><code><span class="line"><span style="color: #c9d1d9">[Things I want to Do](#things-i-want-to-do)</span></span></code></pre>
<p>A description plus in the url part has to have #all-words-in-lower-case with hiphens between each words.</p>
<p>If you are struggling with the idea of <code is:raw>How To</code> for something like this I hope I can inspires you with this journey. Admittedly, I\u2019m winging it\u2026enjoying the process. If I break something I try to learn why it broke and how to fix it.</p>
<h2 id="what-frameworks-does-this-site-use">What Frameworks Does This Site Use?</h2>
<p>This is purely Astro at the time of writting this post. However, Astro natively supports every popular framework.</p>
<ul>
<li><a href="https://reactjs.org/">React</a></li>
<li><a href="https://svelte.dev/">Svelte</a></li>
<li><a href="https://vuejs.org/">Vue</a></li>
<li><a href="https://solidjs.com/">Solidjs</a></li>
<li><a href="https://preactjs.com/">Preact</a></li>
<li><a href="https://alpinejs.dev/">Alpine</a></li>
<li><a href="https://lit.dev/">Lit</a></li>
<li><a href="https://www.javascript.com/">Vanilla</a></li>
</ul>
<p>Meaning, if I wanted to come back later and add anything specific I could with little to no issues!</p>
<p>This site started out with a basic <a href="https://stackblitz.com/github/withastro/astro/tree/latest/examples/blog?file=README.md">Blog template</a>. By comparing the two I hope just how drastically this site has changed.</p>
<h2 id="the-start">The Start</h2>
<p>At the time of writing this I\u2019m an Electrical Engineer. I love the type of work I do, but I see a figurative wall for growth.\r
Was listening one day to a Jordan Harbringer podcast on gaining wealth the discussion pertained to the idea of skill stacking. The idea is to take multiple disciplins and combine them to gain a unquie set of skills.</p>
<p>I started into Software Development with the idea that I could modify Eplan to boost my personal productivity. Eplan is an electrical CAD. It\u2019s designed to simplify the process for creating electrical schematics. Eplan has the ability to run scripts that uses its Application Programming Interface (API). Knowing this I set out to learn C# the language of Eplan.</p>
<p>Half way through my course on C# my lead and coworker quit. Leaving me the last electrical engineer on the team for a multi million dollar company. Taking over the department I had more on my plate than just a few scripts. I had been on the team for a little over a year and had been strugling to use the templates that had been created by my previous team. Just a month prior I had given a presentation for a new development process. Management approved!</p>
<p>Their departure gave me the clean slate to archive all the depricated templates, clean up the parts library, and create bring forward my new templates design scheme. This took roughly 3 months to complete along with the massive workload I had just been given. That sounds like a lot of time, but I had effectively shaved off a weeks worth of time per project, increase accuracy, and readability of the schematics. Half a year later my company finally hired new replacements. I was able to for the most part keep up with the pace of the company.</p>
<p>Towards the end of 2020, I was still spending my weekends slowly learning C#. Along the way I had my coworker telling me I should be looking into python. Took the bait to try and learn it. I was hooked! I quickly flew through the Code Academy course. The language felt natural to me. The only downside was that I had no real decernable direction on how to use it in my work.</p>
<h2 id="100devs">100Devs</h2>
<p>I would from time to time watch this programmer on Twitch called MidnightSimon. One evening he wasn\u2019t on so I went looking for some other streamer to watch. I stumbled onto a streamer who went by LearnWithLeon. He was talking about how to network and market yourself. This seemed to be exactly what I was looking for\u2026 except something seemed off. Leon was teaching Web Development.</p>
<h2 id="a-new-journey">A New Journey</h2>
<p>Here I am, a newly minted Python programmer watching a course on how to get a job as a FullStack JavaScript Developer. A few classes later I finally caved in and started from class one on his youtube channel.</p>
<h2 id="learn-how-to-learn">Learn How To Learn</h2>
<p>The first couple of classes were focused on learning how to learn and dealing with mental and physical health. This became pretty relavent when going through the course. Its set at a pretty decent pace, but the workload was heavy. I went into it knowing the basic software logics from my previous courses.</p>
{/*<!-- \r
The first post I wrote actually started back in 2011 as a facebook post. My mom asked me one morning "[What is a Password Vault](1-password)". Now we're here in 2022 creating a blog. I started programming about 2 years prior learning C#. Making some tournament tracker and a  Shortly after that my roomate & my Co-worker both suggested I start learning Python. I ran through the course. I love writting in python but had no decernable direction. It feels the most intuitive to me. I even created a [Card Game](https://replit.com/@Hopelezz/War?v=1) from scratch.\r
\r
One evening on Twitch I stumbled on a bootcamp called #100Devs. An instructor who goes by the name Leon was teaching about JavaScript. Honestly, at first I was just going to use the platform to hustle my way into a job, but using python instead. That was until I saw the different projects that were being built. \r
\r
## Baby Steps\r
\r
First thing I did was make a Logo! Sure, it's not tied directly to programming the blog or anything, but I wanted to set a theme around a \`brand\`. It's not a bran YET, but it could be. I still have to work on creating an SVG version of it. That'll come when I have some creative headroom. For now I'll be using a simple PNG.\r
\r
>SVG stands for Scalable Vector Graphics. It's a way to draw images that can be scaled, colored, and rotated.\r
\r
## The Road\r
\r
I wanted to add some flexibilty to my site. One thing it was missing was a navigation bar. So I created one! This is what it looked like originally:\r
\r
<blockquote class="imgur-embed-pub" lang="en" data-id="a/88TWvWO"  ><a href="//imgur.com/a/88TWvWO">Sidebar</a></blockquote><script async src="//s.imgur.com/min/embed.js" charset="utf-8"><\/script>\r
\r
I've since redesigned it, adding and removing features based on what I need.\r
\r
For the icons I used this website [Boxicons](https://boxicons.com/). You can search over 1600 icons. You can even use the icons as fonts! Because of this I was able to rather easily modify the CSS of the icons.\r
\r
I also added search (that doesn't work yet. I head that's hard...), -->*/}
{/*<!-- TODO -->*/}
<h1 id="things-i-want-to-do">Things I Want To Do:</h1>
<ul class="contains-task-list">
<li class="task-list-item"><input type="checkbox" disabled> Turn the Logo into an SVG version</li>
<li class="task-list-item"><input type="checkbox" checked disabled> Create a section for Book Reviews
<ul class="contains-task-list">
<li class="task-list-item"><input type="checkbox" disabled> Add images to Post Preview.</li>
</ul>
</li>
<li class="task-list-item"><input type="checkbox" disabled> Add a <code is:raw>About Me</code> page</li>
<li class="task-list-item"><input type="checkbox" disabled> Add a <code is:raw>Hire Me</code> page</li>
<li class="task-list-item"><input type="checkbox" disabled> Add a <code is:raw>404</code> page</li>
<li class="task-list-item"><input type="checkbox" disabled> Add a Dark Theme.</li>
<li class="task-list-item"><input type="checkbox" disabled> Searchbar for posts.
<ul>
<li>Invert the colors and make everything Glow.</li>
</ul>
</li>
<li class="task-list-item"><input type="checkbox" checked disabled> Fix the <code is:raw>Most Recent Posts</code> button on the LeftSideBar</li>
<li class="task-list-item"><input type="checkbox" disabled> Add a Search Feature to query the posts for keywords</li>
<li class="task-list-item"><input type="checkbox" disabled> Change the way <code is:raw>Lists</code> look</li>
<li class="task-list-item"><input type="checkbox" disabled> Change the way <code is:raw>Check Boxes</code> look</li>
<li class="task-list-item"><input type="checkbox" disabled> Make the Page More responsive to Mobile.</li>
<li class="task-list-item"><input type="checkbox" disabled> Make the Page More accessible to everyone.</li>
<li class="task-list-item"><input type="checkbox" disabled> Add a RightSideBar that shows the <code is:raw>In This Post</code> headers.</li>
<li class="task-list-item"><input type="checkbox" disabled> Create a template for the Astro Framework based on what I\u2019ve learned here</li>
</ul>` } };
  return render`${renderComponent($$result, "Layout", $$BlogPost, { "content": $$content }, { "default": () => render`${maybeRenderHead($$result)}<h2 id="motivation">Motivation</h2><p>At the time of writing this I’m 3 month into my <code>Web Development</code> journey. Details of what I’m capable of can be found here in my <a href="aboutMe">About Me</a>. If that link doesn’t work I’ve either not created the page or a custom 404 Page… they’re still under construction. See <a href="#things-i-want-to-do">Things I want to Do</a> for more details.</p><p><em>Not gonna lie, I just learned how to make this link to a different header on the page.</em></p><pre class="astro-code" style="background-color: #0d1117; overflow-x: auto;"><code><span class="line"><span style="color: #c9d1d9">[Things I want to Do](#things-i-want-to-do)</span></span></code></pre><p>A description plus in the url part has to have #all-words-in-lower-case with hiphens between each words.</p><p>If you are struggling with the idea of <code>How To</code> for something like this I hope I can inspires you with this journey. Admittedly, I’m winging it…enjoying the process. If I break something I try to learn why it broke and how to fix it.</p><h2 id="what-frameworks-does-this-site-use">What Frameworks Does This Site Use?</h2><p>This is purely Astro at the time of writting this post. However, Astro natively supports every popular framework.</p><ul>
<li><a href="https://reactjs.org/">React</a></li>
<li><a href="https://svelte.dev/">Svelte</a></li>
<li><a href="https://vuejs.org/">Vue</a></li>
<li><a href="https://solidjs.com/">Solidjs</a></li>
<li><a href="https://preactjs.com/">Preact</a></li>
<li><a href="https://alpinejs.dev/">Alpine</a></li>
<li><a href="https://lit.dev/">Lit</a></li>
<li><a href="https://www.javascript.com/">Vanilla</a></li>
</ul><p>Meaning, if I wanted to come back later and add anything specific I could with little to no issues!</p><p>This site started out with a basic <a href="https://stackblitz.com/github/withastro/astro/tree/latest/examples/blog?file=README.md">Blog template</a>. By comparing the two I hope just how drastically this site has changed.</p><h2 id="the-start">The Start</h2><p>At the time of writing this I’m an Electrical Engineer. I love the type of work I do, but I see a figurative wall for growth.
Was listening one day to a Jordan Harbringer podcast on gaining wealth the discussion pertained to the idea of skill stacking. The idea is to take multiple disciplins and combine them to gain a unquie set of skills.</p><p>I started into Software Development with the idea that I could modify Eplan to boost my personal productivity. Eplan is an electrical CAD. It’s designed to simplify the process for creating electrical schematics. Eplan has the ability to run scripts that uses its Application Programming Interface (API). Knowing this I set out to learn C# the language of Eplan.</p><p>Half way through my course on C# my lead and coworker quit. Leaving me the last electrical engineer on the team for a multi million dollar company. Taking over the department I had more on my plate than just a few scripts. I had been on the team for a little over a year and had been strugling to use the templates that had been created by my previous team. Just a month prior I had given a presentation for a new development process. Management approved!</p><p>Their departure gave me the clean slate to archive all the depricated templates, clean up the parts library, and create bring forward my new templates design scheme. This took roughly 3 months to complete along with the massive workload I had just been given. That sounds like a lot of time, but I had effectively shaved off a weeks worth of time per project, increase accuracy, and readability of the schematics. Half a year later my company finally hired new replacements. I was able to for the most part keep up with the pace of the company.</p><p>Towards the end of 2020, I was still spending my weekends slowly learning C#. Along the way I had my coworker telling me I should be looking into python. Took the bait to try and learn it. I was hooked! I quickly flew through the Code Academy course. The language felt natural to me. The only downside was that I had no real decernable direction on how to use it in my work.</p><h2 id="100devs">100Devs</h2><p>I would from time to time watch this programmer on Twitch called MidnightSimon. One evening he wasn’t on so I went looking for some other streamer to watch. I stumbled onto a streamer who went by LearnWithLeon. He was talking about how to network and market yourself. This seemed to be exactly what I was looking for… except something seemed off. Leon was teaching Web Development.</p><h2 id="a-new-journey">A New Journey</h2><p>Here I am, a newly minted Python programmer watching a course on how to get a job as a FullStack JavaScript Developer. A few classes later I finally caved in and started from class one on his youtube channel.</p><h2 id="learn-how-to-learn">Learn How To Learn</h2><p>The first couple of classes were focused on learning how to learn and dealing with mental and physical health. This became pretty relavent when going through the course. Its set at a pretty decent pace, but the workload was heavy. I went into it knowing the basic software logics from my previous courses.</p><h1 id="things-i-want-to-do">Things I Want To Do:</h1><ul class="contains-task-list">
<li class="task-list-item"><input type="checkbox" disabled> Turn the Logo into an SVG version</li>
<li class="task-list-item"><input type="checkbox" checked disabled> Create a section for Book Reviews
<ul class="contains-task-list">
<li class="task-list-item"><input type="checkbox" disabled> Add images to Post Preview.</li>
</ul>
</li>
<li class="task-list-item"><input type="checkbox" disabled> Add a <code>About Me</code> page</li>
<li class="task-list-item"><input type="checkbox" disabled> Add a <code>Hire Me</code> page</li>
<li class="task-list-item"><input type="checkbox" disabled> Add a <code>404</code> page</li>
<li class="task-list-item"><input type="checkbox" disabled> Add a Dark Theme.</li>
<li class="task-list-item"><input type="checkbox" disabled> Searchbar for posts.
<ul>
<li>Invert the colors and make everything Glow.</li>
</ul>
</li>
<li class="task-list-item"><input type="checkbox" checked disabled> Fix the <code>Most Recent Posts</code> button on the LeftSideBar</li>
<li class="task-list-item"><input type="checkbox" disabled> Add a Search Feature to query the posts for keywords</li>
<li class="task-list-item"><input type="checkbox" disabled> Change the way <code>Lists</code> look</li>
<li class="task-list-item"><input type="checkbox" disabled> Change the way <code>Check Boxes</code> look</li>
<li class="task-list-item"><input type="checkbox" disabled> Make the Page More responsive to Mobile.</li>
<li class="task-list-item"><input type="checkbox" disabled> Make the Page More accessible to everyone.</li>
<li class="task-list-item"><input type="checkbox" disabled> Add a RightSideBar that shows the <code>In This Post</code> headers.</li>
<li class="task-list-item"><input type="checkbox" disabled> Create a template for the Astro Framework based on what I’ve learned here</li>
</ul>` })}`;
});

var _page4 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	metadata: metadata$c,
	frontmatter: frontmatter$c,
	rawContent: rawContent$c,
	compiledContent: compiledContent$c,
	$$metadata: $$metadata$e,
	'default': $$3StartingAstro
}, Symbol.toStringTag, { value: 'Module' }));

const metadata$b = { "headers": [{ "depth": 2, "slug": "early-morning", "text": "Early Morning\u2026" }, { "depth": 3, "slug": "tldr", "text": "TLDR:" }, { "depth": 3, "slug": "long-version", "text": "Long version:" }, { "depth": 2, "slug": "story-time", "text": "Story time" }, { "depth": 2, "slug": "hashing", "text": "Hashing" }, { "depth": 2, "slug": "the-fix", "text": "The Fix" }, { "depth": 2, "slug": "suggestion", "text": "Suggestion" }], "source": '\r\n<a href="https://xkcd.com/936/?fbclid=IwAR1dBAc767rK5ni47plmh50MfOJ0f0pnzvUsua_UiZ7mpmBHuwnF_dbzr_U">\r\n  <div align="center">\r\n    ![img](https://imgs.xkcd.com/comics/password_strength.png)\r\n  </div>\r\n</a>\r\n\r\n## Early Morning...\r\n\r\nMy mom messaged me one morning asking, "What is a  Password vault?"\r\n\r\n### **TLDR:**\r\n\r\n>A Password vault is a collection of passwords that you can use to log into a website. <br/> But you came here for something a bit more... complicated.\r\n\r\n### **Long version:**\r\n\r\nTo start off we first need to break down what a password is. According to Webster:\r\n\r\n```markdown\r\nDefinition of password\r\n\r\n1: something that enables one to pass or gain admission:\r\nsuch as a spoken word or phrase required to pass by a guard \r\n```\r\n\r\nPasswords are these things we\u2019re all plagued with within this new age of tech. Having to remember every unique password can be a pain. Yet, using one of them for all your accounts isn\u2019t recommended. What\'s the fix?\r\n\r\nWe know currently, that passwords aren\'t supposed to be simple. Oh, and they should contain numbers, symbols, and letters. `but why?` I hear you say. Hold on, let\'s rewind a bit. Like everything, there\u2019s a history to it, right? Well, passwords, don\'t have a definitive date. Some speculate it was MIT  when they created the first time-sharing system.\r\n\r\n## Story time\r\n\r\nEmerging onto the stage a wizard performing magic goes by the name of Robert Morris. To set the stage there is a realm called Unix, an operating system that was first developed in the 1960s. Morris conjured a process known as `Hashing`. Not the same thing used for getting stoned; although they may have been at the time. His son later created the [Morris Worm](https://wikipedia.org/wiki/Morris_worm) on November 2, 1988, with the hashing concept. This infected large groups of systems. Its intended use was to see the size of the internet by exploiting loopholes in the codebase of machines. Doesn\'t sound like a bad idea, but it didn\u2019t work quite as expected... leading to the first felony conviction of its kind.\r\n\r\nSkipping a few years we get to the serious concerns for Password... theft. Such as Email accounts, MSN messengers, Geocities, Myspace, Blogger, Xanga, AIM, Yahoo, Hotmail, AOL... Remembers these? These all came with the advent of the internet created by Al Gore... Whoa... _looks at script_, wait one sec checking sources. Never mind, he horribly misquoted. Sources believe XEROX stumbled upon the concept of the internet without knowing what size it would become. So we have the internet and passwords are being encrypted by hashes...\r\n\r\n## Hashing\r\n\r\nWhat even are hashes? Don\'t freak out...Breath. You\'re about to see a long string of letters and numbers. This is intentional! You don\'t have to memorize this or even read it. Just know it\'s a random string of characters.\r\n\r\n>Word 1: <br/>\r\n>hash("hello") = 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824\r\n\r\n>Word 2: <br/>\r\n>hash("hbllo") = 58756879c05c68dfac9866712fad6a93f8146f337a69afe7dd238f3364946366\r\n\r\nYou probably went "wait\u2026 if someone else uses the same password then they have the encryption code too." CORRECT! They were until companies banded together and started a process called `SALT`. By adding a header (like multiplying it or double encrypting it) to the password it varies the hash like so:\r\n\r\n>Remember this?\r\n>hash("hello") = 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824\r\n\r\nLet\'s sprinkle it with SALT. The SALT is a random string of letters and numbers added to the word\r\n\r\n>Hash example 1:\r\n>hash("hello" + "QxLUF1bgIAdeQX") = 9e209040c863f84a31e719795b2577523954739fe5ed3b58a75cff2127075ed1\r\n<br/>\r\n>Hash example 2:\r\n>("hello" + "bv5PehSMfV11Cd") = d1d3ec2e6f20fd420d50e2642992841d8338a314b8ea157c9e18477aaef226ab\r\n\r\nThis prevented hackers from using banks of passwords like [dictionary attacks](https://en.wikipedia.org/wiki/Dictionary_attack), which use lookup tables... _Those perverts_!\r\n\r\nThere have since been many other alternatives to the hashing system. For example: Password-Based Key Derivation Function 1 and 2 or [PBKDF2](https://en.wikipedia.org/wiki/PBKDF2) for short.\r\n\r\n>Wiki: PBKDF2 applies a pseudorandom function, such as hash-based message authentication code (HMAC), to the input password or passphrase along with a salt value and repeats the process many times to produce a derived key, which can then be used as a cryptographic key in subsequent operations.\r\n\r\nIn short, the SALT is repeated many times to create a key.\r\n\r\n## The Fix\r\n\r\nWe have a lot of passwords, but we don\'t want to recall all them. On top of that each should be unique. In comes the advent of Password Managers a.k.a. vaults.\r\n\r\nThe majority of vaults encrypt passwords along with other information such as Credit Cards, addresses, and so on. Some even generate strong passwords for you to use and recalls them so you don\u2019t have to remember what they were. Assuming you are on the same device or have linked your device to the vault.\r\n\r\n\u201CBut this still doesn\u2019t tell me what app to use!?!\u201D _I hear you mom_\r\n\r\nThere is a lot to choose from, but these are the ones used the most.\r\n\r\nTruth is if you\'ve been using Google Chrome for any period of time you\'re most likely already using one. Google Password Manager is a website password manage. This feature is baked into the Google Chrome web browser. Includes generated unique, secure passwords for each website you visit as well as. check if any of the passwords you\u2019re using online have been compromised in a data security breach. \r\n\r\nLastPass is a cloud-based manager. Allowing you to access your passwords regardless of the device you\u2019re on.\r\n\r\nKeePass is a locally stored manager. Meaning you need the device you\'re on to log into the account.\r\n\r\nSome apps has the ability refence Google, Facebook, Twitter, etc accounts. To help reduce the total number passwords. \r\n\r\n## Suggestion\r\n\r\nRecall the comic strip in the beginning? \r\n\r\nThis one:\r\n<a href="https://xkcd.com/936/?fbclid=IwAR1dBAc767rK5ni47plmh50MfOJ0f0pnzvUsua_UiZ7mpmBHuwnF_dbzr_U">\r\n  <div align="center">\r\n    ![img](https://imgs.xkcd.com/comics/password_strength.png)\r\n  </div>\r\n</a>\r\n\r\nIt memes on the idea that `Tr0ub4dor&3` is far harder to recall than `correcthorsebatterystaple`. This is true!\r\n\r\n `1MillionBabyParrots!` is still a viable password, readable, and provides a higher level of security than something like `Tr0ub4dor&3`.\r\n', "html": '<a href="https://xkcd.com/936/?fbclid=IwAR1dBAc767rK5ni47plmh50MfOJ0f0pnzvUsua_UiZ7mpmBHuwnF_dbzr_U"><div align="center"><p><img src="https://imgs.xkcd.com/comics/password_strength.png" alt="img"></p></div></a>\n<h2 id="early-morning">Early Morning\u2026</h2>\n<p>My mom messaged me one morning asking, \u201CWhat is a  Password vault?\u201D</p>\n<h3 id="tldr"><strong>TLDR:</strong></h3>\n<blockquote>\n<p>A Password vault is a collection of passwords that you can use to log into a website. <br /> But you came here for something a bit more\u2026 complicated.</p>\n</blockquote>\n<h3 id="long-version"><strong>Long version:</strong></h3>\n<p>To start off we first need to break down what a password is. According to Webster:</p>\n<pre is:raw class="astro-code" style="background-color: #0d1117; overflow-x: auto;"><code><span class="line"><span style="color: #C9D1D9">Definition of password</span></span>\n<span class="line"></span>\n<span class="line"><span style="color: #C9D1D9">1: something that enables one to pass or gain admission:</span></span>\n<span class="line"><span style="color: #C9D1D9">such as a spoken word or phrase required to pass by a guard </span></span></code></pre>\n<p>Passwords are these things we\u2019re all plagued with within this new age of tech. Having to remember every unique password can be a pain. Yet, using one of them for all your accounts isn\u2019t recommended. What\u2019s the fix?</p>\n<p>We know currently, that passwords aren\u2019t supposed to be simple. Oh, and they should contain numbers, symbols, and letters. <code is:raw>but why?</code> I hear you say. Hold on, let\u2019s rewind a bit. Like everything, there\u2019s a history to it, right? Well, passwords, don\u2019t have a definitive date. Some speculate it was MIT  when they created the first time-sharing system.</p>\n<h2 id="story-time">Story time</h2>\n<p>Emerging onto the stage a wizard performing magic goes by the name of Robert Morris. To set the stage there is a realm called Unix, an operating system that was first developed in the 1960s. Morris conjured a process known as <code is:raw>Hashing</code>. Not the same thing used for getting stoned; although they may have been at the time. His son later created the <a href="https://wikipedia.org/wiki/Morris_worm">Morris Worm</a> on November 2, 1988, with the hashing concept. This infected large groups of systems. Its intended use was to see the size of the internet by exploiting loopholes in the codebase of machines. Doesn\u2019t sound like a bad idea, but it didn\u2019t work quite as expected\u2026 leading to the first felony conviction of its kind.</p>\n<p>Skipping a few years we get to the serious concerns for Password\u2026 theft. Such as Email accounts, MSN messengers, Geocities, Myspace, Blogger, Xanga, AIM, Yahoo, Hotmail, AOL\u2026 Remembers these? These all came with the advent of the internet created by Al Gore\u2026 Whoa\u2026 <em>looks at script</em>, wait one sec checking sources. Never mind, he horribly misquoted. Sources believe XEROX stumbled upon the concept of the internet without knowing what size it would become. So we have the internet and passwords are being encrypted by hashes\u2026</p>\n<h2 id="hashing">Hashing</h2>\n<p>What even are hashes? Don\u2019t freak out\u2026Breath. You\u2019re about to see a long string of letters and numbers. This is intentional! You don\u2019t have to memorize this or even read it. Just know it\u2019s a random string of characters.</p>\n<blockquote>\n<p>Word 1: <br />\r\nhash(\u201Chello\u201D) = 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824</p>\n</blockquote>\n<blockquote>\n<p>Word 2: <br />\r\nhash(\u201Chbllo\u201D) = 58756879c05c68dfac9866712fad6a93f8146f337a69afe7dd238f3364946366</p>\n</blockquote>\n<p>You probably went \u201Cwait\u2026 if someone else uses the same password then they have the encryption code too.\u201D CORRECT! They were until companies banded together and started a process called <code is:raw>SALT</code>. By adding a header (like multiplying it or double encrypting it) to the password it varies the hash like so:</p>\n<blockquote>\n<p>Remember this?\r\nhash(\u201Chello\u201D) = 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824</p>\n</blockquote>\n<p>Let\u2019s sprinkle it with SALT. The SALT is a random string of letters and numbers added to the word</p>\n<blockquote>\n<p>Hash example 1:\r\nhash(\u201Chello\u201D + \u201CQxLUF1bgIAdeQX\u201D) = 9e209040c863f84a31e719795b2577523954739fe5ed3b58a75cff2127075ed1</p>\n</blockquote>\n<br />\n<blockquote>\n<p>Hash example 2:\r\n(\u201Chello\u201D + \u201Cbv5PehSMfV11Cd\u201D) = d1d3ec2e6f20fd420d50e2642992841d8338a314b8ea157c9e18477aaef226ab</p>\n</blockquote>\n<p>This prevented hackers from using banks of passwords like <a href="https://en.wikipedia.org/wiki/Dictionary_attack">dictionary attacks</a>, which use lookup tables\u2026 <em>Those perverts</em>!</p>\n<p>There have since been many other alternatives to the hashing system. For example: Password-Based Key Derivation Function 1 and 2 or <a href="https://en.wikipedia.org/wiki/PBKDF2">PBKDF2</a> for short.</p>\n<blockquote>\n<p>Wiki: PBKDF2 applies a pseudorandom function, such as hash-based message authentication code (HMAC), to the input password or passphrase along with a salt value and repeats the process many times to produce a derived key, which can then be used as a cryptographic key in subsequent operations.</p>\n</blockquote>\n<p>In short, the SALT is repeated many times to create a key.</p>\n<h2 id="the-fix">The Fix</h2>\n<p>We have a lot of passwords, but we don\u2019t want to recall all them. On top of that each should be unique. In comes the advent of Password Managers a.k.a. vaults.</p>\n<p>The majority of vaults encrypt passwords along with other information such as Credit Cards, addresses, and so on. Some even generate strong passwords for you to use and recalls them so you don\u2019t have to remember what they were. Assuming you are on the same device or have linked your device to the vault.</p>\n<p>\u201CBut this still doesn\u2019t tell me what app to use!?!\u201D <em>I hear you mom</em></p>\n<p>There is a lot to choose from, but these are the ones used the most.</p>\n<p>Truth is if you\u2019ve been using Google Chrome for any period of time you\u2019re most likely already using one. Google Password Manager is a website password manage. This feature is baked into the Google Chrome web browser. Includes generated unique, secure passwords for each website you visit as well as. check if any of the passwords you\u2019re using online have been compromised in a data security breach.</p>\n<p>LastPass is a cloud-based manager. Allowing you to access your passwords regardless of the device you\u2019re on.</p>\n<p>KeePass is a locally stored manager. Meaning you need the device you\u2019re on to log into the account.</p>\n<p>Some apps has the ability refence Google, Facebook, Twitter, etc accounts. To help reduce the total number passwords.</p>\n<h2 id="suggestion">Suggestion</h2>\n<p>Recall the comic strip in the beginning?</p>\n<p>This one:</p>\n<a href="https://xkcd.com/936/?fbclid=IwAR1dBAc767rK5ni47plmh50MfOJ0f0pnzvUsua_UiZ7mpmBHuwnF_dbzr_U"><div align="center"><p><img src="https://imgs.xkcd.com/comics/password_strength.png" alt="img"></p></div></a>\n<p>It memes on the idea that <code is:raw>Tr0ub4dor&amp;3</code> is far harder to recall than <code is:raw>correcthorsebatterystaple</code>. This is true!</p>\n<p><code is:raw>1MillionBabyParrots!</code> is still a viable password, readable, and provides a higher level of security than something like <code is:raw>Tr0ub4dor&amp;3</code>.</p>' };
const frontmatter$b = { "title": "Password", "publishDate": "05 JUL 2022", "name": "Mark Spratt", "href": "https://twitter.com/_Hopelezz", "description": "What is a Password vault?", "tags": "passwords, vault, hash, recall", "astro": { "headers": [{ "depth": 2, "slug": "early-morning", "text": "Early Morning\u2026" }, { "depth": 3, "slug": "tldr", "text": "TLDR:" }, { "depth": 3, "slug": "long-version", "text": "Long version:" }, { "depth": 2, "slug": "story-time", "text": "Story time" }, { "depth": 2, "slug": "hashing", "text": "Hashing" }, { "depth": 2, "slug": "the-fix", "text": "The Fix" }, { "depth": 2, "slug": "suggestion", "text": "Suggestion" }], "source": '\r\n<a href="https://xkcd.com/936/?fbclid=IwAR1dBAc767rK5ni47plmh50MfOJ0f0pnzvUsua_UiZ7mpmBHuwnF_dbzr_U">\r\n  <div align="center">\r\n    ![img](https://imgs.xkcd.com/comics/password_strength.png)\r\n  </div>\r\n</a>\r\n\r\n## Early Morning...\r\n\r\nMy mom messaged me one morning asking, "What is a  Password vault?"\r\n\r\n### **TLDR:**\r\n\r\n>A Password vault is a collection of passwords that you can use to log into a website. <br/> But you came here for something a bit more... complicated.\r\n\r\n### **Long version:**\r\n\r\nTo start off we first need to break down what a password is. According to Webster:\r\n\r\n```markdown\r\nDefinition of password\r\n\r\n1: something that enables one to pass or gain admission:\r\nsuch as a spoken word or phrase required to pass by a guard \r\n```\r\n\r\nPasswords are these things we\u2019re all plagued with within this new age of tech. Having to remember every unique password can be a pain. Yet, using one of them for all your accounts isn\u2019t recommended. What\'s the fix?\r\n\r\nWe know currently, that passwords aren\'t supposed to be simple. Oh, and they should contain numbers, symbols, and letters. `but why?` I hear you say. Hold on, let\'s rewind a bit. Like everything, there\u2019s a history to it, right? Well, passwords, don\'t have a definitive date. Some speculate it was MIT  when they created the first time-sharing system.\r\n\r\n## Story time\r\n\r\nEmerging onto the stage a wizard performing magic goes by the name of Robert Morris. To set the stage there is a realm called Unix, an operating system that was first developed in the 1960s. Morris conjured a process known as `Hashing`. Not the same thing used for getting stoned; although they may have been at the time. His son later created the [Morris Worm](https://wikipedia.org/wiki/Morris_worm) on November 2, 1988, with the hashing concept. This infected large groups of systems. Its intended use was to see the size of the internet by exploiting loopholes in the codebase of machines. Doesn\'t sound like a bad idea, but it didn\u2019t work quite as expected... leading to the first felony conviction of its kind.\r\n\r\nSkipping a few years we get to the serious concerns for Password... theft. Such as Email accounts, MSN messengers, Geocities, Myspace, Blogger, Xanga, AIM, Yahoo, Hotmail, AOL... Remembers these? These all came with the advent of the internet created by Al Gore... Whoa... _looks at script_, wait one sec checking sources. Never mind, he horribly misquoted. Sources believe XEROX stumbled upon the concept of the internet without knowing what size it would become. So we have the internet and passwords are being encrypted by hashes...\r\n\r\n## Hashing\r\n\r\nWhat even are hashes? Don\'t freak out...Breath. You\'re about to see a long string of letters and numbers. This is intentional! You don\'t have to memorize this or even read it. Just know it\'s a random string of characters.\r\n\r\n>Word 1: <br/>\r\n>hash("hello") = 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824\r\n\r\n>Word 2: <br/>\r\n>hash("hbllo") = 58756879c05c68dfac9866712fad6a93f8146f337a69afe7dd238f3364946366\r\n\r\nYou probably went "wait\u2026 if someone else uses the same password then they have the encryption code too." CORRECT! They were until companies banded together and started a process called `SALT`. By adding a header (like multiplying it or double encrypting it) to the password it varies the hash like so:\r\n\r\n>Remember this?\r\n>hash("hello") = 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824\r\n\r\nLet\'s sprinkle it with SALT. The SALT is a random string of letters and numbers added to the word\r\n\r\n>Hash example 1:\r\n>hash("hello" + "QxLUF1bgIAdeQX") = 9e209040c863f84a31e719795b2577523954739fe5ed3b58a75cff2127075ed1\r\n<br/>\r\n>Hash example 2:\r\n>("hello" + "bv5PehSMfV11Cd") = d1d3ec2e6f20fd420d50e2642992841d8338a314b8ea157c9e18477aaef226ab\r\n\r\nThis prevented hackers from using banks of passwords like [dictionary attacks](https://en.wikipedia.org/wiki/Dictionary_attack), which use lookup tables... _Those perverts_!\r\n\r\nThere have since been many other alternatives to the hashing system. For example: Password-Based Key Derivation Function 1 and 2 or [PBKDF2](https://en.wikipedia.org/wiki/PBKDF2) for short.\r\n\r\n>Wiki: PBKDF2 applies a pseudorandom function, such as hash-based message authentication code (HMAC), to the input password or passphrase along with a salt value and repeats the process many times to produce a derived key, which can then be used as a cryptographic key in subsequent operations.\r\n\r\nIn short, the SALT is repeated many times to create a key.\r\n\r\n## The Fix\r\n\r\nWe have a lot of passwords, but we don\'t want to recall all them. On top of that each should be unique. In comes the advent of Password Managers a.k.a. vaults.\r\n\r\nThe majority of vaults encrypt passwords along with other information such as Credit Cards, addresses, and so on. Some even generate strong passwords for you to use and recalls them so you don\u2019t have to remember what they were. Assuming you are on the same device or have linked your device to the vault.\r\n\r\n\u201CBut this still doesn\u2019t tell me what app to use!?!\u201D _I hear you mom_\r\n\r\nThere is a lot to choose from, but these are the ones used the most.\r\n\r\nTruth is if you\'ve been using Google Chrome for any period of time you\'re most likely already using one. Google Password Manager is a website password manage. This feature is baked into the Google Chrome web browser. Includes generated unique, secure passwords for each website you visit as well as. check if any of the passwords you\u2019re using online have been compromised in a data security breach. \r\n\r\nLastPass is a cloud-based manager. Allowing you to access your passwords regardless of the device you\u2019re on.\r\n\r\nKeePass is a locally stored manager. Meaning you need the device you\'re on to log into the account.\r\n\r\nSome apps has the ability refence Google, Facebook, Twitter, etc accounts. To help reduce the total number passwords. \r\n\r\n## Suggestion\r\n\r\nRecall the comic strip in the beginning? \r\n\r\nThis one:\r\n<a href="https://xkcd.com/936/?fbclid=IwAR1dBAc767rK5ni47plmh50MfOJ0f0pnzvUsua_UiZ7mpmBHuwnF_dbzr_U">\r\n  <div align="center">\r\n    ![img](https://imgs.xkcd.com/comics/password_strength.png)\r\n  </div>\r\n</a>\r\n\r\nIt memes on the idea that `Tr0ub4dor&3` is far harder to recall than `correcthorsebatterystaple`. This is true!\r\n\r\n `1MillionBabyParrots!` is still a viable password, readable, and provides a higher level of security than something like `Tr0ub4dor&3`.\r\n', "html": '<a href="https://xkcd.com/936/?fbclid=IwAR1dBAc767rK5ni47plmh50MfOJ0f0pnzvUsua_UiZ7mpmBHuwnF_dbzr_U"><div align="center"><p><img src="https://imgs.xkcd.com/comics/password_strength.png" alt="img"></p></div></a>\n<h2 id="early-morning">Early Morning\u2026</h2>\n<p>My mom messaged me one morning asking, \u201CWhat is a  Password vault?\u201D</p>\n<h3 id="tldr"><strong>TLDR:</strong></h3>\n<blockquote>\n<p>A Password vault is a collection of passwords that you can use to log into a website. <br /> But you came here for something a bit more\u2026 complicated.</p>\n</blockquote>\n<h3 id="long-version"><strong>Long version:</strong></h3>\n<p>To start off we first need to break down what a password is. According to Webster:</p>\n<pre is:raw class="astro-code" style="background-color: #0d1117; overflow-x: auto;"><code><span class="line"><span style="color: #C9D1D9">Definition of password</span></span>\n<span class="line"></span>\n<span class="line"><span style="color: #C9D1D9">1: something that enables one to pass or gain admission:</span></span>\n<span class="line"><span style="color: #C9D1D9">such as a spoken word or phrase required to pass by a guard </span></span></code></pre>\n<p>Passwords are these things we\u2019re all plagued with within this new age of tech. Having to remember every unique password can be a pain. Yet, using one of them for all your accounts isn\u2019t recommended. What\u2019s the fix?</p>\n<p>We know currently, that passwords aren\u2019t supposed to be simple. Oh, and they should contain numbers, symbols, and letters. <code is:raw>but why?</code> I hear you say. Hold on, let\u2019s rewind a bit. Like everything, there\u2019s a history to it, right? Well, passwords, don\u2019t have a definitive date. Some speculate it was MIT  when they created the first time-sharing system.</p>\n<h2 id="story-time">Story time</h2>\n<p>Emerging onto the stage a wizard performing magic goes by the name of Robert Morris. To set the stage there is a realm called Unix, an operating system that was first developed in the 1960s. Morris conjured a process known as <code is:raw>Hashing</code>. Not the same thing used for getting stoned; although they may have been at the time. His son later created the <a href="https://wikipedia.org/wiki/Morris_worm">Morris Worm</a> on November 2, 1988, with the hashing concept. This infected large groups of systems. Its intended use was to see the size of the internet by exploiting loopholes in the codebase of machines. Doesn\u2019t sound like a bad idea, but it didn\u2019t work quite as expected\u2026 leading to the first felony conviction of its kind.</p>\n<p>Skipping a few years we get to the serious concerns for Password\u2026 theft. Such as Email accounts, MSN messengers, Geocities, Myspace, Blogger, Xanga, AIM, Yahoo, Hotmail, AOL\u2026 Remembers these? These all came with the advent of the internet created by Al Gore\u2026 Whoa\u2026 <em>looks at script</em>, wait one sec checking sources. Never mind, he horribly misquoted. Sources believe XEROX stumbled upon the concept of the internet without knowing what size it would become. So we have the internet and passwords are being encrypted by hashes\u2026</p>\n<h2 id="hashing">Hashing</h2>\n<p>What even are hashes? Don\u2019t freak out\u2026Breath. You\u2019re about to see a long string of letters and numbers. This is intentional! You don\u2019t have to memorize this or even read it. Just know it\u2019s a random string of characters.</p>\n<blockquote>\n<p>Word 1: <br />\r\nhash(\u201Chello\u201D) = 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824</p>\n</blockquote>\n<blockquote>\n<p>Word 2: <br />\r\nhash(\u201Chbllo\u201D) = 58756879c05c68dfac9866712fad6a93f8146f337a69afe7dd238f3364946366</p>\n</blockquote>\n<p>You probably went \u201Cwait\u2026 if someone else uses the same password then they have the encryption code too.\u201D CORRECT! They were until companies banded together and started a process called <code is:raw>SALT</code>. By adding a header (like multiplying it or double encrypting it) to the password it varies the hash like so:</p>\n<blockquote>\n<p>Remember this?\r\nhash(\u201Chello\u201D) = 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824</p>\n</blockquote>\n<p>Let\u2019s sprinkle it with SALT. The SALT is a random string of letters and numbers added to the word</p>\n<blockquote>\n<p>Hash example 1:\r\nhash(\u201Chello\u201D + \u201CQxLUF1bgIAdeQX\u201D) = 9e209040c863f84a31e719795b2577523954739fe5ed3b58a75cff2127075ed1</p>\n</blockquote>\n<br />\n<blockquote>\n<p>Hash example 2:\r\n(\u201Chello\u201D + \u201Cbv5PehSMfV11Cd\u201D) = d1d3ec2e6f20fd420d50e2642992841d8338a314b8ea157c9e18477aaef226ab</p>\n</blockquote>\n<p>This prevented hackers from using banks of passwords like <a href="https://en.wikipedia.org/wiki/Dictionary_attack">dictionary attacks</a>, which use lookup tables\u2026 <em>Those perverts</em>!</p>\n<p>There have since been many other alternatives to the hashing system. For example: Password-Based Key Derivation Function 1 and 2 or <a href="https://en.wikipedia.org/wiki/PBKDF2">PBKDF2</a> for short.</p>\n<blockquote>\n<p>Wiki: PBKDF2 applies a pseudorandom function, such as hash-based message authentication code (HMAC), to the input password or passphrase along with a salt value and repeats the process many times to produce a derived key, which can then be used as a cryptographic key in subsequent operations.</p>\n</blockquote>\n<p>In short, the SALT is repeated many times to create a key.</p>\n<h2 id="the-fix">The Fix</h2>\n<p>We have a lot of passwords, but we don\u2019t want to recall all them. On top of that each should be unique. In comes the advent of Password Managers a.k.a. vaults.</p>\n<p>The majority of vaults encrypt passwords along with other information such as Credit Cards, addresses, and so on. Some even generate strong passwords for you to use and recalls them so you don\u2019t have to remember what they were. Assuming you are on the same device or have linked your device to the vault.</p>\n<p>\u201CBut this still doesn\u2019t tell me what app to use!?!\u201D <em>I hear you mom</em></p>\n<p>There is a lot to choose from, but these are the ones used the most.</p>\n<p>Truth is if you\u2019ve been using Google Chrome for any period of time you\u2019re most likely already using one. Google Password Manager is a website password manage. This feature is baked into the Google Chrome web browser. Includes generated unique, secure passwords for each website you visit as well as. check if any of the passwords you\u2019re using online have been compromised in a data security breach.</p>\n<p>LastPass is a cloud-based manager. Allowing you to access your passwords regardless of the device you\u2019re on.</p>\n<p>KeePass is a locally stored manager. Meaning you need the device you\u2019re on to log into the account.</p>\n<p>Some apps has the ability refence Google, Facebook, Twitter, etc accounts. To help reduce the total number passwords.</p>\n<h2 id="suggestion">Suggestion</h2>\n<p>Recall the comic strip in the beginning?</p>\n<p>This one:</p>\n<a href="https://xkcd.com/936/?fbclid=IwAR1dBAc767rK5ni47plmh50MfOJ0f0pnzvUsua_UiZ7mpmBHuwnF_dbzr_U"><div align="center"><p><img src="https://imgs.xkcd.com/comics/password_strength.png" alt="img"></p></div></a>\n<p>It memes on the idea that <code is:raw>Tr0ub4dor&amp;3</code> is far harder to recall than <code is:raw>correcthorsebatterystaple</code>. This is true!</p>\n<p><code is:raw>1MillionBabyParrots!</code> is still a viable password, readable, and provides a higher level of security than something like <code is:raw>Tr0ub4dor&amp;3</code>.</p>' } };
function rawContent$b() {
  return '\r\n<a href="https://xkcd.com/936/?fbclid=IwAR1dBAc767rK5ni47plmh50MfOJ0f0pnzvUsua_UiZ7mpmBHuwnF_dbzr_U">\r\n  <div align="center">\r\n    ![img](https://imgs.xkcd.com/comics/password_strength.png)\r\n  </div>\r\n</a>\r\n\r\n## Early Morning...\r\n\r\nMy mom messaged me one morning asking, "What is a  Password vault?"\r\n\r\n### **TLDR:**\r\n\r\n>A Password vault is a collection of passwords that you can use to log into a website. <br/> But you came here for something a bit more... complicated.\r\n\r\n### **Long version:**\r\n\r\nTo start off we first need to break down what a password is. According to Webster:\r\n\r\n```markdown\r\nDefinition of password\r\n\r\n1: something that enables one to pass or gain admission:\r\nsuch as a spoken word or phrase required to pass by a guard \r\n```\r\n\r\nPasswords are these things we\u2019re all plagued with within this new age of tech. Having to remember every unique password can be a pain. Yet, using one of them for all your accounts isn\u2019t recommended. What\'s the fix?\r\n\r\nWe know currently, that passwords aren\'t supposed to be simple. Oh, and they should contain numbers, symbols, and letters. `but why?` I hear you say. Hold on, let\'s rewind a bit. Like everything, there\u2019s a history to it, right? Well, passwords, don\'t have a definitive date. Some speculate it was MIT  when they created the first time-sharing system.\r\n\r\n## Story time\r\n\r\nEmerging onto the stage a wizard performing magic goes by the name of Robert Morris. To set the stage there is a realm called Unix, an operating system that was first developed in the 1960s. Morris conjured a process known as `Hashing`. Not the same thing used for getting stoned; although they may have been at the time. His son later created the [Morris Worm](https://wikipedia.org/wiki/Morris_worm) on November 2, 1988, with the hashing concept. This infected large groups of systems. Its intended use was to see the size of the internet by exploiting loopholes in the codebase of machines. Doesn\'t sound like a bad idea, but it didn\u2019t work quite as expected... leading to the first felony conviction of its kind.\r\n\r\nSkipping a few years we get to the serious concerns for Password... theft. Such as Email accounts, MSN messengers, Geocities, Myspace, Blogger, Xanga, AIM, Yahoo, Hotmail, AOL... Remembers these? These all came with the advent of the internet created by Al Gore... Whoa... _looks at script_, wait one sec checking sources. Never mind, he horribly misquoted. Sources believe XEROX stumbled upon the concept of the internet without knowing what size it would become. So we have the internet and passwords are being encrypted by hashes...\r\n\r\n## Hashing\r\n\r\nWhat even are hashes? Don\'t freak out...Breath. You\'re about to see a long string of letters and numbers. This is intentional! You don\'t have to memorize this or even read it. Just know it\'s a random string of characters.\r\n\r\n>Word 1: <br/>\r\n>hash("hello") = 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824\r\n\r\n>Word 2: <br/>\r\n>hash("hbllo") = 58756879c05c68dfac9866712fad6a93f8146f337a69afe7dd238f3364946366\r\n\r\nYou probably went "wait\u2026 if someone else uses the same password then they have the encryption code too." CORRECT! They were until companies banded together and started a process called `SALT`. By adding a header (like multiplying it or double encrypting it) to the password it varies the hash like so:\r\n\r\n>Remember this?\r\n>hash("hello") = 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824\r\n\r\nLet\'s sprinkle it with SALT. The SALT is a random string of letters and numbers added to the word\r\n\r\n>Hash example 1:\r\n>hash("hello" + "QxLUF1bgIAdeQX") = 9e209040c863f84a31e719795b2577523954739fe5ed3b58a75cff2127075ed1\r\n<br/>\r\n>Hash example 2:\r\n>("hello" + "bv5PehSMfV11Cd") = d1d3ec2e6f20fd420d50e2642992841d8338a314b8ea157c9e18477aaef226ab\r\n\r\nThis prevented hackers from using banks of passwords like [dictionary attacks](https://en.wikipedia.org/wiki/Dictionary_attack), which use lookup tables... _Those perverts_!\r\n\r\nThere have since been many other alternatives to the hashing system. For example: Password-Based Key Derivation Function 1 and 2 or [PBKDF2](https://en.wikipedia.org/wiki/PBKDF2) for short.\r\n\r\n>Wiki: PBKDF2 applies a pseudorandom function, such as hash-based message authentication code (HMAC), to the input password or passphrase along with a salt value and repeats the process many times to produce a derived key, which can then be used as a cryptographic key in subsequent operations.\r\n\r\nIn short, the SALT is repeated many times to create a key.\r\n\r\n## The Fix\r\n\r\nWe have a lot of passwords, but we don\'t want to recall all them. On top of that each should be unique. In comes the advent of Password Managers a.k.a. vaults.\r\n\r\nThe majority of vaults encrypt passwords along with other information such as Credit Cards, addresses, and so on. Some even generate strong passwords for you to use and recalls them so you don\u2019t have to remember what they were. Assuming you are on the same device or have linked your device to the vault.\r\n\r\n\u201CBut this still doesn\u2019t tell me what app to use!?!\u201D _I hear you mom_\r\n\r\nThere is a lot to choose from, but these are the ones used the most.\r\n\r\nTruth is if you\'ve been using Google Chrome for any period of time you\'re most likely already using one. Google Password Manager is a website password manage. This feature is baked into the Google Chrome web browser. Includes generated unique, secure passwords for each website you visit as well as. check if any of the passwords you\u2019re using online have been compromised in a data security breach. \r\n\r\nLastPass is a cloud-based manager. Allowing you to access your passwords regardless of the device you\u2019re on.\r\n\r\nKeePass is a locally stored manager. Meaning you need the device you\'re on to log into the account.\r\n\r\nSome apps has the ability refence Google, Facebook, Twitter, etc accounts. To help reduce the total number passwords. \r\n\r\n## Suggestion\r\n\r\nRecall the comic strip in the beginning? \r\n\r\nThis one:\r\n<a href="https://xkcd.com/936/?fbclid=IwAR1dBAc767rK5ni47plmh50MfOJ0f0pnzvUsua_UiZ7mpmBHuwnF_dbzr_U">\r\n  <div align="center">\r\n    ![img](https://imgs.xkcd.com/comics/password_strength.png)\r\n  </div>\r\n</a>\r\n\r\nIt memes on the idea that `Tr0ub4dor&3` is far harder to recall than `correcthorsebatterystaple`. This is true!\r\n\r\n `1MillionBabyParrots!` is still a viable password, readable, and provides a higher level of security than something like `Tr0ub4dor&3`.\r\n';
}
function compiledContent$b() {
  return '<a href="https://xkcd.com/936/?fbclid=IwAR1dBAc767rK5ni47plmh50MfOJ0f0pnzvUsua_UiZ7mpmBHuwnF_dbzr_U"><div align="center"><p><img src="https://imgs.xkcd.com/comics/password_strength.png" alt="img"></p></div></a>\n<h2 id="early-morning">Early Morning\u2026</h2>\n<p>My mom messaged me one morning asking, \u201CWhat is a  Password vault?\u201D</p>\n<h3 id="tldr"><strong>TLDR:</strong></h3>\n<blockquote>\n<p>A Password vault is a collection of passwords that you can use to log into a website. <br /> But you came here for something a bit more\u2026 complicated.</p>\n</blockquote>\n<h3 id="long-version"><strong>Long version:</strong></h3>\n<p>To start off we first need to break down what a password is. According to Webster:</p>\n<pre is:raw class="astro-code" style="background-color: #0d1117; overflow-x: auto;"><code><span class="line"><span style="color: #C9D1D9">Definition of password</span></span>\n<span class="line"></span>\n<span class="line"><span style="color: #C9D1D9">1: something that enables one to pass or gain admission:</span></span>\n<span class="line"><span style="color: #C9D1D9">such as a spoken word or phrase required to pass by a guard </span></span></code></pre>\n<p>Passwords are these things we\u2019re all plagued with within this new age of tech. Having to remember every unique password can be a pain. Yet, using one of them for all your accounts isn\u2019t recommended. What\u2019s the fix?</p>\n<p>We know currently, that passwords aren\u2019t supposed to be simple. Oh, and they should contain numbers, symbols, and letters. <code is:raw>but why?</code> I hear you say. Hold on, let\u2019s rewind a bit. Like everything, there\u2019s a history to it, right? Well, passwords, don\u2019t have a definitive date. Some speculate it was MIT  when they created the first time-sharing system.</p>\n<h2 id="story-time">Story time</h2>\n<p>Emerging onto the stage a wizard performing magic goes by the name of Robert Morris. To set the stage there is a realm called Unix, an operating system that was first developed in the 1960s. Morris conjured a process known as <code is:raw>Hashing</code>. Not the same thing used for getting stoned; although they may have been at the time. His son later created the <a href="https://wikipedia.org/wiki/Morris_worm">Morris Worm</a> on November 2, 1988, with the hashing concept. This infected large groups of systems. Its intended use was to see the size of the internet by exploiting loopholes in the codebase of machines. Doesn\u2019t sound like a bad idea, but it didn\u2019t work quite as expected\u2026 leading to the first felony conviction of its kind.</p>\n<p>Skipping a few years we get to the serious concerns for Password\u2026 theft. Such as Email accounts, MSN messengers, Geocities, Myspace, Blogger, Xanga, AIM, Yahoo, Hotmail, AOL\u2026 Remembers these? These all came with the advent of the internet created by Al Gore\u2026 Whoa\u2026 <em>looks at script</em>, wait one sec checking sources. Never mind, he horribly misquoted. Sources believe XEROX stumbled upon the concept of the internet without knowing what size it would become. So we have the internet and passwords are being encrypted by hashes\u2026</p>\n<h2 id="hashing">Hashing</h2>\n<p>What even are hashes? Don\u2019t freak out\u2026Breath. You\u2019re about to see a long string of letters and numbers. This is intentional! You don\u2019t have to memorize this or even read it. Just know it\u2019s a random string of characters.</p>\n<blockquote>\n<p>Word 1: <br />\r\nhash(\u201Chello\u201D) = 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824</p>\n</blockquote>\n<blockquote>\n<p>Word 2: <br />\r\nhash(\u201Chbllo\u201D) = 58756879c05c68dfac9866712fad6a93f8146f337a69afe7dd238f3364946366</p>\n</blockquote>\n<p>You probably went \u201Cwait\u2026 if someone else uses the same password then they have the encryption code too.\u201D CORRECT! They were until companies banded together and started a process called <code is:raw>SALT</code>. By adding a header (like multiplying it or double encrypting it) to the password it varies the hash like so:</p>\n<blockquote>\n<p>Remember this?\r\nhash(\u201Chello\u201D) = 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824</p>\n</blockquote>\n<p>Let\u2019s sprinkle it with SALT. The SALT is a random string of letters and numbers added to the word</p>\n<blockquote>\n<p>Hash example 1:\r\nhash(\u201Chello\u201D + \u201CQxLUF1bgIAdeQX\u201D) = 9e209040c863f84a31e719795b2577523954739fe5ed3b58a75cff2127075ed1</p>\n</blockquote>\n<br />\n<blockquote>\n<p>Hash example 2:\r\n(\u201Chello\u201D + \u201Cbv5PehSMfV11Cd\u201D) = d1d3ec2e6f20fd420d50e2642992841d8338a314b8ea157c9e18477aaef226ab</p>\n</blockquote>\n<p>This prevented hackers from using banks of passwords like <a href="https://en.wikipedia.org/wiki/Dictionary_attack">dictionary attacks</a>, which use lookup tables\u2026 <em>Those perverts</em>!</p>\n<p>There have since been many other alternatives to the hashing system. For example: Password-Based Key Derivation Function 1 and 2 or <a href="https://en.wikipedia.org/wiki/PBKDF2">PBKDF2</a> for short.</p>\n<blockquote>\n<p>Wiki: PBKDF2 applies a pseudorandom function, such as hash-based message authentication code (HMAC), to the input password or passphrase along with a salt value and repeats the process many times to produce a derived key, which can then be used as a cryptographic key in subsequent operations.</p>\n</blockquote>\n<p>In short, the SALT is repeated many times to create a key.</p>\n<h2 id="the-fix">The Fix</h2>\n<p>We have a lot of passwords, but we don\u2019t want to recall all them. On top of that each should be unique. In comes the advent of Password Managers a.k.a. vaults.</p>\n<p>The majority of vaults encrypt passwords along with other information such as Credit Cards, addresses, and so on. Some even generate strong passwords for you to use and recalls them so you don\u2019t have to remember what they were. Assuming you are on the same device or have linked your device to the vault.</p>\n<p>\u201CBut this still doesn\u2019t tell me what app to use!?!\u201D <em>I hear you mom</em></p>\n<p>There is a lot to choose from, but these are the ones used the most.</p>\n<p>Truth is if you\u2019ve been using Google Chrome for any period of time you\u2019re most likely already using one. Google Password Manager is a website password manage. This feature is baked into the Google Chrome web browser. Includes generated unique, secure passwords for each website you visit as well as. check if any of the passwords you\u2019re using online have been compromised in a data security breach.</p>\n<p>LastPass is a cloud-based manager. Allowing you to access your passwords regardless of the device you\u2019re on.</p>\n<p>KeePass is a locally stored manager. Meaning you need the device you\u2019re on to log into the account.</p>\n<p>Some apps has the ability refence Google, Facebook, Twitter, etc accounts. To help reduce the total number passwords.</p>\n<h2 id="suggestion">Suggestion</h2>\n<p>Recall the comic strip in the beginning?</p>\n<p>This one:</p>\n<a href="https://xkcd.com/936/?fbclid=IwAR1dBAc767rK5ni47plmh50MfOJ0f0pnzvUsua_UiZ7mpmBHuwnF_dbzr_U"><div align="center"><p><img src="https://imgs.xkcd.com/comics/password_strength.png" alt="img"></p></div></a>\n<p>It memes on the idea that <code is:raw>Tr0ub4dor&amp;3</code> is far harder to recall than <code is:raw>correcthorsebatterystaple</code>. This is true!</p>\n<p><code is:raw>1MillionBabyParrots!</code> is still a viable password, readable, and provides a higher level of security than something like <code is:raw>Tr0ub4dor&amp;3</code>.</p>';
}
const $$metadata$d = createMetadata("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/blog/1-password.md", { modules: [{ module: $$module1$2, specifier: "@astrojs/markdown-remark/ssr-utils", assert: {} }, { module: $$module2$1, specifier: "../../layouts/BlogPost.astro", assert: {} }, { module: $$module3$1, specifier: "../../components/Author.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$d = createAstro("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/blog/1-password.md", "http://localhost:3000/", "file:///C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/");
const $$1Password = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$d, $$props, $$slots);
  Astro2.self = $$1Password;
  const $$content = { "title": "Password", "publishDate": "05 JUL 2022", "name": "Mark Spratt", "href": "https://twitter.com/_Hopelezz", "description": "What is a Password vault?", "tags": "passwords, vault, hash, recall", "astro": { "headers": [{ "depth": 2, "slug": "early-morning", "text": "Early Morning\u2026" }, { "depth": 3, "slug": "tldr", "text": "TLDR:" }, { "depth": 3, "slug": "long-version", "text": "Long version:" }, { "depth": 2, "slug": "story-time", "text": "Story time" }, { "depth": 2, "slug": "hashing", "text": "Hashing" }, { "depth": 2, "slug": "the-fix", "text": "The Fix" }, { "depth": 2, "slug": "suggestion", "text": "Suggestion" }], "source": '\r\n<a href="https://xkcd.com/936/?fbclid=IwAR1dBAc767rK5ni47plmh50MfOJ0f0pnzvUsua_UiZ7mpmBHuwnF_dbzr_U">\r\n  <div align="center">\r\n    ![img](https://imgs.xkcd.com/comics/password_strength.png)\r\n  </div>\r\n</a>\r\n\r\n## Early Morning...\r\n\r\nMy mom messaged me one morning asking, "What is a  Password vault?"\r\n\r\n### **TLDR:**\r\n\r\n>A Password vault is a collection of passwords that you can use to log into a website. <br/> But you came here for something a bit more... complicated.\r\n\r\n### **Long version:**\r\n\r\nTo start off we first need to break down what a password is. According to Webster:\r\n\r\n```markdown\r\nDefinition of password\r\n\r\n1: something that enables one to pass or gain admission:\r\nsuch as a spoken word or phrase required to pass by a guard \r\n```\r\n\r\nPasswords are these things we\u2019re all plagued with within this new age of tech. Having to remember every unique password can be a pain. Yet, using one of them for all your accounts isn\u2019t recommended. What\'s the fix?\r\n\r\nWe know currently, that passwords aren\'t supposed to be simple. Oh, and they should contain numbers, symbols, and letters. `but why?` I hear you say. Hold on, let\'s rewind a bit. Like everything, there\u2019s a history to it, right? Well, passwords, don\'t have a definitive date. Some speculate it was MIT  when they created the first time-sharing system.\r\n\r\n## Story time\r\n\r\nEmerging onto the stage a wizard performing magic goes by the name of Robert Morris. To set the stage there is a realm called Unix, an operating system that was first developed in the 1960s. Morris conjured a process known as `Hashing`. Not the same thing used for getting stoned; although they may have been at the time. His son later created the [Morris Worm](https://wikipedia.org/wiki/Morris_worm) on November 2, 1988, with the hashing concept. This infected large groups of systems. Its intended use was to see the size of the internet by exploiting loopholes in the codebase of machines. Doesn\'t sound like a bad idea, but it didn\u2019t work quite as expected... leading to the first felony conviction of its kind.\r\n\r\nSkipping a few years we get to the serious concerns for Password... theft. Such as Email accounts, MSN messengers, Geocities, Myspace, Blogger, Xanga, AIM, Yahoo, Hotmail, AOL... Remembers these? These all came with the advent of the internet created by Al Gore... Whoa... _looks at script_, wait one sec checking sources. Never mind, he horribly misquoted. Sources believe XEROX stumbled upon the concept of the internet without knowing what size it would become. So we have the internet and passwords are being encrypted by hashes...\r\n\r\n## Hashing\r\n\r\nWhat even are hashes? Don\'t freak out...Breath. You\'re about to see a long string of letters and numbers. This is intentional! You don\'t have to memorize this or even read it. Just know it\'s a random string of characters.\r\n\r\n>Word 1: <br/>\r\n>hash("hello") = 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824\r\n\r\n>Word 2: <br/>\r\n>hash("hbllo") = 58756879c05c68dfac9866712fad6a93f8146f337a69afe7dd238f3364946366\r\n\r\nYou probably went "wait\u2026 if someone else uses the same password then they have the encryption code too." CORRECT! They were until companies banded together and started a process called `SALT`. By adding a header (like multiplying it or double encrypting it) to the password it varies the hash like so:\r\n\r\n>Remember this?\r\n>hash("hello") = 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824\r\n\r\nLet\'s sprinkle it with SALT. The SALT is a random string of letters and numbers added to the word\r\n\r\n>Hash example 1:\r\n>hash("hello" + "QxLUF1bgIAdeQX") = 9e209040c863f84a31e719795b2577523954739fe5ed3b58a75cff2127075ed1\r\n<br/>\r\n>Hash example 2:\r\n>("hello" + "bv5PehSMfV11Cd") = d1d3ec2e6f20fd420d50e2642992841d8338a314b8ea157c9e18477aaef226ab\r\n\r\nThis prevented hackers from using banks of passwords like [dictionary attacks](https://en.wikipedia.org/wiki/Dictionary_attack), which use lookup tables... _Those perverts_!\r\n\r\nThere have since been many other alternatives to the hashing system. For example: Password-Based Key Derivation Function 1 and 2 or [PBKDF2](https://en.wikipedia.org/wiki/PBKDF2) for short.\r\n\r\n>Wiki: PBKDF2 applies a pseudorandom function, such as hash-based message authentication code (HMAC), to the input password or passphrase along with a salt value and repeats the process many times to produce a derived key, which can then be used as a cryptographic key in subsequent operations.\r\n\r\nIn short, the SALT is repeated many times to create a key.\r\n\r\n## The Fix\r\n\r\nWe have a lot of passwords, but we don\'t want to recall all them. On top of that each should be unique. In comes the advent of Password Managers a.k.a. vaults.\r\n\r\nThe majority of vaults encrypt passwords along with other information such as Credit Cards, addresses, and so on. Some even generate strong passwords for you to use and recalls them so you don\u2019t have to remember what they were. Assuming you are on the same device or have linked your device to the vault.\r\n\r\n\u201CBut this still doesn\u2019t tell me what app to use!?!\u201D _I hear you mom_\r\n\r\nThere is a lot to choose from, but these are the ones used the most.\r\n\r\nTruth is if you\'ve been using Google Chrome for any period of time you\'re most likely already using one. Google Password Manager is a website password manage. This feature is baked into the Google Chrome web browser. Includes generated unique, secure passwords for each website you visit as well as. check if any of the passwords you\u2019re using online have been compromised in a data security breach. \r\n\r\nLastPass is a cloud-based manager. Allowing you to access your passwords regardless of the device you\u2019re on.\r\n\r\nKeePass is a locally stored manager. Meaning you need the device you\'re on to log into the account.\r\n\r\nSome apps has the ability refence Google, Facebook, Twitter, etc accounts. To help reduce the total number passwords. \r\n\r\n## Suggestion\r\n\r\nRecall the comic strip in the beginning? \r\n\r\nThis one:\r\n<a href="https://xkcd.com/936/?fbclid=IwAR1dBAc767rK5ni47plmh50MfOJ0f0pnzvUsua_UiZ7mpmBHuwnF_dbzr_U">\r\n  <div align="center">\r\n    ![img](https://imgs.xkcd.com/comics/password_strength.png)\r\n  </div>\r\n</a>\r\n\r\nIt memes on the idea that `Tr0ub4dor&3` is far harder to recall than `correcthorsebatterystaple`. This is true!\r\n\r\n `1MillionBabyParrots!` is still a viable password, readable, and provides a higher level of security than something like `Tr0ub4dor&3`.\r\n', "html": '<a href="https://xkcd.com/936/?fbclid=IwAR1dBAc767rK5ni47plmh50MfOJ0f0pnzvUsua_UiZ7mpmBHuwnF_dbzr_U"><div align="center"><p><img src="https://imgs.xkcd.com/comics/password_strength.png" alt="img"></p></div></a>\n<h2 id="early-morning">Early Morning\u2026</h2>\n<p>My mom messaged me one morning asking, \u201CWhat is a  Password vault?\u201D</p>\n<h3 id="tldr"><strong>TLDR:</strong></h3>\n<blockquote>\n<p>A Password vault is a collection of passwords that you can use to log into a website. <br /> But you came here for something a bit more\u2026 complicated.</p>\n</blockquote>\n<h3 id="long-version"><strong>Long version:</strong></h3>\n<p>To start off we first need to break down what a password is. According to Webster:</p>\n<pre is:raw class="astro-code" style="background-color: #0d1117; overflow-x: auto;"><code><span class="line"><span style="color: #C9D1D9">Definition of password</span></span>\n<span class="line"></span>\n<span class="line"><span style="color: #C9D1D9">1: something that enables one to pass or gain admission:</span></span>\n<span class="line"><span style="color: #C9D1D9">such as a spoken word or phrase required to pass by a guard </span></span></code></pre>\n<p>Passwords are these things we\u2019re all plagued with within this new age of tech. Having to remember every unique password can be a pain. Yet, using one of them for all your accounts isn\u2019t recommended. What\u2019s the fix?</p>\n<p>We know currently, that passwords aren\u2019t supposed to be simple. Oh, and they should contain numbers, symbols, and letters. <code is:raw>but why?</code> I hear you say. Hold on, let\u2019s rewind a bit. Like everything, there\u2019s a history to it, right? Well, passwords, don\u2019t have a definitive date. Some speculate it was MIT  when they created the first time-sharing system.</p>\n<h2 id="story-time">Story time</h2>\n<p>Emerging onto the stage a wizard performing magic goes by the name of Robert Morris. To set the stage there is a realm called Unix, an operating system that was first developed in the 1960s. Morris conjured a process known as <code is:raw>Hashing</code>. Not the same thing used for getting stoned; although they may have been at the time. His son later created the <a href="https://wikipedia.org/wiki/Morris_worm">Morris Worm</a> on November 2, 1988, with the hashing concept. This infected large groups of systems. Its intended use was to see the size of the internet by exploiting loopholes in the codebase of machines. Doesn\u2019t sound like a bad idea, but it didn\u2019t work quite as expected\u2026 leading to the first felony conviction of its kind.</p>\n<p>Skipping a few years we get to the serious concerns for Password\u2026 theft. Such as Email accounts, MSN messengers, Geocities, Myspace, Blogger, Xanga, AIM, Yahoo, Hotmail, AOL\u2026 Remembers these? These all came with the advent of the internet created by Al Gore\u2026 Whoa\u2026 <em>looks at script</em>, wait one sec checking sources. Never mind, he horribly misquoted. Sources believe XEROX stumbled upon the concept of the internet without knowing what size it would become. So we have the internet and passwords are being encrypted by hashes\u2026</p>\n<h2 id="hashing">Hashing</h2>\n<p>What even are hashes? Don\u2019t freak out\u2026Breath. You\u2019re about to see a long string of letters and numbers. This is intentional! You don\u2019t have to memorize this or even read it. Just know it\u2019s a random string of characters.</p>\n<blockquote>\n<p>Word 1: <br />\r\nhash(\u201Chello\u201D) = 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824</p>\n</blockquote>\n<blockquote>\n<p>Word 2: <br />\r\nhash(\u201Chbllo\u201D) = 58756879c05c68dfac9866712fad6a93f8146f337a69afe7dd238f3364946366</p>\n</blockquote>\n<p>You probably went \u201Cwait\u2026 if someone else uses the same password then they have the encryption code too.\u201D CORRECT! They were until companies banded together and started a process called <code is:raw>SALT</code>. By adding a header (like multiplying it or double encrypting it) to the password it varies the hash like so:</p>\n<blockquote>\n<p>Remember this?\r\nhash(\u201Chello\u201D) = 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824</p>\n</blockquote>\n<p>Let\u2019s sprinkle it with SALT. The SALT is a random string of letters and numbers added to the word</p>\n<blockquote>\n<p>Hash example 1:\r\nhash(\u201Chello\u201D + \u201CQxLUF1bgIAdeQX\u201D) = 9e209040c863f84a31e719795b2577523954739fe5ed3b58a75cff2127075ed1</p>\n</blockquote>\n<br />\n<blockquote>\n<p>Hash example 2:\r\n(\u201Chello\u201D + \u201Cbv5PehSMfV11Cd\u201D) = d1d3ec2e6f20fd420d50e2642992841d8338a314b8ea157c9e18477aaef226ab</p>\n</blockquote>\n<p>This prevented hackers from using banks of passwords like <a href="https://en.wikipedia.org/wiki/Dictionary_attack">dictionary attacks</a>, which use lookup tables\u2026 <em>Those perverts</em>!</p>\n<p>There have since been many other alternatives to the hashing system. For example: Password-Based Key Derivation Function 1 and 2 or <a href="https://en.wikipedia.org/wiki/PBKDF2">PBKDF2</a> for short.</p>\n<blockquote>\n<p>Wiki: PBKDF2 applies a pseudorandom function, such as hash-based message authentication code (HMAC), to the input password or passphrase along with a salt value and repeats the process many times to produce a derived key, which can then be used as a cryptographic key in subsequent operations.</p>\n</blockquote>\n<p>In short, the SALT is repeated many times to create a key.</p>\n<h2 id="the-fix">The Fix</h2>\n<p>We have a lot of passwords, but we don\u2019t want to recall all them. On top of that each should be unique. In comes the advent of Password Managers a.k.a. vaults.</p>\n<p>The majority of vaults encrypt passwords along with other information such as Credit Cards, addresses, and so on. Some even generate strong passwords for you to use and recalls them so you don\u2019t have to remember what they were. Assuming you are on the same device or have linked your device to the vault.</p>\n<p>\u201CBut this still doesn\u2019t tell me what app to use!?!\u201D <em>I hear you mom</em></p>\n<p>There is a lot to choose from, but these are the ones used the most.</p>\n<p>Truth is if you\u2019ve been using Google Chrome for any period of time you\u2019re most likely already using one. Google Password Manager is a website password manage. This feature is baked into the Google Chrome web browser. Includes generated unique, secure passwords for each website you visit as well as. check if any of the passwords you\u2019re using online have been compromised in a data security breach.</p>\n<p>LastPass is a cloud-based manager. Allowing you to access your passwords regardless of the device you\u2019re on.</p>\n<p>KeePass is a locally stored manager. Meaning you need the device you\u2019re on to log into the account.</p>\n<p>Some apps has the ability refence Google, Facebook, Twitter, etc accounts. To help reduce the total number passwords.</p>\n<h2 id="suggestion">Suggestion</h2>\n<p>Recall the comic strip in the beginning?</p>\n<p>This one:</p>\n<a href="https://xkcd.com/936/?fbclid=IwAR1dBAc767rK5ni47plmh50MfOJ0f0pnzvUsua_UiZ7mpmBHuwnF_dbzr_U"><div align="center"><p><img src="https://imgs.xkcd.com/comics/password_strength.png" alt="img"></p></div></a>\n<p>It memes on the idea that <code is:raw>Tr0ub4dor&amp;3</code> is far harder to recall than <code is:raw>correcthorsebatterystaple</code>. This is true!</p>\n<p><code is:raw>1MillionBabyParrots!</code> is still a viable password, readable, and provides a higher level of security than something like <code is:raw>Tr0ub4dor&amp;3</code>.</p>' } };
  return render`${renderComponent($$result, "Layout", $$BlogPost, { "content": $$content }, { "default": () => render`${maybeRenderHead($$result)}<a href="https://xkcd.com/936/?fbclid=IwAR1dBAc767rK5ni47plmh50MfOJ0f0pnzvUsua_UiZ7mpmBHuwnF_dbzr_U"><div align="center"><p><img src="https://imgs.xkcd.com/comics/password_strength.png" alt="img"></p></div></a><h2 id="early-morning">Early Morning…</h2><p>My mom messaged me one morning asking, “What is a  Password vault?”</p><h3 id="tldr"><strong>TLDR:</strong></h3><blockquote>
<p>A Password vault is a collection of passwords that you can use to log into a website. <br> But you came here for something a bit more… complicated.</p>
</blockquote><h3 id="long-version"><strong>Long version:</strong></h3><p>To start off we first need to break down what a password is. According to Webster:</p><pre class="astro-code" style="background-color: #0d1117; overflow-x: auto;"><code><span class="line"><span style="color: #C9D1D9">Definition of password</span></span>
<span class="line"></span>
<span class="line"><span style="color: #C9D1D9">1: something that enables one to pass or gain admission:</span></span>
<span class="line"><span style="color: #C9D1D9">such as a spoken word or phrase required to pass by a guard </span></span></code></pre><p>Passwords are these things we’re all plagued with within this new age of tech. Having to remember every unique password can be a pain. Yet, using one of them for all your accounts isn’t recommended. What’s the fix?</p><p>We know currently, that passwords aren’t supposed to be simple. Oh, and they should contain numbers, symbols, and letters. <code>but why?</code> I hear you say. Hold on, let’s rewind a bit. Like everything, there’s a history to it, right? Well, passwords, don’t have a definitive date. Some speculate it was MIT  when they created the first time-sharing system.</p><h2 id="story-time">Story time</h2><p>Emerging onto the stage a wizard performing magic goes by the name of Robert Morris. To set the stage there is a realm called Unix, an operating system that was first developed in the 1960s. Morris conjured a process known as <code>Hashing</code>. Not the same thing used for getting stoned; although they may have been at the time. His son later created the <a href="https://wikipedia.org/wiki/Morris_worm">Morris Worm</a> on November 2, 1988, with the hashing concept. This infected large groups of systems. Its intended use was to see the size of the internet by exploiting loopholes in the codebase of machines. Doesn’t sound like a bad idea, but it didn’t work quite as expected… leading to the first felony conviction of its kind.</p><p>Skipping a few years we get to the serious concerns for Password… theft. Such as Email accounts, MSN messengers, Geocities, Myspace, Blogger, Xanga, AIM, Yahoo, Hotmail, AOL… Remembers these? These all came with the advent of the internet created by Al Gore… Whoa… <em>looks at script</em>, wait one sec checking sources. Never mind, he horribly misquoted. Sources believe XEROX stumbled upon the concept of the internet without knowing what size it would become. So we have the internet and passwords are being encrypted by hashes…</p><h2 id="hashing">Hashing</h2><p>What even are hashes? Don’t freak out…Breath. You’re about to see a long string of letters and numbers. This is intentional! You don’t have to memorize this or even read it. Just know it’s a random string of characters.</p><blockquote>
<p>Word 1: <br>
hash(“hello”) = 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824</p>
</blockquote><blockquote>
<p>Word 2: <br>
hash(“hbllo”) = 58756879c05c68dfac9866712fad6a93f8146f337a69afe7dd238f3364946366</p>
</blockquote><p>You probably went “wait… if someone else uses the same password then they have the encryption code too.” CORRECT! They were until companies banded together and started a process called <code>SALT</code>. By adding a header (like multiplying it or double encrypting it) to the password it varies the hash like so:</p><blockquote>
<p>Remember this?
hash(“hello”) = 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824</p>
</blockquote><p>Let’s sprinkle it with SALT. The SALT is a random string of letters and numbers added to the word</p><blockquote>
<p>Hash example 1:
hash(“hello” + “QxLUF1bgIAdeQX”) = 9e209040c863f84a31e719795b2577523954739fe5ed3b58a75cff2127075ed1</p>
</blockquote><br><blockquote>
<p>Hash example 2:
(“hello” + “bv5PehSMfV11Cd”) = d1d3ec2e6f20fd420d50e2642992841d8338a314b8ea157c9e18477aaef226ab</p>
</blockquote><p>This prevented hackers from using banks of passwords like <a href="https://en.wikipedia.org/wiki/Dictionary_attack">dictionary attacks</a>, which use lookup tables… <em>Those perverts</em>!</p><p>There have since been many other alternatives to the hashing system. For example: Password-Based Key Derivation Function 1 and 2 or <a href="https://en.wikipedia.org/wiki/PBKDF2">PBKDF2</a> for short.</p><blockquote>
<p>Wiki: PBKDF2 applies a pseudorandom function, such as hash-based message authentication code (HMAC), to the input password or passphrase along with a salt value and repeats the process many times to produce a derived key, which can then be used as a cryptographic key in subsequent operations.</p>
</blockquote><p>In short, the SALT is repeated many times to create a key.</p><h2 id="the-fix">The Fix</h2><p>We have a lot of passwords, but we don’t want to recall all them. On top of that each should be unique. In comes the advent of Password Managers a.k.a. vaults.</p><p>The majority of vaults encrypt passwords along with other information such as Credit Cards, addresses, and so on. Some even generate strong passwords for you to use and recalls them so you don’t have to remember what they were. Assuming you are on the same device or have linked your device to the vault.</p><p>“But this still doesn’t tell me what app to use!?!” <em>I hear you mom</em></p><p>There is a lot to choose from, but these are the ones used the most.</p><p>Truth is if you’ve been using Google Chrome for any period of time you’re most likely already using one. Google Password Manager is a website password manage. This feature is baked into the Google Chrome web browser. Includes generated unique, secure passwords for each website you visit as well as. check if any of the passwords you’re using online have been compromised in a data security breach.</p><p>LastPass is a cloud-based manager. Allowing you to access your passwords regardless of the device you’re on.</p><p>KeePass is a locally stored manager. Meaning you need the device you’re on to log into the account.</p><p>Some apps has the ability refence Google, Facebook, Twitter, etc accounts. To help reduce the total number passwords.</p><h2 id="suggestion">Suggestion</h2><p>Recall the comic strip in the beginning?</p><p>This one:</p><a href="https://xkcd.com/936/?fbclid=IwAR1dBAc767rK5ni47plmh50MfOJ0f0pnzvUsua_UiZ7mpmBHuwnF_dbzr_U"><div align="center"><p><img src="https://imgs.xkcd.com/comics/password_strength.png" alt="img"></p></div></a><p>It memes on the idea that <code>Tr0ub4dor&amp;3</code> is far harder to recall than <code>correcthorsebatterystaple</code>. This is true!</p><p><code>1MillionBabyParrots!</code> is still a viable password, readable, and provides a higher level of security than something like <code>Tr0ub4dor&amp;3</code>.</p>` })}`;
});

var _page5 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	metadata: metadata$b,
	frontmatter: frontmatter$b,
	rawContent: rawContent$b,
	compiledContent: compiledContent$b,
	$$metadata: $$metadata$d,
	'default': $$1Password
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$c = createMetadata("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/bookShelf/Post.astro", { modules: [{ module: $$module3$1, specifier: "../Author.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$c = createAstro("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/bookShelf/Post.astro", "http://localhost:3000/", "file:///C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/");
const $$Post = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$c, $$props, $$slots);
  Astro2.self = $$Post;
  const { title, author, publishDate, heroImage, alt, img } = Astro2.props;
  const STYLES = [];
  for (const STYLE of STYLES)
    $$result.styles.add(STYLE);
  return render`${maybeRenderHead($$result)}<div class="layout astro-XKF6ZIPB">
	<article class="content astro-XKF6ZIPB">
		<div class="astro-XKF6ZIPB">
			<header class="astro-XKF6ZIPB">
				${heroImage && render`<img width="720" height="420" class="hero-image astro-XKF6ZIPB" loading="lazy"${addAttribute(heroImage, "src")}${addAttribute(alt, "alt")}>`}
				<p class="publish-date astro-XKF6ZIPB">${publishDate}</p>
				${renderComponent($$result, "Author", $$Author, { "name": "Book Review by: Mark Spratt", "href": "https://twitter.com/_Hopelezz", "class": "astro-XKF6ZIPB" })}
				<h1 class="title astro-XKF6ZIPB">${title}</h1>
				<img${addAttribute(img, "src")} class="astro-XKF6ZIPB">
			</header>
			<main class="astro-XKF6ZIPB">
				${renderSlot($$result, $$slots["default"])}
			</main>
		</div>
	</article>
</div>

`;
});

const $$file$1 = "C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/bookShelf/Post.astro";
const $$url$1 = undefined;

var $$module3 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$c,
	'default': $$Post,
	file: $$file$1,
	url: $$url$1
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$b = createMetadata("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/layouts/BookPost.astro", { modules: [{ module: $$module1$1, specifier: "../components/MetaTags.astro", assert: {} }, { module: $$module2$2, specifier: "../components/Header.astro", assert: {} }, { module: $$module3, specifier: "../components/bookShelf/Post.astro", assert: {} }, { module: $$module4$1, specifier: "../components/sidebar/LeftSidebar.astro", assert: {} }, { module: $$module5, specifier: "../components/Footer/Footer.astro", assert: {} }, { module: $$module6, specifier: "../utils/api.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$b = createAstro("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/layouts/BookPost.astro", "http://localhost:3000/", "file:///C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/");
const $$BookPost = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$b, $$props, $$slots);
  Astro2.self = $$BookPost;
  const { mostRecentBlogPost } = await getBlogPosts();
  const { mostRecentBookPost } = await getBookPosts();
  const { content } = Astro2.props;
  const { title, description, publishDate, author, heroImage, permalink, alt, img } = content;
  const STYLES = [];
  for (const STYLE of STYLES)
    $$result.styles.add(STYLE);
  return render`<html${addAttribute(content.lang || "en", "lang")} class="astro-YJS64GAV">
	<head>
		${renderComponent($$result, "Meta", $$MetaTags, { "title": title, "description": description, "permalink": permalink, "class": "astro-YJS64GAV" })}
	${renderHead($$result)}</head>

		<body>
			<div class="body astro-YJS64GAV">
				${renderComponent($$result, "LeftSidebar", $$LeftSidebar, { "mostRecentBlogPost": mostRecentBlogPost, "mostRecentBookPost": mostRecentBookPost, "class": "astro-YJS64GAV" })}
				<main class="home_content astro-YJS64GAV">
					${renderComponent($$result, "Header", $$Header, { "class": "astro-YJS64GAV" })}
					<div class="wrapper astro-YJS64GAV">
						${renderComponent($$result, "BookPost", $$Post, { "title": title, "author": author, "heroImage": heroImage, "publishDate": publishDate, "alt": alt, "img": img, "class": "astro-YJS64GAV" }, { "default": () => render`${renderSlot($$result, $$slots["default"])}` })}
					</div>
				</main>
			</div>
		${renderComponent($$result, "Footer", $$Footer, { "class": "astro-YJS64GAV" })}
</body></html>`;
});

const $$file = "C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/layouts/BookPost.astro";
const $$url = undefined;

var $$module2 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$b,
	'default': $$BookPost,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const metadata$a = { "headers": [{ "depth": 1, "slug": "rating--310", "text": "Rating : 3/10" }, { "depth": 3, "slug": "politics-dystopic-world-view-communist", "text": "Politics, Dystopic, World View, Communist" }, { "depth": 2, "slug": "the-book", "text": "The Book" }], "source": `\r
# Rating : 3/10\r
### _Politics, Dystopic, World View, Communist_\r
\r
> **Disclaimer:** If you are going to judge something you should at least understand the intent. I doubt Marx or Engels had any ill intent upon the creation of this Manifesto. I do, however, believe they were wholly ignorant to the true nature of the thing in which they were creating. \r
> <br/>\r
> Another thing is the stigma that surrounds certain political pieces. Almost as if one were to touch them you'd be tainted. \r
> <br/>\r
> I once read an introduction to Mein Kampf by Abraham Foxman that said:\r
> "We preserve Mein Kampf in this spirit of remembering; we study it in the hope of securing a brighter future for humanity."\r
\r
I came to this book out of sheer interest for Dystopics and those interests started with a book called "Brave New World" back in my late teens. Since then I have admired, probably out of grotesque interests, the concepts hidden within these stories. Due to this personal intrigue I have since read several pieces on the origin of the topic dating back to Utopia by Sir Thomas More. I say all this because I believe the very essence of Communism is one of utopic vision. \r
\r
## The Book\r
\r
The Marx aims to explain the beliefs of the Communist party and its League. The first thing the reader is addressed with is a history of class struggles.\r
\r
I was discussing this with my friend after having read the book. He said:\r
> "Communism is a concept that isn't inherant in humans, one that has to be forced."\r
\r
`, "html": '<h1 id="rating--310">Rating : 3/10</h1>\n<h3 id="politics-dystopic-world-view-communist"><em>Politics, Dystopic, World View, Communist</em></h3>\n<blockquote>\n<p><strong>Disclaimer:</strong> If you are going to judge something you should at least understand the intent. I doubt Marx or Engels had any ill intent upon the creation of this Manifesto. I do, however, believe they were wholly ignorant to the true nature of the thing in which they were creating.</p>\n<br />\n<p>Another thing is the stigma that surrounds certain political pieces. Almost as if one were to touch them you\u2019d be tainted.</p>\n<br />\n<p>I once read an introduction to Mein Kampf by Abraham Foxman that said:\r\n\u201CWe preserve Mein Kampf in this spirit of remembering; we study it in the hope of securing a brighter future for humanity.\u201D</p>\n</blockquote>\n<p>I came to this book out of sheer interest for Dystopics and those interests started with a book called \u201CBrave New World\u201D back in my late teens. Since then I have admired, probably out of grotesque interests, the concepts hidden within these stories. Due to this personal intrigue I have since read several pieces on the origin of the topic dating back to Utopia by Sir Thomas More. I say all this because I believe the very essence of Communism is one of utopic vision.</p>\n<h2 id="the-book">The Book</h2>\n<p>The Marx aims to explain the beliefs of the Communist party and its League. The first thing the reader is addressed with is a history of class struggles.</p>\n<p>I was discussing this with my friend after having read the book. He said:</p>\n<blockquote>\n<p>\u201CCommunism is a concept that isn\u2019t inherant in humans, one that has to be forced.\u201D</p>\n</blockquote>' };
const frontmatter$a = { "title": "Communist Manifesto by Karl Marx", "publishDate": "18 JUL 2022", "href": "https://twitter.com/_Hopelezz", "name": "Mark Spratt", "description": null, "img": "https://images-na.ssl-images-amazon.com/images/I/51vHCno0a4L._SX330_BO1,204,203,200_.jpg", "tags": "Politics, Dystopic, World View, Communist,", "astro": { "headers": [{ "depth": 1, "slug": "rating--310", "text": "Rating : 3/10" }, { "depth": 3, "slug": "politics-dystopic-world-view-communist", "text": "Politics, Dystopic, World View, Communist" }, { "depth": 2, "slug": "the-book", "text": "The Book" }], "source": `\r
# Rating : 3/10\r
### _Politics, Dystopic, World View, Communist_\r
\r
> **Disclaimer:** If you are going to judge something you should at least understand the intent. I doubt Marx or Engels had any ill intent upon the creation of this Manifesto. I do, however, believe they were wholly ignorant to the true nature of the thing in which they were creating. \r
> <br/>\r
> Another thing is the stigma that surrounds certain political pieces. Almost as if one were to touch them you'd be tainted. \r
> <br/>\r
> I once read an introduction to Mein Kampf by Abraham Foxman that said:\r
> "We preserve Mein Kampf in this spirit of remembering; we study it in the hope of securing a brighter future for humanity."\r
\r
I came to this book out of sheer interest for Dystopics and those interests started with a book called "Brave New World" back in my late teens. Since then I have admired, probably out of grotesque interests, the concepts hidden within these stories. Due to this personal intrigue I have since read several pieces on the origin of the topic dating back to Utopia by Sir Thomas More. I say all this because I believe the very essence of Communism is one of utopic vision. \r
\r
## The Book\r
\r
The Marx aims to explain the beliefs of the Communist party and its League. The first thing the reader is addressed with is a history of class struggles.\r
\r
I was discussing this with my friend after having read the book. He said:\r
> "Communism is a concept that isn't inherant in humans, one that has to be forced."\r
\r
`, "html": '<h1 id="rating--310">Rating : 3/10</h1>\n<h3 id="politics-dystopic-world-view-communist"><em>Politics, Dystopic, World View, Communist</em></h3>\n<blockquote>\n<p><strong>Disclaimer:</strong> If you are going to judge something you should at least understand the intent. I doubt Marx or Engels had any ill intent upon the creation of this Manifesto. I do, however, believe they were wholly ignorant to the true nature of the thing in which they were creating.</p>\n<br />\n<p>Another thing is the stigma that surrounds certain political pieces. Almost as if one were to touch them you\u2019d be tainted.</p>\n<br />\n<p>I once read an introduction to Mein Kampf by Abraham Foxman that said:\r\n\u201CWe preserve Mein Kampf in this spirit of remembering; we study it in the hope of securing a brighter future for humanity.\u201D</p>\n</blockquote>\n<p>I came to this book out of sheer interest for Dystopics and those interests started with a book called \u201CBrave New World\u201D back in my late teens. Since then I have admired, probably out of grotesque interests, the concepts hidden within these stories. Due to this personal intrigue I have since read several pieces on the origin of the topic dating back to Utopia by Sir Thomas More. I say all this because I believe the very essence of Communism is one of utopic vision.</p>\n<h2 id="the-book">The Book</h2>\n<p>The Marx aims to explain the beliefs of the Communist party and its League. The first thing the reader is addressed with is a history of class struggles.</p>\n<p>I was discussing this with my friend after having read the book. He said:</p>\n<blockquote>\n<p>\u201CCommunism is a concept that isn\u2019t inherant in humans, one that has to be forced.\u201D</p>\n</blockquote>' } };
function rawContent$a() {
  return `\r
# Rating : 3/10\r
### _Politics, Dystopic, World View, Communist_\r
\r
> **Disclaimer:** If you are going to judge something you should at least understand the intent. I doubt Marx or Engels had any ill intent upon the creation of this Manifesto. I do, however, believe they were wholly ignorant to the true nature of the thing in which they were creating. \r
> <br/>\r
> Another thing is the stigma that surrounds certain political pieces. Almost as if one were to touch them you'd be tainted. \r
> <br/>\r
> I once read an introduction to Mein Kampf by Abraham Foxman that said:\r
> "We preserve Mein Kampf in this spirit of remembering; we study it in the hope of securing a brighter future for humanity."\r
\r
I came to this book out of sheer interest for Dystopics and those interests started with a book called "Brave New World" back in my late teens. Since then I have admired, probably out of grotesque interests, the concepts hidden within these stories. Due to this personal intrigue I have since read several pieces on the origin of the topic dating back to Utopia by Sir Thomas More. I say all this because I believe the very essence of Communism is one of utopic vision. \r
\r
## The Book\r
\r
The Marx aims to explain the beliefs of the Communist party and its League. The first thing the reader is addressed with is a history of class struggles.\r
\r
I was discussing this with my friend after having read the book. He said:\r
> "Communism is a concept that isn't inherant in humans, one that has to be forced."\r
\r
`;
}
function compiledContent$a() {
  return '<h1 id="rating--310">Rating : 3/10</h1>\n<h3 id="politics-dystopic-world-view-communist"><em>Politics, Dystopic, World View, Communist</em></h3>\n<blockquote>\n<p><strong>Disclaimer:</strong> If you are going to judge something you should at least understand the intent. I doubt Marx or Engels had any ill intent upon the creation of this Manifesto. I do, however, believe they were wholly ignorant to the true nature of the thing in which they were creating.</p>\n<br />\n<p>Another thing is the stigma that surrounds certain political pieces. Almost as if one were to touch them you\u2019d be tainted.</p>\n<br />\n<p>I once read an introduction to Mein Kampf by Abraham Foxman that said:\r\n\u201CWe preserve Mein Kampf in this spirit of remembering; we study it in the hope of securing a brighter future for humanity.\u201D</p>\n</blockquote>\n<p>I came to this book out of sheer interest for Dystopics and those interests started with a book called \u201CBrave New World\u201D back in my late teens. Since then I have admired, probably out of grotesque interests, the concepts hidden within these stories. Due to this personal intrigue I have since read several pieces on the origin of the topic dating back to Utopia by Sir Thomas More. I say all this because I believe the very essence of Communism is one of utopic vision.</p>\n<h2 id="the-book">The Book</h2>\n<p>The Marx aims to explain the beliefs of the Communist party and its League. The first thing the reader is addressed with is a history of class struggles.</p>\n<p>I was discussing this with my friend after having read the book. He said:</p>\n<blockquote>\n<p>\u201CCommunism is a concept that isn\u2019t inherant in humans, one that has to be forced.\u201D</p>\n</blockquote>';
}
const $$metadata$a = createMetadata("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/book/11-communist-manifesto.md", { modules: [{ module: $$module1$2, specifier: "@astrojs/markdown-remark/ssr-utils", assert: {} }, { module: $$module2, specifier: "../../layouts/BookPost.astro", assert: {} }, { module: $$module3$1, specifier: "../../components/Author.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$a = createAstro("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/book/11-communist-manifesto.md", "http://localhost:3000/", "file:///C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/");
const $$11CommunistManifesto = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$a, $$props, $$slots);
  Astro2.self = $$11CommunistManifesto;
  const $$content = { "title": "Communist Manifesto by Karl Marx", "publishDate": "18 JUL 2022", "href": "https://twitter.com/_Hopelezz", "name": "Mark Spratt", "description": null, "img": "https://images-na.ssl-images-amazon.com/images/I/51vHCno0a4L._SX330_BO1,204,203,200_.jpg", "tags": "Politics, Dystopic, World View, Communist,", "astro": { "headers": [{ "depth": 1, "slug": "rating--310", "text": "Rating : 3/10" }, { "depth": 3, "slug": "politics-dystopic-world-view-communist", "text": "Politics, Dystopic, World View, Communist" }, { "depth": 2, "slug": "the-book", "text": "The Book" }], "source": `\r
# Rating : 3/10\r
### _Politics, Dystopic, World View, Communist_\r
\r
> **Disclaimer:** If you are going to judge something you should at least understand the intent. I doubt Marx or Engels had any ill intent upon the creation of this Manifesto. I do, however, believe they were wholly ignorant to the true nature of the thing in which they were creating. \r
> <br/>\r
> Another thing is the stigma that surrounds certain political pieces. Almost as if one were to touch them you'd be tainted. \r
> <br/>\r
> I once read an introduction to Mein Kampf by Abraham Foxman that said:\r
> "We preserve Mein Kampf in this spirit of remembering; we study it in the hope of securing a brighter future for humanity."\r
\r
I came to this book out of sheer interest for Dystopics and those interests started with a book called "Brave New World" back in my late teens. Since then I have admired, probably out of grotesque interests, the concepts hidden within these stories. Due to this personal intrigue I have since read several pieces on the origin of the topic dating back to Utopia by Sir Thomas More. I say all this because I believe the very essence of Communism is one of utopic vision. \r
\r
## The Book\r
\r
The Marx aims to explain the beliefs of the Communist party and its League. The first thing the reader is addressed with is a history of class struggles.\r
\r
I was discussing this with my friend after having read the book. He said:\r
> "Communism is a concept that isn't inherant in humans, one that has to be forced."\r
\r
`, "html": '<h1 id="rating--310">Rating : 3/10</h1>\n<h3 id="politics-dystopic-world-view-communist"><em>Politics, Dystopic, World View, Communist</em></h3>\n<blockquote>\n<p><strong>Disclaimer:</strong> If you are going to judge something you should at least understand the intent. I doubt Marx or Engels had any ill intent upon the creation of this Manifesto. I do, however, believe they were wholly ignorant to the true nature of the thing in which they were creating.</p>\n<br />\n<p>Another thing is the stigma that surrounds certain political pieces. Almost as if one were to touch them you\u2019d be tainted.</p>\n<br />\n<p>I once read an introduction to Mein Kampf by Abraham Foxman that said:\r\n\u201CWe preserve Mein Kampf in this spirit of remembering; we study it in the hope of securing a brighter future for humanity.\u201D</p>\n</blockquote>\n<p>I came to this book out of sheer interest for Dystopics and those interests started with a book called \u201CBrave New World\u201D back in my late teens. Since then I have admired, probably out of grotesque interests, the concepts hidden within these stories. Due to this personal intrigue I have since read several pieces on the origin of the topic dating back to Utopia by Sir Thomas More. I say all this because I believe the very essence of Communism is one of utopic vision.</p>\n<h2 id="the-book">The Book</h2>\n<p>The Marx aims to explain the beliefs of the Communist party and its League. The first thing the reader is addressed with is a history of class struggles.</p>\n<p>I was discussing this with my friend after having read the book. He said:</p>\n<blockquote>\n<p>\u201CCommunism is a concept that isn\u2019t inherant in humans, one that has to be forced.\u201D</p>\n</blockquote>' } };
  return render`${renderComponent($$result, "Layout", $$BookPost, { "content": $$content }, { "default": () => render`${maybeRenderHead($$result)}<h1 id="rating--310">Rating : 3/10</h1><h3 id="politics-dystopic-world-view-communist"><em>Politics, Dystopic, World View, Communist</em></h3><blockquote>
<p><strong>Disclaimer:</strong> If you are going to judge something you should at least understand the intent. I doubt Marx or Engels had any ill intent upon the creation of this Manifesto. I do, however, believe they were wholly ignorant to the true nature of the thing in which they were creating.</p>
<br>
<p>Another thing is the stigma that surrounds certain political pieces. Almost as if one were to touch them you’d be tainted.</p>
<br>
<p>I once read an introduction to Mein Kampf by Abraham Foxman that said:
“We preserve Mein Kampf in this spirit of remembering; we study it in the hope of securing a brighter future for humanity.”</p>
</blockquote><p>I came to this book out of sheer interest for Dystopics and those interests started with a book called “Brave New World” back in my late teens. Since then I have admired, probably out of grotesque interests, the concepts hidden within these stories. Due to this personal intrigue I have since read several pieces on the origin of the topic dating back to Utopia by Sir Thomas More. I say all this because I believe the very essence of Communism is one of utopic vision.</p><h2 id="the-book">The Book</h2><p>The Marx aims to explain the beliefs of the Communist party and its League. The first thing the reader is addressed with is a history of class struggles.</p><p>I was discussing this with my friend after having read the book. He said:</p><blockquote>
<p>“Communism is a concept that isn’t inherant in humans, one that has to be forced.”</p>
</blockquote>` })}`;
});

var _page6 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	metadata: metadata$a,
	frontmatter: frontmatter$a,
	rawContent: rawContent$a,
	compiledContent: compiledContent$a,
	$$metadata: $$metadata$a,
	'default': $$11CommunistManifesto
}, Symbol.toStringTag, { value: 'Module' }));

const metadata$9 = { "headers": [{ "depth": 1, "slug": "rating--910", "text": "Rating : 9/10" }, { "depth": 3, "slug": "american-science-fiction-military-fiction", "text": "American Science Fiction, Military Fiction" }], "source": `\r
# Rating : 9/10\r
### _American Science Fiction, Military Fiction_\r
\r
\r
I felt that the ending was abrupt and just fell off, but that's not the selling point of the story! I loved the wit and subtle humor that's sprinkled throughout the book. \r
\r
>"and the Russians came and arrested everybody except for the two horses"\r
\r
>"This could be useful for Rocketry"\r
\r
So many fun nuggets of humor... but it's bittersweet when the next moment Vonnegut's talking about the real and serious harm that has been inflicted in our history. The grey undertone of the story and the mental illness in which his protagonist is wracked with. Where he's the sole survivor of a plane crash and everyone he meets ends up dead. The telling of subtle people throughout the book in which Vonnegut describes  \r
\r
>"and then they just...die...So It Goes"\r
\r
Vonnegut uses humor in a gentle way to present a very real and grim history. The part that has my spine tingling the most is the fact Vonnegut, a prisoner of WWII, survived the bombing of Dresden in the meat locker of a slaughterhouse.`, "html": '<h1 id="rating--910">Rating : 9/10</h1>\n<h3 id="american-science-fiction-military-fiction"><em>American Science Fiction, Military Fiction</em></h3>\n<p>I felt that the ending was abrupt and just fell off, but that\u2019s not the selling point of the story! I loved the wit and subtle humor that\u2019s sprinkled throughout the book.</p>\n<blockquote>\n<p>\u201Cand the Russians came and arrested everybody except for the two horses\u201D</p>\n</blockquote>\n<blockquote>\n<p>\u201CThis could be useful for Rocketry\u201D</p>\n</blockquote>\n<p>So many fun nuggets of humor\u2026 but it\u2019s bittersweet when the next moment Vonnegut\u2019s talking about the real and serious harm that has been inflicted in our history. The grey undertone of the story and the mental illness in which his protagonist is wracked with. Where he\u2019s the sole survivor of a plane crash and everyone he meets ends up dead. The telling of subtle people throughout the book in which Vonnegut describes</p>\n<blockquote>\n<p>\u201Cand then they just\u2026die\u2026So It Goes\u201D</p>\n</blockquote>\n<p>Vonnegut uses humor in a gentle way to present a very real and grim history. The part that has my spine tingling the most is the fact Vonnegut, a prisoner of WWII, survived the bombing of Dresden in the meat locker of a slaughterhouse.</p>' };
const frontmatter$9 = { "title": "Slaughterhouse-Five By Kurt Vonnegut", "publishDate": "01 OCT 2017", "href": "https://twitter.com/_Hopelezz", "name": "Mark Spratt", "description": "A 1969 semi-autobiographic science fiction-infused anti-war novel by Kurt Vonnegut.", "img": "https://covers.openlibrary.org/b/id/7890961-L.jpg", "tags": "American science fiction, bombing of Dresden, military fiction, war stories, World War II, World War, 1939-1945, literature and the war, war, free will and determinism, literary fiction, Fiction, Animals, Boats and boating, Juvenile fiction, Domestic animals, American fiction (fictional works by one author), Large type books, Fiction, general, Fiction, war & military, World war, 1939-1945, fiction, Classic Literature, Drama, Accessible book, Protected DAISY, In library, Vonnegut, kurt, 1922-2007, American literature, history and criticism, Destruction and pillage, Literature, American literature", "astro": { "headers": [{ "depth": 1, "slug": "rating--910", "text": "Rating : 9/10" }, { "depth": 3, "slug": "american-science-fiction-military-fiction", "text": "American Science Fiction, Military Fiction" }], "source": `\r
# Rating : 9/10\r
### _American Science Fiction, Military Fiction_\r
\r
\r
I felt that the ending was abrupt and just fell off, but that's not the selling point of the story! I loved the wit and subtle humor that's sprinkled throughout the book. \r
\r
>"and the Russians came and arrested everybody except for the two horses"\r
\r
>"This could be useful for Rocketry"\r
\r
So many fun nuggets of humor... but it's bittersweet when the next moment Vonnegut's talking about the real and serious harm that has been inflicted in our history. The grey undertone of the story and the mental illness in which his protagonist is wracked with. Where he's the sole survivor of a plane crash and everyone he meets ends up dead. The telling of subtle people throughout the book in which Vonnegut describes  \r
\r
>"and then they just...die...So It Goes"\r
\r
Vonnegut uses humor in a gentle way to present a very real and grim history. The part that has my spine tingling the most is the fact Vonnegut, a prisoner of WWII, survived the bombing of Dresden in the meat locker of a slaughterhouse.`, "html": '<h1 id="rating--910">Rating : 9/10</h1>\n<h3 id="american-science-fiction-military-fiction"><em>American Science Fiction, Military Fiction</em></h3>\n<p>I felt that the ending was abrupt and just fell off, but that\u2019s not the selling point of the story! I loved the wit and subtle humor that\u2019s sprinkled throughout the book.</p>\n<blockquote>\n<p>\u201Cand the Russians came and arrested everybody except for the two horses\u201D</p>\n</blockquote>\n<blockquote>\n<p>\u201CThis could be useful for Rocketry\u201D</p>\n</blockquote>\n<p>So many fun nuggets of humor\u2026 but it\u2019s bittersweet when the next moment Vonnegut\u2019s talking about the real and serious harm that has been inflicted in our history. The grey undertone of the story and the mental illness in which his protagonist is wracked with. Where he\u2019s the sole survivor of a plane crash and everyone he meets ends up dead. The telling of subtle people throughout the book in which Vonnegut describes</p>\n<blockquote>\n<p>\u201Cand then they just\u2026die\u2026So It Goes\u201D</p>\n</blockquote>\n<p>Vonnegut uses humor in a gentle way to present a very real and grim history. The part that has my spine tingling the most is the fact Vonnegut, a prisoner of WWII, survived the bombing of Dresden in the meat locker of a slaughterhouse.</p>' } };
function rawContent$9() {
  return `\r
# Rating : 9/10\r
### _American Science Fiction, Military Fiction_\r
\r
\r
I felt that the ending was abrupt and just fell off, but that's not the selling point of the story! I loved the wit and subtle humor that's sprinkled throughout the book. \r
\r
>"and the Russians came and arrested everybody except for the two horses"\r
\r
>"This could be useful for Rocketry"\r
\r
So many fun nuggets of humor... but it's bittersweet when the next moment Vonnegut's talking about the real and serious harm that has been inflicted in our history. The grey undertone of the story and the mental illness in which his protagonist is wracked with. Where he's the sole survivor of a plane crash and everyone he meets ends up dead. The telling of subtle people throughout the book in which Vonnegut describes  \r
\r
>"and then they just...die...So It Goes"\r
\r
Vonnegut uses humor in a gentle way to present a very real and grim history. The part that has my spine tingling the most is the fact Vonnegut, a prisoner of WWII, survived the bombing of Dresden in the meat locker of a slaughterhouse.`;
}
function compiledContent$9() {
  return '<h1 id="rating--910">Rating : 9/10</h1>\n<h3 id="american-science-fiction-military-fiction"><em>American Science Fiction, Military Fiction</em></h3>\n<p>I felt that the ending was abrupt and just fell off, but that\u2019s not the selling point of the story! I loved the wit and subtle humor that\u2019s sprinkled throughout the book.</p>\n<blockquote>\n<p>\u201Cand the Russians came and arrested everybody except for the two horses\u201D</p>\n</blockquote>\n<blockquote>\n<p>\u201CThis could be useful for Rocketry\u201D</p>\n</blockquote>\n<p>So many fun nuggets of humor\u2026 but it\u2019s bittersweet when the next moment Vonnegut\u2019s talking about the real and serious harm that has been inflicted in our history. The grey undertone of the story and the mental illness in which his protagonist is wracked with. Where he\u2019s the sole survivor of a plane crash and everyone he meets ends up dead. The telling of subtle people throughout the book in which Vonnegut describes</p>\n<blockquote>\n<p>\u201Cand then they just\u2026die\u2026So It Goes\u201D</p>\n</blockquote>\n<p>Vonnegut uses humor in a gentle way to present a very real and grim history. The part that has my spine tingling the most is the fact Vonnegut, a prisoner of WWII, survived the bombing of Dresden in the meat locker of a slaughterhouse.</p>';
}
const $$metadata$9 = createMetadata("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/book/1-Slaughterhouse-Five.md", { modules: [{ module: $$module1$2, specifier: "@astrojs/markdown-remark/ssr-utils", assert: {} }, { module: $$module2, specifier: "../../layouts/BookPost.astro", assert: {} }, { module: $$module3$1, specifier: "../../components/Author.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$9 = createAstro("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/book/1-Slaughterhouse-Five.md", "http://localhost:3000/", "file:///C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/");
const $$1SlaughterhouseFive = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$9, $$props, $$slots);
  Astro2.self = $$1SlaughterhouseFive;
  const $$content = { "title": "Slaughterhouse-Five By Kurt Vonnegut", "publishDate": "01 OCT 2017", "href": "https://twitter.com/_Hopelezz", "name": "Mark Spratt", "description": "A 1969 semi-autobiographic science fiction-infused anti-war novel by Kurt Vonnegut.", "img": "https://covers.openlibrary.org/b/id/7890961-L.jpg", "tags": "American science fiction, bombing of Dresden, military fiction, war stories, World War II, World War, 1939-1945, literature and the war, war, free will and determinism, literary fiction, Fiction, Animals, Boats and boating, Juvenile fiction, Domestic animals, American fiction (fictional works by one author), Large type books, Fiction, general, Fiction, war & military, World war, 1939-1945, fiction, Classic Literature, Drama, Accessible book, Protected DAISY, In library, Vonnegut, kurt, 1922-2007, American literature, history and criticism, Destruction and pillage, Literature, American literature", "astro": { "headers": [{ "depth": 1, "slug": "rating--910", "text": "Rating : 9/10" }, { "depth": 3, "slug": "american-science-fiction-military-fiction", "text": "American Science Fiction, Military Fiction" }], "source": `\r
# Rating : 9/10\r
### _American Science Fiction, Military Fiction_\r
\r
\r
I felt that the ending was abrupt and just fell off, but that's not the selling point of the story! I loved the wit and subtle humor that's sprinkled throughout the book. \r
\r
>"and the Russians came and arrested everybody except for the two horses"\r
\r
>"This could be useful for Rocketry"\r
\r
So many fun nuggets of humor... but it's bittersweet when the next moment Vonnegut's talking about the real and serious harm that has been inflicted in our history. The grey undertone of the story and the mental illness in which his protagonist is wracked with. Where he's the sole survivor of a plane crash and everyone he meets ends up dead. The telling of subtle people throughout the book in which Vonnegut describes  \r
\r
>"and then they just...die...So It Goes"\r
\r
Vonnegut uses humor in a gentle way to present a very real and grim history. The part that has my spine tingling the most is the fact Vonnegut, a prisoner of WWII, survived the bombing of Dresden in the meat locker of a slaughterhouse.`, "html": '<h1 id="rating--910">Rating : 9/10</h1>\n<h3 id="american-science-fiction-military-fiction"><em>American Science Fiction, Military Fiction</em></h3>\n<p>I felt that the ending was abrupt and just fell off, but that\u2019s not the selling point of the story! I loved the wit and subtle humor that\u2019s sprinkled throughout the book.</p>\n<blockquote>\n<p>\u201Cand the Russians came and arrested everybody except for the two horses\u201D</p>\n</blockquote>\n<blockquote>\n<p>\u201CThis could be useful for Rocketry\u201D</p>\n</blockquote>\n<p>So many fun nuggets of humor\u2026 but it\u2019s bittersweet when the next moment Vonnegut\u2019s talking about the real and serious harm that has been inflicted in our history. The grey undertone of the story and the mental illness in which his protagonist is wracked with. Where he\u2019s the sole survivor of a plane crash and everyone he meets ends up dead. The telling of subtle people throughout the book in which Vonnegut describes</p>\n<blockquote>\n<p>\u201Cand then they just\u2026die\u2026So It Goes\u201D</p>\n</blockquote>\n<p>Vonnegut uses humor in a gentle way to present a very real and grim history. The part that has my spine tingling the most is the fact Vonnegut, a prisoner of WWII, survived the bombing of Dresden in the meat locker of a slaughterhouse.</p>' } };
  return render`${renderComponent($$result, "Layout", $$BookPost, { "content": $$content }, { "default": () => render`${maybeRenderHead($$result)}<h1 id="rating--910">Rating : 9/10</h1><h3 id="american-science-fiction-military-fiction"><em>American Science Fiction, Military Fiction</em></h3><p>I felt that the ending was abrupt and just fell off, but that’s not the selling point of the story! I loved the wit and subtle humor that’s sprinkled throughout the book.</p><blockquote>
<p>“and the Russians came and arrested everybody except for the two horses”</p>
</blockquote><blockquote>
<p>“This could be useful for Rocketry”</p>
</blockquote><p>So many fun nuggets of humor… but it’s bittersweet when the next moment Vonnegut’s talking about the real and serious harm that has been inflicted in our history. The grey undertone of the story and the mental illness in which his protagonist is wracked with. Where he’s the sole survivor of a plane crash and everyone he meets ends up dead. The telling of subtle people throughout the book in which Vonnegut describes</p><blockquote>
<p>“and then they just…die…So It Goes”</p>
</blockquote><p>Vonnegut uses humor in a gentle way to present a very real and grim history. The part that has my spine tingling the most is the fact Vonnegut, a prisoner of WWII, survived the bombing of Dresden in the meat locker of a slaughterhouse.</p>` })}`;
});

var _page7 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	metadata: metadata$9,
	frontmatter: frontmatter$9,
	rawContent: rawContent$9,
	compiledContent: compiledContent$9,
	$$metadata: $$metadata$9,
	'default': $$1SlaughterhouseFive
}, Symbol.toStringTag, { value: 'Module' }));

const metadata$8 = { "headers": [{ "depth": 1, "slug": "rating--910", "text": "Rating : 9/10" }, { "depth": 3, "slug": "classic-fiction-dystopian-adventure", "text": "Classic, Fiction, Dystopian, Adventure" }], "source": `\r
# Rating : 9/10\r
### _Classic, Fiction, Dystopian, Adventure_\r
\r
At the onset of the cold war, a plane full of schoolboys gets shot down over an uninhabited island where only the children survive. Doesn\u2019t take long before the whimsical and imaginative boys start creating a hierarchy amongst themselves. \r
\r
>"He who holds the Conch shell has the authority to speak!"\r
\r
So is the law of the tribe. Shortly thereafter, a system for life was set in motion. Children created a fire, started a camp, and with plenty of fruit to eat; life was good. It doesn't take long before all hell breaks loose amongst the children and their baser instincts start to take hold.\r
\r
>\u201CMaybe there is a beast\u2026 Maybe it\u2019s only us.\u201D\r
\r
Golding\u2019s writing conveys blood lust, panic, and chaos unlike any author I\u2019ve read. The story starts off slow, but with each new chapter a climax that builds off the last; a crescendo up until the last chapter when the wave of emotions crash down and all is set right again. William Golding was awarded a Nobel Prize for this masterpiece of literature in 1983 and deserves every ounce of praise for his novel.`, "html": '<h1 id="rating--910">Rating : 9/10</h1>\n<h3 id="classic-fiction-dystopian-adventure"><em>Classic, Fiction, Dystopian, Adventure</em></h3>\n<p>At the onset of the cold war, a plane full of schoolboys gets shot down over an uninhabited island where only the children survive. Doesn\u2019t take long before the whimsical and imaginative boys start creating a hierarchy amongst themselves.</p>\n<blockquote>\n<p>\u201CHe who holds the Conch shell has the authority to speak!\u201D</p>\n</blockquote>\n<p>So is the law of the tribe. Shortly thereafter, a system for life was set in motion. Children created a fire, started a camp, and with plenty of fruit to eat; life was good. It doesn\u2019t take long before all hell breaks loose amongst the children and their baser instincts start to take hold.</p>\n<blockquote>\n<p>\u201CMaybe there is a beast\u2026 Maybe it\u2019s only us.\u201D</p>\n</blockquote>\n<p>Golding\u2019s writing conveys blood lust, panic, and chaos unlike any author I\u2019ve read. The story starts off slow, but with each new chapter a climax that builds off the last; a crescendo up until the last chapter when the wave of emotions crash down and all is set right again. William Golding was awarded a Nobel Prize for this masterpiece of literature in 1983 and deserves every ounce of praise for his novel.</p>' };
const frontmatter$8 = { "title": "Lord of the Flies by William Golding", "publishDate": "8 OCT 2017", "href": "https://twitter.com/_Hopelezz", "name": "Mark Spratt", "description": null, "img": "https://covers.openlibrary.org/b/id/12723924-L.jpg", "tags": "Sci-fi, Comedy, Charming, Is-A-Movie", "astro": { "headers": [{ "depth": 1, "slug": "rating--910", "text": "Rating : 9/10" }, { "depth": 3, "slug": "classic-fiction-dystopian-adventure", "text": "Classic, Fiction, Dystopian, Adventure" }], "source": `\r
# Rating : 9/10\r
### _Classic, Fiction, Dystopian, Adventure_\r
\r
At the onset of the cold war, a plane full of schoolboys gets shot down over an uninhabited island where only the children survive. Doesn\u2019t take long before the whimsical and imaginative boys start creating a hierarchy amongst themselves. \r
\r
>"He who holds the Conch shell has the authority to speak!"\r
\r
So is the law of the tribe. Shortly thereafter, a system for life was set in motion. Children created a fire, started a camp, and with plenty of fruit to eat; life was good. It doesn't take long before all hell breaks loose amongst the children and their baser instincts start to take hold.\r
\r
>\u201CMaybe there is a beast\u2026 Maybe it\u2019s only us.\u201D\r
\r
Golding\u2019s writing conveys blood lust, panic, and chaos unlike any author I\u2019ve read. The story starts off slow, but with each new chapter a climax that builds off the last; a crescendo up until the last chapter when the wave of emotions crash down and all is set right again. William Golding was awarded a Nobel Prize for this masterpiece of literature in 1983 and deserves every ounce of praise for his novel.`, "html": '<h1 id="rating--910">Rating : 9/10</h1>\n<h3 id="classic-fiction-dystopian-adventure"><em>Classic, Fiction, Dystopian, Adventure</em></h3>\n<p>At the onset of the cold war, a plane full of schoolboys gets shot down over an uninhabited island where only the children survive. Doesn\u2019t take long before the whimsical and imaginative boys start creating a hierarchy amongst themselves.</p>\n<blockquote>\n<p>\u201CHe who holds the Conch shell has the authority to speak!\u201D</p>\n</blockquote>\n<p>So is the law of the tribe. Shortly thereafter, a system for life was set in motion. Children created a fire, started a camp, and with plenty of fruit to eat; life was good. It doesn\u2019t take long before all hell breaks loose amongst the children and their baser instincts start to take hold.</p>\n<blockquote>\n<p>\u201CMaybe there is a beast\u2026 Maybe it\u2019s only us.\u201D</p>\n</blockquote>\n<p>Golding\u2019s writing conveys blood lust, panic, and chaos unlike any author I\u2019ve read. The story starts off slow, but with each new chapter a climax that builds off the last; a crescendo up until the last chapter when the wave of emotions crash down and all is set right again. William Golding was awarded a Nobel Prize for this masterpiece of literature in 1983 and deserves every ounce of praise for his novel.</p>' } };
function rawContent$8() {
  return `\r
# Rating : 9/10\r
### _Classic, Fiction, Dystopian, Adventure_\r
\r
At the onset of the cold war, a plane full of schoolboys gets shot down over an uninhabited island where only the children survive. Doesn\u2019t take long before the whimsical and imaginative boys start creating a hierarchy amongst themselves. \r
\r
>"He who holds the Conch shell has the authority to speak!"\r
\r
So is the law of the tribe. Shortly thereafter, a system for life was set in motion. Children created a fire, started a camp, and with plenty of fruit to eat; life was good. It doesn't take long before all hell breaks loose amongst the children and their baser instincts start to take hold.\r
\r
>\u201CMaybe there is a beast\u2026 Maybe it\u2019s only us.\u201D\r
\r
Golding\u2019s writing conveys blood lust, panic, and chaos unlike any author I\u2019ve read. The story starts off slow, but with each new chapter a climax that builds off the last; a crescendo up until the last chapter when the wave of emotions crash down and all is set right again. William Golding was awarded a Nobel Prize for this masterpiece of literature in 1983 and deserves every ounce of praise for his novel.`;
}
function compiledContent$8() {
  return '<h1 id="rating--910">Rating : 9/10</h1>\n<h3 id="classic-fiction-dystopian-adventure"><em>Classic, Fiction, Dystopian, Adventure</em></h3>\n<p>At the onset of the cold war, a plane full of schoolboys gets shot down over an uninhabited island where only the children survive. Doesn\u2019t take long before the whimsical and imaginative boys start creating a hierarchy amongst themselves.</p>\n<blockquote>\n<p>\u201CHe who holds the Conch shell has the authority to speak!\u201D</p>\n</blockquote>\n<p>So is the law of the tribe. Shortly thereafter, a system for life was set in motion. Children created a fire, started a camp, and with plenty of fruit to eat; life was good. It doesn\u2019t take long before all hell breaks loose amongst the children and their baser instincts start to take hold.</p>\n<blockquote>\n<p>\u201CMaybe there is a beast\u2026 Maybe it\u2019s only us.\u201D</p>\n</blockquote>\n<p>Golding\u2019s writing conveys blood lust, panic, and chaos unlike any author I\u2019ve read. The story starts off slow, but with each new chapter a climax that builds off the last; a crescendo up until the last chapter when the wave of emotions crash down and all is set right again. William Golding was awarded a Nobel Prize for this masterpiece of literature in 1983 and deserves every ounce of praise for his novel.</p>';
}
const $$metadata$8 = createMetadata("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/book/5-lord-of-the-flies.md", { modules: [{ module: $$module1$2, specifier: "@astrojs/markdown-remark/ssr-utils", assert: {} }, { module: $$module2, specifier: "../../layouts/BookPost.astro", assert: {} }, { module: $$module3$1, specifier: "../../components/Author.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$8 = createAstro("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/book/5-lord-of-the-flies.md", "http://localhost:3000/", "file:///C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/");
const $$5LordOfTheFlies = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$8, $$props, $$slots);
  Astro2.self = $$5LordOfTheFlies;
  const $$content = { "title": "Lord of the Flies by William Golding", "publishDate": "8 OCT 2017", "href": "https://twitter.com/_Hopelezz", "name": "Mark Spratt", "description": null, "img": "https://covers.openlibrary.org/b/id/12723924-L.jpg", "tags": "Sci-fi, Comedy, Charming, Is-A-Movie", "astro": { "headers": [{ "depth": 1, "slug": "rating--910", "text": "Rating : 9/10" }, { "depth": 3, "slug": "classic-fiction-dystopian-adventure", "text": "Classic, Fiction, Dystopian, Adventure" }], "source": `\r
# Rating : 9/10\r
### _Classic, Fiction, Dystopian, Adventure_\r
\r
At the onset of the cold war, a plane full of schoolboys gets shot down over an uninhabited island where only the children survive. Doesn\u2019t take long before the whimsical and imaginative boys start creating a hierarchy amongst themselves. \r
\r
>"He who holds the Conch shell has the authority to speak!"\r
\r
So is the law of the tribe. Shortly thereafter, a system for life was set in motion. Children created a fire, started a camp, and with plenty of fruit to eat; life was good. It doesn't take long before all hell breaks loose amongst the children and their baser instincts start to take hold.\r
\r
>\u201CMaybe there is a beast\u2026 Maybe it\u2019s only us.\u201D\r
\r
Golding\u2019s writing conveys blood lust, panic, and chaos unlike any author I\u2019ve read. The story starts off slow, but with each new chapter a climax that builds off the last; a crescendo up until the last chapter when the wave of emotions crash down and all is set right again. William Golding was awarded a Nobel Prize for this masterpiece of literature in 1983 and deserves every ounce of praise for his novel.`, "html": '<h1 id="rating--910">Rating : 9/10</h1>\n<h3 id="classic-fiction-dystopian-adventure"><em>Classic, Fiction, Dystopian, Adventure</em></h3>\n<p>At the onset of the cold war, a plane full of schoolboys gets shot down over an uninhabited island where only the children survive. Doesn\u2019t take long before the whimsical and imaginative boys start creating a hierarchy amongst themselves.</p>\n<blockquote>\n<p>\u201CHe who holds the Conch shell has the authority to speak!\u201D</p>\n</blockquote>\n<p>So is the law of the tribe. Shortly thereafter, a system for life was set in motion. Children created a fire, started a camp, and with plenty of fruit to eat; life was good. It doesn\u2019t take long before all hell breaks loose amongst the children and their baser instincts start to take hold.</p>\n<blockquote>\n<p>\u201CMaybe there is a beast\u2026 Maybe it\u2019s only us.\u201D</p>\n</blockquote>\n<p>Golding\u2019s writing conveys blood lust, panic, and chaos unlike any author I\u2019ve read. The story starts off slow, but with each new chapter a climax that builds off the last; a crescendo up until the last chapter when the wave of emotions crash down and all is set right again. William Golding was awarded a Nobel Prize for this masterpiece of literature in 1983 and deserves every ounce of praise for his novel.</p>' } };
  return render`${renderComponent($$result, "Layout", $$BookPost, { "content": $$content }, { "default": () => render`${maybeRenderHead($$result)}<h1 id="rating--910">Rating : 9/10</h1><h3 id="classic-fiction-dystopian-adventure"><em>Classic, Fiction, Dystopian, Adventure</em></h3><p>At the onset of the cold war, a plane full of schoolboys gets shot down over an uninhabited island where only the children survive. Doesn’t take long before the whimsical and imaginative boys start creating a hierarchy amongst themselves.</p><blockquote>
<p>“He who holds the Conch shell has the authority to speak!”</p>
</blockquote><p>So is the law of the tribe. Shortly thereafter, a system for life was set in motion. Children created a fire, started a camp, and with plenty of fruit to eat; life was good. It doesn’t take long before all hell breaks loose amongst the children and their baser instincts start to take hold.</p><blockquote>
<p>“Maybe there is a beast… Maybe it’s only us.”</p>
</blockquote><p>Golding’s writing conveys blood lust, panic, and chaos unlike any author I’ve read. The story starts off slow, but with each new chapter a climax that builds off the last; a crescendo up until the last chapter when the wave of emotions crash down and all is set right again. William Golding was awarded a Nobel Prize for this masterpiece of literature in 1983 and deserves every ounce of praise for his novel.</p>` })}`;
});

var _page8 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	metadata: metadata$8,
	frontmatter: frontmatter$8,
	rawContent: rawContent$8,
	compiledContent: compiledContent$8,
	$$metadata: $$metadata$8,
	'default': $$5LordOfTheFlies
}, Symbol.toStringTag, { value: 'Module' }));

const metadata$7 = { "headers": [{ "depth": 1, "slug": "rating--710", "text": "Rating : 7/10" }, { "depth": 3, "slug": "melancholy-fiction-dystopic", "text": "Melancholy, Fiction, Dystopic" }], "source": "\r\n# Rating : 7/10\r\n### _Melancholy, Fiction, Dystopic_\r\n\r\nI went into this novel with expectations but was left with a sense of loss but in that good kind of way.\r\nNever Let Me Go, is a novel of a woman telling her story; similar to an autobiography.\r\n\r\nThe book starts off:\r\n\r\n>\u201CThere have been times over the years when I\u2019ve tried to leave Hailsham behind when I\u2019ve told myself I shouldn\u2019t look back so much. But then there came a point when I just stopped resisting. It had to do with this particular donor I had once, in my third year as a carer; it was his reaction when I mentioned I was from Hailsham.\u201D\r\n\r\nCentered around a school called Hailsham for children similar to that of an orphanage with a tinge of a concentration camp. The school is removed from society, in fact, society wants as little to do with them. The school is a place where children are taught to be responsible and to be kind to each other. Trained in litterature and art.\r\n\r\nIn this retelling of Kathy's life, you get a sense of gloom and anxiety that pervades these children's lives even unbeknownst to them.", "html": '<h1 id="rating--710">Rating : 7/10</h1>\n<h3 id="melancholy-fiction-dystopic"><em>Melancholy, Fiction, Dystopic</em></h3>\n<p>I went into this novel with expectations but was left with a sense of loss but in that good kind of way.\r\nNever Let Me Go, is a novel of a woman telling her story; similar to an autobiography.</p>\n<p>The book starts off:</p>\n<blockquote>\n<p>\u201CThere have been times over the years when I\u2019ve tried to leave Hailsham behind when I\u2019ve told myself I shouldn\u2019t look back so much. But then there came a point when I just stopped resisting. It had to do with this particular donor I had once, in my third year as a carer; it was his reaction when I mentioned I was from Hailsham.\u201D</p>\n</blockquote>\n<p>Centered around a school called Hailsham for children similar to that of an orphanage with a tinge of a concentration camp. The school is removed from society, in fact, society wants as little to do with them. The school is a place where children are taught to be responsible and to be kind to each other. Trained in litterature and art.</p>\n<p>In this retelling of Kathy\u2019s life, you get a sense of gloom and anxiety that pervades these children\u2019s lives even unbeknownst to them.</p>' };
const frontmatter$7 = { "title": "Never Let Me Go by Kazuo Ishiguro", "publishDate": "20 APR 2020", "href": "https://twitter.com/_Hopelezz", "name": "Mark Spratt", "description": null, "img": "https://covers.openlibrary.org/b/id/6425427-L.jpg", "tags": "dystopic, Melancholy, Fiction, Organ donors, Cloning, Donation of organs, tissues, Women, Literature, New York Times bestseller, Human cloning, Science fiction, psychological, science fiction, general, England, School, children, Reminiscing, Friendship, English literature", "astro": { "headers": [{ "depth": 1, "slug": "rating--710", "text": "Rating : 7/10" }, { "depth": 3, "slug": "melancholy-fiction-dystopic", "text": "Melancholy, Fiction, Dystopic" }], "source": "\r\n# Rating : 7/10\r\n### _Melancholy, Fiction, Dystopic_\r\n\r\nI went into this novel with expectations but was left with a sense of loss but in that good kind of way.\r\nNever Let Me Go, is a novel of a woman telling her story; similar to an autobiography.\r\n\r\nThe book starts off:\r\n\r\n>\u201CThere have been times over the years when I\u2019ve tried to leave Hailsham behind when I\u2019ve told myself I shouldn\u2019t look back so much. But then there came a point when I just stopped resisting. It had to do with this particular donor I had once, in my third year as a carer; it was his reaction when I mentioned I was from Hailsham.\u201D\r\n\r\nCentered around a school called Hailsham for children similar to that of an orphanage with a tinge of a concentration camp. The school is removed from society, in fact, society wants as little to do with them. The school is a place where children are taught to be responsible and to be kind to each other. Trained in litterature and art.\r\n\r\nIn this retelling of Kathy's life, you get a sense of gloom and anxiety that pervades these children's lives even unbeknownst to them.", "html": '<h1 id="rating--710">Rating : 7/10</h1>\n<h3 id="melancholy-fiction-dystopic"><em>Melancholy, Fiction, Dystopic</em></h3>\n<p>I went into this novel with expectations but was left with a sense of loss but in that good kind of way.\r\nNever Let Me Go, is a novel of a woman telling her story; similar to an autobiography.</p>\n<p>The book starts off:</p>\n<blockquote>\n<p>\u201CThere have been times over the years when I\u2019ve tried to leave Hailsham behind when I\u2019ve told myself I shouldn\u2019t look back so much. But then there came a point when I just stopped resisting. It had to do with this particular donor I had once, in my third year as a carer; it was his reaction when I mentioned I was from Hailsham.\u201D</p>\n</blockquote>\n<p>Centered around a school called Hailsham for children similar to that of an orphanage with a tinge of a concentration camp. The school is removed from society, in fact, society wants as little to do with them. The school is a place where children are taught to be responsible and to be kind to each other. Trained in litterature and art.</p>\n<p>In this retelling of Kathy\u2019s life, you get a sense of gloom and anxiety that pervades these children\u2019s lives even unbeknownst to them.</p>' } };
function rawContent$7() {
  return "\r\n# Rating : 7/10\r\n### _Melancholy, Fiction, Dystopic_\r\n\r\nI went into this novel with expectations but was left with a sense of loss but in that good kind of way.\r\nNever Let Me Go, is a novel of a woman telling her story; similar to an autobiography.\r\n\r\nThe book starts off:\r\n\r\n>\u201CThere have been times over the years when I\u2019ve tried to leave Hailsham behind when I\u2019ve told myself I shouldn\u2019t look back so much. But then there came a point when I just stopped resisting. It had to do with this particular donor I had once, in my third year as a carer; it was his reaction when I mentioned I was from Hailsham.\u201D\r\n\r\nCentered around a school called Hailsham for children similar to that of an orphanage with a tinge of a concentration camp. The school is removed from society, in fact, society wants as little to do with them. The school is a place where children are taught to be responsible and to be kind to each other. Trained in litterature and art.\r\n\r\nIn this retelling of Kathy's life, you get a sense of gloom and anxiety that pervades these children's lives even unbeknownst to them.";
}
function compiledContent$7() {
  return '<h1 id="rating--710">Rating : 7/10</h1>\n<h3 id="melancholy-fiction-dystopic"><em>Melancholy, Fiction, Dystopic</em></h3>\n<p>I went into this novel with expectations but was left with a sense of loss but in that good kind of way.\r\nNever Let Me Go, is a novel of a woman telling her story; similar to an autobiography.</p>\n<p>The book starts off:</p>\n<blockquote>\n<p>\u201CThere have been times over the years when I\u2019ve tried to leave Hailsham behind when I\u2019ve told myself I shouldn\u2019t look back so much. But then there came a point when I just stopped resisting. It had to do with this particular donor I had once, in my third year as a carer; it was his reaction when I mentioned I was from Hailsham.\u201D</p>\n</blockquote>\n<p>Centered around a school called Hailsham for children similar to that of an orphanage with a tinge of a concentration camp. The school is removed from society, in fact, society wants as little to do with them. The school is a place where children are taught to be responsible and to be kind to each other. Trained in litterature and art.</p>\n<p>In this retelling of Kathy\u2019s life, you get a sense of gloom and anxiety that pervades these children\u2019s lives even unbeknownst to them.</p>';
}
const $$metadata$7 = createMetadata("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/book/10-never-let-me-go.md", { modules: [{ module: $$module1$2, specifier: "@astrojs/markdown-remark/ssr-utils", assert: {} }, { module: $$module2, specifier: "../../layouts/BookPost.astro", assert: {} }, { module: $$module3$1, specifier: "../../components/Author.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$7 = createAstro("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/book/10-never-let-me-go.md", "http://localhost:3000/", "file:///C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/");
const $$10NeverLetMeGo = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$7, $$props, $$slots);
  Astro2.self = $$10NeverLetMeGo;
  const $$content = { "title": "Never Let Me Go by Kazuo Ishiguro", "publishDate": "20 APR 2020", "href": "https://twitter.com/_Hopelezz", "name": "Mark Spratt", "description": null, "img": "https://covers.openlibrary.org/b/id/6425427-L.jpg", "tags": "dystopic, Melancholy, Fiction, Organ donors, Cloning, Donation of organs, tissues, Women, Literature, New York Times bestseller, Human cloning, Science fiction, psychological, science fiction, general, England, School, children, Reminiscing, Friendship, English literature", "astro": { "headers": [{ "depth": 1, "slug": "rating--710", "text": "Rating : 7/10" }, { "depth": 3, "slug": "melancholy-fiction-dystopic", "text": "Melancholy, Fiction, Dystopic" }], "source": "\r\n# Rating : 7/10\r\n### _Melancholy, Fiction, Dystopic_\r\n\r\nI went into this novel with expectations but was left with a sense of loss but in that good kind of way.\r\nNever Let Me Go, is a novel of a woman telling her story; similar to an autobiography.\r\n\r\nThe book starts off:\r\n\r\n>\u201CThere have been times over the years when I\u2019ve tried to leave Hailsham behind when I\u2019ve told myself I shouldn\u2019t look back so much. But then there came a point when I just stopped resisting. It had to do with this particular donor I had once, in my third year as a carer; it was his reaction when I mentioned I was from Hailsham.\u201D\r\n\r\nCentered around a school called Hailsham for children similar to that of an orphanage with a tinge of a concentration camp. The school is removed from society, in fact, society wants as little to do with them. The school is a place where children are taught to be responsible and to be kind to each other. Trained in litterature and art.\r\n\r\nIn this retelling of Kathy's life, you get a sense of gloom and anxiety that pervades these children's lives even unbeknownst to them.", "html": '<h1 id="rating--710">Rating : 7/10</h1>\n<h3 id="melancholy-fiction-dystopic"><em>Melancholy, Fiction, Dystopic</em></h3>\n<p>I went into this novel with expectations but was left with a sense of loss but in that good kind of way.\r\nNever Let Me Go, is a novel of a woman telling her story; similar to an autobiography.</p>\n<p>The book starts off:</p>\n<blockquote>\n<p>\u201CThere have been times over the years when I\u2019ve tried to leave Hailsham behind when I\u2019ve told myself I shouldn\u2019t look back so much. But then there came a point when I just stopped resisting. It had to do with this particular donor I had once, in my third year as a carer; it was his reaction when I mentioned I was from Hailsham.\u201D</p>\n</blockquote>\n<p>Centered around a school called Hailsham for children similar to that of an orphanage with a tinge of a concentration camp. The school is removed from society, in fact, society wants as little to do with them. The school is a place where children are taught to be responsible and to be kind to each other. Trained in litterature and art.</p>\n<p>In this retelling of Kathy\u2019s life, you get a sense of gloom and anxiety that pervades these children\u2019s lives even unbeknownst to them.</p>' } };
  return render`${renderComponent($$result, "Layout", $$BookPost, { "content": $$content }, { "default": () => render`${maybeRenderHead($$result)}<h1 id="rating--710">Rating : 7/10</h1><h3 id="melancholy-fiction-dystopic"><em>Melancholy, Fiction, Dystopic</em></h3><p>I went into this novel with expectations but was left with a sense of loss but in that good kind of way.
Never Let Me Go, is a novel of a woman telling her story; similar to an autobiography.</p><p>The book starts off:</p><blockquote>
<p>“There have been times over the years when I’ve tried to leave Hailsham behind when I’ve told myself I shouldn’t look back so much. But then there came a point when I just stopped resisting. It had to do with this particular donor I had once, in my third year as a carer; it was his reaction when I mentioned I was from Hailsham.”</p>
</blockquote><p>Centered around a school called Hailsham for children similar to that of an orphanage with a tinge of a concentration camp. The school is removed from society, in fact, society wants as little to do with them. The school is a place where children are taught to be responsible and to be kind to each other. Trained in litterature and art.</p><p>In this retelling of Kathy’s life, you get a sense of gloom and anxiety that pervades these children’s lives even unbeknownst to them.</p>` })}`;
});

var _page9 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	metadata: metadata$7,
	frontmatter: frontmatter$7,
	rawContent: rawContent$7,
	compiledContent: compiledContent$7,
	$$metadata: $$metadata$7,
	'default': $$10NeverLetMeGo
}, Symbol.toStringTag, { value: 'Module' }));

const metadata$6 = { "headers": [{ "depth": 1, "slug": "rating--910", "text": "Rating : 9/10" }, { "depth": 3, "slug": "cyberpunk-scifi-action-adventure-dystopic-puzzles-virtual-reality-future-fiction", "text": "Cyberpunk, SciFi, Action, Adventure, Dystopic, Puzzles, Virtual Reality, Future, Fiction" }, { "depth": 5, "slug": "movies", "text": "Movies:" }, { "depth": 5, "slug": "books-all-amazing-authors", "text": "Books: (All Amazing Authors!)" }, { "depth": 5, "slug": "music", "text": "Music:" }, { "depth": 5, "slug": "tv-shows", "text": "TV Shows:" }, { "depth": 5, "slug": "games", "text": "GAMES:" }], "source": `\r
# Rating : 9/10\r
\r
### _Cyberpunk, SciFi, Action, Adventure, Dystopic, Puzzles, Virtual Reality, Future, Fiction_\r
\r
\r
I was hooked from the moment I started the book. Barely putting it down!\r
\r
>"Going outside is highly overrated"\r
\r
Ready Player One is set in a depraved world of the future, where people are desperate to 'escape' reality. Set in the future 2044, a boy named Wade Watts grows up learning everything he knows through a game called OASIS. OASIS is a Virtual Reality (VR) immersion platform free for anyone. OASIS is jammed packed with every literature, movie, game, song, ever created. All you have to do is access it. While the world is crumbling around them in despair at least everyone has the OASIS to forget their troubles. Wade in reality and virtually has no money to his name. Both mother and father died when he was younger and is in the custody of his aunt who treats him miserably. His aunt lives in the stacks which are futuristic trailer parks. (Trailers are stacked on top of one another held together by scaffolding and prayers.) Wade grows up forced to survive on his one for the most part, but thankfully there's OASIS. The creator of OASIS known in the game as Anorak. When the creator died, he gave the world of OASIS a VR treasure hunt that will set you back in your seats for a page-turning warp speed of a ride.\r
One of the reviews called it a Willy Wonka Meets the Matrix. Possibly the most app description to describe the book. The book is brimming with 80's nostalgia! While I'm more of a 90's kid I grew up with a lot of the pop references mentioned in RPO. It covers all the basis Movies, Books, Music, TV Shows, Games along with some other pop references to the 80's.\r
Just to give you an idea.\r
\r
##### Movies: \r
\r
- Montey Python\r
- Blade Runner\r
- Ghost Busters\r
- Back to the Future\r
- Ferris Buller's Day Off\r
- Weird Science\r
- WarGames\r
- Pretty in Pink\r
- Breakfast Club\r
\r
##### Books: (All Amazing Authors!)\r
- Vonnegut\r
- Orson Scott Card\r
- Stephen King\r
- Terry Pratchett\r
- J.R.R. Tolkien\r
- Douglas Adams\r
\r
##### Music: \r
\r
- SchoolHouse Rock\r
- Pat Benatar\r
- They Might Be Giants\r
- Rush\r
\r
##### TV Shows: \r
- A-Team\r
- Twilight Zone\r
- Gundam\r
- Spider-Man\r
- Ultraman\r
- Cowboy Bebop\r
- Kikaida\r
- Voltron\r
- Max Headroom\r
- Family Ties\r
- Star Trek\r
- Dr.Who\r
- The Cosmos\r
##### GAMES:\r
- PacMan\r
- Dig Dug\r
- Joust\r
- Black Tiger\r
- Adventure\r
- and many others\r
\r
>"As Terrifying and painful as reality can be, it's also the only place where you can find true happiness."`, "html": '<h1 id="rating--910">Rating : 9/10</h1>\n<h3 id="cyberpunk-scifi-action-adventure-dystopic-puzzles-virtual-reality-future-fiction"><em>Cyberpunk, SciFi, Action, Adventure, Dystopic, Puzzles, Virtual Reality, Future, Fiction</em></h3>\n<p>I was hooked from the moment I started the book. Barely putting it down!</p>\n<blockquote>\n<p>\u201CGoing outside is highly overrated\u201D</p>\n</blockquote>\n<p>Ready Player One is set in a depraved world of the future, where people are desperate to \u2018escape\u2019 reality. Set in the future 2044, a boy named Wade Watts grows up learning everything he knows through a game called OASIS. OASIS is a Virtual Reality (VR) immersion platform free for anyone. OASIS is jammed packed with every literature, movie, game, song, ever created. All you have to do is access it. While the world is crumbling around them in despair at least everyone has the OASIS to forget their troubles. Wade in reality and virtually has no money to his name. Both mother and father died when he was younger and is in the custody of his aunt who treats him miserably. His aunt lives in the stacks which are futuristic trailer parks. (Trailers are stacked on top of one another held together by scaffolding and prayers.) Wade grows up forced to survive on his one for the most part, but thankfully there\u2019s OASIS. The creator of OASIS known in the game as Anorak. When the creator died, he gave the world of OASIS a VR treasure hunt that will set you back in your seats for a page-turning warp speed of a ride.\r\nOne of the reviews called it a Willy Wonka Meets the Matrix. Possibly the most app description to describe the book. The book is brimming with 80\u2019s nostalgia! While I\u2019m more of a 90\u2019s kid I grew up with a lot of the pop references mentioned in RPO. It covers all the basis Movies, Books, Music, TV Shows, Games along with some other pop references to the 80\u2019s.\r\nJust to give you an idea.</p>\n<h5 id="movies">Movies:</h5>\n<ul>\n<li>Montey Python</li>\n<li>Blade Runner</li>\n<li>Ghost Busters</li>\n<li>Back to the Future</li>\n<li>Ferris Buller\u2019s Day Off</li>\n<li>Weird Science</li>\n<li>WarGames</li>\n<li>Pretty in Pink</li>\n<li>Breakfast Club</li>\n</ul>\n<h5 id="books-all-amazing-authors">Books: (All Amazing Authors!)</h5>\n<ul>\n<li>Vonnegut</li>\n<li>Orson Scott Card</li>\n<li>Stephen King</li>\n<li>Terry Pratchett</li>\n<li>J.R.R. Tolkien</li>\n<li>Douglas Adams</li>\n</ul>\n<h5 id="music">Music:</h5>\n<ul>\n<li>SchoolHouse Rock</li>\n<li>Pat Benatar</li>\n<li>They Might Be Giants</li>\n<li>Rush</li>\n</ul>\n<h5 id="tv-shows">TV Shows:</h5>\n<ul>\n<li>A-Team</li>\n<li>Twilight Zone</li>\n<li>Gundam</li>\n<li>Spider-Man</li>\n<li>Ultraman</li>\n<li>Cowboy Bebop</li>\n<li>Kikaida</li>\n<li>Voltron</li>\n<li>Max Headroom</li>\n<li>Family Ties</li>\n<li>Star Trek</li>\n<li>Dr.Who</li>\n<li>The Cosmos</li>\n</ul>\n<h5 id="games">GAMES:</h5>\n<ul>\n<li>PacMan</li>\n<li>Dig Dug</li>\n<li>Joust</li>\n<li>Black Tiger</li>\n<li>Adventure</li>\n<li>and many others</li>\n</ul>\n<blockquote>\n<p>\u201CAs Terrifying and painful as reality can be, it\u2019s also the only place where you can find true happiness.\u201D</p>\n</blockquote>' };
const frontmatter$6 = { "title": "Ready Player One by Ernest Cline", "publishDate": "02 OCT 2017", "href": "https://twitter.com/_Hopelezz", "name": "Mark Spratt", "description": "The story, set in a dystopia in 2045, follows protagonist Wade Watts on his search for an Easter egg in a worldwide virtual reality game", "img": "https://covers.openlibrary.org/b/id/8750149-L.jpg", "tags": "cyberpunk, science fiction, action, adventure, dystopian, Puzzles, Virtual reality, Future, Fiction, science fiction, action & adventure, dystopic", "astro": { "headers": [{ "depth": 1, "slug": "rating--910", "text": "Rating : 9/10" }, { "depth": 3, "slug": "cyberpunk-scifi-action-adventure-dystopic-puzzles-virtual-reality-future-fiction", "text": "Cyberpunk, SciFi, Action, Adventure, Dystopic, Puzzles, Virtual Reality, Future, Fiction" }, { "depth": 5, "slug": "movies", "text": "Movies:" }, { "depth": 5, "slug": "books-all-amazing-authors", "text": "Books: (All Amazing Authors!)" }, { "depth": 5, "slug": "music", "text": "Music:" }, { "depth": 5, "slug": "tv-shows", "text": "TV Shows:" }, { "depth": 5, "slug": "games", "text": "GAMES:" }], "source": `\r
# Rating : 9/10\r
\r
### _Cyberpunk, SciFi, Action, Adventure, Dystopic, Puzzles, Virtual Reality, Future, Fiction_\r
\r
\r
I was hooked from the moment I started the book. Barely putting it down!\r
\r
>"Going outside is highly overrated"\r
\r
Ready Player One is set in a depraved world of the future, where people are desperate to 'escape' reality. Set in the future 2044, a boy named Wade Watts grows up learning everything he knows through a game called OASIS. OASIS is a Virtual Reality (VR) immersion platform free for anyone. OASIS is jammed packed with every literature, movie, game, song, ever created. All you have to do is access it. While the world is crumbling around them in despair at least everyone has the OASIS to forget their troubles. Wade in reality and virtually has no money to his name. Both mother and father died when he was younger and is in the custody of his aunt who treats him miserably. His aunt lives in the stacks which are futuristic trailer parks. (Trailers are stacked on top of one another held together by scaffolding and prayers.) Wade grows up forced to survive on his one for the most part, but thankfully there's OASIS. The creator of OASIS known in the game as Anorak. When the creator died, he gave the world of OASIS a VR treasure hunt that will set you back in your seats for a page-turning warp speed of a ride.\r
One of the reviews called it a Willy Wonka Meets the Matrix. Possibly the most app description to describe the book. The book is brimming with 80's nostalgia! While I'm more of a 90's kid I grew up with a lot of the pop references mentioned in RPO. It covers all the basis Movies, Books, Music, TV Shows, Games along with some other pop references to the 80's.\r
Just to give you an idea.\r
\r
##### Movies: \r
\r
- Montey Python\r
- Blade Runner\r
- Ghost Busters\r
- Back to the Future\r
- Ferris Buller's Day Off\r
- Weird Science\r
- WarGames\r
- Pretty in Pink\r
- Breakfast Club\r
\r
##### Books: (All Amazing Authors!)\r
- Vonnegut\r
- Orson Scott Card\r
- Stephen King\r
- Terry Pratchett\r
- J.R.R. Tolkien\r
- Douglas Adams\r
\r
##### Music: \r
\r
- SchoolHouse Rock\r
- Pat Benatar\r
- They Might Be Giants\r
- Rush\r
\r
##### TV Shows: \r
- A-Team\r
- Twilight Zone\r
- Gundam\r
- Spider-Man\r
- Ultraman\r
- Cowboy Bebop\r
- Kikaida\r
- Voltron\r
- Max Headroom\r
- Family Ties\r
- Star Trek\r
- Dr.Who\r
- The Cosmos\r
##### GAMES:\r
- PacMan\r
- Dig Dug\r
- Joust\r
- Black Tiger\r
- Adventure\r
- and many others\r
\r
>"As Terrifying and painful as reality can be, it's also the only place where you can find true happiness."`, "html": '<h1 id="rating--910">Rating : 9/10</h1>\n<h3 id="cyberpunk-scifi-action-adventure-dystopic-puzzles-virtual-reality-future-fiction"><em>Cyberpunk, SciFi, Action, Adventure, Dystopic, Puzzles, Virtual Reality, Future, Fiction</em></h3>\n<p>I was hooked from the moment I started the book. Barely putting it down!</p>\n<blockquote>\n<p>\u201CGoing outside is highly overrated\u201D</p>\n</blockquote>\n<p>Ready Player One is set in a depraved world of the future, where people are desperate to \u2018escape\u2019 reality. Set in the future 2044, a boy named Wade Watts grows up learning everything he knows through a game called OASIS. OASIS is a Virtual Reality (VR) immersion platform free for anyone. OASIS is jammed packed with every literature, movie, game, song, ever created. All you have to do is access it. While the world is crumbling around them in despair at least everyone has the OASIS to forget their troubles. Wade in reality and virtually has no money to his name. Both mother and father died when he was younger and is in the custody of his aunt who treats him miserably. His aunt lives in the stacks which are futuristic trailer parks. (Trailers are stacked on top of one another held together by scaffolding and prayers.) Wade grows up forced to survive on his one for the most part, but thankfully there\u2019s OASIS. The creator of OASIS known in the game as Anorak. When the creator died, he gave the world of OASIS a VR treasure hunt that will set you back in your seats for a page-turning warp speed of a ride.\r\nOne of the reviews called it a Willy Wonka Meets the Matrix. Possibly the most app description to describe the book. The book is brimming with 80\u2019s nostalgia! While I\u2019m more of a 90\u2019s kid I grew up with a lot of the pop references mentioned in RPO. It covers all the basis Movies, Books, Music, TV Shows, Games along with some other pop references to the 80\u2019s.\r\nJust to give you an idea.</p>\n<h5 id="movies">Movies:</h5>\n<ul>\n<li>Montey Python</li>\n<li>Blade Runner</li>\n<li>Ghost Busters</li>\n<li>Back to the Future</li>\n<li>Ferris Buller\u2019s Day Off</li>\n<li>Weird Science</li>\n<li>WarGames</li>\n<li>Pretty in Pink</li>\n<li>Breakfast Club</li>\n</ul>\n<h5 id="books-all-amazing-authors">Books: (All Amazing Authors!)</h5>\n<ul>\n<li>Vonnegut</li>\n<li>Orson Scott Card</li>\n<li>Stephen King</li>\n<li>Terry Pratchett</li>\n<li>J.R.R. Tolkien</li>\n<li>Douglas Adams</li>\n</ul>\n<h5 id="music">Music:</h5>\n<ul>\n<li>SchoolHouse Rock</li>\n<li>Pat Benatar</li>\n<li>They Might Be Giants</li>\n<li>Rush</li>\n</ul>\n<h5 id="tv-shows">TV Shows:</h5>\n<ul>\n<li>A-Team</li>\n<li>Twilight Zone</li>\n<li>Gundam</li>\n<li>Spider-Man</li>\n<li>Ultraman</li>\n<li>Cowboy Bebop</li>\n<li>Kikaida</li>\n<li>Voltron</li>\n<li>Max Headroom</li>\n<li>Family Ties</li>\n<li>Star Trek</li>\n<li>Dr.Who</li>\n<li>The Cosmos</li>\n</ul>\n<h5 id="games">GAMES:</h5>\n<ul>\n<li>PacMan</li>\n<li>Dig Dug</li>\n<li>Joust</li>\n<li>Black Tiger</li>\n<li>Adventure</li>\n<li>and many others</li>\n</ul>\n<blockquote>\n<p>\u201CAs Terrifying and painful as reality can be, it\u2019s also the only place where you can find true happiness.\u201D</p>\n</blockquote>' } };
function rawContent$6() {
  return `\r
# Rating : 9/10\r
\r
### _Cyberpunk, SciFi, Action, Adventure, Dystopic, Puzzles, Virtual Reality, Future, Fiction_\r
\r
\r
I was hooked from the moment I started the book. Barely putting it down!\r
\r
>"Going outside is highly overrated"\r
\r
Ready Player One is set in a depraved world of the future, where people are desperate to 'escape' reality. Set in the future 2044, a boy named Wade Watts grows up learning everything he knows through a game called OASIS. OASIS is a Virtual Reality (VR) immersion platform free for anyone. OASIS is jammed packed with every literature, movie, game, song, ever created. All you have to do is access it. While the world is crumbling around them in despair at least everyone has the OASIS to forget their troubles. Wade in reality and virtually has no money to his name. Both mother and father died when he was younger and is in the custody of his aunt who treats him miserably. His aunt lives in the stacks which are futuristic trailer parks. (Trailers are stacked on top of one another held together by scaffolding and prayers.) Wade grows up forced to survive on his one for the most part, but thankfully there's OASIS. The creator of OASIS known in the game as Anorak. When the creator died, he gave the world of OASIS a VR treasure hunt that will set you back in your seats for a page-turning warp speed of a ride.\r
One of the reviews called it a Willy Wonka Meets the Matrix. Possibly the most app description to describe the book. The book is brimming with 80's nostalgia! While I'm more of a 90's kid I grew up with a lot of the pop references mentioned in RPO. It covers all the basis Movies, Books, Music, TV Shows, Games along with some other pop references to the 80's.\r
Just to give you an idea.\r
\r
##### Movies: \r
\r
- Montey Python\r
- Blade Runner\r
- Ghost Busters\r
- Back to the Future\r
- Ferris Buller's Day Off\r
- Weird Science\r
- WarGames\r
- Pretty in Pink\r
- Breakfast Club\r
\r
##### Books: (All Amazing Authors!)\r
- Vonnegut\r
- Orson Scott Card\r
- Stephen King\r
- Terry Pratchett\r
- J.R.R. Tolkien\r
- Douglas Adams\r
\r
##### Music: \r
\r
- SchoolHouse Rock\r
- Pat Benatar\r
- They Might Be Giants\r
- Rush\r
\r
##### TV Shows: \r
- A-Team\r
- Twilight Zone\r
- Gundam\r
- Spider-Man\r
- Ultraman\r
- Cowboy Bebop\r
- Kikaida\r
- Voltron\r
- Max Headroom\r
- Family Ties\r
- Star Trek\r
- Dr.Who\r
- The Cosmos\r
##### GAMES:\r
- PacMan\r
- Dig Dug\r
- Joust\r
- Black Tiger\r
- Adventure\r
- and many others\r
\r
>"As Terrifying and painful as reality can be, it's also the only place where you can find true happiness."`;
}
function compiledContent$6() {
  return '<h1 id="rating--910">Rating : 9/10</h1>\n<h3 id="cyberpunk-scifi-action-adventure-dystopic-puzzles-virtual-reality-future-fiction"><em>Cyberpunk, SciFi, Action, Adventure, Dystopic, Puzzles, Virtual Reality, Future, Fiction</em></h3>\n<p>I was hooked from the moment I started the book. Barely putting it down!</p>\n<blockquote>\n<p>\u201CGoing outside is highly overrated\u201D</p>\n</blockquote>\n<p>Ready Player One is set in a depraved world of the future, where people are desperate to \u2018escape\u2019 reality. Set in the future 2044, a boy named Wade Watts grows up learning everything he knows through a game called OASIS. OASIS is a Virtual Reality (VR) immersion platform free for anyone. OASIS is jammed packed with every literature, movie, game, song, ever created. All you have to do is access it. While the world is crumbling around them in despair at least everyone has the OASIS to forget their troubles. Wade in reality and virtually has no money to his name. Both mother and father died when he was younger and is in the custody of his aunt who treats him miserably. His aunt lives in the stacks which are futuristic trailer parks. (Trailers are stacked on top of one another held together by scaffolding and prayers.) Wade grows up forced to survive on his one for the most part, but thankfully there\u2019s OASIS. The creator of OASIS known in the game as Anorak. When the creator died, he gave the world of OASIS a VR treasure hunt that will set you back in your seats for a page-turning warp speed of a ride.\r\nOne of the reviews called it a Willy Wonka Meets the Matrix. Possibly the most app description to describe the book. The book is brimming with 80\u2019s nostalgia! While I\u2019m more of a 90\u2019s kid I grew up with a lot of the pop references mentioned in RPO. It covers all the basis Movies, Books, Music, TV Shows, Games along with some other pop references to the 80\u2019s.\r\nJust to give you an idea.</p>\n<h5 id="movies">Movies:</h5>\n<ul>\n<li>Montey Python</li>\n<li>Blade Runner</li>\n<li>Ghost Busters</li>\n<li>Back to the Future</li>\n<li>Ferris Buller\u2019s Day Off</li>\n<li>Weird Science</li>\n<li>WarGames</li>\n<li>Pretty in Pink</li>\n<li>Breakfast Club</li>\n</ul>\n<h5 id="books-all-amazing-authors">Books: (All Amazing Authors!)</h5>\n<ul>\n<li>Vonnegut</li>\n<li>Orson Scott Card</li>\n<li>Stephen King</li>\n<li>Terry Pratchett</li>\n<li>J.R.R. Tolkien</li>\n<li>Douglas Adams</li>\n</ul>\n<h5 id="music">Music:</h5>\n<ul>\n<li>SchoolHouse Rock</li>\n<li>Pat Benatar</li>\n<li>They Might Be Giants</li>\n<li>Rush</li>\n</ul>\n<h5 id="tv-shows">TV Shows:</h5>\n<ul>\n<li>A-Team</li>\n<li>Twilight Zone</li>\n<li>Gundam</li>\n<li>Spider-Man</li>\n<li>Ultraman</li>\n<li>Cowboy Bebop</li>\n<li>Kikaida</li>\n<li>Voltron</li>\n<li>Max Headroom</li>\n<li>Family Ties</li>\n<li>Star Trek</li>\n<li>Dr.Who</li>\n<li>The Cosmos</li>\n</ul>\n<h5 id="games">GAMES:</h5>\n<ul>\n<li>PacMan</li>\n<li>Dig Dug</li>\n<li>Joust</li>\n<li>Black Tiger</li>\n<li>Adventure</li>\n<li>and many others</li>\n</ul>\n<blockquote>\n<p>\u201CAs Terrifying and painful as reality can be, it\u2019s also the only place where you can find true happiness.\u201D</p>\n</blockquote>';
}
const $$metadata$6 = createMetadata("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/book/2-ready-player-one.md", { modules: [{ module: $$module1$2, specifier: "@astrojs/markdown-remark/ssr-utils", assert: {} }, { module: $$module2, specifier: "../../layouts/BookPost.astro", assert: {} }, { module: $$module3$1, specifier: "../../components/Author.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$6 = createAstro("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/book/2-ready-player-one.md", "http://localhost:3000/", "file:///C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/");
const $$2ReadyPlayerOne = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$6, $$props, $$slots);
  Astro2.self = $$2ReadyPlayerOne;
  const $$content = { "title": "Ready Player One by Ernest Cline", "publishDate": "02 OCT 2017", "href": "https://twitter.com/_Hopelezz", "name": "Mark Spratt", "description": "The story, set in a dystopia in 2045, follows protagonist Wade Watts on his search for an Easter egg in a worldwide virtual reality game", "img": "https://covers.openlibrary.org/b/id/8750149-L.jpg", "tags": "cyberpunk, science fiction, action, adventure, dystopian, Puzzles, Virtual reality, Future, Fiction, science fiction, action & adventure, dystopic", "astro": { "headers": [{ "depth": 1, "slug": "rating--910", "text": "Rating : 9/10" }, { "depth": 3, "slug": "cyberpunk-scifi-action-adventure-dystopic-puzzles-virtual-reality-future-fiction", "text": "Cyberpunk, SciFi, Action, Adventure, Dystopic, Puzzles, Virtual Reality, Future, Fiction" }, { "depth": 5, "slug": "movies", "text": "Movies:" }, { "depth": 5, "slug": "books-all-amazing-authors", "text": "Books: (All Amazing Authors!)" }, { "depth": 5, "slug": "music", "text": "Music:" }, { "depth": 5, "slug": "tv-shows", "text": "TV Shows:" }, { "depth": 5, "slug": "games", "text": "GAMES:" }], "source": `\r
# Rating : 9/10\r
\r
### _Cyberpunk, SciFi, Action, Adventure, Dystopic, Puzzles, Virtual Reality, Future, Fiction_\r
\r
\r
I was hooked from the moment I started the book. Barely putting it down!\r
\r
>"Going outside is highly overrated"\r
\r
Ready Player One is set in a depraved world of the future, where people are desperate to 'escape' reality. Set in the future 2044, a boy named Wade Watts grows up learning everything he knows through a game called OASIS. OASIS is a Virtual Reality (VR) immersion platform free for anyone. OASIS is jammed packed with every literature, movie, game, song, ever created. All you have to do is access it. While the world is crumbling around them in despair at least everyone has the OASIS to forget their troubles. Wade in reality and virtually has no money to his name. Both mother and father died when he was younger and is in the custody of his aunt who treats him miserably. His aunt lives in the stacks which are futuristic trailer parks. (Trailers are stacked on top of one another held together by scaffolding and prayers.) Wade grows up forced to survive on his one for the most part, but thankfully there's OASIS. The creator of OASIS known in the game as Anorak. When the creator died, he gave the world of OASIS a VR treasure hunt that will set you back in your seats for a page-turning warp speed of a ride.\r
One of the reviews called it a Willy Wonka Meets the Matrix. Possibly the most app description to describe the book. The book is brimming with 80's nostalgia! While I'm more of a 90's kid I grew up with a lot of the pop references mentioned in RPO. It covers all the basis Movies, Books, Music, TV Shows, Games along with some other pop references to the 80's.\r
Just to give you an idea.\r
\r
##### Movies: \r
\r
- Montey Python\r
- Blade Runner\r
- Ghost Busters\r
- Back to the Future\r
- Ferris Buller's Day Off\r
- Weird Science\r
- WarGames\r
- Pretty in Pink\r
- Breakfast Club\r
\r
##### Books: (All Amazing Authors!)\r
- Vonnegut\r
- Orson Scott Card\r
- Stephen King\r
- Terry Pratchett\r
- J.R.R. Tolkien\r
- Douglas Adams\r
\r
##### Music: \r
\r
- SchoolHouse Rock\r
- Pat Benatar\r
- They Might Be Giants\r
- Rush\r
\r
##### TV Shows: \r
- A-Team\r
- Twilight Zone\r
- Gundam\r
- Spider-Man\r
- Ultraman\r
- Cowboy Bebop\r
- Kikaida\r
- Voltron\r
- Max Headroom\r
- Family Ties\r
- Star Trek\r
- Dr.Who\r
- The Cosmos\r
##### GAMES:\r
- PacMan\r
- Dig Dug\r
- Joust\r
- Black Tiger\r
- Adventure\r
- and many others\r
\r
>"As Terrifying and painful as reality can be, it's also the only place where you can find true happiness."`, "html": '<h1 id="rating--910">Rating : 9/10</h1>\n<h3 id="cyberpunk-scifi-action-adventure-dystopic-puzzles-virtual-reality-future-fiction"><em>Cyberpunk, SciFi, Action, Adventure, Dystopic, Puzzles, Virtual Reality, Future, Fiction</em></h3>\n<p>I was hooked from the moment I started the book. Barely putting it down!</p>\n<blockquote>\n<p>\u201CGoing outside is highly overrated\u201D</p>\n</blockquote>\n<p>Ready Player One is set in a depraved world of the future, where people are desperate to \u2018escape\u2019 reality. Set in the future 2044, a boy named Wade Watts grows up learning everything he knows through a game called OASIS. OASIS is a Virtual Reality (VR) immersion platform free for anyone. OASIS is jammed packed with every literature, movie, game, song, ever created. All you have to do is access it. While the world is crumbling around them in despair at least everyone has the OASIS to forget their troubles. Wade in reality and virtually has no money to his name. Both mother and father died when he was younger and is in the custody of his aunt who treats him miserably. His aunt lives in the stacks which are futuristic trailer parks. (Trailers are stacked on top of one another held together by scaffolding and prayers.) Wade grows up forced to survive on his one for the most part, but thankfully there\u2019s OASIS. The creator of OASIS known in the game as Anorak. When the creator died, he gave the world of OASIS a VR treasure hunt that will set you back in your seats for a page-turning warp speed of a ride.\r\nOne of the reviews called it a Willy Wonka Meets the Matrix. Possibly the most app description to describe the book. The book is brimming with 80\u2019s nostalgia! While I\u2019m more of a 90\u2019s kid I grew up with a lot of the pop references mentioned in RPO. It covers all the basis Movies, Books, Music, TV Shows, Games along with some other pop references to the 80\u2019s.\r\nJust to give you an idea.</p>\n<h5 id="movies">Movies:</h5>\n<ul>\n<li>Montey Python</li>\n<li>Blade Runner</li>\n<li>Ghost Busters</li>\n<li>Back to the Future</li>\n<li>Ferris Buller\u2019s Day Off</li>\n<li>Weird Science</li>\n<li>WarGames</li>\n<li>Pretty in Pink</li>\n<li>Breakfast Club</li>\n</ul>\n<h5 id="books-all-amazing-authors">Books: (All Amazing Authors!)</h5>\n<ul>\n<li>Vonnegut</li>\n<li>Orson Scott Card</li>\n<li>Stephen King</li>\n<li>Terry Pratchett</li>\n<li>J.R.R. Tolkien</li>\n<li>Douglas Adams</li>\n</ul>\n<h5 id="music">Music:</h5>\n<ul>\n<li>SchoolHouse Rock</li>\n<li>Pat Benatar</li>\n<li>They Might Be Giants</li>\n<li>Rush</li>\n</ul>\n<h5 id="tv-shows">TV Shows:</h5>\n<ul>\n<li>A-Team</li>\n<li>Twilight Zone</li>\n<li>Gundam</li>\n<li>Spider-Man</li>\n<li>Ultraman</li>\n<li>Cowboy Bebop</li>\n<li>Kikaida</li>\n<li>Voltron</li>\n<li>Max Headroom</li>\n<li>Family Ties</li>\n<li>Star Trek</li>\n<li>Dr.Who</li>\n<li>The Cosmos</li>\n</ul>\n<h5 id="games">GAMES:</h5>\n<ul>\n<li>PacMan</li>\n<li>Dig Dug</li>\n<li>Joust</li>\n<li>Black Tiger</li>\n<li>Adventure</li>\n<li>and many others</li>\n</ul>\n<blockquote>\n<p>\u201CAs Terrifying and painful as reality can be, it\u2019s also the only place where you can find true happiness.\u201D</p>\n</blockquote>' } };
  return render`${renderComponent($$result, "Layout", $$BookPost, { "content": $$content }, { "default": () => render`${maybeRenderHead($$result)}<h1 id="rating--910">Rating : 9/10</h1><h3 id="cyberpunk-scifi-action-adventure-dystopic-puzzles-virtual-reality-future-fiction"><em>Cyberpunk, SciFi, Action, Adventure, Dystopic, Puzzles, Virtual Reality, Future, Fiction</em></h3><p>I was hooked from the moment I started the book. Barely putting it down!</p><blockquote>
<p>“Going outside is highly overrated”</p>
</blockquote><p>Ready Player One is set in a depraved world of the future, where people are desperate to ‘escape’ reality. Set in the future 2044, a boy named Wade Watts grows up learning everything he knows through a game called OASIS. OASIS is a Virtual Reality (VR) immersion platform free for anyone. OASIS is jammed packed with every literature, movie, game, song, ever created. All you have to do is access it. While the world is crumbling around them in despair at least everyone has the OASIS to forget their troubles. Wade in reality and virtually has no money to his name. Both mother and father died when he was younger and is in the custody of his aunt who treats him miserably. His aunt lives in the stacks which are futuristic trailer parks. (Trailers are stacked on top of one another held together by scaffolding and prayers.) Wade grows up forced to survive on his one for the most part, but thankfully there’s OASIS. The creator of OASIS known in the game as Anorak. When the creator died, he gave the world of OASIS a VR treasure hunt that will set you back in your seats for a page-turning warp speed of a ride.
One of the reviews called it a Willy Wonka Meets the Matrix. Possibly the most app description to describe the book. The book is brimming with 80’s nostalgia! While I’m more of a 90’s kid I grew up with a lot of the pop references mentioned in RPO. It covers all the basis Movies, Books, Music, TV Shows, Games along with some other pop references to the 80’s.
Just to give you an idea.</p><h5 id="movies">Movies:</h5><ul>
<li>Montey Python</li>
<li>Blade Runner</li>
<li>Ghost Busters</li>
<li>Back to the Future</li>
<li>Ferris Buller’s Day Off</li>
<li>Weird Science</li>
<li>WarGames</li>
<li>Pretty in Pink</li>
<li>Breakfast Club</li>
</ul><h5 id="books-all-amazing-authors">Books: (All Amazing Authors!)</h5><ul>
<li>Vonnegut</li>
<li>Orson Scott Card</li>
<li>Stephen King</li>
<li>Terry Pratchett</li>
<li>J.R.R. Tolkien</li>
<li>Douglas Adams</li>
</ul><h5 id="music">Music:</h5><ul>
<li>SchoolHouse Rock</li>
<li>Pat Benatar</li>
<li>They Might Be Giants</li>
<li>Rush</li>
</ul><h5 id="tv-shows">TV Shows:</h5><ul>
<li>A-Team</li>
<li>Twilight Zone</li>
<li>Gundam</li>
<li>Spider-Man</li>
<li>Ultraman</li>
<li>Cowboy Bebop</li>
<li>Kikaida</li>
<li>Voltron</li>
<li>Max Headroom</li>
<li>Family Ties</li>
<li>Star Trek</li>
<li>Dr.Who</li>
<li>The Cosmos</li>
</ul><h5 id="games">GAMES:</h5><ul>
<li>PacMan</li>
<li>Dig Dug</li>
<li>Joust</li>
<li>Black Tiger</li>
<li>Adventure</li>
<li>and many others</li>
</ul><blockquote>
<p>“As Terrifying and painful as reality can be, it’s also the only place where you can find true happiness.”</p>
</blockquote>` })}`;
});

var _page10 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	metadata: metadata$6,
	frontmatter: frontmatter$6,
	rawContent: rawContent$6,
	compiledContent: compiledContent$6,
	$$metadata: $$metadata$6,
	'default': $$2ReadyPlayerOne
}, Symbol.toStringTag, { value: 'Module' }));

const metadata$5 = { "headers": [{ "depth": 1, "slug": "rating--810", "text": "Rating : 8/10" }, { "depth": 3, "slug": "classics-literature-psychology-feminism-novel-poetry-mental-health", "text": "Classics, Literature, Psychology, Feminism, Novel, Poetry, Mental Health" }], "source": '\r\n# Rating : 8/10\r\n### _Classics, Literature, Psychology, Feminism, Novel, Poetry, Mental Health_\r\n\r\n_This book could be a trigger for those who deal with <u>suicidal tendencies</u>._\r\n\r\nReading The Bell Jar, I felt the pathos that are heavily inlaid into the story of this semi-autobiographical novel and it melted my heart.\r\n\r\n>\u201CIt was a queer, sultry summer, the summer they electrocuted the Rosenbergs, and I didn\u2019t know what I was doing in New York.\u201D\r\n\r\nAnd thus the tale of Esther Greenwood, our Protagonist, begins. The book covers her struggles through relationships, abuse, and the pressure of an adult life, encapsulated through the lens of teen angst. All to the point she starts to suffocate and spiral out of control. Forced into therapy, but it goes horribly wrong. \r\n\r\nI would love to tell you about different details about the book past this point, but I can\u2019t for fear I would be devoiding you of the same ambivalent feeling in which I was consumed with.\r\n\r\nOr in Esther\u2019s own words:\r\n>\u201CI felt very still and empty, the way the eye of a tornado must feel, moving dully along in the middle of the surrounding hullabaloo.\u201D\r\n\r\nI\u2019ve come to the conclusion I\u2019m not fond much of teen angst because it only translates to me as "snooty". Mind you, my feelings were just my experience with the characters in this Novel and Catcher in the Rye, which I read back to back. Many others have found both novels amusing in a seriocomic sort of way. Anyhow, please give this book a serious look as you\u2019re deciding on which book to read next!', "html": '<h1 id="rating--810">Rating : 8/10</h1>\n<h3 id="classics-literature-psychology-feminism-novel-poetry-mental-health"><em>Classics, Literature, Psychology, Feminism, Novel, Poetry, Mental Health</em></h3>\n<p><em>This book could be a trigger for those who deal with <u>suicidal tendencies</u>.</em></p>\n<p>Reading The Bell Jar, I felt the pathos that are heavily inlaid into the story of this semi-autobiographical novel and it melted my heart.</p>\n<blockquote>\n<p>\u201CIt was a queer, sultry summer, the summer they electrocuted the Rosenbergs, and I didn\u2019t know what I was doing in New York.\u201D</p>\n</blockquote>\n<p>And thus the tale of Esther Greenwood, our Protagonist, begins. The book covers her struggles through relationships, abuse, and the pressure of an adult life, encapsulated through the lens of teen angst. All to the point she starts to suffocate and spiral out of control. Forced into therapy, but it goes horribly wrong.</p>\n<p>I would love to tell you about different details about the book past this point, but I can\u2019t for fear I would be devoiding you of the same ambivalent feeling in which I was consumed with.</p>\n<p>Or in Esther\u2019s own words:</p>\n<blockquote>\n<p>\u201CI felt very still and empty, the way the eye of a tornado must feel, moving dully along in the middle of the surrounding hullabaloo.\u201D</p>\n</blockquote>\n<p>I\u2019ve come to the conclusion I\u2019m not fond much of teen angst because it only translates to me as \u201Csnooty\u201D. Mind you, my feelings were just my experience with the characters in this Novel and Catcher in the Rye, which I read back to back. Many others have found both novels amusing in a seriocomic sort of way. Anyhow, please give this book a serious look as you\u2019re deciding on which book to read next!</p>' };
const frontmatter$5 = { "title": "The Bell Jar by Sylvia Plath", "publishDate": "05 Oct 2017", "href": "https://twitter.com/_Hopelezz", "name": "Mark Spratt", "description": "A semi-autobiographical with the names of places and people changed. The book is", "img": "https://covers.openlibrary.org/b/id/8457807-L.jpg", "tags": "women college students, summer, Classics, Literature, Psychology, Feminism, Novel, Poetry, Mental Health, American, Adult, Fiction, Mental Depression, Suicidal behavior, Mentally ill, Psychiatric hospital patients, Mental illness, Women authors, Treatment, Women periodical editors, College students, Suicide, Psychological fiction, Autobiographical fiction, Roman \xE0 clef, open_syllabus_project, Women psychotherapy patients, Fiction, psychological, American fiction (fictional works by one author), Young women, fiction, Students, fiction, Children's fiction, Depression, mental, fiction, Fiction, biographical, Fiction, general, New york (n.y.), fiction, Large type books, American literature", "astro": { "headers": [{ "depth": 1, "slug": "rating--810", "text": "Rating : 8/10" }, { "depth": 3, "slug": "classics-literature-psychology-feminism-novel-poetry-mental-health", "text": "Classics, Literature, Psychology, Feminism, Novel, Poetry, Mental Health" }], "source": '\r\n# Rating : 8/10\r\n### _Classics, Literature, Psychology, Feminism, Novel, Poetry, Mental Health_\r\n\r\n_This book could be a trigger for those who deal with <u>suicidal tendencies</u>._\r\n\r\nReading The Bell Jar, I felt the pathos that are heavily inlaid into the story of this semi-autobiographical novel and it melted my heart.\r\n\r\n>\u201CIt was a queer, sultry summer, the summer they electrocuted the Rosenbergs, and I didn\u2019t know what I was doing in New York.\u201D\r\n\r\nAnd thus the tale of Esther Greenwood, our Protagonist, begins. The book covers her struggles through relationships, abuse, and the pressure of an adult life, encapsulated through the lens of teen angst. All to the point she starts to suffocate and spiral out of control. Forced into therapy, but it goes horribly wrong. \r\n\r\nI would love to tell you about different details about the book past this point, but I can\u2019t for fear I would be devoiding you of the same ambivalent feeling in which I was consumed with.\r\n\r\nOr in Esther\u2019s own words:\r\n>\u201CI felt very still and empty, the way the eye of a tornado must feel, moving dully along in the middle of the surrounding hullabaloo.\u201D\r\n\r\nI\u2019ve come to the conclusion I\u2019m not fond much of teen angst because it only translates to me as "snooty". Mind you, my feelings were just my experience with the characters in this Novel and Catcher in the Rye, which I read back to back. Many others have found both novels amusing in a seriocomic sort of way. Anyhow, please give this book a serious look as you\u2019re deciding on which book to read next!', "html": '<h1 id="rating--810">Rating : 8/10</h1>\n<h3 id="classics-literature-psychology-feminism-novel-poetry-mental-health"><em>Classics, Literature, Psychology, Feminism, Novel, Poetry, Mental Health</em></h3>\n<p><em>This book could be a trigger for those who deal with <u>suicidal tendencies</u>.</em></p>\n<p>Reading The Bell Jar, I felt the pathos that are heavily inlaid into the story of this semi-autobiographical novel and it melted my heart.</p>\n<blockquote>\n<p>\u201CIt was a queer, sultry summer, the summer they electrocuted the Rosenbergs, and I didn\u2019t know what I was doing in New York.\u201D</p>\n</blockquote>\n<p>And thus the tale of Esther Greenwood, our Protagonist, begins. The book covers her struggles through relationships, abuse, and the pressure of an adult life, encapsulated through the lens of teen angst. All to the point she starts to suffocate and spiral out of control. Forced into therapy, but it goes horribly wrong.</p>\n<p>I would love to tell you about different details about the book past this point, but I can\u2019t for fear I would be devoiding you of the same ambivalent feeling in which I was consumed with.</p>\n<p>Or in Esther\u2019s own words:</p>\n<blockquote>\n<p>\u201CI felt very still and empty, the way the eye of a tornado must feel, moving dully along in the middle of the surrounding hullabaloo.\u201D</p>\n</blockquote>\n<p>I\u2019ve come to the conclusion I\u2019m not fond much of teen angst because it only translates to me as \u201Csnooty\u201D. Mind you, my feelings were just my experience with the characters in this Novel and Catcher in the Rye, which I read back to back. Many others have found both novels amusing in a seriocomic sort of way. Anyhow, please give this book a serious look as you\u2019re deciding on which book to read next!</p>' } };
function rawContent$5() {
  return '\r\n# Rating : 8/10\r\n### _Classics, Literature, Psychology, Feminism, Novel, Poetry, Mental Health_\r\n\r\n_This book could be a trigger for those who deal with <u>suicidal tendencies</u>._\r\n\r\nReading The Bell Jar, I felt the pathos that are heavily inlaid into the story of this semi-autobiographical novel and it melted my heart.\r\n\r\n>\u201CIt was a queer, sultry summer, the summer they electrocuted the Rosenbergs, and I didn\u2019t know what I was doing in New York.\u201D\r\n\r\nAnd thus the tale of Esther Greenwood, our Protagonist, begins. The book covers her struggles through relationships, abuse, and the pressure of an adult life, encapsulated through the lens of teen angst. All to the point she starts to suffocate and spiral out of control. Forced into therapy, but it goes horribly wrong. \r\n\r\nI would love to tell you about different details about the book past this point, but I can\u2019t for fear I would be devoiding you of the same ambivalent feeling in which I was consumed with.\r\n\r\nOr in Esther\u2019s own words:\r\n>\u201CI felt very still and empty, the way the eye of a tornado must feel, moving dully along in the middle of the surrounding hullabaloo.\u201D\r\n\r\nI\u2019ve come to the conclusion I\u2019m not fond much of teen angst because it only translates to me as "snooty". Mind you, my feelings were just my experience with the characters in this Novel and Catcher in the Rye, which I read back to back. Many others have found both novels amusing in a seriocomic sort of way. Anyhow, please give this book a serious look as you\u2019re deciding on which book to read next!';
}
function compiledContent$5() {
  return '<h1 id="rating--810">Rating : 8/10</h1>\n<h3 id="classics-literature-psychology-feminism-novel-poetry-mental-health"><em>Classics, Literature, Psychology, Feminism, Novel, Poetry, Mental Health</em></h3>\n<p><em>This book could be a trigger for those who deal with <u>suicidal tendencies</u>.</em></p>\n<p>Reading The Bell Jar, I felt the pathos that are heavily inlaid into the story of this semi-autobiographical novel and it melted my heart.</p>\n<blockquote>\n<p>\u201CIt was a queer, sultry summer, the summer they electrocuted the Rosenbergs, and I didn\u2019t know what I was doing in New York.\u201D</p>\n</blockquote>\n<p>And thus the tale of Esther Greenwood, our Protagonist, begins. The book covers her struggles through relationships, abuse, and the pressure of an adult life, encapsulated through the lens of teen angst. All to the point she starts to suffocate and spiral out of control. Forced into therapy, but it goes horribly wrong.</p>\n<p>I would love to tell you about different details about the book past this point, but I can\u2019t for fear I would be devoiding you of the same ambivalent feeling in which I was consumed with.</p>\n<p>Or in Esther\u2019s own words:</p>\n<blockquote>\n<p>\u201CI felt very still and empty, the way the eye of a tornado must feel, moving dully along in the middle of the surrounding hullabaloo.\u201D</p>\n</blockquote>\n<p>I\u2019ve come to the conclusion I\u2019m not fond much of teen angst because it only translates to me as \u201Csnooty\u201D. Mind you, my feelings were just my experience with the characters in this Novel and Catcher in the Rye, which I read back to back. Many others have found both novels amusing in a seriocomic sort of way. Anyhow, please give this book a serious look as you\u2019re deciding on which book to read next!</p>';
}
const $$metadata$5 = createMetadata("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/book/4-the-bell-jar.md", { modules: [{ module: $$module1$2, specifier: "@astrojs/markdown-remark/ssr-utils", assert: {} }, { module: $$module2, specifier: "../../layouts/BookPost.astro", assert: {} }, { module: $$module3$1, specifier: "../../components/Author.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$5 = createAstro("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/book/4-the-bell-jar.md", "http://localhost:3000/", "file:///C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/");
const $$4TheBellJar = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$5, $$props, $$slots);
  Astro2.self = $$4TheBellJar;
  const $$content = { "title": "The Bell Jar by Sylvia Plath", "publishDate": "05 Oct 2017", "href": "https://twitter.com/_Hopelezz", "name": "Mark Spratt", "description": "A semi-autobiographical with the names of places and people changed. The book is", "img": "https://covers.openlibrary.org/b/id/8457807-L.jpg", "tags": "women college students, summer, Classics, Literature, Psychology, Feminism, Novel, Poetry, Mental Health, American, Adult, Fiction, Mental Depression, Suicidal behavior, Mentally ill, Psychiatric hospital patients, Mental illness, Women authors, Treatment, Women periodical editors, College students, Suicide, Psychological fiction, Autobiographical fiction, Roman \xE0 clef, open_syllabus_project, Women psychotherapy patients, Fiction, psychological, American fiction (fictional works by one author), Young women, fiction, Students, fiction, Children's fiction, Depression, mental, fiction, Fiction, biographical, Fiction, general, New york (n.y.), fiction, Large type books, American literature", "astro": { "headers": [{ "depth": 1, "slug": "rating--810", "text": "Rating : 8/10" }, { "depth": 3, "slug": "classics-literature-psychology-feminism-novel-poetry-mental-health", "text": "Classics, Literature, Psychology, Feminism, Novel, Poetry, Mental Health" }], "source": '\r\n# Rating : 8/10\r\n### _Classics, Literature, Psychology, Feminism, Novel, Poetry, Mental Health_\r\n\r\n_This book could be a trigger for those who deal with <u>suicidal tendencies</u>._\r\n\r\nReading The Bell Jar, I felt the pathos that are heavily inlaid into the story of this semi-autobiographical novel and it melted my heart.\r\n\r\n>\u201CIt was a queer, sultry summer, the summer they electrocuted the Rosenbergs, and I didn\u2019t know what I was doing in New York.\u201D\r\n\r\nAnd thus the tale of Esther Greenwood, our Protagonist, begins. The book covers her struggles through relationships, abuse, and the pressure of an adult life, encapsulated through the lens of teen angst. All to the point she starts to suffocate and spiral out of control. Forced into therapy, but it goes horribly wrong. \r\n\r\nI would love to tell you about different details about the book past this point, but I can\u2019t for fear I would be devoiding you of the same ambivalent feeling in which I was consumed with.\r\n\r\nOr in Esther\u2019s own words:\r\n>\u201CI felt very still and empty, the way the eye of a tornado must feel, moving dully along in the middle of the surrounding hullabaloo.\u201D\r\n\r\nI\u2019ve come to the conclusion I\u2019m not fond much of teen angst because it only translates to me as "snooty". Mind you, my feelings were just my experience with the characters in this Novel and Catcher in the Rye, which I read back to back. Many others have found both novels amusing in a seriocomic sort of way. Anyhow, please give this book a serious look as you\u2019re deciding on which book to read next!', "html": '<h1 id="rating--810">Rating : 8/10</h1>\n<h3 id="classics-literature-psychology-feminism-novel-poetry-mental-health"><em>Classics, Literature, Psychology, Feminism, Novel, Poetry, Mental Health</em></h3>\n<p><em>This book could be a trigger for those who deal with <u>suicidal tendencies</u>.</em></p>\n<p>Reading The Bell Jar, I felt the pathos that are heavily inlaid into the story of this semi-autobiographical novel and it melted my heart.</p>\n<blockquote>\n<p>\u201CIt was a queer, sultry summer, the summer they electrocuted the Rosenbergs, and I didn\u2019t know what I was doing in New York.\u201D</p>\n</blockquote>\n<p>And thus the tale of Esther Greenwood, our Protagonist, begins. The book covers her struggles through relationships, abuse, and the pressure of an adult life, encapsulated through the lens of teen angst. All to the point she starts to suffocate and spiral out of control. Forced into therapy, but it goes horribly wrong.</p>\n<p>I would love to tell you about different details about the book past this point, but I can\u2019t for fear I would be devoiding you of the same ambivalent feeling in which I was consumed with.</p>\n<p>Or in Esther\u2019s own words:</p>\n<blockquote>\n<p>\u201CI felt very still and empty, the way the eye of a tornado must feel, moving dully along in the middle of the surrounding hullabaloo.\u201D</p>\n</blockquote>\n<p>I\u2019ve come to the conclusion I\u2019m not fond much of teen angst because it only translates to me as \u201Csnooty\u201D. Mind you, my feelings were just my experience with the characters in this Novel and Catcher in the Rye, which I read back to back. Many others have found both novels amusing in a seriocomic sort of way. Anyhow, please give this book a serious look as you\u2019re deciding on which book to read next!</p>' } };
  return render`${renderComponent($$result, "Layout", $$BookPost, { "content": $$content }, { "default": () => render`${maybeRenderHead($$result)}<h1 id="rating--810">Rating : 8/10</h1><h3 id="classics-literature-psychology-feminism-novel-poetry-mental-health"><em>Classics, Literature, Psychology, Feminism, Novel, Poetry, Mental Health</em></h3><p><em>This book could be a trigger for those who deal with <u>suicidal tendencies</u>.</em></p><p>Reading The Bell Jar, I felt the pathos that are heavily inlaid into the story of this semi-autobiographical novel and it melted my heart.</p><blockquote>
<p>“It was a queer, sultry summer, the summer they electrocuted the Rosenbergs, and I didn’t know what I was doing in New York.”</p>
</blockquote><p>And thus the tale of Esther Greenwood, our Protagonist, begins. The book covers her struggles through relationships, abuse, and the pressure of an adult life, encapsulated through the lens of teen angst. All to the point she starts to suffocate and spiral out of control. Forced into therapy, but it goes horribly wrong.</p><p>I would love to tell you about different details about the book past this point, but I can’t for fear I would be devoiding you of the same ambivalent feeling in which I was consumed with.</p><p>Or in Esther’s own words:</p><blockquote>
<p>“I felt very still and empty, the way the eye of a tornado must feel, moving dully along in the middle of the surrounding hullabaloo.”</p>
</blockquote><p>I’ve come to the conclusion I’m not fond much of teen angst because it only translates to me as “snooty”. Mind you, my feelings were just my experience with the characters in this Novel and Catcher in the Rye, which I read back to back. Many others have found both novels amusing in a seriocomic sort of way. Anyhow, please give this book a serious look as you’re deciding on which book to read next!</p>` })}`;
});

var _page11 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	metadata: metadata$5,
	frontmatter: frontmatter$5,
	rawContent: rawContent$5,
	compiledContent: compiledContent$5,
	$$metadata: $$metadata$5,
	'default': $$4TheBellJar
}, Symbol.toStringTag, { value: 'Module' }));

const metadata$4 = { "headers": [{ "depth": 1, "slug": "rating--1010", "text": "Rating : 10/10" }, { "depth": 3, "slug": "sci-fi-comedy", "text": "Sci-fi, Comedy" }], "source": "\r\n# Rating : 10/10\r\n\r\n### _Sci-fi, Comedy_\r\n\r\nHitchhickers guide to the Galaxy meets Stormship troopers! Old Man's War is brilliantly written! Scalzi has some of the freshest and most unique take on future tech I've come across in a while.\r\n\r\nPremise of the story is people who turn 75 can apply for the colonial forces, but have to give up everything they know. In exchange they get a fresh new body for as long as they serve in the fleet. During their stay they fight several diverse and sometimes brutal types of aliens.", "html": '<h1 id="rating--1010">Rating : 10/10</h1>\n<h3 id="sci-fi-comedy"><em>Sci-fi, Comedy</em></h3>\n<p>Hitchhickers guide to the Galaxy meets Stormship troopers! Old Man\u2019s War is brilliantly written! Scalzi has some of the freshest and most unique take on future tech I\u2019ve come across in a while.</p>\n<p>Premise of the story is people who turn 75 can apply for the colonial forces, but have to give up everything they know. In exchange they get a fresh new body for as long as they serve in the fleet. During their stay they fight several diverse and sometimes brutal types of aliens.</p>' };
const frontmatter$4 = { "title": "Old Man's War by John Scalzi", "publishDate": "2 MAR 2019", "href": "https://twitter.com/_Hopelezz", "name": "Mark Spratt", "description": "Hitchhickers guide to the Galaxy meets Stormship troopers!", "img": "https://covers.openlibrary.org/b/id/3365280-L.jpg", "tags": "Sci-fi, Comedy, Charming, Is-A-Movie", "astro": { "headers": [{ "depth": 1, "slug": "rating--1010", "text": "Rating : 10/10" }, { "depth": 3, "slug": "sci-fi-comedy", "text": "Sci-fi, Comedy" }], "source": "\r\n# Rating : 10/10\r\n\r\n### _Sci-fi, Comedy_\r\n\r\nHitchhickers guide to the Galaxy meets Stormship troopers! Old Man's War is brilliantly written! Scalzi has some of the freshest and most unique take on future tech I've come across in a while.\r\n\r\nPremise of the story is people who turn 75 can apply for the colonial forces, but have to give up everything they know. In exchange they get a fresh new body for as long as they serve in the fleet. During their stay they fight several diverse and sometimes brutal types of aliens.", "html": '<h1 id="rating--1010">Rating : 10/10</h1>\n<h3 id="sci-fi-comedy"><em>Sci-fi, Comedy</em></h3>\n<p>Hitchhickers guide to the Galaxy meets Stormship troopers! Old Man\u2019s War is brilliantly written! Scalzi has some of the freshest and most unique take on future tech I\u2019ve come across in a while.</p>\n<p>Premise of the story is people who turn 75 can apply for the colonial forces, but have to give up everything they know. In exchange they get a fresh new body for as long as they serve in the fleet. During their stay they fight several diverse and sometimes brutal types of aliens.</p>' } };
function rawContent$4() {
  return "\r\n# Rating : 10/10\r\n\r\n### _Sci-fi, Comedy_\r\n\r\nHitchhickers guide to the Galaxy meets Stormship troopers! Old Man's War is brilliantly written! Scalzi has some of the freshest and most unique take on future tech I've come across in a while.\r\n\r\nPremise of the story is people who turn 75 can apply for the colonial forces, but have to give up everything they know. In exchange they get a fresh new body for as long as they serve in the fleet. During their stay they fight several diverse and sometimes brutal types of aliens.";
}
function compiledContent$4() {
  return '<h1 id="rating--1010">Rating : 10/10</h1>\n<h3 id="sci-fi-comedy"><em>Sci-fi, Comedy</em></h3>\n<p>Hitchhickers guide to the Galaxy meets Stormship troopers! Old Man\u2019s War is brilliantly written! Scalzi has some of the freshest and most unique take on future tech I\u2019ve come across in a while.</p>\n<p>Premise of the story is people who turn 75 can apply for the colonial forces, but have to give up everything they know. In exchange they get a fresh new body for as long as they serve in the fleet. During their stay they fight several diverse and sometimes brutal types of aliens.</p>';
}
const $$metadata$4 = createMetadata("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/book/8-old-mans-war.md", { modules: [{ module: $$module1$2, specifier: "@astrojs/markdown-remark/ssr-utils", assert: {} }, { module: $$module2, specifier: "../../layouts/BookPost.astro", assert: {} }, { module: $$module3$1, specifier: "../../components/Author.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$4 = createAstro("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/book/8-old-mans-war.md", "http://localhost:3000/", "file:///C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/");
const $$8OldMansWar = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$4, $$props, $$slots);
  Astro2.self = $$8OldMansWar;
  const $$content = { "title": "Old Man's War by John Scalzi", "publishDate": "2 MAR 2019", "href": "https://twitter.com/_Hopelezz", "name": "Mark Spratt", "description": "Hitchhickers guide to the Galaxy meets Stormship troopers!", "img": "https://covers.openlibrary.org/b/id/3365280-L.jpg", "tags": "Sci-fi, Comedy, Charming, Is-A-Movie", "astro": { "headers": [{ "depth": 1, "slug": "rating--1010", "text": "Rating : 10/10" }, { "depth": 3, "slug": "sci-fi-comedy", "text": "Sci-fi, Comedy" }], "source": "\r\n# Rating : 10/10\r\n\r\n### _Sci-fi, Comedy_\r\n\r\nHitchhickers guide to the Galaxy meets Stormship troopers! Old Man's War is brilliantly written! Scalzi has some of the freshest and most unique take on future tech I've come across in a while.\r\n\r\nPremise of the story is people who turn 75 can apply for the colonial forces, but have to give up everything they know. In exchange they get a fresh new body for as long as they serve in the fleet. During their stay they fight several diverse and sometimes brutal types of aliens.", "html": '<h1 id="rating--1010">Rating : 10/10</h1>\n<h3 id="sci-fi-comedy"><em>Sci-fi, Comedy</em></h3>\n<p>Hitchhickers guide to the Galaxy meets Stormship troopers! Old Man\u2019s War is brilliantly written! Scalzi has some of the freshest and most unique take on future tech I\u2019ve come across in a while.</p>\n<p>Premise of the story is people who turn 75 can apply for the colonial forces, but have to give up everything they know. In exchange they get a fresh new body for as long as they serve in the fleet. During their stay they fight several diverse and sometimes brutal types of aliens.</p>' } };
  return render`${renderComponent($$result, "Layout", $$BookPost, { "content": $$content }, { "default": () => render`${maybeRenderHead($$result)}<h1 id="rating--1010">Rating : 10/10</h1><h3 id="sci-fi-comedy"><em>Sci-fi, Comedy</em></h3><p>Hitchhickers guide to the Galaxy meets Stormship troopers! Old Man’s War is brilliantly written! Scalzi has some of the freshest and most unique take on future tech I’ve come across in a while.</p><p>Premise of the story is people who turn 75 can apply for the colonial forces, but have to give up everything they know. In exchange they get a fresh new body for as long as they serve in the fleet. During their stay they fight several diverse and sometimes brutal types of aliens.</p>` })}`;
});

var _page12 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	metadata: metadata$4,
	frontmatter: frontmatter$4,
	rawContent: rawContent$4,
	compiledContent: compiledContent$4,
	$$metadata: $$metadata$4,
	'default': $$8OldMansWar
}, Symbol.toStringTag, { value: 'Module' }));

const metadata$3 = { "headers": [{ "depth": 1, "slug": "rating--1010", "text": "Rating : 10/10" }, { "depth": 3, "slug": "sci-fi-comedy-charming-is-a-movie", "text": "Sci-fi, Comedy, Charming, Is-A-Movie" }], "source": "\r\n# Rating : 10/10\r\n\r\n### _Sci-fi, Comedy, Charming, Is-A-Movie_\r\n\r\nA space expedition goes wrong after Sol 6 on the planet of Mars (The Antagonist). A sudden dust storm causes the team to evacuate, but Mark Watney (the protagonist) gets injured and presumed dead. Watney, a botanist and mechanical mastermind, has the skillset needed to survive on the treacherous planet, but for how long?\r\n\r\nThe story advances through update logs in a unique and comical way through Watney's optimistic perspective. Using his optimism Watney reshape his unfortunate situation and sheds light on his ever growing list of problems.\r\n\r\n>I guess you could call it a failure, but I prefer the term learning experience.\r\n\r\nHe has this witty and charming personality that\u2019s hard not to love as you read. Imagine if Castaway, Mission to Mars, Apollo 13, and MacGyver were to have a baby The Martian would be the outcome. With it\u2019s near plausible circumstances and close to accurate science The Martian offers the readers a much desired story that\u2019s been begging to be told for centuries.\r\n\r\nSide note: For those who\u2019ve watched the Movie but have yet to read the book, I encourage you read the book! The Movie shifts around some details and the book has a ton of humor that never made it to the movie.", "html": '<h1 id="rating--1010">Rating : 10/10</h1>\n<h3 id="sci-fi-comedy-charming-is-a-movie"><em>Sci-fi, Comedy, Charming, Is-A-Movie</em></h3>\n<p>A space expedition goes wrong after Sol 6 on the planet of Mars (The Antagonist). A sudden dust storm causes the team to evacuate, but Mark Watney (the protagonist) gets injured and presumed dead. Watney, a botanist and mechanical mastermind, has the skillset needed to survive on the treacherous planet, but for how long?</p>\n<p>The story advances through update logs in a unique and comical way through Watney\u2019s optimistic perspective. Using his optimism Watney reshape his unfortunate situation and sheds light on his ever growing list of problems.</p>\n<blockquote>\n<p>I guess you could call it a failure, but I prefer the term learning experience.</p>\n</blockquote>\n<p>He has this witty and charming personality that\u2019s hard not to love as you read. Imagine if Castaway, Mission to Mars, Apollo 13, and MacGyver were to have a baby The Martian would be the outcome. With it\u2019s near plausible circumstances and close to accurate science The Martian offers the readers a much desired story that\u2019s been begging to be told for centuries.</p>\n<p>Side note: For those who\u2019ve watched the Movie but have yet to read the book, I encourage you read the book! The Movie shifts around some details and the book has a ton of humor that never made it to the movie.</p>' };
const frontmatter$3 = { "title": "The Martian by Andy Weir", "publishDate": "14 OCT 2017", "href": "https://twitter.com/_Hopelezz", "name": "Mark Spratt", "description": "A space expedition goes horribly wrong...", "img": "https://covers.openlibrary.org/b/id/11446888-L.jpg", "tags": "Sci-fi, Comedy, Charming, Is-A-Movie", "astro": { "headers": [{ "depth": 1, "slug": "rating--1010", "text": "Rating : 10/10" }, { "depth": 3, "slug": "sci-fi-comedy-charming-is-a-movie", "text": "Sci-fi, Comedy, Charming, Is-A-Movie" }], "source": "\r\n# Rating : 10/10\r\n\r\n### _Sci-fi, Comedy, Charming, Is-A-Movie_\r\n\r\nA space expedition goes wrong after Sol 6 on the planet of Mars (The Antagonist). A sudden dust storm causes the team to evacuate, but Mark Watney (the protagonist) gets injured and presumed dead. Watney, a botanist and mechanical mastermind, has the skillset needed to survive on the treacherous planet, but for how long?\r\n\r\nThe story advances through update logs in a unique and comical way through Watney's optimistic perspective. Using his optimism Watney reshape his unfortunate situation and sheds light on his ever growing list of problems.\r\n\r\n>I guess you could call it a failure, but I prefer the term learning experience.\r\n\r\nHe has this witty and charming personality that\u2019s hard not to love as you read. Imagine if Castaway, Mission to Mars, Apollo 13, and MacGyver were to have a baby The Martian would be the outcome. With it\u2019s near plausible circumstances and close to accurate science The Martian offers the readers a much desired story that\u2019s been begging to be told for centuries.\r\n\r\nSide note: For those who\u2019ve watched the Movie but have yet to read the book, I encourage you read the book! The Movie shifts around some details and the book has a ton of humor that never made it to the movie.", "html": '<h1 id="rating--1010">Rating : 10/10</h1>\n<h3 id="sci-fi-comedy-charming-is-a-movie"><em>Sci-fi, Comedy, Charming, Is-A-Movie</em></h3>\n<p>A space expedition goes wrong after Sol 6 on the planet of Mars (The Antagonist). A sudden dust storm causes the team to evacuate, but Mark Watney (the protagonist) gets injured and presumed dead. Watney, a botanist and mechanical mastermind, has the skillset needed to survive on the treacherous planet, but for how long?</p>\n<p>The story advances through update logs in a unique and comical way through Watney\u2019s optimistic perspective. Using his optimism Watney reshape his unfortunate situation and sheds light on his ever growing list of problems.</p>\n<blockquote>\n<p>I guess you could call it a failure, but I prefer the term learning experience.</p>\n</blockquote>\n<p>He has this witty and charming personality that\u2019s hard not to love as you read. Imagine if Castaway, Mission to Mars, Apollo 13, and MacGyver were to have a baby The Martian would be the outcome. With it\u2019s near plausible circumstances and close to accurate science The Martian offers the readers a much desired story that\u2019s been begging to be told for centuries.</p>\n<p>Side note: For those who\u2019ve watched the Movie but have yet to read the book, I encourage you read the book! The Movie shifts around some details and the book has a ton of humor that never made it to the movie.</p>' } };
function rawContent$3() {
  return "\r\n# Rating : 10/10\r\n\r\n### _Sci-fi, Comedy, Charming, Is-A-Movie_\r\n\r\nA space expedition goes wrong after Sol 6 on the planet of Mars (The Antagonist). A sudden dust storm causes the team to evacuate, but Mark Watney (the protagonist) gets injured and presumed dead. Watney, a botanist and mechanical mastermind, has the skillset needed to survive on the treacherous planet, but for how long?\r\n\r\nThe story advances through update logs in a unique and comical way through Watney's optimistic perspective. Using his optimism Watney reshape his unfortunate situation and sheds light on his ever growing list of problems.\r\n\r\n>I guess you could call it a failure, but I prefer the term learning experience.\r\n\r\nHe has this witty and charming personality that\u2019s hard not to love as you read. Imagine if Castaway, Mission to Mars, Apollo 13, and MacGyver were to have a baby The Martian would be the outcome. With it\u2019s near plausible circumstances and close to accurate science The Martian offers the readers a much desired story that\u2019s been begging to be told for centuries.\r\n\r\nSide note: For those who\u2019ve watched the Movie but have yet to read the book, I encourage you read the book! The Movie shifts around some details and the book has a ton of humor that never made it to the movie.";
}
function compiledContent$3() {
  return '<h1 id="rating--1010">Rating : 10/10</h1>\n<h3 id="sci-fi-comedy-charming-is-a-movie"><em>Sci-fi, Comedy, Charming, Is-A-Movie</em></h3>\n<p>A space expedition goes wrong after Sol 6 on the planet of Mars (The Antagonist). A sudden dust storm causes the team to evacuate, but Mark Watney (the protagonist) gets injured and presumed dead. Watney, a botanist and mechanical mastermind, has the skillset needed to survive on the treacherous planet, but for how long?</p>\n<p>The story advances through update logs in a unique and comical way through Watney\u2019s optimistic perspective. Using his optimism Watney reshape his unfortunate situation and sheds light on his ever growing list of problems.</p>\n<blockquote>\n<p>I guess you could call it a failure, but I prefer the term learning experience.</p>\n</blockquote>\n<p>He has this witty and charming personality that\u2019s hard not to love as you read. Imagine if Castaway, Mission to Mars, Apollo 13, and MacGyver were to have a baby The Martian would be the outcome. With it\u2019s near plausible circumstances and close to accurate science The Martian offers the readers a much desired story that\u2019s been begging to be told for centuries.</p>\n<p>Side note: For those who\u2019ve watched the Movie but have yet to read the book, I encourage you read the book! The Movie shifts around some details and the book has a ton of humor that never made it to the movie.</p>';
}
const $$metadata$3 = createMetadata("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/book/7-the-martian.md", { modules: [{ module: $$module1$2, specifier: "@astrojs/markdown-remark/ssr-utils", assert: {} }, { module: $$module2, specifier: "../../layouts/BookPost.astro", assert: {} }, { module: $$module3$1, specifier: "../../components/Author.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$3 = createAstro("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/book/7-the-martian.md", "http://localhost:3000/", "file:///C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/");
const $$7TheMartian = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$3, $$props, $$slots);
  Astro2.self = $$7TheMartian;
  const $$content = { "title": "The Martian by Andy Weir", "publishDate": "14 OCT 2017", "href": "https://twitter.com/_Hopelezz", "name": "Mark Spratt", "description": "A space expedition goes horribly wrong...", "img": "https://covers.openlibrary.org/b/id/11446888-L.jpg", "tags": "Sci-fi, Comedy, Charming, Is-A-Movie", "astro": { "headers": [{ "depth": 1, "slug": "rating--1010", "text": "Rating : 10/10" }, { "depth": 3, "slug": "sci-fi-comedy-charming-is-a-movie", "text": "Sci-fi, Comedy, Charming, Is-A-Movie" }], "source": "\r\n# Rating : 10/10\r\n\r\n### _Sci-fi, Comedy, Charming, Is-A-Movie_\r\n\r\nA space expedition goes wrong after Sol 6 on the planet of Mars (The Antagonist). A sudden dust storm causes the team to evacuate, but Mark Watney (the protagonist) gets injured and presumed dead. Watney, a botanist and mechanical mastermind, has the skillset needed to survive on the treacherous planet, but for how long?\r\n\r\nThe story advances through update logs in a unique and comical way through Watney's optimistic perspective. Using his optimism Watney reshape his unfortunate situation and sheds light on his ever growing list of problems.\r\n\r\n>I guess you could call it a failure, but I prefer the term learning experience.\r\n\r\nHe has this witty and charming personality that\u2019s hard not to love as you read. Imagine if Castaway, Mission to Mars, Apollo 13, and MacGyver were to have a baby The Martian would be the outcome. With it\u2019s near plausible circumstances and close to accurate science The Martian offers the readers a much desired story that\u2019s been begging to be told for centuries.\r\n\r\nSide note: For those who\u2019ve watched the Movie but have yet to read the book, I encourage you read the book! The Movie shifts around some details and the book has a ton of humor that never made it to the movie.", "html": '<h1 id="rating--1010">Rating : 10/10</h1>\n<h3 id="sci-fi-comedy-charming-is-a-movie"><em>Sci-fi, Comedy, Charming, Is-A-Movie</em></h3>\n<p>A space expedition goes wrong after Sol 6 on the planet of Mars (The Antagonist). A sudden dust storm causes the team to evacuate, but Mark Watney (the protagonist) gets injured and presumed dead. Watney, a botanist and mechanical mastermind, has the skillset needed to survive on the treacherous planet, but for how long?</p>\n<p>The story advances through update logs in a unique and comical way through Watney\u2019s optimistic perspective. Using his optimism Watney reshape his unfortunate situation and sheds light on his ever growing list of problems.</p>\n<blockquote>\n<p>I guess you could call it a failure, but I prefer the term learning experience.</p>\n</blockquote>\n<p>He has this witty and charming personality that\u2019s hard not to love as you read. Imagine if Castaway, Mission to Mars, Apollo 13, and MacGyver were to have a baby The Martian would be the outcome. With it\u2019s near plausible circumstances and close to accurate science The Martian offers the readers a much desired story that\u2019s been begging to be told for centuries.</p>\n<p>Side note: For those who\u2019ve watched the Movie but have yet to read the book, I encourage you read the book! The Movie shifts around some details and the book has a ton of humor that never made it to the movie.</p>' } };
  return render`${renderComponent($$result, "Layout", $$BookPost, { "content": $$content }, { "default": () => render`${maybeRenderHead($$result)}<h1 id="rating--1010">Rating : 10/10</h1><h3 id="sci-fi-comedy-charming-is-a-movie"><em>Sci-fi, Comedy, Charming, Is-A-Movie</em></h3><p>A space expedition goes wrong after Sol 6 on the planet of Mars (The Antagonist). A sudden dust storm causes the team to evacuate, but Mark Watney (the protagonist) gets injured and presumed dead. Watney, a botanist and mechanical mastermind, has the skillset needed to survive on the treacherous planet, but for how long?</p><p>The story advances through update logs in a unique and comical way through Watney’s optimistic perspective. Using his optimism Watney reshape his unfortunate situation and sheds light on his ever growing list of problems.</p><blockquote>
<p>I guess you could call it a failure, but I prefer the term learning experience.</p>
</blockquote><p>He has this witty and charming personality that’s hard not to love as you read. Imagine if Castaway, Mission to Mars, Apollo 13, and MacGyver were to have a baby The Martian would be the outcome. With it’s near plausible circumstances and close to accurate science The Martian offers the readers a much desired story that’s been begging to be told for centuries.</p><p>Side note: For those who’ve watched the Movie but have yet to read the book, I encourage you read the book! The Movie shifts around some details and the book has a ton of humor that never made it to the movie.</p>` })}`;
});

var _page13 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	metadata: metadata$3,
	frontmatter: frontmatter$3,
	rawContent: rawContent$3,
	compiledContent: compiledContent$3,
	$$metadata: $$metadata$3,
	'default': $$7TheMartian
}, Symbol.toStringTag, { value: 'Module' }));

const metadata$2 = { "headers": [{ "depth": 1, "slug": "rating--710", "text": "Rating : 7/10" }, { "depth": 3, "slug": "fiction-psychological-suspense", "text": "Fiction, Psychological, Suspense" }], "source": "\r\n# Rating : 7/10\r\n### _Fiction, Psychological, Suspense_\r\n\r\nThe book starts off with a narrative that's compelling. It'll suck you in, but right after it shifts drastically to some boring guys' (Flynn) life. He's an author, writing about a supermarket. For the most part the story is the bland day to day nonsense, but with insights on his thoughts of writing his novel. \r\n\r\nIt's very much like Fight Club in the way to story plays out, but with twists like Flynn breaking the 4th wall or retelling of events as if they happened when they're all in his head. This gave the story a fresh take. I very much like the 2nd half of the book more as this is when the story really starts getting fleshed out and changes narrative mindsets. \r\n\r\nFor the most part, it's a solid book for a new author.", "html": '<h1 id="rating--710">Rating : 7/10</h1>\n<h3 id="fiction-psychological-suspense"><em>Fiction, Psychological, Suspense</em></h3>\n<p>The book starts off with a narrative that\u2019s compelling. It\u2019ll suck you in, but right after it shifts drastically to some boring guys\u2019 (Flynn) life. He\u2019s an author, writing about a supermarket. For the most part the story is the bland day to day nonsense, but with insights on his thoughts of writing his novel.</p>\n<p>It\u2019s very much like Fight Club in the way to story plays out, but with twists like Flynn breaking the 4th wall or retelling of events as if they happened when they\u2019re all in his head. This gave the story a fresh take. I very much like the 2nd half of the book more as this is when the story really starts getting fleshed out and changes narrative mindsets.</p>\n<p>For the most part, it\u2019s a solid book for a new author.</p>' };
const frontmatter$2 = { "title": "Supermarket by Bobby Hall", "publishDate": "23 NOV 2019", "href": "https://twitter.com/_Hopelezz", "name": "Mark Spratt", "description": null, "img": "https://covers.openlibrary.org/b/isbn/9781982127138-L.jpg", "tags": "Fiction, psychological, Fiction, suspense", "astro": { "headers": [{ "depth": 1, "slug": "rating--710", "text": "Rating : 7/10" }, { "depth": 3, "slug": "fiction-psychological-suspense", "text": "Fiction, Psychological, Suspense" }], "source": "\r\n# Rating : 7/10\r\n### _Fiction, Psychological, Suspense_\r\n\r\nThe book starts off with a narrative that's compelling. It'll suck you in, but right after it shifts drastically to some boring guys' (Flynn) life. He's an author, writing about a supermarket. For the most part the story is the bland day to day nonsense, but with insights on his thoughts of writing his novel. \r\n\r\nIt's very much like Fight Club in the way to story plays out, but with twists like Flynn breaking the 4th wall or retelling of events as if they happened when they're all in his head. This gave the story a fresh take. I very much like the 2nd half of the book more as this is when the story really starts getting fleshed out and changes narrative mindsets. \r\n\r\nFor the most part, it's a solid book for a new author.", "html": '<h1 id="rating--710">Rating : 7/10</h1>\n<h3 id="fiction-psychological-suspense"><em>Fiction, Psychological, Suspense</em></h3>\n<p>The book starts off with a narrative that\u2019s compelling. It\u2019ll suck you in, but right after it shifts drastically to some boring guys\u2019 (Flynn) life. He\u2019s an author, writing about a supermarket. For the most part the story is the bland day to day nonsense, but with insights on his thoughts of writing his novel.</p>\n<p>It\u2019s very much like Fight Club in the way to story plays out, but with twists like Flynn breaking the 4th wall or retelling of events as if they happened when they\u2019re all in his head. This gave the story a fresh take. I very much like the 2nd half of the book more as this is when the story really starts getting fleshed out and changes narrative mindsets.</p>\n<p>For the most part, it\u2019s a solid book for a new author.</p>' } };
function rawContent$2() {
  return "\r\n# Rating : 7/10\r\n### _Fiction, Psychological, Suspense_\r\n\r\nThe book starts off with a narrative that's compelling. It'll suck you in, but right after it shifts drastically to some boring guys' (Flynn) life. He's an author, writing about a supermarket. For the most part the story is the bland day to day nonsense, but with insights on his thoughts of writing his novel. \r\n\r\nIt's very much like Fight Club in the way to story plays out, but with twists like Flynn breaking the 4th wall or retelling of events as if they happened when they're all in his head. This gave the story a fresh take. I very much like the 2nd half of the book more as this is when the story really starts getting fleshed out and changes narrative mindsets. \r\n\r\nFor the most part, it's a solid book for a new author.";
}
function compiledContent$2() {
  return '<h1 id="rating--710">Rating : 7/10</h1>\n<h3 id="fiction-psychological-suspense"><em>Fiction, Psychological, Suspense</em></h3>\n<p>The book starts off with a narrative that\u2019s compelling. It\u2019ll suck you in, but right after it shifts drastically to some boring guys\u2019 (Flynn) life. He\u2019s an author, writing about a supermarket. For the most part the story is the bland day to day nonsense, but with insights on his thoughts of writing his novel.</p>\n<p>It\u2019s very much like Fight Club in the way to story plays out, but with twists like Flynn breaking the 4th wall or retelling of events as if they happened when they\u2019re all in his head. This gave the story a fresh take. I very much like the 2nd half of the book more as this is when the story really starts getting fleshed out and changes narrative mindsets.</p>\n<p>For the most part, it\u2019s a solid book for a new author.</p>';
}
const $$metadata$2 = createMetadata("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/book/9-supermarket.md", { modules: [{ module: $$module1$2, specifier: "@astrojs/markdown-remark/ssr-utils", assert: {} }, { module: $$module2, specifier: "../../layouts/BookPost.astro", assert: {} }, { module: $$module3$1, specifier: "../../components/Author.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$2 = createAstro("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/book/9-supermarket.md", "http://localhost:3000/", "file:///C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/");
const $$9Supermarket = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$9Supermarket;
  const $$content = { "title": "Supermarket by Bobby Hall", "publishDate": "23 NOV 2019", "href": "https://twitter.com/_Hopelezz", "name": "Mark Spratt", "description": null, "img": "https://covers.openlibrary.org/b/isbn/9781982127138-L.jpg", "tags": "Fiction, psychological, Fiction, suspense", "astro": { "headers": [{ "depth": 1, "slug": "rating--710", "text": "Rating : 7/10" }, { "depth": 3, "slug": "fiction-psychological-suspense", "text": "Fiction, Psychological, Suspense" }], "source": "\r\n# Rating : 7/10\r\n### _Fiction, Psychological, Suspense_\r\n\r\nThe book starts off with a narrative that's compelling. It'll suck you in, but right after it shifts drastically to some boring guys' (Flynn) life. He's an author, writing about a supermarket. For the most part the story is the bland day to day nonsense, but with insights on his thoughts of writing his novel. \r\n\r\nIt's very much like Fight Club in the way to story plays out, but with twists like Flynn breaking the 4th wall or retelling of events as if they happened when they're all in his head. This gave the story a fresh take. I very much like the 2nd half of the book more as this is when the story really starts getting fleshed out and changes narrative mindsets. \r\n\r\nFor the most part, it's a solid book for a new author.", "html": '<h1 id="rating--710">Rating : 7/10</h1>\n<h3 id="fiction-psychological-suspense"><em>Fiction, Psychological, Suspense</em></h3>\n<p>The book starts off with a narrative that\u2019s compelling. It\u2019ll suck you in, but right after it shifts drastically to some boring guys\u2019 (Flynn) life. He\u2019s an author, writing about a supermarket. For the most part the story is the bland day to day nonsense, but with insights on his thoughts of writing his novel.</p>\n<p>It\u2019s very much like Fight Club in the way to story plays out, but with twists like Flynn breaking the 4th wall or retelling of events as if they happened when they\u2019re all in his head. This gave the story a fresh take. I very much like the 2nd half of the book more as this is when the story really starts getting fleshed out and changes narrative mindsets.</p>\n<p>For the most part, it\u2019s a solid book for a new author.</p>' } };
  return render`${renderComponent($$result, "Layout", $$BookPost, { "content": $$content }, { "default": () => render`${maybeRenderHead($$result)}<h1 id="rating--710">Rating : 7/10</h1><h3 id="fiction-psychological-suspense"><em>Fiction, Psychological, Suspense</em></h3><p>The book starts off with a narrative that’s compelling. It’ll suck you in, but right after it shifts drastically to some boring guys’ (Flynn) life. He’s an author, writing about a supermarket. For the most part the story is the bland day to day nonsense, but with insights on his thoughts of writing his novel.</p><p>It’s very much like Fight Club in the way to story plays out, but with twists like Flynn breaking the 4th wall or retelling of events as if they happened when they’re all in his head. This gave the story a fresh take. I very much like the 2nd half of the book more as this is when the story really starts getting fleshed out and changes narrative mindsets.</p><p>For the most part, it’s a solid book for a new author.</p>` })}`;
});

var _page14 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	metadata: metadata$2,
	frontmatter: frontmatter$2,
	rawContent: rawContent$2,
	compiledContent: compiledContent$2,
	$$metadata: $$metadata$2,
	'default': $$9Supermarket
}, Symbol.toStringTag, { value: 'Module' }));

const metadata$1 = { "headers": [{ "depth": 1, "slug": "rating--1010", "text": "Rating : 10/10" }, { "depth": 3, "slug": "fiction-american-autobiographical", "text": "Fiction, American, Autobiographical" }], "source": '\r\n# Rating : 10/10\r\n### _Fiction, American, Autobiographical_\r\n\r\n>"This is the closest I will ever come to writing an autobiography. I have called it "Slapstick" because it is grotesque, situational poetry -- like the slapstick film comedies, especially those of Laurel and Hardy, of long ago. It is about what life feels like to me."\r\n\r\nYou see, Kurt\'s sister Alice, whom he was close with, died of cancer. A few days later her husband followed in an accident. \r\nAfter having read Slaughterhouse-five one would think okay this will be somewhat distorted fiction\u2026 No. This is one whirlwind of neurotic-psychedelic-nightmares infused by Dali or some such artist. One you masochistically can\u2019t put down. Strap in you\u2019re going for a ride!\r\n\r\nWilbur and Eliza Swain are twins. At birth the parents were told they wouldn\u2019t live past their childhood years. Misshapen and appearing unintelligent like that of Neanderthals, with small incoherent words. Their parents made their lives as comfortable as possible. Being of wealth, they made it as comfortable for them as possible and spared no expenses to provide the best possible life they could imagine, including the best physicians money could afford. To keep this from the public, they created a fortress like home surrounded by two sets of fences. One around the house and the other an apple orchard that surrounded the house. The two children for much of their childhood practically inseparable and together brilliant minded; each representing the two halves of a brain. When separated, they function poorly: \r\n\r\n>\u201CI felt as though my head were turning to wood\u201D or \u201Cmy skull was filling up with maple syrup\u201D\r\n\r\nA bitter psychiatrist who feels as though her time is wasted on the two snivel nosed beasts, convinces the parents to separate them. Wilbur who\u2019s able to read and write gets sent off to schools around the world while Eliza is sent off to an asylum because she was considered \u201Cuseless: without her brother, but that\u2019s far from reality. \r\n\r\nThis mind scrambler of a tale keept me entertained with this bizarre comedic sort of way while glaze in a melancholy tone. There\u2019s tiny China men `No. Seriously. \u201CTiny\u201D China men`, a mysterious \u201Cgreen death\u201D disease that\u2019s killing thousands of people, Gravitational fluctuations, and so many more absurdities to the point, it\u2019s absurd, yet with the way Kurt portrays his story you can\u2019t help, but be wonder struck and amazed by the tale.\r\n\r\n>\u201CHi ho.\u201D', "html": '<h1 id="rating--1010">Rating : 10/10</h1>\n<h3 id="fiction-american-autobiographical"><em>Fiction, American, Autobiographical</em></h3>\n<blockquote>\n<p>\u201CThis is the closest I will ever come to writing an autobiography. I have called it \u201CSlapstick\u201D because it is grotesque, situational poetry \u2014 like the slapstick film comedies, especially those of Laurel and Hardy, of long ago. It is about what life feels like to me.\u201D</p>\n</blockquote>\n<p>You see, Kurt\u2019s sister Alice, whom he was close with, died of cancer. A few days later her husband followed in an accident.\r\nAfter having read Slaughterhouse-five one would think okay this will be somewhat distorted fiction\u2026 No. This is one whirlwind of neurotic-psychedelic-nightmares infused by Dali or some such artist. One you masochistically can\u2019t put down. Strap in you\u2019re going for a ride!</p>\n<p>Wilbur and Eliza Swain are twins. At birth the parents were told they wouldn\u2019t live past their childhood years. Misshapen and appearing unintelligent like that of Neanderthals, with small incoherent words. Their parents made their lives as comfortable as possible. Being of wealth, they made it as comfortable for them as possible and spared no expenses to provide the best possible life they could imagine, including the best physicians money could afford. To keep this from the public, they created a fortress like home surrounded by two sets of fences. One around the house and the other an apple orchard that surrounded the house. The two children for much of their childhood practically inseparable and together brilliant minded; each representing the two halves of a brain. When separated, they function poorly:</p>\n<blockquote>\n<p>\u201CI felt as though my head were turning to wood\u201D or \u201Cmy skull was filling up with maple syrup\u201D</p>\n</blockquote>\n<p>A bitter psychiatrist who feels as though her time is wasted on the two snivel nosed beasts, convinces the parents to separate them. Wilbur who\u2019s able to read and write gets sent off to schools around the world while Eliza is sent off to an asylum because she was considered \u201Cuseless: without her brother, but that\u2019s far from reality.</p>\n<p>This mind scrambler of a tale keept me entertained with this bizarre comedic sort of way while glaze in a melancholy tone. There\u2019s tiny China men <code is:raw>No. Seriously. \u201CTiny\u201D China men</code>, a mysterious \u201Cgreen death\u201D disease that\u2019s killing thousands of people, Gravitational fluctuations, and so many more absurdities to the point, it\u2019s absurd, yet with the way Kurt portrays his story you can\u2019t help, but be wonder struck and amazed by the tale.</p>\n<blockquote>\n<p>\u201CHi ho.\u201D</p>\n</blockquote>' };
const frontmatter$1 = { "title": "Slapstick by Kurt Vonnegut", "publishDate": "12 OCT 2017", "href": "https://twitter.com/_Hopelezz", "name": "Mark Spratt", "description": "Depicts Vonnegut's views of loneliness, both on an individual and social scale.", "img": "https://covers.openlibrary.org/b/id/6632174-L.jpg", "tags": "Presidents, Fiction, American fiction", "astro": { "headers": [{ "depth": 1, "slug": "rating--1010", "text": "Rating : 10/10" }, { "depth": 3, "slug": "fiction-american-autobiographical", "text": "Fiction, American, Autobiographical" }], "source": '\r\n# Rating : 10/10\r\n### _Fiction, American, Autobiographical_\r\n\r\n>"This is the closest I will ever come to writing an autobiography. I have called it "Slapstick" because it is grotesque, situational poetry -- like the slapstick film comedies, especially those of Laurel and Hardy, of long ago. It is about what life feels like to me."\r\n\r\nYou see, Kurt\'s sister Alice, whom he was close with, died of cancer. A few days later her husband followed in an accident. \r\nAfter having read Slaughterhouse-five one would think okay this will be somewhat distorted fiction\u2026 No. This is one whirlwind of neurotic-psychedelic-nightmares infused by Dali or some such artist. One you masochistically can\u2019t put down. Strap in you\u2019re going for a ride!\r\n\r\nWilbur and Eliza Swain are twins. At birth the parents were told they wouldn\u2019t live past their childhood years. Misshapen and appearing unintelligent like that of Neanderthals, with small incoherent words. Their parents made their lives as comfortable as possible. Being of wealth, they made it as comfortable for them as possible and spared no expenses to provide the best possible life they could imagine, including the best physicians money could afford. To keep this from the public, they created a fortress like home surrounded by two sets of fences. One around the house and the other an apple orchard that surrounded the house. The two children for much of their childhood practically inseparable and together brilliant minded; each representing the two halves of a brain. When separated, they function poorly: \r\n\r\n>\u201CI felt as though my head were turning to wood\u201D or \u201Cmy skull was filling up with maple syrup\u201D\r\n\r\nA bitter psychiatrist who feels as though her time is wasted on the two snivel nosed beasts, convinces the parents to separate them. Wilbur who\u2019s able to read and write gets sent off to schools around the world while Eliza is sent off to an asylum because she was considered \u201Cuseless: without her brother, but that\u2019s far from reality. \r\n\r\nThis mind scrambler of a tale keept me entertained with this bizarre comedic sort of way while glaze in a melancholy tone. There\u2019s tiny China men `No. Seriously. \u201CTiny\u201D China men`, a mysterious \u201Cgreen death\u201D disease that\u2019s killing thousands of people, Gravitational fluctuations, and so many more absurdities to the point, it\u2019s absurd, yet with the way Kurt portrays his story you can\u2019t help, but be wonder struck and amazed by the tale.\r\n\r\n>\u201CHi ho.\u201D', "html": '<h1 id="rating--1010">Rating : 10/10</h1>\n<h3 id="fiction-american-autobiographical"><em>Fiction, American, Autobiographical</em></h3>\n<blockquote>\n<p>\u201CThis is the closest I will ever come to writing an autobiography. I have called it \u201CSlapstick\u201D because it is grotesque, situational poetry \u2014 like the slapstick film comedies, especially those of Laurel and Hardy, of long ago. It is about what life feels like to me.\u201D</p>\n</blockquote>\n<p>You see, Kurt\u2019s sister Alice, whom he was close with, died of cancer. A few days later her husband followed in an accident.\r\nAfter having read Slaughterhouse-five one would think okay this will be somewhat distorted fiction\u2026 No. This is one whirlwind of neurotic-psychedelic-nightmares infused by Dali or some such artist. One you masochistically can\u2019t put down. Strap in you\u2019re going for a ride!</p>\n<p>Wilbur and Eliza Swain are twins. At birth the parents were told they wouldn\u2019t live past their childhood years. Misshapen and appearing unintelligent like that of Neanderthals, with small incoherent words. Their parents made their lives as comfortable as possible. Being of wealth, they made it as comfortable for them as possible and spared no expenses to provide the best possible life they could imagine, including the best physicians money could afford. To keep this from the public, they created a fortress like home surrounded by two sets of fences. One around the house and the other an apple orchard that surrounded the house. The two children for much of their childhood practically inseparable and together brilliant minded; each representing the two halves of a brain. When separated, they function poorly:</p>\n<blockquote>\n<p>\u201CI felt as though my head were turning to wood\u201D or \u201Cmy skull was filling up with maple syrup\u201D</p>\n</blockquote>\n<p>A bitter psychiatrist who feels as though her time is wasted on the two snivel nosed beasts, convinces the parents to separate them. Wilbur who\u2019s able to read and write gets sent off to schools around the world while Eliza is sent off to an asylum because she was considered \u201Cuseless: without her brother, but that\u2019s far from reality.</p>\n<p>This mind scrambler of a tale keept me entertained with this bizarre comedic sort of way while glaze in a melancholy tone. There\u2019s tiny China men <code is:raw>No. Seriously. \u201CTiny\u201D China men</code>, a mysterious \u201Cgreen death\u201D disease that\u2019s killing thousands of people, Gravitational fluctuations, and so many more absurdities to the point, it\u2019s absurd, yet with the way Kurt portrays his story you can\u2019t help, but be wonder struck and amazed by the tale.</p>\n<blockquote>\n<p>\u201CHi ho.\u201D</p>\n</blockquote>' } };
function rawContent$1() {
  return '\r\n# Rating : 10/10\r\n### _Fiction, American, Autobiographical_\r\n\r\n>"This is the closest I will ever come to writing an autobiography. I have called it "Slapstick" because it is grotesque, situational poetry -- like the slapstick film comedies, especially those of Laurel and Hardy, of long ago. It is about what life feels like to me."\r\n\r\nYou see, Kurt\'s sister Alice, whom he was close with, died of cancer. A few days later her husband followed in an accident. \r\nAfter having read Slaughterhouse-five one would think okay this will be somewhat distorted fiction\u2026 No. This is one whirlwind of neurotic-psychedelic-nightmares infused by Dali or some such artist. One you masochistically can\u2019t put down. Strap in you\u2019re going for a ride!\r\n\r\nWilbur and Eliza Swain are twins. At birth the parents were told they wouldn\u2019t live past their childhood years. Misshapen and appearing unintelligent like that of Neanderthals, with small incoherent words. Their parents made their lives as comfortable as possible. Being of wealth, they made it as comfortable for them as possible and spared no expenses to provide the best possible life they could imagine, including the best physicians money could afford. To keep this from the public, they created a fortress like home surrounded by two sets of fences. One around the house and the other an apple orchard that surrounded the house. The two children for much of their childhood practically inseparable and together brilliant minded; each representing the two halves of a brain. When separated, they function poorly: \r\n\r\n>\u201CI felt as though my head were turning to wood\u201D or \u201Cmy skull was filling up with maple syrup\u201D\r\n\r\nA bitter psychiatrist who feels as though her time is wasted on the two snivel nosed beasts, convinces the parents to separate them. Wilbur who\u2019s able to read and write gets sent off to schools around the world while Eliza is sent off to an asylum because she was considered \u201Cuseless: without her brother, but that\u2019s far from reality. \r\n\r\nThis mind scrambler of a tale keept me entertained with this bizarre comedic sort of way while glaze in a melancholy tone. There\u2019s tiny China men `No. Seriously. \u201CTiny\u201D China men`, a mysterious \u201Cgreen death\u201D disease that\u2019s killing thousands of people, Gravitational fluctuations, and so many more absurdities to the point, it\u2019s absurd, yet with the way Kurt portrays his story you can\u2019t help, but be wonder struck and amazed by the tale.\r\n\r\n>\u201CHi ho.\u201D';
}
function compiledContent$1() {
  return '<h1 id="rating--1010">Rating : 10/10</h1>\n<h3 id="fiction-american-autobiographical"><em>Fiction, American, Autobiographical</em></h3>\n<blockquote>\n<p>\u201CThis is the closest I will ever come to writing an autobiography. I have called it \u201CSlapstick\u201D because it is grotesque, situational poetry \u2014 like the slapstick film comedies, especially those of Laurel and Hardy, of long ago. It is about what life feels like to me.\u201D</p>\n</blockquote>\n<p>You see, Kurt\u2019s sister Alice, whom he was close with, died of cancer. A few days later her husband followed in an accident.\r\nAfter having read Slaughterhouse-five one would think okay this will be somewhat distorted fiction\u2026 No. This is one whirlwind of neurotic-psychedelic-nightmares infused by Dali or some such artist. One you masochistically can\u2019t put down. Strap in you\u2019re going for a ride!</p>\n<p>Wilbur and Eliza Swain are twins. At birth the parents were told they wouldn\u2019t live past their childhood years. Misshapen and appearing unintelligent like that of Neanderthals, with small incoherent words. Their parents made their lives as comfortable as possible. Being of wealth, they made it as comfortable for them as possible and spared no expenses to provide the best possible life they could imagine, including the best physicians money could afford. To keep this from the public, they created a fortress like home surrounded by two sets of fences. One around the house and the other an apple orchard that surrounded the house. The two children for much of their childhood practically inseparable and together brilliant minded; each representing the two halves of a brain. When separated, they function poorly:</p>\n<blockquote>\n<p>\u201CI felt as though my head were turning to wood\u201D or \u201Cmy skull was filling up with maple syrup\u201D</p>\n</blockquote>\n<p>A bitter psychiatrist who feels as though her time is wasted on the two snivel nosed beasts, convinces the parents to separate them. Wilbur who\u2019s able to read and write gets sent off to schools around the world while Eliza is sent off to an asylum because she was considered \u201Cuseless: without her brother, but that\u2019s far from reality.</p>\n<p>This mind scrambler of a tale keept me entertained with this bizarre comedic sort of way while glaze in a melancholy tone. There\u2019s tiny China men <code is:raw>No. Seriously. \u201CTiny\u201D China men</code>, a mysterious \u201Cgreen death\u201D disease that\u2019s killing thousands of people, Gravitational fluctuations, and so many more absurdities to the point, it\u2019s absurd, yet with the way Kurt portrays his story you can\u2019t help, but be wonder struck and amazed by the tale.</p>\n<blockquote>\n<p>\u201CHi ho.\u201D</p>\n</blockquote>';
}
const $$metadata$1 = createMetadata("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/book/6-slapstick.md", { modules: [{ module: $$module1$2, specifier: "@astrojs/markdown-remark/ssr-utils", assert: {} }, { module: $$module2, specifier: "../../layouts/BookPost.astro", assert: {} }, { module: $$module3$1, specifier: "../../components/Author.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$1 = createAstro("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/book/6-slapstick.md", "http://localhost:3000/", "file:///C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/");
const $$6Slapstick = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$6Slapstick;
  const $$content = { "title": "Slapstick by Kurt Vonnegut", "publishDate": "12 OCT 2017", "href": "https://twitter.com/_Hopelezz", "name": "Mark Spratt", "description": "Depicts Vonnegut's views of loneliness, both on an individual and social scale.", "img": "https://covers.openlibrary.org/b/id/6632174-L.jpg", "tags": "Presidents, Fiction, American fiction", "astro": { "headers": [{ "depth": 1, "slug": "rating--1010", "text": "Rating : 10/10" }, { "depth": 3, "slug": "fiction-american-autobiographical", "text": "Fiction, American, Autobiographical" }], "source": '\r\n# Rating : 10/10\r\n### _Fiction, American, Autobiographical_\r\n\r\n>"This is the closest I will ever come to writing an autobiography. I have called it "Slapstick" because it is grotesque, situational poetry -- like the slapstick film comedies, especially those of Laurel and Hardy, of long ago. It is about what life feels like to me."\r\n\r\nYou see, Kurt\'s sister Alice, whom he was close with, died of cancer. A few days later her husband followed in an accident. \r\nAfter having read Slaughterhouse-five one would think okay this will be somewhat distorted fiction\u2026 No. This is one whirlwind of neurotic-psychedelic-nightmares infused by Dali or some such artist. One you masochistically can\u2019t put down. Strap in you\u2019re going for a ride!\r\n\r\nWilbur and Eliza Swain are twins. At birth the parents were told they wouldn\u2019t live past their childhood years. Misshapen and appearing unintelligent like that of Neanderthals, with small incoherent words. Their parents made their lives as comfortable as possible. Being of wealth, they made it as comfortable for them as possible and spared no expenses to provide the best possible life they could imagine, including the best physicians money could afford. To keep this from the public, they created a fortress like home surrounded by two sets of fences. One around the house and the other an apple orchard that surrounded the house. The two children for much of their childhood practically inseparable and together brilliant minded; each representing the two halves of a brain. When separated, they function poorly: \r\n\r\n>\u201CI felt as though my head were turning to wood\u201D or \u201Cmy skull was filling up with maple syrup\u201D\r\n\r\nA bitter psychiatrist who feels as though her time is wasted on the two snivel nosed beasts, convinces the parents to separate them. Wilbur who\u2019s able to read and write gets sent off to schools around the world while Eliza is sent off to an asylum because she was considered \u201Cuseless: without her brother, but that\u2019s far from reality. \r\n\r\nThis mind scrambler of a tale keept me entertained with this bizarre comedic sort of way while glaze in a melancholy tone. There\u2019s tiny China men `No. Seriously. \u201CTiny\u201D China men`, a mysterious \u201Cgreen death\u201D disease that\u2019s killing thousands of people, Gravitational fluctuations, and so many more absurdities to the point, it\u2019s absurd, yet with the way Kurt portrays his story you can\u2019t help, but be wonder struck and amazed by the tale.\r\n\r\n>\u201CHi ho.\u201D', "html": '<h1 id="rating--1010">Rating : 10/10</h1>\n<h3 id="fiction-american-autobiographical"><em>Fiction, American, Autobiographical</em></h3>\n<blockquote>\n<p>\u201CThis is the closest I will ever come to writing an autobiography. I have called it \u201CSlapstick\u201D because it is grotesque, situational poetry \u2014 like the slapstick film comedies, especially those of Laurel and Hardy, of long ago. It is about what life feels like to me.\u201D</p>\n</blockquote>\n<p>You see, Kurt\u2019s sister Alice, whom he was close with, died of cancer. A few days later her husband followed in an accident.\r\nAfter having read Slaughterhouse-five one would think okay this will be somewhat distorted fiction\u2026 No. This is one whirlwind of neurotic-psychedelic-nightmares infused by Dali or some such artist. One you masochistically can\u2019t put down. Strap in you\u2019re going for a ride!</p>\n<p>Wilbur and Eliza Swain are twins. At birth the parents were told they wouldn\u2019t live past their childhood years. Misshapen and appearing unintelligent like that of Neanderthals, with small incoherent words. Their parents made their lives as comfortable as possible. Being of wealth, they made it as comfortable for them as possible and spared no expenses to provide the best possible life they could imagine, including the best physicians money could afford. To keep this from the public, they created a fortress like home surrounded by two sets of fences. One around the house and the other an apple orchard that surrounded the house. The two children for much of their childhood practically inseparable and together brilliant minded; each representing the two halves of a brain. When separated, they function poorly:</p>\n<blockquote>\n<p>\u201CI felt as though my head were turning to wood\u201D or \u201Cmy skull was filling up with maple syrup\u201D</p>\n</blockquote>\n<p>A bitter psychiatrist who feels as though her time is wasted on the two snivel nosed beasts, convinces the parents to separate them. Wilbur who\u2019s able to read and write gets sent off to schools around the world while Eliza is sent off to an asylum because she was considered \u201Cuseless: without her brother, but that\u2019s far from reality.</p>\n<p>This mind scrambler of a tale keept me entertained with this bizarre comedic sort of way while glaze in a melancholy tone. There\u2019s tiny China men <code is:raw>No. Seriously. \u201CTiny\u201D China men</code>, a mysterious \u201Cgreen death\u201D disease that\u2019s killing thousands of people, Gravitational fluctuations, and so many more absurdities to the point, it\u2019s absurd, yet with the way Kurt portrays his story you can\u2019t help, but be wonder struck and amazed by the tale.</p>\n<blockquote>\n<p>\u201CHi ho.\u201D</p>\n</blockquote>' } };
  return render`${renderComponent($$result, "Layout", $$BookPost, { "content": $$content }, { "default": () => render`${maybeRenderHead($$result)}<h1 id="rating--1010">Rating : 10/10</h1><h3 id="fiction-american-autobiographical"><em>Fiction, American, Autobiographical</em></h3><blockquote>
<p>“This is the closest I will ever come to writing an autobiography. I have called it “Slapstick” because it is grotesque, situational poetry — like the slapstick film comedies, especially those of Laurel and Hardy, of long ago. It is about what life feels like to me.”</p>
</blockquote><p>You see, Kurt’s sister Alice, whom he was close with, died of cancer. A few days later her husband followed in an accident.
After having read Slaughterhouse-five one would think okay this will be somewhat distorted fiction… No. This is one whirlwind of neurotic-psychedelic-nightmares infused by Dali or some such artist. One you masochistically can’t put down. Strap in you’re going for a ride!</p><p>Wilbur and Eliza Swain are twins. At birth the parents were told they wouldn’t live past their childhood years. Misshapen and appearing unintelligent like that of Neanderthals, with small incoherent words. Their parents made their lives as comfortable as possible. Being of wealth, they made it as comfortable for them as possible and spared no expenses to provide the best possible life they could imagine, including the best physicians money could afford. To keep this from the public, they created a fortress like home surrounded by two sets of fences. One around the house and the other an apple orchard that surrounded the house. The two children for much of their childhood practically inseparable and together brilliant minded; each representing the two halves of a brain. When separated, they function poorly:</p><blockquote>
<p>“I felt as though my head were turning to wood” or “my skull was filling up with maple syrup”</p>
</blockquote><p>A bitter psychiatrist who feels as though her time is wasted on the two snivel nosed beasts, convinces the parents to separate them. Wilbur who’s able to read and write gets sent off to schools around the world while Eliza is sent off to an asylum because she was considered “useless: without her brother, but that’s far from reality.</p><p>This mind scrambler of a tale keept me entertained with this bizarre comedic sort of way while glaze in a melancholy tone. There’s tiny China men <code>No. Seriously. “Tiny” China men</code>, a mysterious “green death” disease that’s killing thousands of people, Gravitational fluctuations, and so many more absurdities to the point, it’s absurd, yet with the way Kurt portrays his story you can’t help, but be wonder struck and amazed by the tale.</p><blockquote>
<p>“Hi ho.”</p>
</blockquote>` })}`;
});

var _page15 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	metadata: metadata$1,
	frontmatter: frontmatter$1,
	rawContent: rawContent$1,
	compiledContent: compiledContent$1,
	$$metadata: $$metadata$1,
	'default': $$6Slapstick
}, Symbol.toStringTag, { value: 'Module' }));

const metadata = { "headers": [{ "depth": 1, "slug": "rating--1010", "text": "Rating : 10/10" }, { "depth": 3, "slug": "sci-fi-thriller-action-packed-aliens-enders-game-clone", "text": "Sci-fi, Thriller, Action-packed, Aliens, Ender\u2019s-Game-Clone" }], "source": "\r\n# Rating : 10/10\r\n\r\n### _Sci-fi, Thriller, Action-packed, Aliens, Ender's-Game-Clone_\r\n\r\nArmada is about a guy named Zack Lightman, who is daydreaming out a window in class and sees an alien spaceship. The same ship from a video game he\u2019s been playing for 3 years. He comes to realize that the powers-that-be have been preparing the world to defend against an Alien invasion for years. Zack\u2019s personal story will have you in a whirl of emotions and engaged through the entire story.\r\n\r\n>I'd spent my entire life overdosing on uncut escapism, willingly allowing fantasy to become my reality.\r\n\r\nEven though I had read Ready Player One with a fervor, I approached Armada with some skepticism. _How could Cline top his previous book?_ With Armada of course. I read this book in 3 days; which is a record for myself. I have an obsession with a book series written by Orson Scott Card known as Ender Series.  Ender is about a boy who tests out to be one of the brightest kids in the world and is chosen to defend earth with his critical thinking skills. A while back I had read that Card wrote the books for his children so he kept it on the less gritty side. Armada is an adult version of Ender\u2019s Game (The first in the series), not so much gore, but sheer intensity. Armada pays homage to Card\u2019s books and even references it in Armada. While Armada has a few of the key elements Enders uses, it\u2019s no carbon copy by any means.\r\n\r\nCline uses pop culture to immerse the reader in nostalgia all while telling a story through the eyes of the main character. It's almost as if you're in conversation with someone telling an incredible story. Every artifact Cline mentions that I didn't know made me want to research them or listen to the songs. A scattering of hidden eggs can be found throughout the book. Oh, and the ending? The ending\u2026 on second thought, I\u2019ll let you read it for yourself. I was in awe.", "html": '<h1 id="rating--1010">Rating : 10/10</h1>\n<h3 id="sci-fi-thriller-action-packed-aliens-enders-game-clone"><em>Sci-fi, Thriller, Action-packed, Aliens, Ender\u2019s-Game-Clone</em></h3>\n<p>Armada is about a guy named Zack Lightman, who is daydreaming out a window in class and sees an alien spaceship. The same ship from a video game he\u2019s been playing for 3 years. He comes to realize that the powers-that-be have been preparing the world to defend against an Alien invasion for years. Zack\u2019s personal story will have you in a whirl of emotions and engaged through the entire story.</p>\n<blockquote>\n<p>I\u2019d spent my entire life overdosing on uncut escapism, willingly allowing fantasy to become my reality.</p>\n</blockquote>\n<p>Even though I had read Ready Player One with a fervor, I approached Armada with some skepticism. <em>How could Cline top his previous book?</em> With Armada of course. I read this book in 3 days; which is a record for myself. I have an obsession with a book series written by Orson Scott Card known as Ender Series.  Ender is about a boy who tests out to be one of the brightest kids in the world and is chosen to defend earth with his critical thinking skills. A while back I had read that Card wrote the books for his children so he kept it on the less gritty side. Armada is an adult version of Ender\u2019s Game (The first in the series), not so much gore, but sheer intensity. Armada pays homage to Card\u2019s books and even references it in Armada. While Armada has a few of the key elements Enders uses, it\u2019s no carbon copy by any means.</p>\n<p>Cline uses pop culture to immerse the reader in nostalgia all while telling a story through the eyes of the main character. It\u2019s almost as if you\u2019re in conversation with someone telling an incredible story. Every artifact Cline mentions that I didn\u2019t know made me want to research them or listen to the songs. A scattering of hidden eggs can be found throughout the book. Oh, and the ending? The ending\u2026 on second thought, I\u2019ll let you read it for yourself. I was in awe.</p>' };
const frontmatter = { "title": "Armada by Ernest Cline", "publishDate": "11 JUL 2017", "href": "https://twitter.com/_Hopelezz", "name": "Mark Spratt", "description": "The story follows a teenager who plays an online video game about defending against an alien invasion, only to find out that the game is a simulator to prepare him and people around the world for defending against an actual alien invasion.", "img": "https://covers.openlibrary.org/b/id/10375880-L.jpg", "tags": "Thriller, Action-packed, Aliens, Ender's-Game-Clone", "astro": { "headers": [{ "depth": 1, "slug": "rating--1010", "text": "Rating : 10/10" }, { "depth": 3, "slug": "sci-fi-thriller-action-packed-aliens-enders-game-clone", "text": "Sci-fi, Thriller, Action-packed, Aliens, Ender\u2019s-Game-Clone" }], "source": "\r\n# Rating : 10/10\r\n\r\n### _Sci-fi, Thriller, Action-packed, Aliens, Ender's-Game-Clone_\r\n\r\nArmada is about a guy named Zack Lightman, who is daydreaming out a window in class and sees an alien spaceship. The same ship from a video game he\u2019s been playing for 3 years. He comes to realize that the powers-that-be have been preparing the world to defend against an Alien invasion for years. Zack\u2019s personal story will have you in a whirl of emotions and engaged through the entire story.\r\n\r\n>I'd spent my entire life overdosing on uncut escapism, willingly allowing fantasy to become my reality.\r\n\r\nEven though I had read Ready Player One with a fervor, I approached Armada with some skepticism. _How could Cline top his previous book?_ With Armada of course. I read this book in 3 days; which is a record for myself. I have an obsession with a book series written by Orson Scott Card known as Ender Series.  Ender is about a boy who tests out to be one of the brightest kids in the world and is chosen to defend earth with his critical thinking skills. A while back I had read that Card wrote the books for his children so he kept it on the less gritty side. Armada is an adult version of Ender\u2019s Game (The first in the series), not so much gore, but sheer intensity. Armada pays homage to Card\u2019s books and even references it in Armada. While Armada has a few of the key elements Enders uses, it\u2019s no carbon copy by any means.\r\n\r\nCline uses pop culture to immerse the reader in nostalgia all while telling a story through the eyes of the main character. It's almost as if you're in conversation with someone telling an incredible story. Every artifact Cline mentions that I didn't know made me want to research them or listen to the songs. A scattering of hidden eggs can be found throughout the book. Oh, and the ending? The ending\u2026 on second thought, I\u2019ll let you read it for yourself. I was in awe.", "html": '<h1 id="rating--1010">Rating : 10/10</h1>\n<h3 id="sci-fi-thriller-action-packed-aliens-enders-game-clone"><em>Sci-fi, Thriller, Action-packed, Aliens, Ender\u2019s-Game-Clone</em></h3>\n<p>Armada is about a guy named Zack Lightman, who is daydreaming out a window in class and sees an alien spaceship. The same ship from a video game he\u2019s been playing for 3 years. He comes to realize that the powers-that-be have been preparing the world to defend against an Alien invasion for years. Zack\u2019s personal story will have you in a whirl of emotions and engaged through the entire story.</p>\n<blockquote>\n<p>I\u2019d spent my entire life overdosing on uncut escapism, willingly allowing fantasy to become my reality.</p>\n</blockquote>\n<p>Even though I had read Ready Player One with a fervor, I approached Armada with some skepticism. <em>How could Cline top his previous book?</em> With Armada of course. I read this book in 3 days; which is a record for myself. I have an obsession with a book series written by Orson Scott Card known as Ender Series.  Ender is about a boy who tests out to be one of the brightest kids in the world and is chosen to defend earth with his critical thinking skills. A while back I had read that Card wrote the books for his children so he kept it on the less gritty side. Armada is an adult version of Ender\u2019s Game (The first in the series), not so much gore, but sheer intensity. Armada pays homage to Card\u2019s books and even references it in Armada. While Armada has a few of the key elements Enders uses, it\u2019s no carbon copy by any means.</p>\n<p>Cline uses pop culture to immerse the reader in nostalgia all while telling a story through the eyes of the main character. It\u2019s almost as if you\u2019re in conversation with someone telling an incredible story. Every artifact Cline mentions that I didn\u2019t know made me want to research them or listen to the songs. A scattering of hidden eggs can be found throughout the book. Oh, and the ending? The ending\u2026 on second thought, I\u2019ll let you read it for yourself. I was in awe.</p>' } };
function rawContent() {
  return "\r\n# Rating : 10/10\r\n\r\n### _Sci-fi, Thriller, Action-packed, Aliens, Ender's-Game-Clone_\r\n\r\nArmada is about a guy named Zack Lightman, who is daydreaming out a window in class and sees an alien spaceship. The same ship from a video game he\u2019s been playing for 3 years. He comes to realize that the powers-that-be have been preparing the world to defend against an Alien invasion for years. Zack\u2019s personal story will have you in a whirl of emotions and engaged through the entire story.\r\n\r\n>I'd spent my entire life overdosing on uncut escapism, willingly allowing fantasy to become my reality.\r\n\r\nEven though I had read Ready Player One with a fervor, I approached Armada with some skepticism. _How could Cline top his previous book?_ With Armada of course. I read this book in 3 days; which is a record for myself. I have an obsession with a book series written by Orson Scott Card known as Ender Series.  Ender is about a boy who tests out to be one of the brightest kids in the world and is chosen to defend earth with his critical thinking skills. A while back I had read that Card wrote the books for his children so he kept it on the less gritty side. Armada is an adult version of Ender\u2019s Game (The first in the series), not so much gore, but sheer intensity. Armada pays homage to Card\u2019s books and even references it in Armada. While Armada has a few of the key elements Enders uses, it\u2019s no carbon copy by any means.\r\n\r\nCline uses pop culture to immerse the reader in nostalgia all while telling a story through the eyes of the main character. It's almost as if you're in conversation with someone telling an incredible story. Every artifact Cline mentions that I didn't know made me want to research them or listen to the songs. A scattering of hidden eggs can be found throughout the book. Oh, and the ending? The ending\u2026 on second thought, I\u2019ll let you read it for yourself. I was in awe.";
}
function compiledContent() {
  return '<h1 id="rating--1010">Rating : 10/10</h1>\n<h3 id="sci-fi-thriller-action-packed-aliens-enders-game-clone"><em>Sci-fi, Thriller, Action-packed, Aliens, Ender\u2019s-Game-Clone</em></h3>\n<p>Armada is about a guy named Zack Lightman, who is daydreaming out a window in class and sees an alien spaceship. The same ship from a video game he\u2019s been playing for 3 years. He comes to realize that the powers-that-be have been preparing the world to defend against an Alien invasion for years. Zack\u2019s personal story will have you in a whirl of emotions and engaged through the entire story.</p>\n<blockquote>\n<p>I\u2019d spent my entire life overdosing on uncut escapism, willingly allowing fantasy to become my reality.</p>\n</blockquote>\n<p>Even though I had read Ready Player One with a fervor, I approached Armada with some skepticism. <em>How could Cline top his previous book?</em> With Armada of course. I read this book in 3 days; which is a record for myself. I have an obsession with a book series written by Orson Scott Card known as Ender Series.  Ender is about a boy who tests out to be one of the brightest kids in the world and is chosen to defend earth with his critical thinking skills. A while back I had read that Card wrote the books for his children so he kept it on the less gritty side. Armada is an adult version of Ender\u2019s Game (The first in the series), not so much gore, but sheer intensity. Armada pays homage to Card\u2019s books and even references it in Armada. While Armada has a few of the key elements Enders uses, it\u2019s no carbon copy by any means.</p>\n<p>Cline uses pop culture to immerse the reader in nostalgia all while telling a story through the eyes of the main character. It\u2019s almost as if you\u2019re in conversation with someone telling an incredible story. Every artifact Cline mentions that I didn\u2019t know made me want to research them or listen to the songs. A scattering of hidden eggs can be found throughout the book. Oh, and the ending? The ending\u2026 on second thought, I\u2019ll let you read it for yourself. I was in awe.</p>';
}
const $$metadata = createMetadata("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/book/3-armada.md", { modules: [{ module: $$module1$2, specifier: "@astrojs/markdown-remark/ssr-utils", assert: {} }, { module: $$module2, specifier: "../../layouts/BookPost.astro", assert: {} }, { module: $$module3$1, specifier: "../../components/Author.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro = createAstro("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/book/3-armada.md", "http://localhost:3000/", "file:///C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/");
const $$3Armada = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$3Armada;
  const $$content = { "title": "Armada by Ernest Cline", "publishDate": "11 JUL 2017", "href": "https://twitter.com/_Hopelezz", "name": "Mark Spratt", "description": "The story follows a teenager who plays an online video game about defending against an alien invasion, only to find out that the game is a simulator to prepare him and people around the world for defending against an actual alien invasion.", "img": "https://covers.openlibrary.org/b/id/10375880-L.jpg", "tags": "Thriller, Action-packed, Aliens, Ender's-Game-Clone", "astro": { "headers": [{ "depth": 1, "slug": "rating--1010", "text": "Rating : 10/10" }, { "depth": 3, "slug": "sci-fi-thriller-action-packed-aliens-enders-game-clone", "text": "Sci-fi, Thriller, Action-packed, Aliens, Ender\u2019s-Game-Clone" }], "source": "\r\n# Rating : 10/10\r\n\r\n### _Sci-fi, Thriller, Action-packed, Aliens, Ender's-Game-Clone_\r\n\r\nArmada is about a guy named Zack Lightman, who is daydreaming out a window in class and sees an alien spaceship. The same ship from a video game he\u2019s been playing for 3 years. He comes to realize that the powers-that-be have been preparing the world to defend against an Alien invasion for years. Zack\u2019s personal story will have you in a whirl of emotions and engaged through the entire story.\r\n\r\n>I'd spent my entire life overdosing on uncut escapism, willingly allowing fantasy to become my reality.\r\n\r\nEven though I had read Ready Player One with a fervor, I approached Armada with some skepticism. _How could Cline top his previous book?_ With Armada of course. I read this book in 3 days; which is a record for myself. I have an obsession with a book series written by Orson Scott Card known as Ender Series.  Ender is about a boy who tests out to be one of the brightest kids in the world and is chosen to defend earth with his critical thinking skills. A while back I had read that Card wrote the books for his children so he kept it on the less gritty side. Armada is an adult version of Ender\u2019s Game (The first in the series), not so much gore, but sheer intensity. Armada pays homage to Card\u2019s books and even references it in Armada. While Armada has a few of the key elements Enders uses, it\u2019s no carbon copy by any means.\r\n\r\nCline uses pop culture to immerse the reader in nostalgia all while telling a story through the eyes of the main character. It's almost as if you're in conversation with someone telling an incredible story. Every artifact Cline mentions that I didn't know made me want to research them or listen to the songs. A scattering of hidden eggs can be found throughout the book. Oh, and the ending? The ending\u2026 on second thought, I\u2019ll let you read it for yourself. I was in awe.", "html": '<h1 id="rating--1010">Rating : 10/10</h1>\n<h3 id="sci-fi-thriller-action-packed-aliens-enders-game-clone"><em>Sci-fi, Thriller, Action-packed, Aliens, Ender\u2019s-Game-Clone</em></h3>\n<p>Armada is about a guy named Zack Lightman, who is daydreaming out a window in class and sees an alien spaceship. The same ship from a video game he\u2019s been playing for 3 years. He comes to realize that the powers-that-be have been preparing the world to defend against an Alien invasion for years. Zack\u2019s personal story will have you in a whirl of emotions and engaged through the entire story.</p>\n<blockquote>\n<p>I\u2019d spent my entire life overdosing on uncut escapism, willingly allowing fantasy to become my reality.</p>\n</blockquote>\n<p>Even though I had read Ready Player One with a fervor, I approached Armada with some skepticism. <em>How could Cline top his previous book?</em> With Armada of course. I read this book in 3 days; which is a record for myself. I have an obsession with a book series written by Orson Scott Card known as Ender Series.  Ender is about a boy who tests out to be one of the brightest kids in the world and is chosen to defend earth with his critical thinking skills. A while back I had read that Card wrote the books for his children so he kept it on the less gritty side. Armada is an adult version of Ender\u2019s Game (The first in the series), not so much gore, but sheer intensity. Armada pays homage to Card\u2019s books and even references it in Armada. While Armada has a few of the key elements Enders uses, it\u2019s no carbon copy by any means.</p>\n<p>Cline uses pop culture to immerse the reader in nostalgia all while telling a story through the eyes of the main character. It\u2019s almost as if you\u2019re in conversation with someone telling an incredible story. Every artifact Cline mentions that I didn\u2019t know made me want to research them or listen to the songs. A scattering of hidden eggs can be found throughout the book. Oh, and the ending? The ending\u2026 on second thought, I\u2019ll let you read it for yourself. I was in awe.</p>' } };
  return render`${renderComponent($$result, "Layout", $$BookPost, { "content": $$content }, { "default": () => render`${maybeRenderHead($$result)}<h1 id="rating--1010">Rating : 10/10</h1><h3 id="sci-fi-thriller-action-packed-aliens-enders-game-clone"><em>Sci-fi, Thriller, Action-packed, Aliens, Ender’s-Game-Clone</em></h3><p>Armada is about a guy named Zack Lightman, who is daydreaming out a window in class and sees an alien spaceship. The same ship from a video game he’s been playing for 3 years. He comes to realize that the powers-that-be have been preparing the world to defend against an Alien invasion for years. Zack’s personal story will have you in a whirl of emotions and engaged through the entire story.</p><blockquote>
<p>I’d spent my entire life overdosing on uncut escapism, willingly allowing fantasy to become my reality.</p>
</blockquote><p>Even though I had read Ready Player One with a fervor, I approached Armada with some skepticism. <em>How could Cline top his previous book?</em> With Armada of course. I read this book in 3 days; which is a record for myself. I have an obsession with a book series written by Orson Scott Card known as Ender Series.  Ender is about a boy who tests out to be one of the brightest kids in the world and is chosen to defend earth with his critical thinking skills. A while back I had read that Card wrote the books for his children so he kept it on the less gritty side. Armada is an adult version of Ender’s Game (The first in the series), not so much gore, but sheer intensity. Armada pays homage to Card’s books and even references it in Armada. While Armada has a few of the key elements Enders uses, it’s no carbon copy by any means.</p><p>Cline uses pop culture to immerse the reader in nostalgia all while telling a story through the eyes of the main character. It’s almost as if you’re in conversation with someone telling an incredible story. Every artifact Cline mentions that I didn’t know made me want to research them or listen to the songs. A scattering of hidden eggs can be found throughout the book. Oh, and the ending? The ending… on second thought, I’ll let you read it for yourself. I was in awe.</p>` })}`;
});

var _page16 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	metadata: metadata,
	frontmatter: frontmatter,
	rawContent: rawContent,
	compiledContent: compiledContent,
	$$metadata: $$metadata,
	'default': $$3Armada
}, Symbol.toStringTag, { value: 'Module' }));

const pageMap = new Map([['src/pages/index.astro', _page0],['src/pages/bookreview.astro', _page1],['src/pages/blog/4-most-recent-post-button.md', _page2],['src/pages/blog/2-two-factor-auth.md', _page3],['src/pages/blog/3-starting-astro.md', _page4],['src/pages/blog/1-password.md', _page5],['src/pages/book/11-communist-manifesto.md', _page6],['src/pages/book/1-Slaughterhouse-Five.md', _page7],['src/pages/book/5-lord-of-the-flies.md', _page8],['src/pages/book/10-never-let-me-go.md', _page9],['src/pages/book/2-ready-player-one.md', _page10],['src/pages/book/4-the-bell-jar.md', _page11],['src/pages/book/8-old-mans-war.md', _page12],['src/pages/book/7-the-martian.md', _page13],['src/pages/book/9-supermarket.md', _page14],['src/pages/book/6-slapstick.md', _page15],['src/pages/book/3-armada.md', _page16],]);
const renderers = [Object.assign({"name":"@astrojs/solid-js","clientEntrypoint":"@astrojs/solid-js/client.js","serverEntrypoint":"@astrojs/solid-js/server.js","jsxImportSource":"solid-js"}, { ssr: _renderer0 }),];

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

/**
 * @param typeMap [Object] Map of MIME type -> Array[extensions]
 * @param ...
 */
function Mime$1() {
  this._types = Object.create(null);
  this._extensions = Object.create(null);

  for (let i = 0; i < arguments.length; i++) {
    this.define(arguments[i]);
  }

  this.define = this.define.bind(this);
  this.getType = this.getType.bind(this);
  this.getExtension = this.getExtension.bind(this);
}

/**
 * Define mimetype -> extension mappings.  Each key is a mime-type that maps
 * to an array of extensions associated with the type.  The first extension is
 * used as the default extension for the type.
 *
 * e.g. mime.define({'audio/ogg', ['oga', 'ogg', 'spx']});
 *
 * If a type declares an extension that has already been defined, an error will
 * be thrown.  To suppress this error and force the extension to be associated
 * with the new type, pass `force`=true.  Alternatively, you may prefix the
 * extension with "*" to map the type to extension, without mapping the
 * extension to the type.
 *
 * e.g. mime.define({'audio/wav', ['wav']}, {'audio/x-wav', ['*wav']});
 *
 *
 * @param map (Object) type definitions
 * @param force (Boolean) if true, force overriding of existing definitions
 */
Mime$1.prototype.define = function(typeMap, force) {
  for (let type in typeMap) {
    let extensions = typeMap[type].map(function(t) {
      return t.toLowerCase();
    });
    type = type.toLowerCase();

    for (let i = 0; i < extensions.length; i++) {
      const ext = extensions[i];

      // '*' prefix = not the preferred type for this extension.  So fixup the
      // extension, and skip it.
      if (ext[0] === '*') {
        continue;
      }

      if (!force && (ext in this._types)) {
        throw new Error(
          'Attempt to change mapping for "' + ext +
          '" extension from "' + this._types[ext] + '" to "' + type +
          '". Pass `force=true` to allow this, otherwise remove "' + ext +
          '" from the list of extensions for "' + type + '".'
        );
      }

      this._types[ext] = type;
    }

    // Use first extension as default
    if (force || !this._extensions[type]) {
      const ext = extensions[0];
      this._extensions[type] = (ext[0] !== '*') ? ext : ext.substr(1);
    }
  }
};

/**
 * Lookup a mime type based on extension
 */
Mime$1.prototype.getType = function(path) {
  path = String(path);
  let last = path.replace(/^.*[/\\]/, '').toLowerCase();
  let ext = last.replace(/^.*\./, '').toLowerCase();

  let hasPath = last.length < path.length;
  let hasDot = ext.length < last.length - 1;

  return (hasDot || !hasPath) && this._types[ext] || null;
};

/**
 * Return file extension associated with a mime type
 */
Mime$1.prototype.getExtension = function(type) {
  type = /^\s*([^;\s]*)/.test(type) && RegExp.$1;
  return type && this._extensions[type.toLowerCase()] || null;
};

var Mime_1 = Mime$1;

var standard = {"application/andrew-inset":["ez"],"application/applixware":["aw"],"application/atom+xml":["atom"],"application/atomcat+xml":["atomcat"],"application/atomdeleted+xml":["atomdeleted"],"application/atomsvc+xml":["atomsvc"],"application/atsc-dwd+xml":["dwd"],"application/atsc-held+xml":["held"],"application/atsc-rsat+xml":["rsat"],"application/bdoc":["bdoc"],"application/calendar+xml":["xcs"],"application/ccxml+xml":["ccxml"],"application/cdfx+xml":["cdfx"],"application/cdmi-capability":["cdmia"],"application/cdmi-container":["cdmic"],"application/cdmi-domain":["cdmid"],"application/cdmi-object":["cdmio"],"application/cdmi-queue":["cdmiq"],"application/cu-seeme":["cu"],"application/dash+xml":["mpd"],"application/davmount+xml":["davmount"],"application/docbook+xml":["dbk"],"application/dssc+der":["dssc"],"application/dssc+xml":["xdssc"],"application/ecmascript":["es","ecma"],"application/emma+xml":["emma"],"application/emotionml+xml":["emotionml"],"application/epub+zip":["epub"],"application/exi":["exi"],"application/express":["exp"],"application/fdt+xml":["fdt"],"application/font-tdpfr":["pfr"],"application/geo+json":["geojson"],"application/gml+xml":["gml"],"application/gpx+xml":["gpx"],"application/gxf":["gxf"],"application/gzip":["gz"],"application/hjson":["hjson"],"application/hyperstudio":["stk"],"application/inkml+xml":["ink","inkml"],"application/ipfix":["ipfix"],"application/its+xml":["its"],"application/java-archive":["jar","war","ear"],"application/java-serialized-object":["ser"],"application/java-vm":["class"],"application/javascript":["js","mjs"],"application/json":["json","map"],"application/json5":["json5"],"application/jsonml+json":["jsonml"],"application/ld+json":["jsonld"],"application/lgr+xml":["lgr"],"application/lost+xml":["lostxml"],"application/mac-binhex40":["hqx"],"application/mac-compactpro":["cpt"],"application/mads+xml":["mads"],"application/manifest+json":["webmanifest"],"application/marc":["mrc"],"application/marcxml+xml":["mrcx"],"application/mathematica":["ma","nb","mb"],"application/mathml+xml":["mathml"],"application/mbox":["mbox"],"application/mediaservercontrol+xml":["mscml"],"application/metalink+xml":["metalink"],"application/metalink4+xml":["meta4"],"application/mets+xml":["mets"],"application/mmt-aei+xml":["maei"],"application/mmt-usd+xml":["musd"],"application/mods+xml":["mods"],"application/mp21":["m21","mp21"],"application/mp4":["mp4s","m4p"],"application/msword":["doc","dot"],"application/mxf":["mxf"],"application/n-quads":["nq"],"application/n-triples":["nt"],"application/node":["cjs"],"application/octet-stream":["bin","dms","lrf","mar","so","dist","distz","pkg","bpk","dump","elc","deploy","exe","dll","deb","dmg","iso","img","msi","msp","msm","buffer"],"application/oda":["oda"],"application/oebps-package+xml":["opf"],"application/ogg":["ogx"],"application/omdoc+xml":["omdoc"],"application/onenote":["onetoc","onetoc2","onetmp","onepkg"],"application/oxps":["oxps"],"application/p2p-overlay+xml":["relo"],"application/patch-ops-error+xml":["xer"],"application/pdf":["pdf"],"application/pgp-encrypted":["pgp"],"application/pgp-signature":["asc","sig"],"application/pics-rules":["prf"],"application/pkcs10":["p10"],"application/pkcs7-mime":["p7m","p7c"],"application/pkcs7-signature":["p7s"],"application/pkcs8":["p8"],"application/pkix-attr-cert":["ac"],"application/pkix-cert":["cer"],"application/pkix-crl":["crl"],"application/pkix-pkipath":["pkipath"],"application/pkixcmp":["pki"],"application/pls+xml":["pls"],"application/postscript":["ai","eps","ps"],"application/provenance+xml":["provx"],"application/pskc+xml":["pskcxml"],"application/raml+yaml":["raml"],"application/rdf+xml":["rdf","owl"],"application/reginfo+xml":["rif"],"application/relax-ng-compact-syntax":["rnc"],"application/resource-lists+xml":["rl"],"application/resource-lists-diff+xml":["rld"],"application/rls-services+xml":["rs"],"application/route-apd+xml":["rapd"],"application/route-s-tsid+xml":["sls"],"application/route-usd+xml":["rusd"],"application/rpki-ghostbusters":["gbr"],"application/rpki-manifest":["mft"],"application/rpki-roa":["roa"],"application/rsd+xml":["rsd"],"application/rss+xml":["rss"],"application/rtf":["rtf"],"application/sbml+xml":["sbml"],"application/scvp-cv-request":["scq"],"application/scvp-cv-response":["scs"],"application/scvp-vp-request":["spq"],"application/scvp-vp-response":["spp"],"application/sdp":["sdp"],"application/senml+xml":["senmlx"],"application/sensml+xml":["sensmlx"],"application/set-payment-initiation":["setpay"],"application/set-registration-initiation":["setreg"],"application/shf+xml":["shf"],"application/sieve":["siv","sieve"],"application/smil+xml":["smi","smil"],"application/sparql-query":["rq"],"application/sparql-results+xml":["srx"],"application/srgs":["gram"],"application/srgs+xml":["grxml"],"application/sru+xml":["sru"],"application/ssdl+xml":["ssdl"],"application/ssml+xml":["ssml"],"application/swid+xml":["swidtag"],"application/tei+xml":["tei","teicorpus"],"application/thraud+xml":["tfi"],"application/timestamped-data":["tsd"],"application/toml":["toml"],"application/trig":["trig"],"application/ttml+xml":["ttml"],"application/ubjson":["ubj"],"application/urc-ressheet+xml":["rsheet"],"application/urc-targetdesc+xml":["td"],"application/voicexml+xml":["vxml"],"application/wasm":["wasm"],"application/widget":["wgt"],"application/winhlp":["hlp"],"application/wsdl+xml":["wsdl"],"application/wspolicy+xml":["wspolicy"],"application/xaml+xml":["xaml"],"application/xcap-att+xml":["xav"],"application/xcap-caps+xml":["xca"],"application/xcap-diff+xml":["xdf"],"application/xcap-el+xml":["xel"],"application/xcap-ns+xml":["xns"],"application/xenc+xml":["xenc"],"application/xhtml+xml":["xhtml","xht"],"application/xliff+xml":["xlf"],"application/xml":["xml","xsl","xsd","rng"],"application/xml-dtd":["dtd"],"application/xop+xml":["xop"],"application/xproc+xml":["xpl"],"application/xslt+xml":["*xsl","xslt"],"application/xspf+xml":["xspf"],"application/xv+xml":["mxml","xhvml","xvml","xvm"],"application/yang":["yang"],"application/yin+xml":["yin"],"application/zip":["zip"],"audio/3gpp":["*3gpp"],"audio/adpcm":["adp"],"audio/amr":["amr"],"audio/basic":["au","snd"],"audio/midi":["mid","midi","kar","rmi"],"audio/mobile-xmf":["mxmf"],"audio/mp3":["*mp3"],"audio/mp4":["m4a","mp4a"],"audio/mpeg":["mpga","mp2","mp2a","mp3","m2a","m3a"],"audio/ogg":["oga","ogg","spx","opus"],"audio/s3m":["s3m"],"audio/silk":["sil"],"audio/wav":["wav"],"audio/wave":["*wav"],"audio/webm":["weba"],"audio/xm":["xm"],"font/collection":["ttc"],"font/otf":["otf"],"font/ttf":["ttf"],"font/woff":["woff"],"font/woff2":["woff2"],"image/aces":["exr"],"image/apng":["apng"],"image/avif":["avif"],"image/bmp":["bmp"],"image/cgm":["cgm"],"image/dicom-rle":["drle"],"image/emf":["emf"],"image/fits":["fits"],"image/g3fax":["g3"],"image/gif":["gif"],"image/heic":["heic"],"image/heic-sequence":["heics"],"image/heif":["heif"],"image/heif-sequence":["heifs"],"image/hej2k":["hej2"],"image/hsj2":["hsj2"],"image/ief":["ief"],"image/jls":["jls"],"image/jp2":["jp2","jpg2"],"image/jpeg":["jpeg","jpg","jpe"],"image/jph":["jph"],"image/jphc":["jhc"],"image/jpm":["jpm"],"image/jpx":["jpx","jpf"],"image/jxr":["jxr"],"image/jxra":["jxra"],"image/jxrs":["jxrs"],"image/jxs":["jxs"],"image/jxsc":["jxsc"],"image/jxsi":["jxsi"],"image/jxss":["jxss"],"image/ktx":["ktx"],"image/ktx2":["ktx2"],"image/png":["png"],"image/sgi":["sgi"],"image/svg+xml":["svg","svgz"],"image/t38":["t38"],"image/tiff":["tif","tiff"],"image/tiff-fx":["tfx"],"image/webp":["webp"],"image/wmf":["wmf"],"message/disposition-notification":["disposition-notification"],"message/global":["u8msg"],"message/global-delivery-status":["u8dsn"],"message/global-disposition-notification":["u8mdn"],"message/global-headers":["u8hdr"],"message/rfc822":["eml","mime"],"model/3mf":["3mf"],"model/gltf+json":["gltf"],"model/gltf-binary":["glb"],"model/iges":["igs","iges"],"model/mesh":["msh","mesh","silo"],"model/mtl":["mtl"],"model/obj":["obj"],"model/step+xml":["stpx"],"model/step+zip":["stpz"],"model/step-xml+zip":["stpxz"],"model/stl":["stl"],"model/vrml":["wrl","vrml"],"model/x3d+binary":["*x3db","x3dbz"],"model/x3d+fastinfoset":["x3db"],"model/x3d+vrml":["*x3dv","x3dvz"],"model/x3d+xml":["x3d","x3dz"],"model/x3d-vrml":["x3dv"],"text/cache-manifest":["appcache","manifest"],"text/calendar":["ics","ifb"],"text/coffeescript":["coffee","litcoffee"],"text/css":["css"],"text/csv":["csv"],"text/html":["html","htm","shtml"],"text/jade":["jade"],"text/jsx":["jsx"],"text/less":["less"],"text/markdown":["markdown","md"],"text/mathml":["mml"],"text/mdx":["mdx"],"text/n3":["n3"],"text/plain":["txt","text","conf","def","list","log","in","ini"],"text/richtext":["rtx"],"text/rtf":["*rtf"],"text/sgml":["sgml","sgm"],"text/shex":["shex"],"text/slim":["slim","slm"],"text/spdx":["spdx"],"text/stylus":["stylus","styl"],"text/tab-separated-values":["tsv"],"text/troff":["t","tr","roff","man","me","ms"],"text/turtle":["ttl"],"text/uri-list":["uri","uris","urls"],"text/vcard":["vcard"],"text/vtt":["vtt"],"text/xml":["*xml"],"text/yaml":["yaml","yml"],"video/3gpp":["3gp","3gpp"],"video/3gpp2":["3g2"],"video/h261":["h261"],"video/h263":["h263"],"video/h264":["h264"],"video/iso.segment":["m4s"],"video/jpeg":["jpgv"],"video/jpm":["*jpm","jpgm"],"video/mj2":["mj2","mjp2"],"video/mp2t":["ts"],"video/mp4":["mp4","mp4v","mpg4"],"video/mpeg":["mpeg","mpg","mpe","m1v","m2v"],"video/ogg":["ogv"],"video/quicktime":["qt","mov"],"video/webm":["webm"]};

var other = {"application/prs.cww":["cww"],"application/vnd.1000minds.decision-model+xml":["1km"],"application/vnd.3gpp.pic-bw-large":["plb"],"application/vnd.3gpp.pic-bw-small":["psb"],"application/vnd.3gpp.pic-bw-var":["pvb"],"application/vnd.3gpp2.tcap":["tcap"],"application/vnd.3m.post-it-notes":["pwn"],"application/vnd.accpac.simply.aso":["aso"],"application/vnd.accpac.simply.imp":["imp"],"application/vnd.acucobol":["acu"],"application/vnd.acucorp":["atc","acutc"],"application/vnd.adobe.air-application-installer-package+zip":["air"],"application/vnd.adobe.formscentral.fcdt":["fcdt"],"application/vnd.adobe.fxp":["fxp","fxpl"],"application/vnd.adobe.xdp+xml":["xdp"],"application/vnd.adobe.xfdf":["xfdf"],"application/vnd.ahead.space":["ahead"],"application/vnd.airzip.filesecure.azf":["azf"],"application/vnd.airzip.filesecure.azs":["azs"],"application/vnd.amazon.ebook":["azw"],"application/vnd.americandynamics.acc":["acc"],"application/vnd.amiga.ami":["ami"],"application/vnd.android.package-archive":["apk"],"application/vnd.anser-web-certificate-issue-initiation":["cii"],"application/vnd.anser-web-funds-transfer-initiation":["fti"],"application/vnd.antix.game-component":["atx"],"application/vnd.apple.installer+xml":["mpkg"],"application/vnd.apple.keynote":["key"],"application/vnd.apple.mpegurl":["m3u8"],"application/vnd.apple.numbers":["numbers"],"application/vnd.apple.pages":["pages"],"application/vnd.apple.pkpass":["pkpass"],"application/vnd.aristanetworks.swi":["swi"],"application/vnd.astraea-software.iota":["iota"],"application/vnd.audiograph":["aep"],"application/vnd.balsamiq.bmml+xml":["bmml"],"application/vnd.blueice.multipass":["mpm"],"application/vnd.bmi":["bmi"],"application/vnd.businessobjects":["rep"],"application/vnd.chemdraw+xml":["cdxml"],"application/vnd.chipnuts.karaoke-mmd":["mmd"],"application/vnd.cinderella":["cdy"],"application/vnd.citationstyles.style+xml":["csl"],"application/vnd.claymore":["cla"],"application/vnd.cloanto.rp9":["rp9"],"application/vnd.clonk.c4group":["c4g","c4d","c4f","c4p","c4u"],"application/vnd.cluetrust.cartomobile-config":["c11amc"],"application/vnd.cluetrust.cartomobile-config-pkg":["c11amz"],"application/vnd.commonspace":["csp"],"application/vnd.contact.cmsg":["cdbcmsg"],"application/vnd.cosmocaller":["cmc"],"application/vnd.crick.clicker":["clkx"],"application/vnd.crick.clicker.keyboard":["clkk"],"application/vnd.crick.clicker.palette":["clkp"],"application/vnd.crick.clicker.template":["clkt"],"application/vnd.crick.clicker.wordbank":["clkw"],"application/vnd.criticaltools.wbs+xml":["wbs"],"application/vnd.ctc-posml":["pml"],"application/vnd.cups-ppd":["ppd"],"application/vnd.curl.car":["car"],"application/vnd.curl.pcurl":["pcurl"],"application/vnd.dart":["dart"],"application/vnd.data-vision.rdz":["rdz"],"application/vnd.dbf":["dbf"],"application/vnd.dece.data":["uvf","uvvf","uvd","uvvd"],"application/vnd.dece.ttml+xml":["uvt","uvvt"],"application/vnd.dece.unspecified":["uvx","uvvx"],"application/vnd.dece.zip":["uvz","uvvz"],"application/vnd.denovo.fcselayout-link":["fe_launch"],"application/vnd.dna":["dna"],"application/vnd.dolby.mlp":["mlp"],"application/vnd.dpgraph":["dpg"],"application/vnd.dreamfactory":["dfac"],"application/vnd.ds-keypoint":["kpxx"],"application/vnd.dvb.ait":["ait"],"application/vnd.dvb.service":["svc"],"application/vnd.dynageo":["geo"],"application/vnd.ecowin.chart":["mag"],"application/vnd.enliven":["nml"],"application/vnd.epson.esf":["esf"],"application/vnd.epson.msf":["msf"],"application/vnd.epson.quickanime":["qam"],"application/vnd.epson.salt":["slt"],"application/vnd.epson.ssf":["ssf"],"application/vnd.eszigno3+xml":["es3","et3"],"application/vnd.ezpix-album":["ez2"],"application/vnd.ezpix-package":["ez3"],"application/vnd.fdf":["fdf"],"application/vnd.fdsn.mseed":["mseed"],"application/vnd.fdsn.seed":["seed","dataless"],"application/vnd.flographit":["gph"],"application/vnd.fluxtime.clip":["ftc"],"application/vnd.framemaker":["fm","frame","maker","book"],"application/vnd.frogans.fnc":["fnc"],"application/vnd.frogans.ltf":["ltf"],"application/vnd.fsc.weblaunch":["fsc"],"application/vnd.fujitsu.oasys":["oas"],"application/vnd.fujitsu.oasys2":["oa2"],"application/vnd.fujitsu.oasys3":["oa3"],"application/vnd.fujitsu.oasysgp":["fg5"],"application/vnd.fujitsu.oasysprs":["bh2"],"application/vnd.fujixerox.ddd":["ddd"],"application/vnd.fujixerox.docuworks":["xdw"],"application/vnd.fujixerox.docuworks.binder":["xbd"],"application/vnd.fuzzysheet":["fzs"],"application/vnd.genomatix.tuxedo":["txd"],"application/vnd.geogebra.file":["ggb"],"application/vnd.geogebra.tool":["ggt"],"application/vnd.geometry-explorer":["gex","gre"],"application/vnd.geonext":["gxt"],"application/vnd.geoplan":["g2w"],"application/vnd.geospace":["g3w"],"application/vnd.gmx":["gmx"],"application/vnd.google-apps.document":["gdoc"],"application/vnd.google-apps.presentation":["gslides"],"application/vnd.google-apps.spreadsheet":["gsheet"],"application/vnd.google-earth.kml+xml":["kml"],"application/vnd.google-earth.kmz":["kmz"],"application/vnd.grafeq":["gqf","gqs"],"application/vnd.groove-account":["gac"],"application/vnd.groove-help":["ghf"],"application/vnd.groove-identity-message":["gim"],"application/vnd.groove-injector":["grv"],"application/vnd.groove-tool-message":["gtm"],"application/vnd.groove-tool-template":["tpl"],"application/vnd.groove-vcard":["vcg"],"application/vnd.hal+xml":["hal"],"application/vnd.handheld-entertainment+xml":["zmm"],"application/vnd.hbci":["hbci"],"application/vnd.hhe.lesson-player":["les"],"application/vnd.hp-hpgl":["hpgl"],"application/vnd.hp-hpid":["hpid"],"application/vnd.hp-hps":["hps"],"application/vnd.hp-jlyt":["jlt"],"application/vnd.hp-pcl":["pcl"],"application/vnd.hp-pclxl":["pclxl"],"application/vnd.hydrostatix.sof-data":["sfd-hdstx"],"application/vnd.ibm.minipay":["mpy"],"application/vnd.ibm.modcap":["afp","listafp","list3820"],"application/vnd.ibm.rights-management":["irm"],"application/vnd.ibm.secure-container":["sc"],"application/vnd.iccprofile":["icc","icm"],"application/vnd.igloader":["igl"],"application/vnd.immervision-ivp":["ivp"],"application/vnd.immervision-ivu":["ivu"],"application/vnd.insors.igm":["igm"],"application/vnd.intercon.formnet":["xpw","xpx"],"application/vnd.intergeo":["i2g"],"application/vnd.intu.qbo":["qbo"],"application/vnd.intu.qfx":["qfx"],"application/vnd.ipunplugged.rcprofile":["rcprofile"],"application/vnd.irepository.package+xml":["irp"],"application/vnd.is-xpr":["xpr"],"application/vnd.isac.fcs":["fcs"],"application/vnd.jam":["jam"],"application/vnd.jcp.javame.midlet-rms":["rms"],"application/vnd.jisp":["jisp"],"application/vnd.joost.joda-archive":["joda"],"application/vnd.kahootz":["ktz","ktr"],"application/vnd.kde.karbon":["karbon"],"application/vnd.kde.kchart":["chrt"],"application/vnd.kde.kformula":["kfo"],"application/vnd.kde.kivio":["flw"],"application/vnd.kde.kontour":["kon"],"application/vnd.kde.kpresenter":["kpr","kpt"],"application/vnd.kde.kspread":["ksp"],"application/vnd.kde.kword":["kwd","kwt"],"application/vnd.kenameaapp":["htke"],"application/vnd.kidspiration":["kia"],"application/vnd.kinar":["kne","knp"],"application/vnd.koan":["skp","skd","skt","skm"],"application/vnd.kodak-descriptor":["sse"],"application/vnd.las.las+xml":["lasxml"],"application/vnd.llamagraphics.life-balance.desktop":["lbd"],"application/vnd.llamagraphics.life-balance.exchange+xml":["lbe"],"application/vnd.lotus-1-2-3":["123"],"application/vnd.lotus-approach":["apr"],"application/vnd.lotus-freelance":["pre"],"application/vnd.lotus-notes":["nsf"],"application/vnd.lotus-organizer":["org"],"application/vnd.lotus-screencam":["scm"],"application/vnd.lotus-wordpro":["lwp"],"application/vnd.macports.portpkg":["portpkg"],"application/vnd.mapbox-vector-tile":["mvt"],"application/vnd.mcd":["mcd"],"application/vnd.medcalcdata":["mc1"],"application/vnd.mediastation.cdkey":["cdkey"],"application/vnd.mfer":["mwf"],"application/vnd.mfmp":["mfm"],"application/vnd.micrografx.flo":["flo"],"application/vnd.micrografx.igx":["igx"],"application/vnd.mif":["mif"],"application/vnd.mobius.daf":["daf"],"application/vnd.mobius.dis":["dis"],"application/vnd.mobius.mbk":["mbk"],"application/vnd.mobius.mqy":["mqy"],"application/vnd.mobius.msl":["msl"],"application/vnd.mobius.plc":["plc"],"application/vnd.mobius.txf":["txf"],"application/vnd.mophun.application":["mpn"],"application/vnd.mophun.certificate":["mpc"],"application/vnd.mozilla.xul+xml":["xul"],"application/vnd.ms-artgalry":["cil"],"application/vnd.ms-cab-compressed":["cab"],"application/vnd.ms-excel":["xls","xlm","xla","xlc","xlt","xlw"],"application/vnd.ms-excel.addin.macroenabled.12":["xlam"],"application/vnd.ms-excel.sheet.binary.macroenabled.12":["xlsb"],"application/vnd.ms-excel.sheet.macroenabled.12":["xlsm"],"application/vnd.ms-excel.template.macroenabled.12":["xltm"],"application/vnd.ms-fontobject":["eot"],"application/vnd.ms-htmlhelp":["chm"],"application/vnd.ms-ims":["ims"],"application/vnd.ms-lrm":["lrm"],"application/vnd.ms-officetheme":["thmx"],"application/vnd.ms-outlook":["msg"],"application/vnd.ms-pki.seccat":["cat"],"application/vnd.ms-pki.stl":["*stl"],"application/vnd.ms-powerpoint":["ppt","pps","pot"],"application/vnd.ms-powerpoint.addin.macroenabled.12":["ppam"],"application/vnd.ms-powerpoint.presentation.macroenabled.12":["pptm"],"application/vnd.ms-powerpoint.slide.macroenabled.12":["sldm"],"application/vnd.ms-powerpoint.slideshow.macroenabled.12":["ppsm"],"application/vnd.ms-powerpoint.template.macroenabled.12":["potm"],"application/vnd.ms-project":["mpp","mpt"],"application/vnd.ms-word.document.macroenabled.12":["docm"],"application/vnd.ms-word.template.macroenabled.12":["dotm"],"application/vnd.ms-works":["wps","wks","wcm","wdb"],"application/vnd.ms-wpl":["wpl"],"application/vnd.ms-xpsdocument":["xps"],"application/vnd.mseq":["mseq"],"application/vnd.musician":["mus"],"application/vnd.muvee.style":["msty"],"application/vnd.mynfc":["taglet"],"application/vnd.neurolanguage.nlu":["nlu"],"application/vnd.nitf":["ntf","nitf"],"application/vnd.noblenet-directory":["nnd"],"application/vnd.noblenet-sealer":["nns"],"application/vnd.noblenet-web":["nnw"],"application/vnd.nokia.n-gage.ac+xml":["*ac"],"application/vnd.nokia.n-gage.data":["ngdat"],"application/vnd.nokia.n-gage.symbian.install":["n-gage"],"application/vnd.nokia.radio-preset":["rpst"],"application/vnd.nokia.radio-presets":["rpss"],"application/vnd.novadigm.edm":["edm"],"application/vnd.novadigm.edx":["edx"],"application/vnd.novadigm.ext":["ext"],"application/vnd.oasis.opendocument.chart":["odc"],"application/vnd.oasis.opendocument.chart-template":["otc"],"application/vnd.oasis.opendocument.database":["odb"],"application/vnd.oasis.opendocument.formula":["odf"],"application/vnd.oasis.opendocument.formula-template":["odft"],"application/vnd.oasis.opendocument.graphics":["odg"],"application/vnd.oasis.opendocument.graphics-template":["otg"],"application/vnd.oasis.opendocument.image":["odi"],"application/vnd.oasis.opendocument.image-template":["oti"],"application/vnd.oasis.opendocument.presentation":["odp"],"application/vnd.oasis.opendocument.presentation-template":["otp"],"application/vnd.oasis.opendocument.spreadsheet":["ods"],"application/vnd.oasis.opendocument.spreadsheet-template":["ots"],"application/vnd.oasis.opendocument.text":["odt"],"application/vnd.oasis.opendocument.text-master":["odm"],"application/vnd.oasis.opendocument.text-template":["ott"],"application/vnd.oasis.opendocument.text-web":["oth"],"application/vnd.olpc-sugar":["xo"],"application/vnd.oma.dd2+xml":["dd2"],"application/vnd.openblox.game+xml":["obgx"],"application/vnd.openofficeorg.extension":["oxt"],"application/vnd.openstreetmap.data+xml":["osm"],"application/vnd.openxmlformats-officedocument.presentationml.presentation":["pptx"],"application/vnd.openxmlformats-officedocument.presentationml.slide":["sldx"],"application/vnd.openxmlformats-officedocument.presentationml.slideshow":["ppsx"],"application/vnd.openxmlformats-officedocument.presentationml.template":["potx"],"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":["xlsx"],"application/vnd.openxmlformats-officedocument.spreadsheetml.template":["xltx"],"application/vnd.openxmlformats-officedocument.wordprocessingml.document":["docx"],"application/vnd.openxmlformats-officedocument.wordprocessingml.template":["dotx"],"application/vnd.osgeo.mapguide.package":["mgp"],"application/vnd.osgi.dp":["dp"],"application/vnd.osgi.subsystem":["esa"],"application/vnd.palm":["pdb","pqa","oprc"],"application/vnd.pawaafile":["paw"],"application/vnd.pg.format":["str"],"application/vnd.pg.osasli":["ei6"],"application/vnd.picsel":["efif"],"application/vnd.pmi.widget":["wg"],"application/vnd.pocketlearn":["plf"],"application/vnd.powerbuilder6":["pbd"],"application/vnd.previewsystems.box":["box"],"application/vnd.proteus.magazine":["mgz"],"application/vnd.publishare-delta-tree":["qps"],"application/vnd.pvi.ptid1":["ptid"],"application/vnd.quark.quarkxpress":["qxd","qxt","qwd","qwt","qxl","qxb"],"application/vnd.rar":["rar"],"application/vnd.realvnc.bed":["bed"],"application/vnd.recordare.musicxml":["mxl"],"application/vnd.recordare.musicxml+xml":["musicxml"],"application/vnd.rig.cryptonote":["cryptonote"],"application/vnd.rim.cod":["cod"],"application/vnd.rn-realmedia":["rm"],"application/vnd.rn-realmedia-vbr":["rmvb"],"application/vnd.route66.link66+xml":["link66"],"application/vnd.sailingtracker.track":["st"],"application/vnd.seemail":["see"],"application/vnd.sema":["sema"],"application/vnd.semd":["semd"],"application/vnd.semf":["semf"],"application/vnd.shana.informed.formdata":["ifm"],"application/vnd.shana.informed.formtemplate":["itp"],"application/vnd.shana.informed.interchange":["iif"],"application/vnd.shana.informed.package":["ipk"],"application/vnd.simtech-mindmapper":["twd","twds"],"application/vnd.smaf":["mmf"],"application/vnd.smart.teacher":["teacher"],"application/vnd.software602.filler.form+xml":["fo"],"application/vnd.solent.sdkm+xml":["sdkm","sdkd"],"application/vnd.spotfire.dxp":["dxp"],"application/vnd.spotfire.sfs":["sfs"],"application/vnd.stardivision.calc":["sdc"],"application/vnd.stardivision.draw":["sda"],"application/vnd.stardivision.impress":["sdd"],"application/vnd.stardivision.math":["smf"],"application/vnd.stardivision.writer":["sdw","vor"],"application/vnd.stardivision.writer-global":["sgl"],"application/vnd.stepmania.package":["smzip"],"application/vnd.stepmania.stepchart":["sm"],"application/vnd.sun.wadl+xml":["wadl"],"application/vnd.sun.xml.calc":["sxc"],"application/vnd.sun.xml.calc.template":["stc"],"application/vnd.sun.xml.draw":["sxd"],"application/vnd.sun.xml.draw.template":["std"],"application/vnd.sun.xml.impress":["sxi"],"application/vnd.sun.xml.impress.template":["sti"],"application/vnd.sun.xml.math":["sxm"],"application/vnd.sun.xml.writer":["sxw"],"application/vnd.sun.xml.writer.global":["sxg"],"application/vnd.sun.xml.writer.template":["stw"],"application/vnd.sus-calendar":["sus","susp"],"application/vnd.svd":["svd"],"application/vnd.symbian.install":["sis","sisx"],"application/vnd.syncml+xml":["xsm"],"application/vnd.syncml.dm+wbxml":["bdm"],"application/vnd.syncml.dm+xml":["xdm"],"application/vnd.syncml.dmddf+xml":["ddf"],"application/vnd.tao.intent-module-archive":["tao"],"application/vnd.tcpdump.pcap":["pcap","cap","dmp"],"application/vnd.tmobile-livetv":["tmo"],"application/vnd.trid.tpt":["tpt"],"application/vnd.triscape.mxs":["mxs"],"application/vnd.trueapp":["tra"],"application/vnd.ufdl":["ufd","ufdl"],"application/vnd.uiq.theme":["utz"],"application/vnd.umajin":["umj"],"application/vnd.unity":["unityweb"],"application/vnd.uoml+xml":["uoml"],"application/vnd.vcx":["vcx"],"application/vnd.visio":["vsd","vst","vss","vsw"],"application/vnd.visionary":["vis"],"application/vnd.vsf":["vsf"],"application/vnd.wap.wbxml":["wbxml"],"application/vnd.wap.wmlc":["wmlc"],"application/vnd.wap.wmlscriptc":["wmlsc"],"application/vnd.webturbo":["wtb"],"application/vnd.wolfram.player":["nbp"],"application/vnd.wordperfect":["wpd"],"application/vnd.wqd":["wqd"],"application/vnd.wt.stf":["stf"],"application/vnd.xara":["xar"],"application/vnd.xfdl":["xfdl"],"application/vnd.yamaha.hv-dic":["hvd"],"application/vnd.yamaha.hv-script":["hvs"],"application/vnd.yamaha.hv-voice":["hvp"],"application/vnd.yamaha.openscoreformat":["osf"],"application/vnd.yamaha.openscoreformat.osfpvg+xml":["osfpvg"],"application/vnd.yamaha.smaf-audio":["saf"],"application/vnd.yamaha.smaf-phrase":["spf"],"application/vnd.yellowriver-custom-menu":["cmp"],"application/vnd.zul":["zir","zirz"],"application/vnd.zzazz.deck+xml":["zaz"],"application/x-7z-compressed":["7z"],"application/x-abiword":["abw"],"application/x-ace-compressed":["ace"],"application/x-apple-diskimage":["*dmg"],"application/x-arj":["arj"],"application/x-authorware-bin":["aab","x32","u32","vox"],"application/x-authorware-map":["aam"],"application/x-authorware-seg":["aas"],"application/x-bcpio":["bcpio"],"application/x-bdoc":["*bdoc"],"application/x-bittorrent":["torrent"],"application/x-blorb":["blb","blorb"],"application/x-bzip":["bz"],"application/x-bzip2":["bz2","boz"],"application/x-cbr":["cbr","cba","cbt","cbz","cb7"],"application/x-cdlink":["vcd"],"application/x-cfs-compressed":["cfs"],"application/x-chat":["chat"],"application/x-chess-pgn":["pgn"],"application/x-chrome-extension":["crx"],"application/x-cocoa":["cco"],"application/x-conference":["nsc"],"application/x-cpio":["cpio"],"application/x-csh":["csh"],"application/x-debian-package":["*deb","udeb"],"application/x-dgc-compressed":["dgc"],"application/x-director":["dir","dcr","dxr","cst","cct","cxt","w3d","fgd","swa"],"application/x-doom":["wad"],"application/x-dtbncx+xml":["ncx"],"application/x-dtbook+xml":["dtb"],"application/x-dtbresource+xml":["res"],"application/x-dvi":["dvi"],"application/x-envoy":["evy"],"application/x-eva":["eva"],"application/x-font-bdf":["bdf"],"application/x-font-ghostscript":["gsf"],"application/x-font-linux-psf":["psf"],"application/x-font-pcf":["pcf"],"application/x-font-snf":["snf"],"application/x-font-type1":["pfa","pfb","pfm","afm"],"application/x-freearc":["arc"],"application/x-futuresplash":["spl"],"application/x-gca-compressed":["gca"],"application/x-glulx":["ulx"],"application/x-gnumeric":["gnumeric"],"application/x-gramps-xml":["gramps"],"application/x-gtar":["gtar"],"application/x-hdf":["hdf"],"application/x-httpd-php":["php"],"application/x-install-instructions":["install"],"application/x-iso9660-image":["*iso"],"application/x-iwork-keynote-sffkey":["*key"],"application/x-iwork-numbers-sffnumbers":["*numbers"],"application/x-iwork-pages-sffpages":["*pages"],"application/x-java-archive-diff":["jardiff"],"application/x-java-jnlp-file":["jnlp"],"application/x-keepass2":["kdbx"],"application/x-latex":["latex"],"application/x-lua-bytecode":["luac"],"application/x-lzh-compressed":["lzh","lha"],"application/x-makeself":["run"],"application/x-mie":["mie"],"application/x-mobipocket-ebook":["prc","mobi"],"application/x-ms-application":["application"],"application/x-ms-shortcut":["lnk"],"application/x-ms-wmd":["wmd"],"application/x-ms-wmz":["wmz"],"application/x-ms-xbap":["xbap"],"application/x-msaccess":["mdb"],"application/x-msbinder":["obd"],"application/x-mscardfile":["crd"],"application/x-msclip":["clp"],"application/x-msdos-program":["*exe"],"application/x-msdownload":["*exe","*dll","com","bat","*msi"],"application/x-msmediaview":["mvb","m13","m14"],"application/x-msmetafile":["*wmf","*wmz","*emf","emz"],"application/x-msmoney":["mny"],"application/x-mspublisher":["pub"],"application/x-msschedule":["scd"],"application/x-msterminal":["trm"],"application/x-mswrite":["wri"],"application/x-netcdf":["nc","cdf"],"application/x-ns-proxy-autoconfig":["pac"],"application/x-nzb":["nzb"],"application/x-perl":["pl","pm"],"application/x-pilot":["*prc","*pdb"],"application/x-pkcs12":["p12","pfx"],"application/x-pkcs7-certificates":["p7b","spc"],"application/x-pkcs7-certreqresp":["p7r"],"application/x-rar-compressed":["*rar"],"application/x-redhat-package-manager":["rpm"],"application/x-research-info-systems":["ris"],"application/x-sea":["sea"],"application/x-sh":["sh"],"application/x-shar":["shar"],"application/x-shockwave-flash":["swf"],"application/x-silverlight-app":["xap"],"application/x-sql":["sql"],"application/x-stuffit":["sit"],"application/x-stuffitx":["sitx"],"application/x-subrip":["srt"],"application/x-sv4cpio":["sv4cpio"],"application/x-sv4crc":["sv4crc"],"application/x-t3vm-image":["t3"],"application/x-tads":["gam"],"application/x-tar":["tar"],"application/x-tcl":["tcl","tk"],"application/x-tex":["tex"],"application/x-tex-tfm":["tfm"],"application/x-texinfo":["texinfo","texi"],"application/x-tgif":["*obj"],"application/x-ustar":["ustar"],"application/x-virtualbox-hdd":["hdd"],"application/x-virtualbox-ova":["ova"],"application/x-virtualbox-ovf":["ovf"],"application/x-virtualbox-vbox":["vbox"],"application/x-virtualbox-vbox-extpack":["vbox-extpack"],"application/x-virtualbox-vdi":["vdi"],"application/x-virtualbox-vhd":["vhd"],"application/x-virtualbox-vmdk":["vmdk"],"application/x-wais-source":["src"],"application/x-web-app-manifest+json":["webapp"],"application/x-x509-ca-cert":["der","crt","pem"],"application/x-xfig":["fig"],"application/x-xliff+xml":["*xlf"],"application/x-xpinstall":["xpi"],"application/x-xz":["xz"],"application/x-zmachine":["z1","z2","z3","z4","z5","z6","z7","z8"],"audio/vnd.dece.audio":["uva","uvva"],"audio/vnd.digital-winds":["eol"],"audio/vnd.dra":["dra"],"audio/vnd.dts":["dts"],"audio/vnd.dts.hd":["dtshd"],"audio/vnd.lucent.voice":["lvp"],"audio/vnd.ms-playready.media.pya":["pya"],"audio/vnd.nuera.ecelp4800":["ecelp4800"],"audio/vnd.nuera.ecelp7470":["ecelp7470"],"audio/vnd.nuera.ecelp9600":["ecelp9600"],"audio/vnd.rip":["rip"],"audio/x-aac":["aac"],"audio/x-aiff":["aif","aiff","aifc"],"audio/x-caf":["caf"],"audio/x-flac":["flac"],"audio/x-m4a":["*m4a"],"audio/x-matroska":["mka"],"audio/x-mpegurl":["m3u"],"audio/x-ms-wax":["wax"],"audio/x-ms-wma":["wma"],"audio/x-pn-realaudio":["ram","ra"],"audio/x-pn-realaudio-plugin":["rmp"],"audio/x-realaudio":["*ra"],"audio/x-wav":["*wav"],"chemical/x-cdx":["cdx"],"chemical/x-cif":["cif"],"chemical/x-cmdf":["cmdf"],"chemical/x-cml":["cml"],"chemical/x-csml":["csml"],"chemical/x-xyz":["xyz"],"image/prs.btif":["btif"],"image/prs.pti":["pti"],"image/vnd.adobe.photoshop":["psd"],"image/vnd.airzip.accelerator.azv":["azv"],"image/vnd.dece.graphic":["uvi","uvvi","uvg","uvvg"],"image/vnd.djvu":["djvu","djv"],"image/vnd.dvb.subtitle":["*sub"],"image/vnd.dwg":["dwg"],"image/vnd.dxf":["dxf"],"image/vnd.fastbidsheet":["fbs"],"image/vnd.fpx":["fpx"],"image/vnd.fst":["fst"],"image/vnd.fujixerox.edmics-mmr":["mmr"],"image/vnd.fujixerox.edmics-rlc":["rlc"],"image/vnd.microsoft.icon":["ico"],"image/vnd.ms-dds":["dds"],"image/vnd.ms-modi":["mdi"],"image/vnd.ms-photo":["wdp"],"image/vnd.net-fpx":["npx"],"image/vnd.pco.b16":["b16"],"image/vnd.tencent.tap":["tap"],"image/vnd.valve.source.texture":["vtf"],"image/vnd.wap.wbmp":["wbmp"],"image/vnd.xiff":["xif"],"image/vnd.zbrush.pcx":["pcx"],"image/x-3ds":["3ds"],"image/x-cmu-raster":["ras"],"image/x-cmx":["cmx"],"image/x-freehand":["fh","fhc","fh4","fh5","fh7"],"image/x-icon":["*ico"],"image/x-jng":["jng"],"image/x-mrsid-image":["sid"],"image/x-ms-bmp":["*bmp"],"image/x-pcx":["*pcx"],"image/x-pict":["pic","pct"],"image/x-portable-anymap":["pnm"],"image/x-portable-bitmap":["pbm"],"image/x-portable-graymap":["pgm"],"image/x-portable-pixmap":["ppm"],"image/x-rgb":["rgb"],"image/x-tga":["tga"],"image/x-xbitmap":["xbm"],"image/x-xpixmap":["xpm"],"image/x-xwindowdump":["xwd"],"message/vnd.wfa.wsc":["wsc"],"model/vnd.collada+xml":["dae"],"model/vnd.dwf":["dwf"],"model/vnd.gdl":["gdl"],"model/vnd.gtw":["gtw"],"model/vnd.mts":["mts"],"model/vnd.opengex":["ogex"],"model/vnd.parasolid.transmit.binary":["x_b"],"model/vnd.parasolid.transmit.text":["x_t"],"model/vnd.sap.vds":["vds"],"model/vnd.usdz+zip":["usdz"],"model/vnd.valve.source.compiled-map":["bsp"],"model/vnd.vtu":["vtu"],"text/prs.lines.tag":["dsc"],"text/vnd.curl":["curl"],"text/vnd.curl.dcurl":["dcurl"],"text/vnd.curl.mcurl":["mcurl"],"text/vnd.curl.scurl":["scurl"],"text/vnd.dvb.subtitle":["sub"],"text/vnd.fly":["fly"],"text/vnd.fmi.flexstor":["flx"],"text/vnd.graphviz":["gv"],"text/vnd.in3d.3dml":["3dml"],"text/vnd.in3d.spot":["spot"],"text/vnd.sun.j2me.app-descriptor":["jad"],"text/vnd.wap.wml":["wml"],"text/vnd.wap.wmlscript":["wmls"],"text/x-asm":["s","asm"],"text/x-c":["c","cc","cxx","cpp","h","hh","dic"],"text/x-component":["htc"],"text/x-fortran":["f","for","f77","f90"],"text/x-handlebars-template":["hbs"],"text/x-java-source":["java"],"text/x-lua":["lua"],"text/x-markdown":["mkd"],"text/x-nfo":["nfo"],"text/x-opml":["opml"],"text/x-org":["*org"],"text/x-pascal":["p","pas"],"text/x-processing":["pde"],"text/x-sass":["sass"],"text/x-scss":["scss"],"text/x-setext":["etx"],"text/x-sfv":["sfv"],"text/x-suse-ymp":["ymp"],"text/x-uuencode":["uu"],"text/x-vcalendar":["vcs"],"text/x-vcard":["vcf"],"video/vnd.dece.hd":["uvh","uvvh"],"video/vnd.dece.mobile":["uvm","uvvm"],"video/vnd.dece.pd":["uvp","uvvp"],"video/vnd.dece.sd":["uvs","uvvs"],"video/vnd.dece.video":["uvv","uvvv"],"video/vnd.dvb.file":["dvb"],"video/vnd.fvt":["fvt"],"video/vnd.mpegurl":["mxu","m4u"],"video/vnd.ms-playready.media.pyv":["pyv"],"video/vnd.uvvu.mp4":["uvu","uvvu"],"video/vnd.vivo":["viv"],"video/x-f4v":["f4v"],"video/x-fli":["fli"],"video/x-flv":["flv"],"video/x-m4v":["m4v"],"video/x-matroska":["mkv","mk3d","mks"],"video/x-mng":["mng"],"video/x-ms-asf":["asf","asx"],"video/x-ms-vob":["vob"],"video/x-ms-wm":["wm"],"video/x-ms-wmv":["wmv"],"video/x-ms-wmx":["wmx"],"video/x-ms-wvx":["wvx"],"video/x-msvideo":["avi"],"video/x-sgi-movie":["movie"],"video/x-smv":["smv"],"x-conference/x-cooltalk":["ice"]};

let Mime = Mime_1;
new Mime(standard, other);

if (typeof process !== 'undefined') {
	(process.env || {});
	process.stdout && process.stdout.isTTY;
}

var eastasianwidth = {exports: {}};

(function (module) {
var eaw = {};

{
  module.exports = eaw;
}

eaw.eastAsianWidth = function(character) {
  var x = character.charCodeAt(0);
  var y = (character.length == 2) ? character.charCodeAt(1) : 0;
  var codePoint = x;
  if ((0xD800 <= x && x <= 0xDBFF) && (0xDC00 <= y && y <= 0xDFFF)) {
    x &= 0x3FF;
    y &= 0x3FF;
    codePoint = (x << 10) | y;
    codePoint += 0x10000;
  }

  if ((0x3000 == codePoint) ||
      (0xFF01 <= codePoint && codePoint <= 0xFF60) ||
      (0xFFE0 <= codePoint && codePoint <= 0xFFE6)) {
    return 'F';
  }
  if ((0x20A9 == codePoint) ||
      (0xFF61 <= codePoint && codePoint <= 0xFFBE) ||
      (0xFFC2 <= codePoint && codePoint <= 0xFFC7) ||
      (0xFFCA <= codePoint && codePoint <= 0xFFCF) ||
      (0xFFD2 <= codePoint && codePoint <= 0xFFD7) ||
      (0xFFDA <= codePoint && codePoint <= 0xFFDC) ||
      (0xFFE8 <= codePoint && codePoint <= 0xFFEE)) {
    return 'H';
  }
  if ((0x1100 <= codePoint && codePoint <= 0x115F) ||
      (0x11A3 <= codePoint && codePoint <= 0x11A7) ||
      (0x11FA <= codePoint && codePoint <= 0x11FF) ||
      (0x2329 <= codePoint && codePoint <= 0x232A) ||
      (0x2E80 <= codePoint && codePoint <= 0x2E99) ||
      (0x2E9B <= codePoint && codePoint <= 0x2EF3) ||
      (0x2F00 <= codePoint && codePoint <= 0x2FD5) ||
      (0x2FF0 <= codePoint && codePoint <= 0x2FFB) ||
      (0x3001 <= codePoint && codePoint <= 0x303E) ||
      (0x3041 <= codePoint && codePoint <= 0x3096) ||
      (0x3099 <= codePoint && codePoint <= 0x30FF) ||
      (0x3105 <= codePoint && codePoint <= 0x312D) ||
      (0x3131 <= codePoint && codePoint <= 0x318E) ||
      (0x3190 <= codePoint && codePoint <= 0x31BA) ||
      (0x31C0 <= codePoint && codePoint <= 0x31E3) ||
      (0x31F0 <= codePoint && codePoint <= 0x321E) ||
      (0x3220 <= codePoint && codePoint <= 0x3247) ||
      (0x3250 <= codePoint && codePoint <= 0x32FE) ||
      (0x3300 <= codePoint && codePoint <= 0x4DBF) ||
      (0x4E00 <= codePoint && codePoint <= 0xA48C) ||
      (0xA490 <= codePoint && codePoint <= 0xA4C6) ||
      (0xA960 <= codePoint && codePoint <= 0xA97C) ||
      (0xAC00 <= codePoint && codePoint <= 0xD7A3) ||
      (0xD7B0 <= codePoint && codePoint <= 0xD7C6) ||
      (0xD7CB <= codePoint && codePoint <= 0xD7FB) ||
      (0xF900 <= codePoint && codePoint <= 0xFAFF) ||
      (0xFE10 <= codePoint && codePoint <= 0xFE19) ||
      (0xFE30 <= codePoint && codePoint <= 0xFE52) ||
      (0xFE54 <= codePoint && codePoint <= 0xFE66) ||
      (0xFE68 <= codePoint && codePoint <= 0xFE6B) ||
      (0x1B000 <= codePoint && codePoint <= 0x1B001) ||
      (0x1F200 <= codePoint && codePoint <= 0x1F202) ||
      (0x1F210 <= codePoint && codePoint <= 0x1F23A) ||
      (0x1F240 <= codePoint && codePoint <= 0x1F248) ||
      (0x1F250 <= codePoint && codePoint <= 0x1F251) ||
      (0x20000 <= codePoint && codePoint <= 0x2F73F) ||
      (0x2B740 <= codePoint && codePoint <= 0x2FFFD) ||
      (0x30000 <= codePoint && codePoint <= 0x3FFFD)) {
    return 'W';
  }
  if ((0x0020 <= codePoint && codePoint <= 0x007E) ||
      (0x00A2 <= codePoint && codePoint <= 0x00A3) ||
      (0x00A5 <= codePoint && codePoint <= 0x00A6) ||
      (0x00AC == codePoint) ||
      (0x00AF == codePoint) ||
      (0x27E6 <= codePoint && codePoint <= 0x27ED) ||
      (0x2985 <= codePoint && codePoint <= 0x2986)) {
    return 'Na';
  }
  if ((0x00A1 == codePoint) ||
      (0x00A4 == codePoint) ||
      (0x00A7 <= codePoint && codePoint <= 0x00A8) ||
      (0x00AA == codePoint) ||
      (0x00AD <= codePoint && codePoint <= 0x00AE) ||
      (0x00B0 <= codePoint && codePoint <= 0x00B4) ||
      (0x00B6 <= codePoint && codePoint <= 0x00BA) ||
      (0x00BC <= codePoint && codePoint <= 0x00BF) ||
      (0x00C6 == codePoint) ||
      (0x00D0 == codePoint) ||
      (0x00D7 <= codePoint && codePoint <= 0x00D8) ||
      (0x00DE <= codePoint && codePoint <= 0x00E1) ||
      (0x00E6 == codePoint) ||
      (0x00E8 <= codePoint && codePoint <= 0x00EA) ||
      (0x00EC <= codePoint && codePoint <= 0x00ED) ||
      (0x00F0 == codePoint) ||
      (0x00F2 <= codePoint && codePoint <= 0x00F3) ||
      (0x00F7 <= codePoint && codePoint <= 0x00FA) ||
      (0x00FC == codePoint) ||
      (0x00FE == codePoint) ||
      (0x0101 == codePoint) ||
      (0x0111 == codePoint) ||
      (0x0113 == codePoint) ||
      (0x011B == codePoint) ||
      (0x0126 <= codePoint && codePoint <= 0x0127) ||
      (0x012B == codePoint) ||
      (0x0131 <= codePoint && codePoint <= 0x0133) ||
      (0x0138 == codePoint) ||
      (0x013F <= codePoint && codePoint <= 0x0142) ||
      (0x0144 == codePoint) ||
      (0x0148 <= codePoint && codePoint <= 0x014B) ||
      (0x014D == codePoint) ||
      (0x0152 <= codePoint && codePoint <= 0x0153) ||
      (0x0166 <= codePoint && codePoint <= 0x0167) ||
      (0x016B == codePoint) ||
      (0x01CE == codePoint) ||
      (0x01D0 == codePoint) ||
      (0x01D2 == codePoint) ||
      (0x01D4 == codePoint) ||
      (0x01D6 == codePoint) ||
      (0x01D8 == codePoint) ||
      (0x01DA == codePoint) ||
      (0x01DC == codePoint) ||
      (0x0251 == codePoint) ||
      (0x0261 == codePoint) ||
      (0x02C4 == codePoint) ||
      (0x02C7 == codePoint) ||
      (0x02C9 <= codePoint && codePoint <= 0x02CB) ||
      (0x02CD == codePoint) ||
      (0x02D0 == codePoint) ||
      (0x02D8 <= codePoint && codePoint <= 0x02DB) ||
      (0x02DD == codePoint) ||
      (0x02DF == codePoint) ||
      (0x0300 <= codePoint && codePoint <= 0x036F) ||
      (0x0391 <= codePoint && codePoint <= 0x03A1) ||
      (0x03A3 <= codePoint && codePoint <= 0x03A9) ||
      (0x03B1 <= codePoint && codePoint <= 0x03C1) ||
      (0x03C3 <= codePoint && codePoint <= 0x03C9) ||
      (0x0401 == codePoint) ||
      (0x0410 <= codePoint && codePoint <= 0x044F) ||
      (0x0451 == codePoint) ||
      (0x2010 == codePoint) ||
      (0x2013 <= codePoint && codePoint <= 0x2016) ||
      (0x2018 <= codePoint && codePoint <= 0x2019) ||
      (0x201C <= codePoint && codePoint <= 0x201D) ||
      (0x2020 <= codePoint && codePoint <= 0x2022) ||
      (0x2024 <= codePoint && codePoint <= 0x2027) ||
      (0x2030 == codePoint) ||
      (0x2032 <= codePoint && codePoint <= 0x2033) ||
      (0x2035 == codePoint) ||
      (0x203B == codePoint) ||
      (0x203E == codePoint) ||
      (0x2074 == codePoint) ||
      (0x207F == codePoint) ||
      (0x2081 <= codePoint && codePoint <= 0x2084) ||
      (0x20AC == codePoint) ||
      (0x2103 == codePoint) ||
      (0x2105 == codePoint) ||
      (0x2109 == codePoint) ||
      (0x2113 == codePoint) ||
      (0x2116 == codePoint) ||
      (0x2121 <= codePoint && codePoint <= 0x2122) ||
      (0x2126 == codePoint) ||
      (0x212B == codePoint) ||
      (0x2153 <= codePoint && codePoint <= 0x2154) ||
      (0x215B <= codePoint && codePoint <= 0x215E) ||
      (0x2160 <= codePoint && codePoint <= 0x216B) ||
      (0x2170 <= codePoint && codePoint <= 0x2179) ||
      (0x2189 == codePoint) ||
      (0x2190 <= codePoint && codePoint <= 0x2199) ||
      (0x21B8 <= codePoint && codePoint <= 0x21B9) ||
      (0x21D2 == codePoint) ||
      (0x21D4 == codePoint) ||
      (0x21E7 == codePoint) ||
      (0x2200 == codePoint) ||
      (0x2202 <= codePoint && codePoint <= 0x2203) ||
      (0x2207 <= codePoint && codePoint <= 0x2208) ||
      (0x220B == codePoint) ||
      (0x220F == codePoint) ||
      (0x2211 == codePoint) ||
      (0x2215 == codePoint) ||
      (0x221A == codePoint) ||
      (0x221D <= codePoint && codePoint <= 0x2220) ||
      (0x2223 == codePoint) ||
      (0x2225 == codePoint) ||
      (0x2227 <= codePoint && codePoint <= 0x222C) ||
      (0x222E == codePoint) ||
      (0x2234 <= codePoint && codePoint <= 0x2237) ||
      (0x223C <= codePoint && codePoint <= 0x223D) ||
      (0x2248 == codePoint) ||
      (0x224C == codePoint) ||
      (0x2252 == codePoint) ||
      (0x2260 <= codePoint && codePoint <= 0x2261) ||
      (0x2264 <= codePoint && codePoint <= 0x2267) ||
      (0x226A <= codePoint && codePoint <= 0x226B) ||
      (0x226E <= codePoint && codePoint <= 0x226F) ||
      (0x2282 <= codePoint && codePoint <= 0x2283) ||
      (0x2286 <= codePoint && codePoint <= 0x2287) ||
      (0x2295 == codePoint) ||
      (0x2299 == codePoint) ||
      (0x22A5 == codePoint) ||
      (0x22BF == codePoint) ||
      (0x2312 == codePoint) ||
      (0x2460 <= codePoint && codePoint <= 0x24E9) ||
      (0x24EB <= codePoint && codePoint <= 0x254B) ||
      (0x2550 <= codePoint && codePoint <= 0x2573) ||
      (0x2580 <= codePoint && codePoint <= 0x258F) ||
      (0x2592 <= codePoint && codePoint <= 0x2595) ||
      (0x25A0 <= codePoint && codePoint <= 0x25A1) ||
      (0x25A3 <= codePoint && codePoint <= 0x25A9) ||
      (0x25B2 <= codePoint && codePoint <= 0x25B3) ||
      (0x25B6 <= codePoint && codePoint <= 0x25B7) ||
      (0x25BC <= codePoint && codePoint <= 0x25BD) ||
      (0x25C0 <= codePoint && codePoint <= 0x25C1) ||
      (0x25C6 <= codePoint && codePoint <= 0x25C8) ||
      (0x25CB == codePoint) ||
      (0x25CE <= codePoint && codePoint <= 0x25D1) ||
      (0x25E2 <= codePoint && codePoint <= 0x25E5) ||
      (0x25EF == codePoint) ||
      (0x2605 <= codePoint && codePoint <= 0x2606) ||
      (0x2609 == codePoint) ||
      (0x260E <= codePoint && codePoint <= 0x260F) ||
      (0x2614 <= codePoint && codePoint <= 0x2615) ||
      (0x261C == codePoint) ||
      (0x261E == codePoint) ||
      (0x2640 == codePoint) ||
      (0x2642 == codePoint) ||
      (0x2660 <= codePoint && codePoint <= 0x2661) ||
      (0x2663 <= codePoint && codePoint <= 0x2665) ||
      (0x2667 <= codePoint && codePoint <= 0x266A) ||
      (0x266C <= codePoint && codePoint <= 0x266D) ||
      (0x266F == codePoint) ||
      (0x269E <= codePoint && codePoint <= 0x269F) ||
      (0x26BE <= codePoint && codePoint <= 0x26BF) ||
      (0x26C4 <= codePoint && codePoint <= 0x26CD) ||
      (0x26CF <= codePoint && codePoint <= 0x26E1) ||
      (0x26E3 == codePoint) ||
      (0x26E8 <= codePoint && codePoint <= 0x26FF) ||
      (0x273D == codePoint) ||
      (0x2757 == codePoint) ||
      (0x2776 <= codePoint && codePoint <= 0x277F) ||
      (0x2B55 <= codePoint && codePoint <= 0x2B59) ||
      (0x3248 <= codePoint && codePoint <= 0x324F) ||
      (0xE000 <= codePoint && codePoint <= 0xF8FF) ||
      (0xFE00 <= codePoint && codePoint <= 0xFE0F) ||
      (0xFFFD == codePoint) ||
      (0x1F100 <= codePoint && codePoint <= 0x1F10A) ||
      (0x1F110 <= codePoint && codePoint <= 0x1F12D) ||
      (0x1F130 <= codePoint && codePoint <= 0x1F169) ||
      (0x1F170 <= codePoint && codePoint <= 0x1F19A) ||
      (0xE0100 <= codePoint && codePoint <= 0xE01EF) ||
      (0xF0000 <= codePoint && codePoint <= 0xFFFFD) ||
      (0x100000 <= codePoint && codePoint <= 0x10FFFD)) {
    return 'A';
  }

  return 'N';
};

eaw.characterLength = function(character) {
  var code = this.eastAsianWidth(character);
  if (code == 'F' || code == 'W' || code == 'A') {
    return 2;
  } else {
    return 1;
  }
};

// Split a string considering surrogate-pairs.
function stringToArray(string) {
  return string.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[^\uD800-\uDFFF]/g) || [];
}

eaw.length = function(string) {
  var characters = stringToArray(string);
  var len = 0;
  for (var i = 0; i < characters.length; i++) {
    len = len + this.characterLength(characters[i]);
  }
  return len;
};

eaw.slice = function(text, start, end) {
  textLen = eaw.length(text);
  start = start ? start : 0;
  end = end ? end : 1;
  if (start < 0) {
      start = textLen + start;
  }
  if (end < 0) {
      end = textLen + end;
  }
  var result = '';
  var eawLen = 0;
  var chars = stringToArray(text);
  for (var i = 0; i < chars.length; i++) {
    var char = chars[i];
    var charLen = eaw.length(char);
    if (eawLen >= start - (charLen == 2 ? 1 : 0)) {
        if (eawLen + charLen <= end) {
            result += char;
        } else {
            break;
        }
    }
    eawLen += charLen;
  }
  return result;
};
}(eastasianwidth));

if (typeof process !== "undefined") {
  if (process.argv.includes("--verbose")) ; else if (process.argv.includes("--silent")) ; else ;
}

const SCRIPT_EXTENSIONS = /* @__PURE__ */ new Set([".js", ".ts"]);
new RegExp(`\\.(${Array.from(SCRIPT_EXTENSIONS).map((s) => s.slice(1)).join("|")})($|\\?)`);

function assertPath(path) {
  if (typeof path !== 'string') {
    throw new TypeError('Path must be a string. Received ' + JSON.stringify(path));
  }
}

// Resolves . and .. elements in a path with directory names
function normalizeStringPosix(path, allowAboveRoot) {
  var res = '';
  var lastSegmentLength = 0;
  var lastSlash = -1;
  var dots = 0;
  var code;
  for (var i = 0; i <= path.length; ++i) {
    if (i < path.length)
      code = path.charCodeAt(i);
    else if (code === 47 /*/*/)
      break;
    else
      code = 47 /*/*/;
    if (code === 47 /*/*/) {
      if (lastSlash === i - 1 || dots === 1) ; else if (lastSlash !== i - 1 && dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 /*.*/ || res.charCodeAt(res.length - 2) !== 46 /*.*/) {
          if (res.length > 2) {
            var lastSlashIndex = res.lastIndexOf('/');
            if (lastSlashIndex !== res.length - 1) {
              if (lastSlashIndex === -1) {
                res = '';
                lastSegmentLength = 0;
              } else {
                res = res.slice(0, lastSlashIndex);
                lastSegmentLength = res.length - 1 - res.lastIndexOf('/');
              }
              lastSlash = i;
              dots = 0;
              continue;
            }
          } else if (res.length === 2 || res.length === 1) {
            res = '';
            lastSegmentLength = 0;
            lastSlash = i;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          if (res.length > 0)
            res += '/..';
          else
            res = '..';
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0)
          res += '/' + path.slice(lastSlash + 1, i);
        else
          res = path.slice(lastSlash + 1, i);
        lastSegmentLength = i - lastSlash - 1;
      }
      lastSlash = i;
      dots = 0;
    } else if (code === 46 /*.*/ && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}

function _format(sep, pathObject) {
  var dir = pathObject.dir || pathObject.root;
  var base = pathObject.base || (pathObject.name || '') + (pathObject.ext || '');
  if (!dir) {
    return base;
  }
  if (dir === pathObject.root) {
    return dir + base;
  }
  return dir + sep + base;
}

var posix = {
  // path.resolve([from ...], to)
  resolve: function resolve() {
    var resolvedPath = '';
    var resolvedAbsolute = false;
    var cwd;

    for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      var path;
      if (i >= 0)
        path = arguments[i];
      else {
        if (cwd === undefined)
          cwd = process.cwd();
        path = cwd;
      }

      assertPath(path);

      // Skip empty entries
      if (path.length === 0) {
        continue;
      }

      resolvedPath = path + '/' + resolvedPath;
      resolvedAbsolute = path.charCodeAt(0) === 47 /*/*/;
    }

    // At this point the path should be resolved to a full absolute path, but
    // handle relative paths to be safe (might happen when process.cwd() fails)

    // Normalize the path
    resolvedPath = normalizeStringPosix(resolvedPath, !resolvedAbsolute);

    if (resolvedAbsolute) {
      if (resolvedPath.length > 0)
        return '/' + resolvedPath;
      else
        return '/';
    } else if (resolvedPath.length > 0) {
      return resolvedPath;
    } else {
      return '.';
    }
  },

  normalize: function normalize(path) {
    assertPath(path);

    if (path.length === 0) return '.';

    var isAbsolute = path.charCodeAt(0) === 47 /*/*/;
    var trailingSeparator = path.charCodeAt(path.length - 1) === 47 /*/*/;

    // Normalize the path
    path = normalizeStringPosix(path, !isAbsolute);

    if (path.length === 0 && !isAbsolute) path = '.';
    if (path.length > 0 && trailingSeparator) path += '/';

    if (isAbsolute) return '/' + path;
    return path;
  },

  isAbsolute: function isAbsolute(path) {
    assertPath(path);
    return path.length > 0 && path.charCodeAt(0) === 47 /*/*/;
  },

  join: function join() {
    if (arguments.length === 0)
      return '.';
    var joined;
    for (var i = 0; i < arguments.length; ++i) {
      var arg = arguments[i];
      assertPath(arg);
      if (arg.length > 0) {
        if (joined === undefined)
          joined = arg;
        else
          joined += '/' + arg;
      }
    }
    if (joined === undefined)
      return '.';
    return posix.normalize(joined);
  },

  relative: function relative(from, to) {
    assertPath(from);
    assertPath(to);

    if (from === to) return '';

    from = posix.resolve(from);
    to = posix.resolve(to);

    if (from === to) return '';

    // Trim any leading backslashes
    var fromStart = 1;
    for (; fromStart < from.length; ++fromStart) {
      if (from.charCodeAt(fromStart) !== 47 /*/*/)
        break;
    }
    var fromEnd = from.length;
    var fromLen = fromEnd - fromStart;

    // Trim any leading backslashes
    var toStart = 1;
    for (; toStart < to.length; ++toStart) {
      if (to.charCodeAt(toStart) !== 47 /*/*/)
        break;
    }
    var toEnd = to.length;
    var toLen = toEnd - toStart;

    // Compare paths to find the longest common path from root
    var length = fromLen < toLen ? fromLen : toLen;
    var lastCommonSep = -1;
    var i = 0;
    for (; i <= length; ++i) {
      if (i === length) {
        if (toLen > length) {
          if (to.charCodeAt(toStart + i) === 47 /*/*/) {
            // We get here if `from` is the exact base path for `to`.
            // For example: from='/foo/bar'; to='/foo/bar/baz'
            return to.slice(toStart + i + 1);
          } else if (i === 0) {
            // We get here if `from` is the root
            // For example: from='/'; to='/foo'
            return to.slice(toStart + i);
          }
        } else if (fromLen > length) {
          if (from.charCodeAt(fromStart + i) === 47 /*/*/) {
            // We get here if `to` is the exact base path for `from`.
            // For example: from='/foo/bar/baz'; to='/foo/bar'
            lastCommonSep = i;
          } else if (i === 0) {
            // We get here if `to` is the root.
            // For example: from='/foo'; to='/'
            lastCommonSep = 0;
          }
        }
        break;
      }
      var fromCode = from.charCodeAt(fromStart + i);
      var toCode = to.charCodeAt(toStart + i);
      if (fromCode !== toCode)
        break;
      else if (fromCode === 47 /*/*/)
        lastCommonSep = i;
    }

    var out = '';
    // Generate the relative path based on the path difference between `to`
    // and `from`
    for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
      if (i === fromEnd || from.charCodeAt(i) === 47 /*/*/) {
        if (out.length === 0)
          out += '..';
        else
          out += '/..';
      }
    }

    // Lastly, append the rest of the destination (`to`) path that comes after
    // the common path parts
    if (out.length > 0)
      return out + to.slice(toStart + lastCommonSep);
    else {
      toStart += lastCommonSep;
      if (to.charCodeAt(toStart) === 47 /*/*/)
        ++toStart;
      return to.slice(toStart);
    }
  },

  _makeLong: function _makeLong(path) {
    return path;
  },

  dirname: function dirname(path) {
    assertPath(path);
    if (path.length === 0) return '.';
    var code = path.charCodeAt(0);
    var hasRoot = code === 47 /*/*/;
    var end = -1;
    var matchedSlash = true;
    for (var i = path.length - 1; i >= 1; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          if (!matchedSlash) {
            end = i;
            break;
          }
        } else {
        // We saw the first non-path separator
        matchedSlash = false;
      }
    }

    if (end === -1) return hasRoot ? '/' : '.';
    if (hasRoot && end === 1) return '//';
    return path.slice(0, end);
  },

  basename: function basename(path, ext) {
    if (ext !== undefined && typeof ext !== 'string') throw new TypeError('"ext" argument must be a string');
    assertPath(path);

    var start = 0;
    var end = -1;
    var matchedSlash = true;
    var i;

    if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
      if (ext.length === path.length && ext === path) return '';
      var extIdx = ext.length - 1;
      var firstNonSlashEnd = -1;
      for (i = path.length - 1; i >= 0; --i) {
        var code = path.charCodeAt(i);
        if (code === 47 /*/*/) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else {
          if (firstNonSlashEnd === -1) {
            // We saw the first non-path separator, remember this index in case
            // we need it if the extension ends up not matching
            matchedSlash = false;
            firstNonSlashEnd = i + 1;
          }
          if (extIdx >= 0) {
            // Try to match the explicit extension
            if (code === ext.charCodeAt(extIdx)) {
              if (--extIdx === -1) {
                // We matched the extension, so mark this as the end of our path
                // component
                end = i;
              }
            } else {
              // Extension does not match, so our result is the entire path
              // component
              extIdx = -1;
              end = firstNonSlashEnd;
            }
          }
        }
      }

      if (start === end) end = firstNonSlashEnd;else if (end === -1) end = path.length;
      return path.slice(start, end);
    } else {
      for (i = path.length - 1; i >= 0; --i) {
        if (path.charCodeAt(i) === 47 /*/*/) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else if (end === -1) {
          // We saw the first non-path separator, mark this as the end of our
          // path component
          matchedSlash = false;
          end = i + 1;
        }
      }

      if (end === -1) return '';
      return path.slice(start, end);
    }
  },

  extname: function extname(path) {
    assertPath(path);
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;
    for (var i = path.length - 1; i >= 0; --i) {
      var code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
          // If this is our first dot, mark it as the start of our extension
          if (startDot === -1)
            startDot = i;
          else if (preDotState !== 1)
            preDotState = 1;
      } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 ||
        // We saw a non-dot character immediately before the dot
        preDotState === 0 ||
        // The (right-most) trimmed path component is exactly '..'
        preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      return '';
    }
    return path.slice(startDot, end);
  },

  format: function format(pathObject) {
    if (pathObject === null || typeof pathObject !== 'object') {
      throw new TypeError('The "pathObject" argument must be of type Object. Received type ' + typeof pathObject);
    }
    return _format('/', pathObject);
  },

  parse: function parse(path) {
    assertPath(path);

    var ret = { root: '', dir: '', base: '', ext: '', name: '' };
    if (path.length === 0) return ret;
    var code = path.charCodeAt(0);
    var isAbsolute = code === 47 /*/*/;
    var start;
    if (isAbsolute) {
      ret.root = '/';
      start = 1;
    } else {
      start = 0;
    }
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    var i = path.length - 1;

    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;

    // Get non-dir info
    for (; i >= start; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
          // If this is our first dot, mark it as the start of our extension
          if (startDot === -1) startDot = i;else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 ||
    // We saw a non-dot character immediately before the dot
    preDotState === 0 ||
    // The (right-most) trimmed path component is exactly '..'
    preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      if (end !== -1) {
        if (startPart === 0 && isAbsolute) ret.base = ret.name = path.slice(1, end);else ret.base = ret.name = path.slice(startPart, end);
      }
    } else {
      if (startPart === 0 && isAbsolute) {
        ret.name = path.slice(1, startDot);
        ret.base = path.slice(1, end);
      } else {
        ret.name = path.slice(startPart, startDot);
        ret.base = path.slice(startPart, end);
      }
      ret.ext = path.slice(startDot, end);
    }

    if (startPart > 0) ret.dir = path.slice(0, startPart - 1);else if (isAbsolute) ret.dir = '/';

    return ret;
  },

  sep: '/',
  delimiter: ':',
  win32: null,
  posix: null
};

posix.posix = posix;

const STYLE_EXTENSIONS = /* @__PURE__ */ new Set([
  ".css",
  ".pcss",
  ".postcss",
  ".scss",
  ".sass",
  ".styl",
  ".stylus",
  ".less"
]);
new RegExp(`\\.(${Array.from(STYLE_EXTENSIONS).map((s) => s.slice(1)).join("|")})($|\\?)`);

var util$1 = {};

var types = {};

/* eslint complexity: [2, 18], max-statements: [2, 33] */
var shams$1 = function hasSymbols() {
	if (typeof Symbol !== 'function' || typeof Object.getOwnPropertySymbols !== 'function') { return false; }
	if (typeof Symbol.iterator === 'symbol') { return true; }

	var obj = {};
	var sym = Symbol('test');
	var symObj = Object(sym);
	if (typeof sym === 'string') { return false; }

	if (Object.prototype.toString.call(sym) !== '[object Symbol]') { return false; }
	if (Object.prototype.toString.call(symObj) !== '[object Symbol]') { return false; }

	// temp disabled per https://github.com/ljharb/object.assign/issues/17
	// if (sym instanceof Symbol) { return false; }
	// temp disabled per https://github.com/WebReflection/get-own-property-symbols/issues/4
	// if (!(symObj instanceof Symbol)) { return false; }

	// if (typeof Symbol.prototype.toString !== 'function') { return false; }
	// if (String(sym) !== Symbol.prototype.toString.call(sym)) { return false; }

	var symVal = 42;
	obj[sym] = symVal;
	for (sym in obj) { return false; } // eslint-disable-line no-restricted-syntax, no-unreachable-loop
	if (typeof Object.keys === 'function' && Object.keys(obj).length !== 0) { return false; }

	if (typeof Object.getOwnPropertyNames === 'function' && Object.getOwnPropertyNames(obj).length !== 0) { return false; }

	var syms = Object.getOwnPropertySymbols(obj);
	if (syms.length !== 1 || syms[0] !== sym) { return false; }

	if (!Object.prototype.propertyIsEnumerable.call(obj, sym)) { return false; }

	if (typeof Object.getOwnPropertyDescriptor === 'function') {
		var descriptor = Object.getOwnPropertyDescriptor(obj, sym);
		if (descriptor.value !== symVal || descriptor.enumerable !== true) { return false; }
	}

	return true;
};

var hasSymbols$2 = shams$1;

var shams = function hasToStringTagShams() {
	return hasSymbols$2() && !!Symbol.toStringTag;
};

var origSymbol = typeof Symbol !== 'undefined' && Symbol;
var hasSymbolSham = shams$1;

var hasSymbols$1 = function hasNativeSymbols() {
	if (typeof origSymbol !== 'function') { return false; }
	if (typeof Symbol !== 'function') { return false; }
	if (typeof origSymbol('foo') !== 'symbol') { return false; }
	if (typeof Symbol('bar') !== 'symbol') { return false; }

	return hasSymbolSham();
};

/* eslint no-invalid-this: 1 */

var ERROR_MESSAGE = 'Function.prototype.bind called on incompatible ';
var slice = Array.prototype.slice;
var toStr$3 = Object.prototype.toString;
var funcType = '[object Function]';

var implementation$1 = function bind(that) {
    var target = this;
    if (typeof target !== 'function' || toStr$3.call(target) !== funcType) {
        throw new TypeError(ERROR_MESSAGE + target);
    }
    var args = slice.call(arguments, 1);

    var bound;
    var binder = function () {
        if (this instanceof bound) {
            var result = target.apply(
                this,
                args.concat(slice.call(arguments))
            );
            if (Object(result) === result) {
                return result;
            }
            return this;
        } else {
            return target.apply(
                that,
                args.concat(slice.call(arguments))
            );
        }
    };

    var boundLength = Math.max(0, target.length - args.length);
    var boundArgs = [];
    for (var i = 0; i < boundLength; i++) {
        boundArgs.push('$' + i);
    }

    bound = Function('binder', 'return function (' + boundArgs.join(',') + '){ return binder.apply(this,arguments); }')(binder);

    if (target.prototype) {
        var Empty = function Empty() {};
        Empty.prototype = target.prototype;
        bound.prototype = new Empty();
        Empty.prototype = null;
    }

    return bound;
};

var implementation = implementation$1;

var functionBind = Function.prototype.bind || implementation;

var bind$1 = functionBind;

var src = bind$1.call(Function.call, Object.prototype.hasOwnProperty);

var undefined$1;

var $SyntaxError = SyntaxError;
var $Function = Function;
var $TypeError = TypeError;

// eslint-disable-next-line consistent-return
var getEvalledConstructor = function (expressionSyntax) {
	try {
		return $Function('"use strict"; return (' + expressionSyntax + ').constructor;')();
	} catch (e) {}
};

var $gOPD$1 = Object.getOwnPropertyDescriptor;
if ($gOPD$1) {
	try {
		$gOPD$1({}, '');
	} catch (e) {
		$gOPD$1 = null; // this is IE 8, which has a broken gOPD
	}
}

var throwTypeError = function () {
	throw new $TypeError();
};
var ThrowTypeError = $gOPD$1
	? (function () {
		try {
			// eslint-disable-next-line no-unused-expressions, no-caller, no-restricted-properties
			arguments.callee; // IE 8 does not throw here
			return throwTypeError;
		} catch (calleeThrows) {
			try {
				// IE 8 throws on Object.getOwnPropertyDescriptor(arguments, '')
				return $gOPD$1(arguments, 'callee').get;
			} catch (gOPDthrows) {
				return throwTypeError;
			}
		}
	}())
	: throwTypeError;

var hasSymbols = hasSymbols$1();

var getProto$1 = Object.getPrototypeOf || function (x) { return x.__proto__; }; // eslint-disable-line no-proto

var needsEval = {};

var TypedArray = typeof Uint8Array === 'undefined' ? undefined$1 : getProto$1(Uint8Array);

var INTRINSICS = {
	'%AggregateError%': typeof AggregateError === 'undefined' ? undefined$1 : AggregateError,
	'%Array%': Array,
	'%ArrayBuffer%': typeof ArrayBuffer === 'undefined' ? undefined$1 : ArrayBuffer,
	'%ArrayIteratorPrototype%': hasSymbols ? getProto$1([][Symbol.iterator]()) : undefined$1,
	'%AsyncFromSyncIteratorPrototype%': undefined$1,
	'%AsyncFunction%': needsEval,
	'%AsyncGenerator%': needsEval,
	'%AsyncGeneratorFunction%': needsEval,
	'%AsyncIteratorPrototype%': needsEval,
	'%Atomics%': typeof Atomics === 'undefined' ? undefined$1 : Atomics,
	'%BigInt%': typeof BigInt === 'undefined' ? undefined$1 : BigInt,
	'%Boolean%': Boolean,
	'%DataView%': typeof DataView === 'undefined' ? undefined$1 : DataView,
	'%Date%': Date,
	'%decodeURI%': decodeURI,
	'%decodeURIComponent%': decodeURIComponent,
	'%encodeURI%': encodeURI,
	'%encodeURIComponent%': encodeURIComponent,
	'%Error%': Error,
	'%eval%': eval, // eslint-disable-line no-eval
	'%EvalError%': EvalError,
	'%Float32Array%': typeof Float32Array === 'undefined' ? undefined$1 : Float32Array,
	'%Float64Array%': typeof Float64Array === 'undefined' ? undefined$1 : Float64Array,
	'%FinalizationRegistry%': typeof FinalizationRegistry === 'undefined' ? undefined$1 : FinalizationRegistry,
	'%Function%': $Function,
	'%GeneratorFunction%': needsEval,
	'%Int8Array%': typeof Int8Array === 'undefined' ? undefined$1 : Int8Array,
	'%Int16Array%': typeof Int16Array === 'undefined' ? undefined$1 : Int16Array,
	'%Int32Array%': typeof Int32Array === 'undefined' ? undefined$1 : Int32Array,
	'%isFinite%': isFinite,
	'%isNaN%': isNaN,
	'%IteratorPrototype%': hasSymbols ? getProto$1(getProto$1([][Symbol.iterator]())) : undefined$1,
	'%JSON%': typeof JSON === 'object' ? JSON : undefined$1,
	'%Map%': typeof Map === 'undefined' ? undefined$1 : Map,
	'%MapIteratorPrototype%': typeof Map === 'undefined' || !hasSymbols ? undefined$1 : getProto$1(new Map()[Symbol.iterator]()),
	'%Math%': Math,
	'%Number%': Number,
	'%Object%': Object,
	'%parseFloat%': parseFloat,
	'%parseInt%': parseInt,
	'%Promise%': typeof Promise === 'undefined' ? undefined$1 : Promise,
	'%Proxy%': typeof Proxy === 'undefined' ? undefined$1 : Proxy,
	'%RangeError%': RangeError,
	'%ReferenceError%': ReferenceError,
	'%Reflect%': typeof Reflect === 'undefined' ? undefined$1 : Reflect,
	'%RegExp%': RegExp,
	'%Set%': typeof Set === 'undefined' ? undefined$1 : Set,
	'%SetIteratorPrototype%': typeof Set === 'undefined' || !hasSymbols ? undefined$1 : getProto$1(new Set()[Symbol.iterator]()),
	'%SharedArrayBuffer%': typeof SharedArrayBuffer === 'undefined' ? undefined$1 : SharedArrayBuffer,
	'%String%': String,
	'%StringIteratorPrototype%': hasSymbols ? getProto$1(''[Symbol.iterator]()) : undefined$1,
	'%Symbol%': hasSymbols ? Symbol : undefined$1,
	'%SyntaxError%': $SyntaxError,
	'%ThrowTypeError%': ThrowTypeError,
	'%TypedArray%': TypedArray,
	'%TypeError%': $TypeError,
	'%Uint8Array%': typeof Uint8Array === 'undefined' ? undefined$1 : Uint8Array,
	'%Uint8ClampedArray%': typeof Uint8ClampedArray === 'undefined' ? undefined$1 : Uint8ClampedArray,
	'%Uint16Array%': typeof Uint16Array === 'undefined' ? undefined$1 : Uint16Array,
	'%Uint32Array%': typeof Uint32Array === 'undefined' ? undefined$1 : Uint32Array,
	'%URIError%': URIError,
	'%WeakMap%': typeof WeakMap === 'undefined' ? undefined$1 : WeakMap,
	'%WeakRef%': typeof WeakRef === 'undefined' ? undefined$1 : WeakRef,
	'%WeakSet%': typeof WeakSet === 'undefined' ? undefined$1 : WeakSet
};

var doEval = function doEval(name) {
	var value;
	if (name === '%AsyncFunction%') {
		value = getEvalledConstructor('async function () {}');
	} else if (name === '%GeneratorFunction%') {
		value = getEvalledConstructor('function* () {}');
	} else if (name === '%AsyncGeneratorFunction%') {
		value = getEvalledConstructor('async function* () {}');
	} else if (name === '%AsyncGenerator%') {
		var fn = doEval('%AsyncGeneratorFunction%');
		if (fn) {
			value = fn.prototype;
		}
	} else if (name === '%AsyncIteratorPrototype%') {
		var gen = doEval('%AsyncGenerator%');
		if (gen) {
			value = getProto$1(gen.prototype);
		}
	}

	INTRINSICS[name] = value;

	return value;
};

var LEGACY_ALIASES = {
	'%ArrayBufferPrototype%': ['ArrayBuffer', 'prototype'],
	'%ArrayPrototype%': ['Array', 'prototype'],
	'%ArrayProto_entries%': ['Array', 'prototype', 'entries'],
	'%ArrayProto_forEach%': ['Array', 'prototype', 'forEach'],
	'%ArrayProto_keys%': ['Array', 'prototype', 'keys'],
	'%ArrayProto_values%': ['Array', 'prototype', 'values'],
	'%AsyncFunctionPrototype%': ['AsyncFunction', 'prototype'],
	'%AsyncGenerator%': ['AsyncGeneratorFunction', 'prototype'],
	'%AsyncGeneratorPrototype%': ['AsyncGeneratorFunction', 'prototype', 'prototype'],
	'%BooleanPrototype%': ['Boolean', 'prototype'],
	'%DataViewPrototype%': ['DataView', 'prototype'],
	'%DatePrototype%': ['Date', 'prototype'],
	'%ErrorPrototype%': ['Error', 'prototype'],
	'%EvalErrorPrototype%': ['EvalError', 'prototype'],
	'%Float32ArrayPrototype%': ['Float32Array', 'prototype'],
	'%Float64ArrayPrototype%': ['Float64Array', 'prototype'],
	'%FunctionPrototype%': ['Function', 'prototype'],
	'%Generator%': ['GeneratorFunction', 'prototype'],
	'%GeneratorPrototype%': ['GeneratorFunction', 'prototype', 'prototype'],
	'%Int8ArrayPrototype%': ['Int8Array', 'prototype'],
	'%Int16ArrayPrototype%': ['Int16Array', 'prototype'],
	'%Int32ArrayPrototype%': ['Int32Array', 'prototype'],
	'%JSONParse%': ['JSON', 'parse'],
	'%JSONStringify%': ['JSON', 'stringify'],
	'%MapPrototype%': ['Map', 'prototype'],
	'%NumberPrototype%': ['Number', 'prototype'],
	'%ObjectPrototype%': ['Object', 'prototype'],
	'%ObjProto_toString%': ['Object', 'prototype', 'toString'],
	'%ObjProto_valueOf%': ['Object', 'prototype', 'valueOf'],
	'%PromisePrototype%': ['Promise', 'prototype'],
	'%PromiseProto_then%': ['Promise', 'prototype', 'then'],
	'%Promise_all%': ['Promise', 'all'],
	'%Promise_reject%': ['Promise', 'reject'],
	'%Promise_resolve%': ['Promise', 'resolve'],
	'%RangeErrorPrototype%': ['RangeError', 'prototype'],
	'%ReferenceErrorPrototype%': ['ReferenceError', 'prototype'],
	'%RegExpPrototype%': ['RegExp', 'prototype'],
	'%SetPrototype%': ['Set', 'prototype'],
	'%SharedArrayBufferPrototype%': ['SharedArrayBuffer', 'prototype'],
	'%StringPrototype%': ['String', 'prototype'],
	'%SymbolPrototype%': ['Symbol', 'prototype'],
	'%SyntaxErrorPrototype%': ['SyntaxError', 'prototype'],
	'%TypedArrayPrototype%': ['TypedArray', 'prototype'],
	'%TypeErrorPrototype%': ['TypeError', 'prototype'],
	'%Uint8ArrayPrototype%': ['Uint8Array', 'prototype'],
	'%Uint8ClampedArrayPrototype%': ['Uint8ClampedArray', 'prototype'],
	'%Uint16ArrayPrototype%': ['Uint16Array', 'prototype'],
	'%Uint32ArrayPrototype%': ['Uint32Array', 'prototype'],
	'%URIErrorPrototype%': ['URIError', 'prototype'],
	'%WeakMapPrototype%': ['WeakMap', 'prototype'],
	'%WeakSetPrototype%': ['WeakSet', 'prototype']
};

var bind = functionBind;
var hasOwn = src;
var $concat = bind.call(Function.call, Array.prototype.concat);
var $spliceApply = bind.call(Function.apply, Array.prototype.splice);
var $replace = bind.call(Function.call, String.prototype.replace);
var $strSlice = bind.call(Function.call, String.prototype.slice);
var $exec = bind.call(Function.call, RegExp.prototype.exec);

/* adapted from https://github.com/lodash/lodash/blob/4.17.15/dist/lodash.js#L6735-L6744 */
var rePropName = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g;
var reEscapeChar = /\\(\\)?/g; /** Used to match backslashes in property paths. */
var stringToPath = function stringToPath(string) {
	var first = $strSlice(string, 0, 1);
	var last = $strSlice(string, -1);
	if (first === '%' && last !== '%') {
		throw new $SyntaxError('invalid intrinsic syntax, expected closing `%`');
	} else if (last === '%' && first !== '%') {
		throw new $SyntaxError('invalid intrinsic syntax, expected opening `%`');
	}
	var result = [];
	$replace(string, rePropName, function (match, number, quote, subString) {
		result[result.length] = quote ? $replace(subString, reEscapeChar, '$1') : number || match;
	});
	return result;
};
/* end adaptation */

var getBaseIntrinsic = function getBaseIntrinsic(name, allowMissing) {
	var intrinsicName = name;
	var alias;
	if (hasOwn(LEGACY_ALIASES, intrinsicName)) {
		alias = LEGACY_ALIASES[intrinsicName];
		intrinsicName = '%' + alias[0] + '%';
	}

	if (hasOwn(INTRINSICS, intrinsicName)) {
		var value = INTRINSICS[intrinsicName];
		if (value === needsEval) {
			value = doEval(intrinsicName);
		}
		if (typeof value === 'undefined' && !allowMissing) {
			throw new $TypeError('intrinsic ' + name + ' exists, but is not available. Please file an issue!');
		}

		return {
			alias: alias,
			name: intrinsicName,
			value: value
		};
	}

	throw new $SyntaxError('intrinsic ' + name + ' does not exist!');
};

var getIntrinsic = function GetIntrinsic(name, allowMissing) {
	if (typeof name !== 'string' || name.length === 0) {
		throw new $TypeError('intrinsic name must be a non-empty string');
	}
	if (arguments.length > 1 && typeof allowMissing !== 'boolean') {
		throw new $TypeError('"allowMissing" argument must be a boolean');
	}

	if ($exec(/^%?[^%]*%?$/g, name) === null) {
		throw new $SyntaxError('`%` may not be present anywhere but at the beginning and end of the intrinsic name');
	}
	var parts = stringToPath(name);
	var intrinsicBaseName = parts.length > 0 ? parts[0] : '';

	var intrinsic = getBaseIntrinsic('%' + intrinsicBaseName + '%', allowMissing);
	var intrinsicRealName = intrinsic.name;
	var value = intrinsic.value;
	var skipFurtherCaching = false;

	var alias = intrinsic.alias;
	if (alias) {
		intrinsicBaseName = alias[0];
		$spliceApply(parts, $concat([0, 1], alias));
	}

	for (var i = 1, isOwn = true; i < parts.length; i += 1) {
		var part = parts[i];
		var first = $strSlice(part, 0, 1);
		var last = $strSlice(part, -1);
		if (
			(
				(first === '"' || first === "'" || first === '`')
				|| (last === '"' || last === "'" || last === '`')
			)
			&& first !== last
		) {
			throw new $SyntaxError('property names with quotes must have matching quotes');
		}
		if (part === 'constructor' || !isOwn) {
			skipFurtherCaching = true;
		}

		intrinsicBaseName += '.' + part;
		intrinsicRealName = '%' + intrinsicBaseName + '%';

		if (hasOwn(INTRINSICS, intrinsicRealName)) {
			value = INTRINSICS[intrinsicRealName];
		} else if (value != null) {
			if (!(part in value)) {
				if (!allowMissing) {
					throw new $TypeError('base intrinsic for ' + name + ' exists, but the property is not available.');
				}
				return void undefined$1;
			}
			if ($gOPD$1 && (i + 1) >= parts.length) {
				var desc = $gOPD$1(value, part);
				isOwn = !!desc;

				// By convention, when a data property is converted to an accessor
				// property to emulate a data property that does not suffer from
				// the override mistake, that accessor's getter is marked with
				// an `originalValue` property. Here, when we detect this, we
				// uphold the illusion by pretending to see that original data
				// property, i.e., returning the value rather than the getter
				// itself.
				if (isOwn && 'get' in desc && !('originalValue' in desc.get)) {
					value = desc.get;
				} else {
					value = value[part];
				}
			} else {
				isOwn = hasOwn(value, part);
				value = value[part];
			}

			if (isOwn && !skipFurtherCaching) {
				INTRINSICS[intrinsicRealName] = value;
			}
		}
	}
	return value;
};

var callBind$1 = {exports: {}};

(function (module) {

var bind = functionBind;
var GetIntrinsic = getIntrinsic;

var $apply = GetIntrinsic('%Function.prototype.apply%');
var $call = GetIntrinsic('%Function.prototype.call%');
var $reflectApply = GetIntrinsic('%Reflect.apply%', true) || bind.call($call, $apply);

var $gOPD = GetIntrinsic('%Object.getOwnPropertyDescriptor%', true);
var $defineProperty = GetIntrinsic('%Object.defineProperty%', true);
var $max = GetIntrinsic('%Math.max%');

if ($defineProperty) {
	try {
		$defineProperty({}, 'a', { value: 1 });
	} catch (e) {
		// IE 8 has a broken defineProperty
		$defineProperty = null;
	}
}

module.exports = function callBind(originalFunction) {
	var func = $reflectApply(bind, $call, arguments);
	if ($gOPD && $defineProperty) {
		var desc = $gOPD(func, 'length');
		if (desc.configurable) {
			// original length, plus the receiver, minus any additional arguments (after the receiver)
			$defineProperty(
				func,
				'length',
				{ value: 1 + $max(0, originalFunction.length - (arguments.length - 1)) }
			);
		}
	}
	return func;
};

var applyBind = function applyBind() {
	return $reflectApply(bind, $apply, arguments);
};

if ($defineProperty) {
	$defineProperty(module.exports, 'apply', { value: applyBind });
} else {
	module.exports.apply = applyBind;
}
}(callBind$1));

var GetIntrinsic$1 = getIntrinsic;

var callBind = callBind$1.exports;

var $indexOf$1 = callBind(GetIntrinsic$1('String.prototype.indexOf'));

var callBound$3 = function callBoundIntrinsic(name, allowMissing) {
	var intrinsic = GetIntrinsic$1(name, !!allowMissing);
	if (typeof intrinsic === 'function' && $indexOf$1(name, '.prototype.') > -1) {
		return callBind(intrinsic);
	}
	return intrinsic;
};

var hasToStringTag$4 = shams();
var callBound$2 = callBound$3;

var $toString$2 = callBound$2('Object.prototype.toString');

var isStandardArguments = function isArguments(value) {
	if (hasToStringTag$4 && value && typeof value === 'object' && Symbol.toStringTag in value) {
		return false;
	}
	return $toString$2(value) === '[object Arguments]';
};

var isLegacyArguments = function isArguments(value) {
	if (isStandardArguments(value)) {
		return true;
	}
	return value !== null &&
		typeof value === 'object' &&
		typeof value.length === 'number' &&
		value.length >= 0 &&
		$toString$2(value) !== '[object Array]' &&
		$toString$2(value.callee) === '[object Function]';
};

var supportsStandardArguments = (function () {
	return isStandardArguments(arguments);
}());

isStandardArguments.isLegacyArguments = isLegacyArguments; // for tests

var isArguments = supportsStandardArguments ? isStandardArguments : isLegacyArguments;

var toStr$2 = Object.prototype.toString;
var fnToStr$1 = Function.prototype.toString;
var isFnRegex = /^\s*(?:function)?\*/;
var hasToStringTag$3 = shams();
var getProto = Object.getPrototypeOf;
var getGeneratorFunc = function () { // eslint-disable-line consistent-return
	if (!hasToStringTag$3) {
		return false;
	}
	try {
		return Function('return function*() {}')();
	} catch (e) {
	}
};
var GeneratorFunction;

var isGeneratorFunction = function isGeneratorFunction(fn) {
	if (typeof fn !== 'function') {
		return false;
	}
	if (isFnRegex.test(fnToStr$1.call(fn))) {
		return true;
	}
	if (!hasToStringTag$3) {
		var str = toStr$2.call(fn);
		return str === '[object GeneratorFunction]';
	}
	if (!getProto) {
		return false;
	}
	if (typeof GeneratorFunction === 'undefined') {
		var generatorFunc = getGeneratorFunc();
		GeneratorFunction = generatorFunc ? getProto(generatorFunc) : false;
	}
	return getProto(fn) === GeneratorFunction;
};

var fnToStr = Function.prototype.toString;
var reflectApply = typeof Reflect === 'object' && Reflect !== null && Reflect.apply;
var badArrayLike;
var isCallableMarker;
if (typeof reflectApply === 'function' && typeof Object.defineProperty === 'function') {
	try {
		badArrayLike = Object.defineProperty({}, 'length', {
			get: function () {
				throw isCallableMarker;
			}
		});
		isCallableMarker = {};
		// eslint-disable-next-line no-throw-literal
		reflectApply(function () { throw 42; }, null, badArrayLike);
	} catch (_) {
		if (_ !== isCallableMarker) {
			reflectApply = null;
		}
	}
} else {
	reflectApply = null;
}

var constructorRegex = /^\s*class\b/;
var isES6ClassFn = function isES6ClassFunction(value) {
	try {
		var fnStr = fnToStr.call(value);
		return constructorRegex.test(fnStr);
	} catch (e) {
		return false; // not a function
	}
};

var tryFunctionObject = function tryFunctionToStr(value) {
	try {
		if (isES6ClassFn(value)) { return false; }
		fnToStr.call(value);
		return true;
	} catch (e) {
		return false;
	}
};
var toStr$1 = Object.prototype.toString;
var fnClass = '[object Function]';
var genClass = '[object GeneratorFunction]';
var hasToStringTag$2 = typeof Symbol === 'function' && !!Symbol.toStringTag; // better: use `has-tostringtag`
/* globals document: false */
var documentDotAll = typeof document === 'object' && typeof document.all === 'undefined' && document.all !== undefined ? document.all : {};

var isCallable$1 = reflectApply
	? function isCallable(value) {
		if (value === documentDotAll) { return true; }
		if (!value) { return false; }
		if (typeof value !== 'function' && typeof value !== 'object') { return false; }
		if (typeof value === 'function' && !value.prototype) { return true; }
		try {
			reflectApply(value, null, badArrayLike);
		} catch (e) {
			if (e !== isCallableMarker) { return false; }
		}
		return !isES6ClassFn(value);
	}
	: function isCallable(value) {
		if (value === documentDotAll) { return true; }
		if (!value) { return false; }
		if (typeof value !== 'function' && typeof value !== 'object') { return false; }
		if (typeof value === 'function' && !value.prototype) { return true; }
		if (hasToStringTag$2) { return tryFunctionObject(value); }
		if (isES6ClassFn(value)) { return false; }
		var strClass = toStr$1.call(value);
		return strClass === fnClass || strClass === genClass;
	};

var isCallable = isCallable$1;

var toStr = Object.prototype.toString;
var hasOwnProperty = Object.prototype.hasOwnProperty;

var forEachArray = function forEachArray(array, iterator, receiver) {
    for (var i = 0, len = array.length; i < len; i++) {
        if (hasOwnProperty.call(array, i)) {
            if (receiver == null) {
                iterator(array[i], i, array);
            } else {
                iterator.call(receiver, array[i], i, array);
            }
        }
    }
};

var forEachString = function forEachString(string, iterator, receiver) {
    for (var i = 0, len = string.length; i < len; i++) {
        // no such thing as a sparse string.
        if (receiver == null) {
            iterator(string.charAt(i), i, string);
        } else {
            iterator.call(receiver, string.charAt(i), i, string);
        }
    }
};

var forEachObject = function forEachObject(object, iterator, receiver) {
    for (var k in object) {
        if (hasOwnProperty.call(object, k)) {
            if (receiver == null) {
                iterator(object[k], k, object);
            } else {
                iterator.call(receiver, object[k], k, object);
            }
        }
    }
};

var forEach$2 = function forEach(list, iterator, thisArg) {
    if (!isCallable(iterator)) {
        throw new TypeError('iterator must be a function');
    }

    var receiver;
    if (arguments.length >= 3) {
        receiver = thisArg;
    }

    if (toStr.call(list) === '[object Array]') {
        forEachArray(list, iterator, receiver);
    } else if (typeof list === 'string') {
        forEachString(list, iterator, receiver);
    } else {
        forEachObject(list, iterator, receiver);
    }
};

var forEach_1 = forEach$2;

var possibleNames = [
	'BigInt64Array',
	'BigUint64Array',
	'Float32Array',
	'Float64Array',
	'Int16Array',
	'Int32Array',
	'Int8Array',
	'Uint16Array',
	'Uint32Array',
	'Uint8Array',
	'Uint8ClampedArray'
];

var g$2 = typeof globalThis === 'undefined' ? commonjsGlobal : globalThis;

var availableTypedArrays$2 = function availableTypedArrays() {
	var out = [];
	for (var i = 0; i < possibleNames.length; i++) {
		if (typeof g$2[possibleNames[i]] === 'function') {
			out[out.length] = possibleNames[i];
		}
	}
	return out;
};

var GetIntrinsic = getIntrinsic;

var $gOPD = GetIntrinsic('%Object.getOwnPropertyDescriptor%', true);
if ($gOPD) {
	try {
		$gOPD([], 'length');
	} catch (e) {
		// IE 8 has a broken gOPD
		$gOPD = null;
	}
}

var getOwnPropertyDescriptor = $gOPD;

var forEach$1 = forEach_1;
var availableTypedArrays$1 = availableTypedArrays$2;
var callBound$1 = callBound$3;

var $toString$1 = callBound$1('Object.prototype.toString');
var hasToStringTag$1 = shams();

var g$1 = typeof globalThis === 'undefined' ? commonjsGlobal : globalThis;
var typedArrays$1 = availableTypedArrays$1();

var $indexOf = callBound$1('Array.prototype.indexOf', true) || function indexOf(array, value) {
	for (var i = 0; i < array.length; i += 1) {
		if (array[i] === value) {
			return i;
		}
	}
	return -1;
};
var $slice$1 = callBound$1('String.prototype.slice');
var toStrTags$1 = {};
var gOPD$1 = getOwnPropertyDescriptor;
var getPrototypeOf$1 = Object.getPrototypeOf; // require('getprototypeof');
if (hasToStringTag$1 && gOPD$1 && getPrototypeOf$1) {
	forEach$1(typedArrays$1, function (typedArray) {
		var arr = new g$1[typedArray]();
		if (Symbol.toStringTag in arr) {
			var proto = getPrototypeOf$1(arr);
			var descriptor = gOPD$1(proto, Symbol.toStringTag);
			if (!descriptor) {
				var superProto = getPrototypeOf$1(proto);
				descriptor = gOPD$1(superProto, Symbol.toStringTag);
			}
			toStrTags$1[typedArray] = descriptor.get;
		}
	});
}

var tryTypedArrays$1 = function tryAllTypedArrays(value) {
	var anyTrue = false;
	forEach$1(toStrTags$1, function (getter, typedArray) {
		if (!anyTrue) {
			try {
				anyTrue = getter.call(value) === typedArray;
			} catch (e) { /**/ }
		}
	});
	return anyTrue;
};

var isTypedArray$1 = function isTypedArray(value) {
	if (!value || typeof value !== 'object') { return false; }
	if (!hasToStringTag$1 || !(Symbol.toStringTag in value)) {
		var tag = $slice$1($toString$1(value), 8, -1);
		return $indexOf(typedArrays$1, tag) > -1;
	}
	if (!gOPD$1) { return false; }
	return tryTypedArrays$1(value);
};

var forEach = forEach_1;
var availableTypedArrays = availableTypedArrays$2;
var callBound = callBound$3;

var $toString = callBound('Object.prototype.toString');
var hasToStringTag = shams();

var g = typeof globalThis === 'undefined' ? commonjsGlobal : globalThis;
var typedArrays = availableTypedArrays();

var $slice = callBound('String.prototype.slice');
var toStrTags = {};
var gOPD = getOwnPropertyDescriptor;
var getPrototypeOf = Object.getPrototypeOf; // require('getprototypeof');
if (hasToStringTag && gOPD && getPrototypeOf) {
	forEach(typedArrays, function (typedArray) {
		if (typeof g[typedArray] === 'function') {
			var arr = new g[typedArray]();
			if (Symbol.toStringTag in arr) {
				var proto = getPrototypeOf(arr);
				var descriptor = gOPD(proto, Symbol.toStringTag);
				if (!descriptor) {
					var superProto = getPrototypeOf(proto);
					descriptor = gOPD(superProto, Symbol.toStringTag);
				}
				toStrTags[typedArray] = descriptor.get;
			}
		}
	});
}

var tryTypedArrays = function tryAllTypedArrays(value) {
	var foundName = false;
	forEach(toStrTags, function (getter, typedArray) {
		if (!foundName) {
			try {
				var name = getter.call(value);
				if (name === typedArray) {
					foundName = name;
				}
			} catch (e) {}
		}
	});
	return foundName;
};

var isTypedArray = isTypedArray$1;

var whichTypedArray = function whichTypedArray(value) {
	if (!isTypedArray(value)) { return false; }
	if (!hasToStringTag || !(Symbol.toStringTag in value)) { return $slice($toString(value), 8, -1); }
	return tryTypedArrays(value);
};

(function (exports) {

var isArgumentsObject = isArguments;
var isGeneratorFunction$1 = isGeneratorFunction;
var whichTypedArray$1 = whichTypedArray;
var isTypedArray = isTypedArray$1;

function uncurryThis(f) {
  return f.call.bind(f);
}

var BigIntSupported = typeof BigInt !== 'undefined';
var SymbolSupported = typeof Symbol !== 'undefined';

var ObjectToString = uncurryThis(Object.prototype.toString);

var numberValue = uncurryThis(Number.prototype.valueOf);
var stringValue = uncurryThis(String.prototype.valueOf);
var booleanValue = uncurryThis(Boolean.prototype.valueOf);

if (BigIntSupported) {
  var bigIntValue = uncurryThis(BigInt.prototype.valueOf);
}

if (SymbolSupported) {
  var symbolValue = uncurryThis(Symbol.prototype.valueOf);
}

function checkBoxedPrimitive(value, prototypeValueOf) {
  if (typeof value !== 'object') {
    return false;
  }
  try {
    prototypeValueOf(value);
    return true;
  } catch(e) {
    return false;
  }
}

exports.isArgumentsObject = isArgumentsObject;
exports.isGeneratorFunction = isGeneratorFunction$1;
exports.isTypedArray = isTypedArray;

// Taken from here and modified for better browser support
// https://github.com/sindresorhus/p-is-promise/blob/cda35a513bda03f977ad5cde3a079d237e82d7ef/index.js
function isPromise(input) {
	return (
		(
			typeof Promise !== 'undefined' &&
			input instanceof Promise
		) ||
		(
			input !== null &&
			typeof input === 'object' &&
			typeof input.then === 'function' &&
			typeof input.catch === 'function'
		)
	);
}
exports.isPromise = isPromise;

function isArrayBufferView(value) {
  if (typeof ArrayBuffer !== 'undefined' && ArrayBuffer.isView) {
    return ArrayBuffer.isView(value);
  }

  return (
    isTypedArray(value) ||
    isDataView(value)
  );
}
exports.isArrayBufferView = isArrayBufferView;


function isUint8Array(value) {
  return whichTypedArray$1(value) === 'Uint8Array';
}
exports.isUint8Array = isUint8Array;

function isUint8ClampedArray(value) {
  return whichTypedArray$1(value) === 'Uint8ClampedArray';
}
exports.isUint8ClampedArray = isUint8ClampedArray;

function isUint16Array(value) {
  return whichTypedArray$1(value) === 'Uint16Array';
}
exports.isUint16Array = isUint16Array;

function isUint32Array(value) {
  return whichTypedArray$1(value) === 'Uint32Array';
}
exports.isUint32Array = isUint32Array;

function isInt8Array(value) {
  return whichTypedArray$1(value) === 'Int8Array';
}
exports.isInt8Array = isInt8Array;

function isInt16Array(value) {
  return whichTypedArray$1(value) === 'Int16Array';
}
exports.isInt16Array = isInt16Array;

function isInt32Array(value) {
  return whichTypedArray$1(value) === 'Int32Array';
}
exports.isInt32Array = isInt32Array;

function isFloat32Array(value) {
  return whichTypedArray$1(value) === 'Float32Array';
}
exports.isFloat32Array = isFloat32Array;

function isFloat64Array(value) {
  return whichTypedArray$1(value) === 'Float64Array';
}
exports.isFloat64Array = isFloat64Array;

function isBigInt64Array(value) {
  return whichTypedArray$1(value) === 'BigInt64Array';
}
exports.isBigInt64Array = isBigInt64Array;

function isBigUint64Array(value) {
  return whichTypedArray$1(value) === 'BigUint64Array';
}
exports.isBigUint64Array = isBigUint64Array;

function isMapToString(value) {
  return ObjectToString(value) === '[object Map]';
}
isMapToString.working = (
  typeof Map !== 'undefined' &&
  isMapToString(new Map())
);

function isMap(value) {
  if (typeof Map === 'undefined') {
    return false;
  }

  return isMapToString.working
    ? isMapToString(value)
    : value instanceof Map;
}
exports.isMap = isMap;

function isSetToString(value) {
  return ObjectToString(value) === '[object Set]';
}
isSetToString.working = (
  typeof Set !== 'undefined' &&
  isSetToString(new Set())
);
function isSet(value) {
  if (typeof Set === 'undefined') {
    return false;
  }

  return isSetToString.working
    ? isSetToString(value)
    : value instanceof Set;
}
exports.isSet = isSet;

function isWeakMapToString(value) {
  return ObjectToString(value) === '[object WeakMap]';
}
isWeakMapToString.working = (
  typeof WeakMap !== 'undefined' &&
  isWeakMapToString(new WeakMap())
);
function isWeakMap(value) {
  if (typeof WeakMap === 'undefined') {
    return false;
  }

  return isWeakMapToString.working
    ? isWeakMapToString(value)
    : value instanceof WeakMap;
}
exports.isWeakMap = isWeakMap;

function isWeakSetToString(value) {
  return ObjectToString(value) === '[object WeakSet]';
}
isWeakSetToString.working = (
  typeof WeakSet !== 'undefined' &&
  isWeakSetToString(new WeakSet())
);
function isWeakSet(value) {
  return isWeakSetToString(value);
}
exports.isWeakSet = isWeakSet;

function isArrayBufferToString(value) {
  return ObjectToString(value) === '[object ArrayBuffer]';
}
isArrayBufferToString.working = (
  typeof ArrayBuffer !== 'undefined' &&
  isArrayBufferToString(new ArrayBuffer())
);
function isArrayBuffer(value) {
  if (typeof ArrayBuffer === 'undefined') {
    return false;
  }

  return isArrayBufferToString.working
    ? isArrayBufferToString(value)
    : value instanceof ArrayBuffer;
}
exports.isArrayBuffer = isArrayBuffer;

function isDataViewToString(value) {
  return ObjectToString(value) === '[object DataView]';
}
isDataViewToString.working = (
  typeof ArrayBuffer !== 'undefined' &&
  typeof DataView !== 'undefined' &&
  isDataViewToString(new DataView(new ArrayBuffer(1), 0, 1))
);
function isDataView(value) {
  if (typeof DataView === 'undefined') {
    return false;
  }

  return isDataViewToString.working
    ? isDataViewToString(value)
    : value instanceof DataView;
}
exports.isDataView = isDataView;

// Store a copy of SharedArrayBuffer in case it's deleted elsewhere
var SharedArrayBufferCopy = typeof SharedArrayBuffer !== 'undefined' ? SharedArrayBuffer : undefined;
function isSharedArrayBufferToString(value) {
  return ObjectToString(value) === '[object SharedArrayBuffer]';
}
function isSharedArrayBuffer(value) {
  if (typeof SharedArrayBufferCopy === 'undefined') {
    return false;
  }

  if (typeof isSharedArrayBufferToString.working === 'undefined') {
    isSharedArrayBufferToString.working = isSharedArrayBufferToString(new SharedArrayBufferCopy());
  }

  return isSharedArrayBufferToString.working
    ? isSharedArrayBufferToString(value)
    : value instanceof SharedArrayBufferCopy;
}
exports.isSharedArrayBuffer = isSharedArrayBuffer;

function isAsyncFunction(value) {
  return ObjectToString(value) === '[object AsyncFunction]';
}
exports.isAsyncFunction = isAsyncFunction;

function isMapIterator(value) {
  return ObjectToString(value) === '[object Map Iterator]';
}
exports.isMapIterator = isMapIterator;

function isSetIterator(value) {
  return ObjectToString(value) === '[object Set Iterator]';
}
exports.isSetIterator = isSetIterator;

function isGeneratorObject(value) {
  return ObjectToString(value) === '[object Generator]';
}
exports.isGeneratorObject = isGeneratorObject;

function isWebAssemblyCompiledModule(value) {
  return ObjectToString(value) === '[object WebAssembly.Module]';
}
exports.isWebAssemblyCompiledModule = isWebAssemblyCompiledModule;

function isNumberObject(value) {
  return checkBoxedPrimitive(value, numberValue);
}
exports.isNumberObject = isNumberObject;

function isStringObject(value) {
  return checkBoxedPrimitive(value, stringValue);
}
exports.isStringObject = isStringObject;

function isBooleanObject(value) {
  return checkBoxedPrimitive(value, booleanValue);
}
exports.isBooleanObject = isBooleanObject;

function isBigIntObject(value) {
  return BigIntSupported && checkBoxedPrimitive(value, bigIntValue);
}
exports.isBigIntObject = isBigIntObject;

function isSymbolObject(value) {
  return SymbolSupported && checkBoxedPrimitive(value, symbolValue);
}
exports.isSymbolObject = isSymbolObject;

function isBoxedPrimitive(value) {
  return (
    isNumberObject(value) ||
    isStringObject(value) ||
    isBooleanObject(value) ||
    isBigIntObject(value) ||
    isSymbolObject(value)
  );
}
exports.isBoxedPrimitive = isBoxedPrimitive;

function isAnyArrayBuffer(value) {
  return typeof Uint8Array !== 'undefined' && (
    isArrayBuffer(value) ||
    isSharedArrayBuffer(value)
  );
}
exports.isAnyArrayBuffer = isAnyArrayBuffer;

['isProxy', 'isExternal', 'isModuleNamespaceObject'].forEach(function(method) {
  Object.defineProperty(exports, method, {
    enumerable: false,
    value: function() {
      throw new Error(method + ' is not supported in userland');
    }
  });
});
}(types));

var isBuffer = function isBuffer(arg) {
  return arg instanceof Buffer;
};

var inherits = {exports: {}};

var inherits_browser = {exports: {}};

if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  inherits_browser.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor;
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
    }
  };
} else {
  // old school shim for old browsers
  inherits_browser.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor;
      var TempCtor = function () {};
      TempCtor.prototype = superCtor.prototype;
      ctor.prototype = new TempCtor();
      ctor.prototype.constructor = ctor;
    }
  };
}

try {
  var util = require('util');
  /* istanbul ignore next */
  if (typeof util.inherits !== 'function') throw '';
  inherits.exports = util.inherits;
} catch (e) {
  /* istanbul ignore next */
  inherits.exports = inherits_browser.exports;
}

(function (exports) {
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var getOwnPropertyDescriptors = Object.getOwnPropertyDescriptors ||
  function getOwnPropertyDescriptors(obj) {
    var keys = Object.keys(obj);
    var descriptors = {};
    for (var i = 0; i < keys.length; i++) {
      descriptors[keys[i]] = Object.getOwnPropertyDescriptor(obj, keys[i]);
    }
    return descriptors;
  };

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  if (typeof process !== 'undefined' && process.noDeprecation === true) {
    return fn;
  }

  // Allow for deprecating things in the process of starting up.
  if (typeof process === 'undefined') {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnvRegex = /^$/;

if (process.env.NODE_DEBUG) {
  var debugEnv = process.env.NODE_DEBUG;
  debugEnv = debugEnv.replace(/[|\\{}()[\]^$+?.]/g, '\\$&')
    .replace(/\*/g, '.*')
    .replace(/,/g, '$|^')
    .toUpperCase();
  debugEnvRegex = new RegExp('^' + debugEnv + '$', 'i');
}
exports.debuglog = function(set) {
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (debugEnvRegex.test(set)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var length = output.reduce(function(prev, cur) {
    if (cur.indexOf('\n') >= 0) ;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
exports.types = types;

function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;
exports.types.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;
exports.types.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;
exports.types.isNativeError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = isBuffer;

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = inherits.exports;

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

var kCustomPromisifiedSymbol = typeof Symbol !== 'undefined' ? Symbol('util.promisify.custom') : undefined;

exports.promisify = function promisify(original) {
  if (typeof original !== 'function')
    throw new TypeError('The "original" argument must be of type Function');

  if (kCustomPromisifiedSymbol && original[kCustomPromisifiedSymbol]) {
    var fn = original[kCustomPromisifiedSymbol];
    if (typeof fn !== 'function') {
      throw new TypeError('The "util.promisify.custom" argument must be of type Function');
    }
    Object.defineProperty(fn, kCustomPromisifiedSymbol, {
      value: fn, enumerable: false, writable: false, configurable: true
    });
    return fn;
  }

  function fn() {
    var promiseResolve, promiseReject;
    var promise = new Promise(function (resolve, reject) {
      promiseResolve = resolve;
      promiseReject = reject;
    });

    var args = [];
    for (var i = 0; i < arguments.length; i++) {
      args.push(arguments[i]);
    }
    args.push(function (err, value) {
      if (err) {
        promiseReject(err);
      } else {
        promiseResolve(value);
      }
    });

    try {
      original.apply(this, args);
    } catch (err) {
      promiseReject(err);
    }

    return promise;
  }

  Object.setPrototypeOf(fn, Object.getPrototypeOf(original));

  if (kCustomPromisifiedSymbol) Object.defineProperty(fn, kCustomPromisifiedSymbol, {
    value: fn, enumerable: false, writable: false, configurable: true
  });
  return Object.defineProperties(
    fn,
    getOwnPropertyDescriptors(original)
  );
};

exports.promisify.custom = kCustomPromisifiedSymbol;

function callbackifyOnRejected(reason, cb) {
  // `!reason` guard inspired by bluebird (Ref: https://goo.gl/t5IS6M).
  // Because `null` is a special error value in callbacks which means "no error
  // occurred", we error-wrap so the callback consumer can distinguish between
  // "the promise rejected with null" or "the promise fulfilled with undefined".
  if (!reason) {
    var newReason = new Error('Promise was rejected with a falsy value');
    newReason.reason = reason;
    reason = newReason;
  }
  return cb(reason);
}

function callbackify(original) {
  if (typeof original !== 'function') {
    throw new TypeError('The "original" argument must be of type Function');
  }

  // We DO NOT return the promise as it gives the user a false sense that
  // the promise is actually somehow related to the callback's execution
  // and that the callback throwing will reject the promise.
  function callbackified() {
    var args = [];
    for (var i = 0; i < arguments.length; i++) {
      args.push(arguments[i]);
    }

    var maybeCb = args.pop();
    if (typeof maybeCb !== 'function') {
      throw new TypeError('The last argument must be of type Function');
    }
    var self = this;
    var cb = function() {
      return maybeCb.apply(self, arguments);
    };
    // In true node style we process the callback on `nextTick` with all the
    // implications (stack, `uncaughtException`, `async_hooks`)
    original.apply(this, args)
      .then(function(ret) { process.nextTick(cb.bind(null, null, ret)); },
            function(rej) { process.nextTick(callbackifyOnRejected.bind(null, rej, cb)); });
  }

  Object.setPrototypeOf(callbackified, Object.getPrototypeOf(original));
  Object.defineProperties(callbackified,
                          getOwnPropertyDescriptors(original));
  return callbackified;
}
exports.callbackify = callbackify;
}(util$1));

/**
 * Tokenize input string.
 */
function lexer(str) {
    var tokens = [];
    var i = 0;
    while (i < str.length) {
        var char = str[i];
        if (char === "*" || char === "+" || char === "?") {
            tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
            continue;
        }
        if (char === "\\") {
            tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
            continue;
        }
        if (char === "{") {
            tokens.push({ type: "OPEN", index: i, value: str[i++] });
            continue;
        }
        if (char === "}") {
            tokens.push({ type: "CLOSE", index: i, value: str[i++] });
            continue;
        }
        if (char === ":") {
            var name = "";
            var j = i + 1;
            while (j < str.length) {
                var code = str.charCodeAt(j);
                if (
                // `0-9`
                (code >= 48 && code <= 57) ||
                    // `A-Z`
                    (code >= 65 && code <= 90) ||
                    // `a-z`
                    (code >= 97 && code <= 122) ||
                    // `_`
                    code === 95) {
                    name += str[j++];
                    continue;
                }
                break;
            }
            if (!name)
                throw new TypeError("Missing parameter name at ".concat(i));
            tokens.push({ type: "NAME", index: i, value: name });
            i = j;
            continue;
        }
        if (char === "(") {
            var count = 1;
            var pattern = "";
            var j = i + 1;
            if (str[j] === "?") {
                throw new TypeError("Pattern cannot start with \"?\" at ".concat(j));
            }
            while (j < str.length) {
                if (str[j] === "\\") {
                    pattern += str[j++] + str[j++];
                    continue;
                }
                if (str[j] === ")") {
                    count--;
                    if (count === 0) {
                        j++;
                        break;
                    }
                }
                else if (str[j] === "(") {
                    count++;
                    if (str[j + 1] !== "?") {
                        throw new TypeError("Capturing groups are not allowed at ".concat(j));
                    }
                }
                pattern += str[j++];
            }
            if (count)
                throw new TypeError("Unbalanced pattern at ".concat(i));
            if (!pattern)
                throw new TypeError("Missing pattern at ".concat(i));
            tokens.push({ type: "PATTERN", index: i, value: pattern });
            i = j;
            continue;
        }
        tokens.push({ type: "CHAR", index: i, value: str[i++] });
    }
    tokens.push({ type: "END", index: i, value: "" });
    return tokens;
}
/**
 * Parse a string for the raw tokens.
 */
function parse(str, options) {
    if (options === void 0) { options = {}; }
    var tokens = lexer(str);
    var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a;
    var defaultPattern = "[^".concat(escapeString(options.delimiter || "/#?"), "]+?");
    var result = [];
    var key = 0;
    var i = 0;
    var path = "";
    var tryConsume = function (type) {
        if (i < tokens.length && tokens[i].type === type)
            return tokens[i++].value;
    };
    var mustConsume = function (type) {
        var value = tryConsume(type);
        if (value !== undefined)
            return value;
        var _a = tokens[i], nextType = _a.type, index = _a.index;
        throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
    };
    var consumeText = function () {
        var result = "";
        var value;
        while ((value = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR"))) {
            result += value;
        }
        return result;
    };
    while (i < tokens.length) {
        var char = tryConsume("CHAR");
        var name = tryConsume("NAME");
        var pattern = tryConsume("PATTERN");
        if (name || pattern) {
            var prefix = char || "";
            if (prefixes.indexOf(prefix) === -1) {
                path += prefix;
                prefix = "";
            }
            if (path) {
                result.push(path);
                path = "";
            }
            result.push({
                name: name || key++,
                prefix: prefix,
                suffix: "",
                pattern: pattern || defaultPattern,
                modifier: tryConsume("MODIFIER") || "",
            });
            continue;
        }
        var value = char || tryConsume("ESCAPED_CHAR");
        if (value) {
            path += value;
            continue;
        }
        if (path) {
            result.push(path);
            path = "";
        }
        var open = tryConsume("OPEN");
        if (open) {
            var prefix = consumeText();
            var name_1 = tryConsume("NAME") || "";
            var pattern_1 = tryConsume("PATTERN") || "";
            var suffix = consumeText();
            mustConsume("CLOSE");
            result.push({
                name: name_1 || (pattern_1 ? key++ : ""),
                pattern: name_1 && !pattern_1 ? defaultPattern : pattern_1,
                prefix: prefix,
                suffix: suffix,
                modifier: tryConsume("MODIFIER") || "",
            });
            continue;
        }
        mustConsume("END");
    }
    return result;
}
/**
 * Compile a string to a template function for the path.
 */
function compile(str, options) {
    return tokensToFunction(parse(str, options), options);
}
/**
 * Expose a method for transforming tokens into the path function.
 */
function tokensToFunction(tokens, options) {
    if (options === void 0) { options = {}; }
    var reFlags = flags(options);
    var _a = options.encode, encode = _a === void 0 ? function (x) { return x; } : _a, _b = options.validate, validate = _b === void 0 ? true : _b;
    // Compile all the tokens into regexps.
    var matches = tokens.map(function (token) {
        if (typeof token === "object") {
            return new RegExp("^(?:".concat(token.pattern, ")$"), reFlags);
        }
    });
    return function (data) {
        var path = "";
        for (var i = 0; i < tokens.length; i++) {
            var token = tokens[i];
            if (typeof token === "string") {
                path += token;
                continue;
            }
            var value = data ? data[token.name] : undefined;
            var optional = token.modifier === "?" || token.modifier === "*";
            var repeat = token.modifier === "*" || token.modifier === "+";
            if (Array.isArray(value)) {
                if (!repeat) {
                    throw new TypeError("Expected \"".concat(token.name, "\" to not repeat, but got an array"));
                }
                if (value.length === 0) {
                    if (optional)
                        continue;
                    throw new TypeError("Expected \"".concat(token.name, "\" to not be empty"));
                }
                for (var j = 0; j < value.length; j++) {
                    var segment = encode(value[j], token);
                    if (validate && !matches[i].test(segment)) {
                        throw new TypeError("Expected all \"".concat(token.name, "\" to match \"").concat(token.pattern, "\", but got \"").concat(segment, "\""));
                    }
                    path += token.prefix + segment + token.suffix;
                }
                continue;
            }
            if (typeof value === "string" || typeof value === "number") {
                var segment = encode(String(value), token);
                if (validate && !matches[i].test(segment)) {
                    throw new TypeError("Expected \"".concat(token.name, "\" to match \"").concat(token.pattern, "\", but got \"").concat(segment, "\""));
                }
                path += token.prefix + segment + token.suffix;
                continue;
            }
            if (optional)
                continue;
            var typeOfMessage = repeat ? "an array" : "a string";
            throw new TypeError("Expected \"".concat(token.name, "\" to be ").concat(typeOfMessage));
        }
        return path;
    };
}
/**
 * Escape a regular expression string.
 */
function escapeString(str) {
    return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
/**
 * Get the flags for a regexp from the options.
 */
function flags(options) {
    return options && options.sensitive ? "" : "i";
}

function getRouteGenerator(segments, addTrailingSlash) {
  const template = segments.map((segment) => {
    return segment[0].spread ? `/:${segment[0].content.slice(3)}(.*)?` : "/" + segment.map((part) => {
      if (part)
        return part.dynamic ? `:${part.content}` : part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }).join("");
  }).join("");
  const trailing = addTrailingSlash !== "never" && segments.length ? "/" : "";
  const toPath = compile(template + trailing);
  return toPath;
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  return {
    ...serializedManifest,
    assets,
    routes
  };
}

const _manifest = Object.assign(deserializeManifest({"routes":[{"file":"","links":["assets/37aa35a5.7516396b.css","assets/7d3520ec.cd1462d4.css","assets/a2742253.c9111474.css"],"scripts":[{"type":"external","value":"hoisted.6b133e90.js"}],"routeData":{"route":"/","type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/37aa35a5.7516396b.css","assets/597adc77.367da866.css","assets/a2742253.c9111474.css"],"scripts":[{"type":"external","value":"hoisted.6b133e90.js"}],"routeData":{"route":"/bookreview","type":"page","pattern":"^\\/bookreview\\/?$","segments":[[{"content":"bookreview","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/bookreview.astro","pathname":"/bookreview","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/a2742253.c9111474.css"],"scripts":[{"type":"external","value":"hoisted.6b133e90.js"}],"routeData":{"route":"/blog/4-most-recent-post-button","type":"page","pattern":"^\\/blog\\/4-most-recent-post-button\\/?$","segments":[[{"content":"blog","dynamic":false,"spread":false}],[{"content":"4-most-recent-post-button","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/blog/4-most-recent-post-button.md","pathname":"/blog/4-most-recent-post-button","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/a2742253.c9111474.css"],"scripts":[{"type":"external","value":"hoisted.6b133e90.js"}],"routeData":{"route":"/blog/2-two-factor-auth","type":"page","pattern":"^\\/blog\\/2-two-factor-auth\\/?$","segments":[[{"content":"blog","dynamic":false,"spread":false}],[{"content":"2-two-factor-auth","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/blog/2-two-factor-auth.md","pathname":"/blog/2-two-factor-auth","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/a2742253.c9111474.css"],"scripts":[{"type":"external","value":"hoisted.6b133e90.js"}],"routeData":{"route":"/blog/3-starting-astro","type":"page","pattern":"^\\/blog\\/3-starting-astro\\/?$","segments":[[{"content":"blog","dynamic":false,"spread":false}],[{"content":"3-starting-astro","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/blog/3-starting-astro.md","pathname":"/blog/3-starting-astro","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/a2742253.c9111474.css"],"scripts":[{"type":"external","value":"hoisted.6b133e90.js"}],"routeData":{"route":"/blog/1-password","type":"page","pattern":"^\\/blog\\/1-password\\/?$","segments":[[{"content":"blog","dynamic":false,"spread":false}],[{"content":"1-password","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/blog/1-password.md","pathname":"/blog/1-password","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/a2742253.c9111474.css"],"scripts":[{"type":"external","value":"hoisted.6b133e90.js"}],"routeData":{"route":"/book/11-communist-manifesto","type":"page","pattern":"^\\/book\\/11-communist-manifesto\\/?$","segments":[[{"content":"book","dynamic":false,"spread":false}],[{"content":"11-communist-manifesto","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/book/11-communist-manifesto.md","pathname":"/book/11-communist-manifesto","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/a2742253.c9111474.css"],"scripts":[{"type":"external","value":"hoisted.6b133e90.js"}],"routeData":{"route":"/book/1-slaughterhouse-five","type":"page","pattern":"^\\/book\\/1-Slaughterhouse-Five\\/?$","segments":[[{"content":"book","dynamic":false,"spread":false}],[{"content":"1-Slaughterhouse-Five","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/book/1-Slaughterhouse-Five.md","pathname":"/book/1-Slaughterhouse-Five","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/a2742253.c9111474.css"],"scripts":[{"type":"external","value":"hoisted.6b133e90.js"}],"routeData":{"route":"/book/5-lord-of-the-flies","type":"page","pattern":"^\\/book\\/5-lord-of-the-flies\\/?$","segments":[[{"content":"book","dynamic":false,"spread":false}],[{"content":"5-lord-of-the-flies","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/book/5-lord-of-the-flies.md","pathname":"/book/5-lord-of-the-flies","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/a2742253.c9111474.css"],"scripts":[{"type":"external","value":"hoisted.6b133e90.js"}],"routeData":{"route":"/book/10-never-let-me-go","type":"page","pattern":"^\\/book\\/10-never-let-me-go\\/?$","segments":[[{"content":"book","dynamic":false,"spread":false}],[{"content":"10-never-let-me-go","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/book/10-never-let-me-go.md","pathname":"/book/10-never-let-me-go","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/a2742253.c9111474.css"],"scripts":[{"type":"external","value":"hoisted.6b133e90.js"}],"routeData":{"route":"/book/2-ready-player-one","type":"page","pattern":"^\\/book\\/2-ready-player-one\\/?$","segments":[[{"content":"book","dynamic":false,"spread":false}],[{"content":"2-ready-player-one","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/book/2-ready-player-one.md","pathname":"/book/2-ready-player-one","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/a2742253.c9111474.css"],"scripts":[{"type":"external","value":"hoisted.6b133e90.js"}],"routeData":{"route":"/book/4-the-bell-jar","type":"page","pattern":"^\\/book\\/4-the-bell-jar\\/?$","segments":[[{"content":"book","dynamic":false,"spread":false}],[{"content":"4-the-bell-jar","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/book/4-the-bell-jar.md","pathname":"/book/4-the-bell-jar","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/a2742253.c9111474.css"],"scripts":[{"type":"external","value":"hoisted.6b133e90.js"}],"routeData":{"route":"/book/8-old-mans-war","type":"page","pattern":"^\\/book\\/8-old-mans-war\\/?$","segments":[[{"content":"book","dynamic":false,"spread":false}],[{"content":"8-old-mans-war","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/book/8-old-mans-war.md","pathname":"/book/8-old-mans-war","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/a2742253.c9111474.css"],"scripts":[{"type":"external","value":"hoisted.6b133e90.js"}],"routeData":{"route":"/book/7-the-martian","type":"page","pattern":"^\\/book\\/7-the-martian\\/?$","segments":[[{"content":"book","dynamic":false,"spread":false}],[{"content":"7-the-martian","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/book/7-the-martian.md","pathname":"/book/7-the-martian","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/a2742253.c9111474.css"],"scripts":[{"type":"external","value":"hoisted.6b133e90.js"}],"routeData":{"route":"/book/9-supermarket","type":"page","pattern":"^\\/book\\/9-supermarket\\/?$","segments":[[{"content":"book","dynamic":false,"spread":false}],[{"content":"9-supermarket","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/book/9-supermarket.md","pathname":"/book/9-supermarket","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/a2742253.c9111474.css"],"scripts":[{"type":"external","value":"hoisted.6b133e90.js"}],"routeData":{"route":"/book/6-slapstick","type":"page","pattern":"^\\/book\\/6-slapstick\\/?$","segments":[[{"content":"book","dynamic":false,"spread":false}],[{"content":"6-slapstick","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/book/6-slapstick.md","pathname":"/book/6-slapstick","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/a2742253.c9111474.css"],"scripts":[{"type":"external","value":"hoisted.6b133e90.js"}],"routeData":{"route":"/book/3-armada","type":"page","pattern":"^\\/book\\/3-armada\\/?$","segments":[[{"content":"book","dynamic":false,"spread":false}],[{"content":"3-armada","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/book/3-armada.md","pathname":"/book/3-armada","_meta":{"trailingSlash":"ignore"}}}],"base":"/","markdown":{"mode":"mdx","drafts":false,"syntaxHighlight":"shiki","shikiConfig":{"langs":[],"theme":"github-dark","wrap":false},"remarkPlugins":[],"rehypePlugins":[]},"pageMap":null,"renderers":[],"entryModules":{"\u0000@astrojs-ssr-virtual-entry":"entry.js","C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/blog/1-password.md?mdImport":"chunks/1-password.49457bc9.mjs","C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/blog/2-two-factor-auth.md?mdImport":"chunks/2-two-factor-auth.36fb6b72.mjs","C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/blog/3-starting-astro.md?mdImport":"chunks/3-starting-astro.71d6a123.mjs","C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/blog/4-most-recent-post-button.md?mdImport":"chunks/4-most-recent-post-button.a3f823c2.mjs","C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/book/1-Slaughterhouse-Five.md?mdImport":"chunks/1-Slaughterhouse-Five.b6b1564b.mjs","C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/book/10-never-let-me-go.md?mdImport":"chunks/10-never-let-me-go.111e7ffd.mjs","C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/book/11-communist-manifesto.md?mdImport":"chunks/11-communist-manifesto.70aff368.mjs","C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/book/2-ready-player-one.md?mdImport":"chunks/2-ready-player-one.771cea39.mjs","C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/book/3-armada.md?mdImport":"chunks/3-armada.e5509789.mjs","C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/book/4-the-bell-jar.md?mdImport":"chunks/4-the-bell-jar.4a9921b8.mjs","C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/book/5-lord-of-the-flies.md?mdImport":"chunks/5-lord-of-the-flies.dc92c2a8.mjs","C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/book/6-slapstick.md?mdImport":"chunks/6-slapstick.d09e3350.mjs","C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/book/7-the-martian.md?mdImport":"chunks/7-the-martian.146d8896.mjs","C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/book/8-old-mans-war.md?mdImport":"chunks/8-old-mans-war.2421aca0.mjs","C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/book/9-supermarket.md?mdImport":"chunks/9-supermarket.8a992e57.mjs","/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/Search/Search":"Search.c14f119a.js","@astrojs/solid-js/client.js":"client.0ce4c70e.js","/astro/hoisted.js?q=0":"hoisted.6b133e90.js","astro:scripts/before-hydration.js":"data:text/javascript;charset=utf-8,//[no before-hydration script]"},"assets":["/assets/37aa35a5.7516396b.css","/assets/597adc77.367da866.css","/assets/7d3520ec.cd1462d4.css","/assets/a2742253.c9111474.css","/client.0ce4c70e.js","/favicon.ico","/hoisted.6b133e90.js","/Search.c14f119a.js","/social.jpg","/social.png","/assets/LOGO.html","/chunks/web.6f31aee9.js","/assets/blog/introducing-astro.jpg","/assets/bookreview/Armada.jpg","/assets/bookreview/OldMansWar.jpg","/assets/bookreview/TheMartian.jpg","/assets/images/LOGO.png"]}), {
	pageMap: pageMap,
	renderers: renderers
});
const _args = undefined;

const _exports = adapter.createExports(_manifest, _args);
const _default = _exports['default'];

const _start = 'start';
if(_start in adapter) {
	adapter[_start](_manifest, _args);
}

export { _page2 as _, _page3 as a, _page4 as b, _page5 as c, _page6 as d, _default as default, _page7 as e, _page8 as f, _page9 as g, _page10 as h, _page11 as i, _page12 as j, _page13 as k, _page14 as l, _page15 as m, _page16 as n };
