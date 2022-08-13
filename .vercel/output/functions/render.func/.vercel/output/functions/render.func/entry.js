import * as adapter from '@astrojs/vercel/serverless/entrypoint';
import { h, Component } from 'preact';
import render from 'preact-render-to-string';
import { ssr, renderToString as renderToString$1, createComponent as createComponent$1, ssrHydrationKey, ssrAttribute, escape as escape$1 } from 'solid-js/web';
import { escape } from 'html-escaper';
import etag from 'etag';
import { lookup } from 'mrmime';
import sharp$1 from 'sharp';
import fs from 'node:fs/promises';
/* empty css                        *//* empty css                           */import { createSignal, Show, For } from 'solid-js';
import path, { extname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import fs$1 from 'node:fs';
import glob from 'tiny-glob';
import slash from 'slash';
import sizeOf from 'image-size';
/* empty css                           */import 'mime';
import 'kleur/colors';
import 'string-width';
import 'path-browserify';
import { compile } from 'path-to-regexp';

/**
 * Astro passes `children` as a string of HTML, so we need
 * a wrapper `div` to render that content as VNodes.
 *
 * As a bonus, we can signal to Preact that this subtree is
 * entirely static and will never change via `shouldComponentUpdate`.
 */
const StaticHtml = ({ value, name }) => {
	if (!value) return null;
	return h('astro-slot', { name, dangerouslySetInnerHTML: { __html: value } });
};

/**
 * This tells Preact to opt-out of re-rendering this subtree,
 * In addition to being a performance optimization,
 * this also allows other frameworks to attach to `children`.
 *
 * See https://preactjs.com/guide/v8/external-dom-mutations
 */
StaticHtml.shouldComponentUpdate = () => false;

const slotName$2 = (str) => str.trim().replace(/[-_]([a-z])/g, (_, w) => w.toUpperCase());

let originalConsoleError$1;
let consoleFilterRefs$1 = 0;

function check$2(Component$1, props, children) {
	if (typeof Component$1 !== 'function') return false;

	if (Component$1.prototype != null && typeof Component$1.prototype.render === 'function') {
		return Component.isPrototypeOf(Component$1);
	}

	useConsoleFilter$1();

	try {
		try {
			const { html } = renderToStaticMarkup$2(Component$1, props, children);
			if (typeof html !== 'string') {
				return false;
			}

			// There are edge cases (SolidJS) where Preact *might* render a string,
			// but components would be <undefined></undefined>

			return !/\<undefined\>/.test(html);
		} catch (err) {
			return false;
		}
	} finally {
		finishUsingConsoleFilter$1();
	}
}

function renderToStaticMarkup$2(Component, props, { default: children, ...slotted }) {
	const slots = {};
	for (const [key, value] of Object.entries(slotted)) {
		const name = slotName$2(key);
		slots[name] = h(StaticHtml, { value, name });
	}
	// Note: create newProps to avoid mutating `props` before they are serialized
	const newProps = { ...props, ...slots };
	const html = render(
		h(Component, newProps, children != null ? h(StaticHtml, { value: children }) : children)
	);
	return { html };
}

/**
 * Reduces console noise by filtering known non-problematic errors.
 *
 * Performs reference counting to allow parallel usage from async code.
 *
 * To stop filtering, please ensure that there always is a matching call
 * to `finishUsingConsoleFilter` afterwards.
 */
function useConsoleFilter$1() {
	consoleFilterRefs$1++;

	if (!originalConsoleError$1) {
		// eslint-disable-next-line no-console
		originalConsoleError$1 = console.error;

		try {
			// eslint-disable-next-line no-console
			console.error = filteredConsoleError$1;
		} catch (error) {
			// If we're unable to hook `console.error`, just accept it
		}
	}
}

/**
 * Indicates that the filter installed by `useConsoleFilter`
 * is no longer needed by the calling code.
 */
function finishUsingConsoleFilter$1() {
	consoleFilterRefs$1--;

	// Note: Instead of reverting `console.error` back to the original
	// when the reference counter reaches 0, we leave our hook installed
	// to prevent potential race conditions once `check` is made async
}

/**
 * Hook/wrapper function for the global `console.error` function.
 *
 * Ignores known non-problematic errors while any code is using the console filter.
 * Otherwise, simply forwards all arguments to the original function.
 */
function filteredConsoleError$1(msg, ...rest) {
	if (consoleFilterRefs$1 > 0 && typeof msg === 'string') {
		// In `check`, we attempt to render JSX components through Preact.
		// When attempting this on a React component, React may output
		// the following error, which we can safely filter out:
		const isKnownReactHookError =
			msg.includes('Warning: Invalid hook call.') &&
			msg.includes('https://reactjs.org/link/invalid-hook-call');
		if (isKnownReactHookError) return;
	}
	originalConsoleError$1(msg, ...rest);
}

const _renderer2 = {
	check: check$2,
	renderToStaticMarkup: renderToStaticMarkup$2,
};

const slotName$1 = (str) => str.trim().replace(/[-_]([a-z])/g, (_, w) => w.toUpperCase());

function check$1(Component, props, children) {
	if (typeof Component !== 'function') return false;
	const { html } = renderToStaticMarkup$1(Component, props, children);
	return typeof html === 'string';
}

function renderToStaticMarkup$1(Component, props, { default: children, ...slotted }) {
	const slots = {};
	for (const [key, value] of Object.entries(slotted)) {
		const name = slotName$1(key);
		slots[name] = ssr(`<astro-slot name="${name}">${value}</astro-slot>`);
	}
	// Note: create newProps to avoid mutating `props` before they are serialized
	const newProps = {
		...props,
		...slots,
		// In Solid SSR mode, `ssr` creates the expected structure for `children`.
		children: children != null ? ssr(`<astro-slot>${children}</astro-slot>`) : children,
	};
	const html = renderToString$1(() => createComponent$1(Component, newProps));
	return { html };
}

const _renderer1 = {
	check: check$1,
	renderToStaticMarkup: renderToStaticMarkup$1,
};

const ASTRO_VERSION = "1.0.5";
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
  const site = _site ? new URL(_site) : void 0;
  const referenceURL = new URL(filePathname, `http://localhost`);
  const projectRoot = new URL(projectRootStr);
  return {
    site,
    generator: `Astro v${ASTRO_VERSION}`,
    fetchContent: createDeprecatedFetchContentFn(),
    glob: createAstroGlobFn(),
    resolve(...segments) {
      let resolved = segments.reduce((u, segment) => new URL(segment, u), referenceURL).pathname;
      if (resolved.startsWith(projectRoot.pathname)) {
        resolved = "/" + resolved.slice(projectRoot.pathname.length);
      }
      return resolved;
    }
  };
}

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
  return Object.fromEntries(
    Object.entries(value).map(([k, v]) => {
      return [k, convertToSerializedForm(v)];
    })
  );
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
      return [PROP_TYPE.Map, JSON.stringify(serializeArray(Array.from(value)))];
    }
    case "[object Set]": {
      return [PROP_TYPE.Set, JSON.stringify(serializeArray(Array.from(value)))];
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
      item = item === false || item == null ? "" : String(item).trim();
      if (item) {
        item.split(/\s+/).forEach((name) => {
          hash[name] = true;
        });
      }
    }
  }
}

const HydrationDirectivesRaw = ["load", "idle", "media", "visible", "only"];
const HydrationDirectives = new Set(HydrationDirectivesRaw);
const HydrationDirectiveProps = new Set(HydrationDirectivesRaw.map((n) => `client:${n}`));
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
        case "client:display-name": {
          break;
        }
        default: {
          extracted.hydration.directive = key.split(":")[1];
          extracted.hydration.value = value;
          if (!HydrationDirectives.has(extracted.hydration.directive)) {
            throw new Error(
              `Error: invalid hydration directive "${key}". Supported hydration methods: ${Array.from(
                HydrationDirectiveProps
              ).join(", ")}`
            );
          }
          if (extracted.hydration.directive === "media" && typeof extracted.hydration.value !== "string") {
            throw new Error(
              'Error: Media query must be provided for "client:media", similar to client:media="(max-width: 600px)"'
            );
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
  const { renderer, result, astroId, props, attrs } = scriptOptions;
  const { hydrate, componentUrl, componentExport } = metadata;
  if (!componentExport.value) {
    throw new Error(
      `Unable to resolve a valid export for "${metadata.displayName}"! Please open an issue at https://astro.build/issues!`
    );
  }
  const island = {
    children: "",
    props: {
      uid: astroId
    }
  };
  if (attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      island.props[key] = value;
    }
  }
  island.props["component-url"] = await result.resolve(componentUrl);
  if (renderer.clientEntrypoint) {
    island.props["component-export"] = componentExport.value;
    island.props["renderer-url"] = await result.resolve(renderer.clientEntrypoint);
    island.props["props"] = escapeHTML(serializeProps(props));
  }
  island.props["ssr"] = "";
  island.props["client"] = hydrate;
  island.props["before-hydration-url"] = await result.resolve("astro:scripts/before-hydration.js");
  island.props["opts"] = escapeHTML(
    JSON.stringify({
      name: metadata.displayName,
      value: metadata.hydrateArgs || ""
    })
  );
  return island;
}

var idle_prebuilt_default = `(self.Astro=self.Astro||{}).idle=a=>{const e=async()=>{await(await a())()};"requestIdleCallback"in window?window.requestIdleCallback(e):setTimeout(e,200)};`;

var load_prebuilt_default = `(self.Astro=self.Astro||{}).load=a=>{(async()=>await(await a())())()};`;

var media_prebuilt_default = `(self.Astro=self.Astro||{}).media=(s,a)=>{const t=async()=>{await(await s())()};if(a.value){const e=matchMedia(a.value);e.matches?t():e.addEventListener("change",t,{once:!0})}};`;

var only_prebuilt_default = `(self.Astro=self.Astro||{}).only=a=>{(async()=>await(await a())())()};`;

var visible_prebuilt_default = `(self.Astro=self.Astro||{}).visible=(i,c,n)=>{const r=async()=>{await(await i())()};let s=new IntersectionObserver(e=>{for(const t of e)if(!!t.isIntersecting){s.disconnect(),r();break}});for(let e=0;e<n.children.length;e++){const t=n.children[e];s.observe(t)}};`;

var astro_island_prebuilt_default = `var a;{const l={0:t=>t,1:t=>JSON.parse(t,n),2:t=>new RegExp(t),3:t=>new Date(t),4:t=>new Map(JSON.parse(t,n)),5:t=>new Set(JSON.parse(t,n)),6:t=>BigInt(t),7:t=>new URL(t)},n=(t,r)=>{if(t===""||!Array.isArray(r))return r;const[s,i]=r;return s in l?l[s](i):void 0};customElements.get("astro-island")||customElements.define("astro-island",(a=class extends HTMLElement{constructor(){super(...arguments);this.hydrate=()=>{if(!this.hydrator||this.parentElement?.closest("astro-island[ssr]"))return;const r=this.querySelectorAll("astro-slot"),s={},i=this.querySelectorAll("template[data-astro-template]");for(const e of i)!e.closest(this.tagName)?.isSameNode(this)||(s[e.getAttribute("data-astro-template")||"default"]=e.innerHTML,e.remove());for(const e of r)!e.closest(this.tagName)?.isSameNode(this)||(s[e.getAttribute("name")||"default"]=e.innerHTML);const o=this.hasAttribute("props")?JSON.parse(this.getAttribute("props"),n):{};this.hydrator(this)(this.Component,o,s,{client:this.getAttribute("client")}),this.removeAttribute("ssr"),window.removeEventListener("astro:hydrate",this.hydrate),window.dispatchEvent(new CustomEvent("astro:hydrate"))}}connectedCallback(){!this.hasAttribute("await-children")||this.firstChild?this.childrenConnectedCallback():new MutationObserver((r,s)=>{s.disconnect(),this.childrenConnectedCallback()}).observe(this,{childList:!0})}async childrenConnectedCallback(){window.addEventListener("astro:hydrate",this.hydrate),await import(this.getAttribute("before-hydration-url"));const r=JSON.parse(this.getAttribute("opts"));Astro[this.getAttribute("client")](async()=>{const s=this.getAttribute("renderer-url"),[i,{default:o}]=await Promise.all([import(this.getAttribute("component-url")),s?import(s):()=>()=>{}]),e=this.getAttribute("component-export")||"default";if(!e.includes("."))this.Component=i[e];else{this.Component=i;for(const c of e.split("."))this.Component=this.Component[c]}return this.hydrator=o,this.hydrate},r,this)}attributeChangedCallback(){this.hydrator&&this.hydrate()}},a.observedAttributes=["props"],a))}`;

function determineIfNeedsHydrationScript(result) {
  if (result._metadata.hasHydrationScript) {
    return false;
  }
  return result._metadata.hasHydrationScript = true;
}
const hydrationScripts = {
  idle: idle_prebuilt_default,
  load: load_prebuilt_default,
  only: only_prebuilt_default,
  media: media_prebuilt_default,
  visible: visible_prebuilt_default
};
function determinesIfNeedsDirectiveScript(result, directive) {
  if (result._metadata.hasDirectives.has(directive)) {
    return false;
  }
  result._metadata.hasDirectives.add(directive);
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

const Fragment = Symbol.for("astro:fragment");
const Renderer = Symbol.for("astro:renderer");
function stringifyChunk(result, chunk) {
  switch (chunk.type) {
    case "directive": {
      const { hydration } = chunk;
      let needsHydrationScript = hydration && determineIfNeedsHydrationScript(result);
      let needsDirectiveScript = hydration && determinesIfNeedsDirectiveScript(result, hydration.directive);
      let prescriptType = needsHydrationScript ? "both" : needsDirectiveScript ? "directive" : null;
      if (prescriptType) {
        let prescripts = getPrescripts(prescriptType, hydration.directive);
        return markHTMLString(prescripts);
      } else {
        return "";
      }
    }
    default: {
      return chunk.toString();
    }
  }
}

function validateComponentProps(props, displayName) {
  var _a;
  if (((_a = {"BASE_URL":"/","MODE":"production","DEV":false,"PROD":true}) == null ? void 0 : _a.DEV) && props != null) {
    for (const prop of Object.keys(props)) {
      if (HydrationDirectiveProps.has(prop)) {
        console.warn(
          `You are attempting to render <${displayName} ${prop} />, but ${displayName} is an Astro component. Astro components do not render in the client and should not have a hydration directive. Please use a framework component for client rendering.`
        );
      }
    }
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
      yield* renderChild(expression);
    }
  }
}
function isAstroComponent(obj) {
  return typeof obj === "object" && Object.prototype.toString.call(obj) === "[object AstroComponent]";
}
async function* renderAstroComponent(component) {
  for await (const value of component) {
    if (value || value === 0) {
      for await (const chunk of renderChild(value)) {
        switch (chunk.type) {
          case "directive": {
            yield chunk;
            break;
          }
          default: {
            yield markHTMLString(chunk);
            break;
          }
        }
      }
    }
  }
}
async function renderToString(result, componentFactory, props, children) {
  const Component = await componentFactory(result, props, children);
  if (!isAstroComponent(Component)) {
    const response = Component;
    throw response;
  }
  let html = "";
  for await (const chunk of renderAstroComponent(Component)) {
    html += stringifyChunk(result, chunk);
  }
  return html;
}
async function renderToIterable(result, componentFactory, displayName, props, children) {
  validateComponentProps(props, displayName);
  const Component = await componentFactory(result, props, children);
  if (!isAstroComponent(Component)) {
    console.warn(
      `Returning a Response is only supported inside of page components. Consider refactoring this logic into something like a function that can be used in the page.`
    );
    const response = Component;
    throw response;
  }
  return renderAstroComponent(Component);
}
async function renderTemplate(htmlParts, ...expressions) {
  return new AstroComponent(htmlParts, expressions);
}

async function* renderChild(child) {
  child = await child;
  if (child instanceof HTMLString) {
    yield child;
  } else if (Array.isArray(child)) {
    for (const value of child) {
      yield markHTMLString(await renderChild(value));
    }
  } else if (typeof child === "function") {
    yield* renderChild(child());
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
async function renderSlot(result, slotted, fallback) {
  if (slotted) {
    let iterator = renderChild(slotted);
    let content = "";
    for await (const chunk of iterator) {
      if (chunk.type === "directive") {
        content += stringifyChunk(result, chunk);
      } else {
        content += chunk;
      }
    }
    return markHTMLString(content);
  }
  return fallback;
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
const dictionary$1 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXY";
const binary$1 = dictionary$1.length;
function bitwise$1(str) {
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
function shorthash$1(text) {
  let num;
  let result = "";
  let integer = bitwise$1(text);
  const sign = integer < 0 ? "Z" : "";
  integer = Math.abs(integer);
  while (integer >= binary$1) {
    num = integer % binary$1;
    integer = Math.floor(integer / binary$1);
    result = dictionary$1[num] + result;
  }
  if (integer > 0) {
    result = dictionary$1[integer] + result;
  }
  return sign + result;
}

const voidElementNames = /^(area|base|br|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)$/i;
const htmlBooleanAttributes = /^(allowfullscreen|async|autofocus|autoplay|controls|default|defer|disabled|disablepictureinpicture|disableremoteplayback|formnovalidate|hidden|loop|nomodule|novalidate|open|playsinline|readonly|required|reversed|scoped|seamless|itemscope)$/i;
const htmlEnumAttributes = /^(contenteditable|draggable|spellcheck|value)$/i;
const svgEnumAttributes = /^(autoReverse|externalResourcesRequired|focusable|preserveAlpha)$/i;
const STATIC_DIRECTIVES = /* @__PURE__ */ new Set(["set:html", "set:text"]);
const toIdent = (k) => k.trim().replace(/(?:(?<!^)\b\w|\s+|[^\w]+)/g, (match, index) => {
  if (/[^\w]|\s/.test(match))
    return "";
  return index === 0 ? match : match.toUpperCase();
});
const toAttributeString = (value, shouldEscape = true) => shouldEscape ? String(value).replace(/&/g, "&#38;").replace(/"/g, "&#34;") : value;
const kebab = (k) => k.toLowerCase() === k ? k : k.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
const toStyleString = (obj) => Object.entries(obj).map(([k, v]) => `${kebab(k)}:${v}`).join(";");
function defineScriptVars(vars) {
  let output = "";
  for (const [key, value] of Object.entries(vars)) {
    output += `let ${toIdent(key)} = ${JSON.stringify(value)};
`;
  }
  return markHTMLString(output);
}
function formatList(values) {
  if (values.length === 1) {
    return values[0];
  }
  return `${values.slice(0, -1).join(", ")} or ${values[values.length - 1]}`;
}
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
    const listValue = toAttributeString(serializeListValue(value));
    if (listValue === "") {
      return "";
    }
    return markHTMLString(` ${key.slice(0, -5)}="${listValue}"`);
  }
  if (key === "style" && !(value instanceof HTMLString) && typeof value === "object") {
    return markHTMLString(` ${key}="${toStyleString(value)}"`);
  }
  if (key === "className") {
    return markHTMLString(` class="${toAttributeString(value, shouldEscape)}"`);
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
function renderElement$1(name, { props: _props, children = "" }, shouldEscape = true) {
  const { lang: _, "data-astro-id": astroId, "define:vars": defineVars, ...props } = _props;
  if (defineVars) {
    if (name === "style") {
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

function componentIsHTMLElement(Component) {
  return typeof HTMLElement !== "undefined" && HTMLElement.isPrototypeOf(Component);
}
async function renderHTMLElement(result, constructor, props, slots) {
  const name = getHTMLElementName(constructor);
  let attrHTML = "";
  for (const attr in props) {
    attrHTML += ` ${attr}="${toAttributeString(await props[attr])}"`;
  }
  return markHTMLString(
    `<${name}${attrHTML}>${await renderSlot(result, slots == null ? void 0 : slots.default)}</${name}>`
  );
}
function getHTMLElementName(constructor) {
  const definedName = customElements.getName(constructor);
  if (definedName)
    return definedName;
  const assignedName = constructor.name.replace(/^HTML|Element$/g, "").replace(/[A-Z]/g, "-$&").toLowerCase().replace(/^-/, "html-");
  return assignedName;
}

const rendererAliases = /* @__PURE__ */ new Map([["solid", "solid-js"]]);
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
function getComponentType(Component) {
  if (Component === Fragment) {
    return "fragment";
  }
  if (Component && typeof Component === "object" && Component["astro:html"]) {
    return "html";
  }
  if (Component && Component.isAstroComponentFactory) {
    return "astro-factory";
  }
  return "unknown";
}
async function renderComponent(result, displayName, Component, _props, slots = {}) {
  var _a;
  Component = await Component;
  switch (getComponentType(Component)) {
    case "fragment": {
      const children2 = await renderSlot(result, slots == null ? void 0 : slots.default);
      if (children2 == null) {
        return children2;
      }
      return markHTMLString(children2);
    }
    case "html": {
      const children2 = {};
      if (slots) {
        await Promise.all(
          Object.entries(slots).map(
            ([key, value]) => renderSlot(result, value).then((output) => {
              children2[key] = output;
            })
          )
        );
      }
      const html2 = Component.render({ slots: children2 });
      return markHTMLString(html2);
    }
    case "astro-factory": {
      async function* renderAstroComponentInline() {
        let iterable = await renderToIterable(result, Component, displayName, _props, slots);
        yield* iterable;
      }
      return renderAstroComponentInline();
    }
  }
  if (!Component && !_props["client:only"]) {
    throw new Error(
      `Unable to render ${displayName} because it is ${Component}!
Did you forget to import the component or is it possible there is a typo?`
    );
  }
  const { renderers } = result._metadata;
  const metadata = { displayName };
  const { hydration, isPage, props } = extractDirectives(_props);
  let html = "";
  let attrs = void 0;
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
    await Promise.all(
      Object.entries(slots).map(
        ([key, value]) => renderSlot(result, value).then((output) => {
          children[key] = output;
        })
      )
    );
  }
  let renderer;
  if (metadata.hydrate !== "only") {
    if (Component && Component[Renderer]) {
      const rendererName = Component[Renderer];
      renderer = renderers.find(({ name }) => name === rendererName);
    }
    if (!renderer) {
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
      if (!renderer && error) {
        throw error;
      }
    }
    if (!renderer && typeof HTMLElement === "function" && componentIsHTMLElement(Component)) {
      const output = renderHTMLElement(result, Component, _props, slots);
      return output;
    }
  } else {
    if (metadata.hydrateArgs) {
      const passedName = metadata.hydrateArgs;
      const rendererName = rendererAliases.has(passedName) ? rendererAliases.get(passedName) : passedName;
      renderer = renderers.find(
        ({ name }) => name === `@astrojs/${rendererName}` || name === rendererName
      );
    }
    if (!renderer && renderers.length === 1) {
      renderer = renderers[0];
    }
    if (!renderer) {
      const extname = (_a = metadata.componentUrl) == null ? void 0 : _a.split(".").pop();
      renderer = renderers.filter(
        ({ name }) => name === `@astrojs/${extname}` || name === extname
      )[0];
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
        ({ html, attrs } = await renderer.ssr.renderToStaticMarkup.call(
          { result },
          Component,
          props,
          children,
          metadata
        ));
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
      ({ html, attrs } = await renderer.ssr.renderToStaticMarkup.call(
        { result },
        Component,
        props,
        children,
        metadata
      ));
    }
  }
  if (renderer && !renderer.clientEntrypoint && renderer.name !== "@astrojs/lit" && metadata.hydrate) {
    throw new Error(
      `${metadata.displayName} component has a \`client:${metadata.hydrate}\` directive, but no client entrypoint was provided by ${renderer.name}!`
    );
  }
  if (!html && typeof Component === "string") {
    const childSlots = Object.values(children).join("");
    const iterable = renderAstroComponent(
      await renderTemplate`<${Component}${internalSpreadAttributes(props)}${markHTMLString(
        childSlots === "" && voidElementNames.test(Component) ? `/>` : `>${childSlots}</${Component}>`
      )}`
    );
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
  const astroId = shorthash$1(
    `<!--${metadata.componentExport.value}:${metadata.componentUrl}-->
${html}
${serializeProps(
      props
    )}`
  );
  const island = await generateHydrateScript(
    { renderer, result, astroId, props, attrs },
    metadata
  );
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
  const template = unrenderedSlots.length > 0 ? unrenderedSlots.map(
    (key) => `<template data-astro-template${key !== "default" ? `="${key}"` : ""}>${children[key]}</template>`
  ).join("") : "";
  island.children = `${html ?? ""}${template}`;
  if (island.children) {
    island.props["await-children"] = "";
  }
  async function* renderAll() {
    yield { type: "directive", hydration, result };
    yield markHTMLString(renderElement$1("astro-island", island, false));
  }
  return renderAll();
}

const uniqueElements = (item, index, all) => {
  const props = JSON.stringify(item.props);
  const children = item.children;
  return index === all.findIndex((i) => JSON.stringify(i.props) === props && i.children == children);
};
const alreadyHeadRenderedResults = /* @__PURE__ */ new WeakSet();
function renderHead(result) {
  alreadyHeadRenderedResults.add(result);
  const styles = Array.from(result.styles).filter(uniqueElements).map((style) => renderElement$1("style", style));
  result.styles.clear();
  const scripts = Array.from(result.scripts).filter(uniqueElements).map((script, i) => {
    return renderElement$1("script", script, false);
  });
  const links = Array.from(result.links).filter(uniqueElements).map((link) => renderElement$1("link", link, false));
  return markHTMLString(links.join("\n") + styles.join("\n") + scripts.join("\n"));
}
async function* maybeRenderHead(result) {
  if (alreadyHeadRenderedResults.has(result)) {
    return;
  }
  yield renderHead(result);
}

typeof process === "object" && Object.prototype.toString.call(process) === "[object process]";

new TextEncoder();

function createComponent(cb) {
  cb.isAstroComponentFactory = true;
  return cb;
}
function __astro_tag_component__(Component, rendererName) {
  if (!Component)
    return;
  if (typeof Component !== "function")
    return;
  Object.defineProperty(Component, Renderer, {
    value: rendererName,
    enumerable: false,
    writable: false
  });
}
function spreadAttributes(values, _name, { class: scopedClassName } = {}) {
  let output = "";
  if (scopedClassName) {
    if (typeof values.class !== "undefined") {
      values.class += ` ${scopedClassName}`;
    } else if (typeof values["class:list"] !== "undefined") {
      values["class:list"] = [values["class:list"], scopedClassName];
    } else {
      values.class = scopedClassName;
    }
  }
  for (const [key, value] of Object.entries(values)) {
    output += addAttribute(value, key, true);
  }
  return markHTMLString(output);
}

const AstroJSX = "astro:jsx";
const Empty = Symbol("empty");
const toSlotName = (str) => str.trim().replace(/[-_]([a-z])/g, (_, w) => w.toUpperCase());
function isVNode(vnode) {
  return vnode && typeof vnode === "object" && vnode[AstroJSX];
}
function transformSlots(vnode) {
  if (typeof vnode.type === "string")
    return vnode;
  const slots = {};
  if (isVNode(vnode.props.children)) {
    const child = vnode.props.children;
    if (!isVNode(child))
      return;
    if (!("slot" in child.props))
      return;
    const name = toSlotName(child.props.slot);
    slots[name] = [child];
    slots[name]["$$slot"] = true;
    delete child.props.slot;
    delete vnode.props.children;
  }
  if (Array.isArray(vnode.props.children)) {
    vnode.props.children = vnode.props.children.map((child) => {
      if (!isVNode(child))
        return child;
      if (!("slot" in child.props))
        return child;
      const name = toSlotName(child.props.slot);
      if (Array.isArray(slots[name])) {
        slots[name].push(child);
      } else {
        slots[name] = [child];
        slots[name]["$$slot"] = true;
      }
      delete child.props.slot;
      return Empty;
    }).filter((v) => v !== Empty);
  }
  Object.assign(vnode.props, slots);
}
function markRawChildren(child) {
  if (typeof child === "string")
    return markHTMLString(child);
  if (Array.isArray(child))
    return child.map((c) => markRawChildren(c));
  return child;
}
function transformSetDirectives(vnode) {
  if (!("set:html" in vnode.props || "set:text" in vnode.props))
    return;
  if ("set:html" in vnode.props) {
    const children = markRawChildren(vnode.props["set:html"]);
    delete vnode.props["set:html"];
    Object.assign(vnode.props, { children });
    return;
  }
  if ("set:text" in vnode.props) {
    const children = vnode.props["set:text"];
    delete vnode.props["set:text"];
    Object.assign(vnode.props, { children });
    return;
  }
}
function createVNode(type, props) {
  const vnode = {
    [AstroJSX]: true,
    type,
    props: props ?? {}
  };
  transformSetDirectives(vnode);
  transformSlots(vnode);
  return vnode;
}

const ClientOnlyPlaceholder = "astro-client-only";
const skipAstroJSXCheck = /* @__PURE__ */ new WeakSet();
let originalConsoleError;
let consoleFilterRefs = 0;
async function renderJSX(result, vnode) {
  switch (true) {
    case vnode instanceof HTMLString:
      if (vnode.toString().trim() === "") {
        return "";
      }
      return vnode;
    case typeof vnode === "string":
      return markHTMLString(escapeHTML(vnode));
    case (!vnode && vnode !== 0):
      return "";
    case Array.isArray(vnode):
      return markHTMLString(
        (await Promise.all(vnode.map((v) => renderJSX(result, v)))).join("")
      );
  }
  if (isVNode(vnode)) {
    switch (true) {
      case vnode.type === Symbol.for("astro:fragment"):
        return renderJSX(result, vnode.props.children);
      case vnode.type.isAstroComponentFactory: {
        let props = {};
        let slots = {};
        for (const [key, value] of Object.entries(vnode.props ?? {})) {
          if (key === "children" || value && typeof value === "object" && value["$$slot"]) {
            slots[key === "children" ? "default" : key] = () => renderJSX(result, value);
          } else {
            props[key] = value;
          }
        }
        return markHTMLString(await renderToString(result, vnode.type, props, slots));
      }
      case (!vnode.type && vnode.type !== 0):
        return "";
      case (typeof vnode.type === "string" && vnode.type !== ClientOnlyPlaceholder):
        return markHTMLString(await renderElement(result, vnode.type, vnode.props ?? {}));
    }
    if (vnode.type) {
      let extractSlots2 = function(child) {
        if (Array.isArray(child)) {
          return child.map((c) => extractSlots2(c));
        }
        if (!isVNode(child)) {
          _slots.default.push(child);
          return;
        }
        if ("slot" in child.props) {
          _slots[child.props.slot] = [..._slots[child.props.slot] ?? [], child];
          delete child.props.slot;
          return;
        }
        _slots.default.push(child);
      };
      if (typeof vnode.type === "function" && vnode.type["astro:renderer"]) {
        skipAstroJSXCheck.add(vnode.type);
      }
      if (typeof vnode.type === "function" && vnode.props["server:root"]) {
        const output2 = await vnode.type(vnode.props ?? {});
        return await renderJSX(result, output2);
      }
      if (typeof vnode.type === "function" && !skipAstroJSXCheck.has(vnode.type)) {
        useConsoleFilter();
        try {
          const output2 = await vnode.type(vnode.props ?? {});
          if (output2 && output2[AstroJSX]) {
            return await renderJSX(result, output2);
          } else if (!output2) {
            return await renderJSX(result, output2);
          }
        } catch (e) {
          skipAstroJSXCheck.add(vnode.type);
        } finally {
          finishUsingConsoleFilter();
        }
      }
      const { children = null, ...props } = vnode.props ?? {};
      const _slots = {
        default: []
      };
      extractSlots2(children);
      for (const [key, value] of Object.entries(props)) {
        if (value["$$slot"]) {
          _slots[key] = value;
          delete props[key];
        }
      }
      const slotPromises = [];
      const slots = {};
      for (const [key, value] of Object.entries(_slots)) {
        slotPromises.push(
          renderJSX(result, value).then((output2) => {
            if (output2.toString().trim().length === 0)
              return;
            slots[key] = () => output2;
          })
        );
      }
      await Promise.all(slotPromises);
      let output;
      if (vnode.type === ClientOnlyPlaceholder && vnode.props["client:only"]) {
        output = await renderComponent(
          result,
          vnode.props["client:display-name"] ?? "",
          null,
          props,
          slots
        );
      } else {
        output = await renderComponent(
          result,
          typeof vnode.type === "function" ? vnode.type.name : vnode.type,
          vnode.type,
          props,
          slots
        );
      }
      if (typeof output !== "string" && Symbol.asyncIterator in output) {
        let body = "";
        for await (const chunk of output) {
          let html = stringifyChunk(result, chunk);
          body += html;
        }
        return markHTMLString(body);
      } else {
        return markHTMLString(output);
      }
    }
  }
  return markHTMLString(`${vnode}`);
}
async function renderElement(result, tag, { children, ...props }) {
  return markHTMLString(
    `<${tag}${spreadAttributes(props)}${markHTMLString(
      (children == null || children == "") && voidElementNames.test(tag) ? `/>` : `>${children == null ? "" : await renderJSX(result, children)}</${tag}>`
    )}`
  );
}
function useConsoleFilter() {
  consoleFilterRefs++;
  if (!originalConsoleError) {
    originalConsoleError = console.error;
    try {
      console.error = filteredConsoleError;
    } catch (error) {
    }
  }
}
function finishUsingConsoleFilter() {
  consoleFilterRefs--;
}
function filteredConsoleError(msg, ...rest) {
  if (consoleFilterRefs > 0 && typeof msg === "string") {
    const isKnownReactHookError = msg.includes("Warning: Invalid hook call.") && msg.includes("https://reactjs.org/link/invalid-hook-call");
    if (isKnownReactHookError)
      return;
  }
}

const slotName = (str) => str.trim().replace(/[-_]([a-z])/g, (_, w) => w.toUpperCase());
async function check(Component, props, { default: children = null, ...slotted } = {}) {
  if (typeof Component !== "function")
    return false;
  const slots = {};
  for (const [key, value] of Object.entries(slotted)) {
    const name = slotName(key);
    slots[name] = value;
  }
  try {
    const result = await Component({ ...props, ...slots, children });
    return result[AstroJSX];
  } catch (e) {
  }
  return false;
}
async function renderToStaticMarkup(Component, props = {}, { default: children = null, ...slotted } = {}) {
  const slots = {};
  for (const [key, value] of Object.entries(slotted)) {
    const name = slotName(key);
    slots[name] = value;
  }
  const { result } = this;
  const html = await renderJSX(result, createVNode(Component, { ...props, ...slots, children }));
  return { html };
}
var server_default = {
  check,
  renderToStaticMarkup
};

function isOutputFormat(value) {
  return ["avif", "jpeg", "png", "webp"].includes(value);
}
function isAspectRatioString(value) {
  return /^\d*:\d*$/.test(value);
}
function isRemoteImage(src) {
  return /^http(s?):\/\//.test(src);
}
async function loadLocalImage(src) {
  try {
    return await fs.readFile(src);
  } catch {
    return void 0;
  }
}
async function loadRemoteImage(src) {
  try {
    const res = await fetch(src);
    if (!res.ok) {
      return void 0;
    }
    return Buffer.from(await res.arrayBuffer());
  } catch {
    return void 0;
  }
}
function parseAspectRatio(aspectRatio) {
  if (!aspectRatio) {
    return void 0;
  }
  if (typeof aspectRatio === "number") {
    return aspectRatio;
  } else {
    const [width, height] = aspectRatio.split(":");
    return parseInt(width) / parseInt(height);
  }
}

class SharpService {
  async getImageAttributes(transform) {
    const { width, height, src, format, quality, aspectRatio, ...rest } = transform;
    return {
      ...rest,
      width,
      height
    };
  }
  serializeTransform(transform) {
    const searchParams = new URLSearchParams();
    if (transform.quality) {
      searchParams.append("q", transform.quality.toString());
    }
    if (transform.format) {
      searchParams.append("f", transform.format);
    }
    if (transform.width) {
      searchParams.append("w", transform.width.toString());
    }
    if (transform.height) {
      searchParams.append("h", transform.height.toString());
    }
    if (transform.aspectRatio) {
      searchParams.append("ar", transform.aspectRatio.toString());
    }
    searchParams.append("href", transform.src);
    return { searchParams };
  }
  parseTransform(searchParams) {
    if (!searchParams.has("href")) {
      return void 0;
    }
    let transform = { src: searchParams.get("href") };
    if (searchParams.has("q")) {
      transform.quality = parseInt(searchParams.get("q"));
    }
    if (searchParams.has("f")) {
      const format = searchParams.get("f");
      if (isOutputFormat(format)) {
        transform.format = format;
      }
    }
    if (searchParams.has("w")) {
      transform.width = parseInt(searchParams.get("w"));
    }
    if (searchParams.has("h")) {
      transform.height = parseInt(searchParams.get("h"));
    }
    if (searchParams.has("ar")) {
      const ratio = searchParams.get("ar");
      if (isAspectRatioString(ratio)) {
        transform.aspectRatio = ratio;
      } else {
        transform.aspectRatio = parseFloat(ratio);
      }
    }
    return transform;
  }
  async transform(inputBuffer, transform) {
    const sharpImage = sharp$1(inputBuffer, { failOnError: false, pages: -1 });
    sharpImage.rotate();
    if (transform.width || transform.height) {
      const width = transform.width && Math.round(transform.width);
      const height = transform.height && Math.round(transform.height);
      sharpImage.resize(width, height);
    }
    if (transform.format) {
      sharpImage.toFormat(transform.format, { quality: transform.quality });
    }
    const { data, info } = await sharpImage.toBuffer({ resolveWithObject: true });
    return {
      data,
      format: info.format
    };
  }
}
const service = new SharpService();
var sharp_default = service;

const sharp = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: sharp_default
}, Symbol.toStringTag, { value: 'Module' }));

const get = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const transform = sharp_default.parseTransform(url.searchParams);
    if (!transform) {
      return new Response("Bad Request", { status: 400 });
    }
    let inputBuffer = void 0;
    if (isRemoteImage(transform.src)) {
      inputBuffer = await loadRemoteImage(transform.src);
    } else {
      const clientRoot = new URL("../client/", import.meta.url);
      const localPath = new URL("." + transform.src, clientRoot);
      inputBuffer = await loadLocalImage(localPath);
    }
    if (!inputBuffer) {
      return new Response(`"${transform.src} not found`, { status: 404 });
    }
    const { data, format } = await sharp_default.transform(inputBuffer, transform);
    return new Response(data, {
      status: 200,
      headers: {
        "Content-Type": lookup(format) || "",
        "Cache-Control": "public, max-age=31536000",
        ETag: etag(inputBuffer),
        Date: new Date().toUTCString()
      }
    });
  } catch (err) {
    return new Response(`Server Error: ${err}`, { status: 500 });
  }
};

const _page0 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	get
}, Symbol.toStringTag, { value: 'Module' }));

var __freeze$2 = Object.freeze;
var __defProp$2 = Object.defineProperty;
var __template$2 = (cooked, raw) => __freeze$2(__defProp$2(cooked, "raw", { value: __freeze$2(raw || cooked.slice()) }));
var _a$2;
const $$metadata$d = createMetadata("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/MetaTags.astro", { modules: [], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$f = createAstro("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/MetaTags.astro", "https://blackskies.vercel.app/", "file:///C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/");
const $$MetaTags = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$f, $$props, $$slots);
  Astro2.self = $$MetaTags;
  const { title, description, permalink } = Astro2.props;
  return renderTemplate(_a$2 || (_a$2 = __template$2(['<!-- Global Metadata --><meta charset="utf-8">\n<meta name="viewport" content="width=device-width">\n<link rel="icon" type="image/x-icon" href="/favicon.ico">\n\n<!-- Primary Meta Tags -->\n<title>', '</title>\n<meta name="title"', '>\n<meta name="description"', '>\n\n<!-- Open Graph / Facebook -->\n<meta property="og:type" content="website">\n<meta property="og:url"', '>\n<meta property="og:title"', '>\n<meta property="og:description"', '>\n<meta property="og:image" content="https://astro.build/social.png?v=1">\n\n<!-- Twitter -->\n<meta property="twitter:card" content="summary_large_image">\n<meta property="twitter:url"', '>\n<meta property="twitter:title"', '>\n<meta property="twitter:description"', '>\n<meta property="twitter:image" content="https://astro.build/social.png?v=1">\n\n<!-- Fonts -->\n<link rel="preconnect" href="https://fonts.gstatic.com">\n<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono&family=IBM+Plex+Sans:wght@400;700&display=swap">\n\n<!-- "Boxicons CDN" Link -->\n<link href="https://unpkg.com/boxicons@2.1.2/css/boxicons.min.css" rel="stylesheet">\n\n<!-- FontAwesome -->\n<script src="https://kit.fontawesome.com/e2fcf864fc.js" crossorigin="anonymous"><\/script>'])), title, addAttribute(title, "content"), addAttribute(description, "content"), addAttribute(permalink, "content"), addAttribute(title, "content"), addAttribute(description, "content"), addAttribute(permalink, "content"), addAttribute(title, "content"), addAttribute(description, "content"));
});

const $$file$d = "C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/MetaTags.astro";
const $$url$d = undefined;

const $$module1$5 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$d,
	default: $$MetaTags,
	file: $$file$d,
	url: $$url$d
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$c = createMetadata("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/cursorEffect/Cursor.astro", { modules: [], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [{ type: "inline", value: `
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
const $$Astro$e = createAstro("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/cursorEffect/Cursor.astro", "https://blackskies.vercel.app/", "file:///C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/");
const $$Cursor = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$e, $$props, $$slots);
  Astro2.self = $$Cursor;
  const STYLES = [];
  for (const STYLE of STYLES)
    $$result.styles.add(STYLE);
  return renderTemplate`${maybeRenderHead($$result)}<canvas id="canvas" class="astro-NXUPEEDQ"></canvas>

`;
});

const $$file$c = "C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/cursorEffect/Cursor.astro";
const $$url$c = undefined;

const $$module3$2 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$c,
	default: $$Cursor,
	file: $$file$c,
	url: $$url$c
}, Symbol.toStringTag, { value: 'Module' }));

const _tmpl$ = ["<ul", ' class="list">', "</ul>"], _tmpl$2 = ["<div", ' class="searchContainer"><div class="search-input"><input type="text" placeholder="<Search... />"', ' class="surface3 searchBar" role="search"><i class="icon fas fa-search"></i></div><!--#-->', "<!--/--></div>"], _tmpl$3 = ["<li", ' class=" searchResult">No results found</li>'], _tmpl$4 = ["<li", ' class="searchResult"><a', ">", "</a></li>"];
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
        children: (post, i) => ssr(_tmpl$4, ssrHydrationKey(), ssrAttribute("href", escape$1(post.url, true), false), escape$1(post.title))
      })));
    }
  })));
}
__astro_tag_component__(Search, "@astrojs/solid-js");

const $$module1$4 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: Search
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$b = createMetadata("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/utils/api.astro", { modules: [], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$d = createAstro("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/utils/api.astro", "https://blackskies.vercel.app/", "file:///C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/");
const Astro = $$Astro$d;
async function getBlogPosts() {
  let allBlogPosts = await Astro.glob(/* #__PURE__ */ Object.assign({"../pages/blog/1-password.mdx": () => Promise.resolve().then(() => _page6),"../pages/blog/2-two-factor-auth.mdx": () => Promise.resolve().then(() => _page4),"../pages/blog/3-starting-astro.mdx": () => Promise.resolve().then(() => _page5),"../pages/blog/4-most-recent-post-button.mdx": () => Promise.resolve().then(() => _page3)}), () => "../pages/blog/*.mdx");
  allBlogPosts = allBlogPosts.sort((a, b) => new Date(b.frontmatter.publishDate).valueOf() - new Date(a.frontmatter.publishDate).valueOf());
  let mostRecentBlogPost = allBlogPosts[0];
  return { allBlogPosts, mostRecentBlogPost };
}
async function getBookPosts() {
  let allBookPosts = await Astro.glob(/* #__PURE__ */ Object.assign({"../pages/book/1-Slaughterhouse-Five.mdx": () => Promise.resolve().then(() => _page8),"../pages/book/10-never-let-me-go.mdx": () => Promise.resolve().then(() => _page10),"../pages/book/11-communist-manifesto.mdx": () => Promise.resolve().then(() => _page7),"../pages/book/2-ready-player-one.mdx": () => Promise.resolve().then(() => _page12),"../pages/book/3-armada.mdx": () => Promise.resolve().then(() => _page18),"../pages/book/4-the-bell-jar.mdx": () => Promise.resolve().then(() => _page13),"../pages/book/5-lord-of-the-flies.mdx": () => Promise.resolve().then(() => _page9),"../pages/book/6-slapstick.mdx": () => Promise.resolve().then(() => _page17),"../pages/book/7-the-martian.mdx": () => Promise.resolve().then(() => _page15),"../pages/book/8-old-mans-war.mdx": () => Promise.resolve().then(() => _page14),"../pages/book/9-supermarket.mdx": () => Promise.resolve().then(() => _page16)}), () => "../pages/book/*.mdx");
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
async function getSearchData() {
  let allPosts = await getPosts();
  let allPostsData = allPosts.allPosts.map(
    (post) => {
      return {
        title: post.frontmatter.title,
        author: post.frontmatter.author,
        writer: post.frontmatter.writer,
        description: post.frontmatter.description,
        tags: post.frontmatter.tags,
        url: post.url
      };
    }
  );
  return allPostsData;
}
const $$Api = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$d, $$props, $$slots);
  Astro2.self = $$Api;
  return renderTemplate``;
});

const $$file$b = "C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/utils/api.astro";
const $$url$b = undefined;

const $$module6 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$b,
	getBlogPosts,
	getBookPosts,
	getPosts,
	getSearchData,
	default: $$Api,
	file: $$file$b,
	url: $$url$b
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$a = createMetadata("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/darkmode.astro", { modules: [], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [{ type: "inline", value: `
    const switcher = document.querySelector('#theme-switcher'); // select the switcher

    switcher.addEventListener('input', e =>
    setTheme(e.target.value))
    // set the theme on input and save to local storage

    const setTheme = theme => {
        document.documentElement.setAttribute('color-scheme', theme);
        localStorage.setItem('color-scheme', theme);
    }
    // set the theme on load
    setTheme(localStorage.getItem('color-scheme') || 'auto');
` }] });
const $$Astro$c = createAstro("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/darkmode.astro", "https://blackskies.vercel.app/", "file:///C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/");
const $$Darkmode = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$c, $$props, $$slots);
  Astro2.self = $$Darkmode;
  const STYLES = [];
  for (const STYLE of STYLES)
    $$result.styles.add(STYLE);
  return renderTemplate`${maybeRenderHead($$result)}<select id="theme-switcher" class="astro-THQITHVX">
    <option value="auto" id="auto" class="astro-THQITHVX">Auto</option>
    <option value="light" id="light" class="astro-THQITHVX">Light</option>
    <option value="dark" id="dark" class="astro-THQITHVX">Dark</option>
    <option value="dim" id="dim" class="astro-THQITHVX">Dim</option>
    <option value="teal" id="teal" class="astro-THQITHVX">Teal</option>
    <option value="grape" id="grape" class="astro-THQITHVX">Grape</option>
</select>

`;
});

const $$file$a = "C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/darkmode.astro";
const $$url$a = undefined;

const $$module3$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$a,
	default: $$Darkmode,
	file: $$file$a,
	url: $$url$a
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$9 = createMetadata("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/Navbar.astro", { modules: [{ module: $$module1$4, specifier: "../components/search/Search", assert: {} }, { module: $$module6, specifier: "../utils/api.astro", assert: {} }, { module: $$module3$1, specifier: "../components/darkmode.astro", assert: {} }], hydratedComponents: [Search], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set(["load"]), hoisted: [] });
const $$Astro$b = createAstro("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/Navbar.astro", "https://blackskies.vercel.app/", "file:///C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/");
const $$Navbar = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$b, $$props, $$slots);
  Astro2.self = $$Navbar;
  const posts = await getSearchData();
  const STYLES = [];
  for (const STYLE of STYLES)
    $$result.styles.add(STYLE);
  return renderTemplate`${maybeRenderHead($$result)}<nav class="brand surface2 nav astro-LPDBPLPZ">
    <div class="logoContainer astro-LPDBPLPZ">
        <a href="/" class="logo astro-LPDBPLPZ">
            <!-- <img src='../assets/LOGO.svg' width={90} height={90} alt='Logo' /> -->
            <h2 class="brand astro-LPDBPLPZ">&lt;BLACKSKIES &#47;&gt;</h2>
        </a>
    </div>
    ${renderComponent($$result, "Search", Search, { "client:load": true, "posts": posts, "client:component-hydration": "load", "client:component-path": "/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/search/Search", "client:component-export": "default", "class": "astro-LPDBPLPZ" })}
    <div class="menu astro-LPDBPLPZ">
        <ul class="hamburger astro-LPDBPLPZ">
            <li class="astro-LPDBPLPZ"><a href="/" class="astro-LPDBPLPZ">Home</a></li>
            <li class="astro-LPDBPLPZ"><a href="#" class="astro-LPDBPLPZ">About</a></li>
            <li class="astro-LPDBPLPZ"><a href="#" class="astro-LPDBPLPZ">Hire Me</a></li>
            <li class="astro-LPDBPLPZ">
                ${renderComponent($$result, "Dark", $$Darkmode, { "class": "astro-LPDBPLPZ" })}
            </li>
        </ul>
    </div>
</nav>`;
});

const $$file$9 = "C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/Navbar.astro";
const $$url$9 = undefined;

const $$module2$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$9,
	default: $$Navbar,
	file: $$file$9,
	url: $$url$9
}, Symbol.toStringTag, { value: 'Module' }));

const Mark = {
	name: "Mark Spratt",
	born: "09-29-1987",
	twitter: "http://twitter.com",
	twitterHandle: "@_Hopelezz",
	linkedin: "https://www.linkedin.com/in/mark-spratt/",
	github: "https://github.com/Hopelezz",
	githubHandle: "@Hopelezz",
	photo: "/assets/authors/Mark.avif",
	bio: "Electrical Engineer, Astro & Solid DocTeam!"
};
const John = {
	name: "John Spratt",
	born: "09-29-1987",
	twitter: "http://twitter.com",
	twitterHandle: "@_Hopelezz",
	linkedin: "https://www.linkedin.com/in/mark-spratt/",
	github: "https://github.com/Hopelezz",
	githubHandle: "@Hopelezz",
	photo: "/assets/authors/John.avif",
	bio: "I am a web developer and I love to code."
};
const Thamie = {
	name: "Thamie Spratt",
	born: "09-29-1987",
	twitter: "http://twitter.com",
	twitterHandle: "@_Hopelezz",
	linkedin: "https://www.linkedin.com/in/mark-spratt/",
	github: "",
	githubHandle: "@Hopelezz",
	photo: "/assets/authors/Jane.avif",
	bio: "I am a web developer and I love to code."
};
const json = {
	Mark: Mark,
	John: John,
	Thamie: Thamie
};

const $$module1$3 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	Mark,
	John,
	Thamie,
	default: json
}, Symbol.toStringTag, { value: 'Module' }));

const PKG_NAME = "@astrojs/image";
const ROUTE_PATTERN = "/_image";
const OUTPUT_DIR = "/_image";

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

function ensureDir(dir) {
  fs$1.mkdirSync(dir, { recursive: true });
}
function propsToFilename({ src, width, height, format }) {
  const ext = path.extname(src);
  let filename = src.replace(ext, "");
  if (isRemoteImage(src)) {
    filename += `-${shorthash(src)}`;
  }
  if (width && height) {
    return `${filename}_${width}x${height}.${format}`;
  } else if (width) {
    return `${filename}_${width}w.${format}`;
  } else if (height) {
    return `${filename}_${height}h.${format}`;
  }
  return format ? src.replace(ext, format) : src;
}
function filenameFormat(transform) {
  return isRemoteImage(transform.src) ? path.join(OUTPUT_DIR, path.basename(propsToFilename(transform))) : path.join(OUTPUT_DIR, path.dirname(transform.src), path.basename(propsToFilename(transform)));
}

async function ssgBuild({ loader, staticImages, srcDir, outDir }) {
  const inputFiles = /* @__PURE__ */ new Set();
  for await (const [src, transformsMap] of staticImages) {
    let inputFile = void 0;
    let inputBuffer = void 0;
    if (isRemoteImage(src)) {
      inputBuffer = await loadRemoteImage(src);
    } else {
      const inputFileURL = new URL(`.${src}`, srcDir);
      inputFile = fileURLToPath(inputFileURL);
      inputBuffer = await loadLocalImage(inputFile);
      inputFiles.add(inputFile);
    }
    if (!inputBuffer) {
      console.warn(`"${src}" image could not be fetched`);
      continue;
    }
    const transforms = Array.from(transformsMap.entries());
    for await (const [filename, transform] of transforms) {
      let outputFile;
      if (isRemoteImage(src)) {
        const outputFileURL = new URL(path.join("./", OUTPUT_DIR, path.basename(filename)), outDir);
        outputFile = fileURLToPath(outputFileURL);
      } else {
        const outputFileURL = new URL(path.join("./", OUTPUT_DIR, filename), outDir);
        outputFile = fileURLToPath(outputFileURL);
      }
      const { data } = await loader.transform(inputBuffer, transform);
      ensureDir(path.dirname(outputFile));
      await fs.writeFile(outputFile, data);
    }
  }
  for await (const original of inputFiles) {
    const to = original.replace(fileURLToPath(srcDir), fileURLToPath(outDir));
    await ensureDir(path.dirname(to));
    await fs.copyFile(original, to);
  }
}

async function globImages(dir) {
  fileURLToPath(dir);
  return await glob("./**/*.{heic,heif,avif,jpeg,jpg,png,tiff,webp,gif}", {
    cwd: fileURLToPath(dir)
  });
}
async function ssrBuild({ srcDir, outDir }) {
  const images = await globImages(srcDir);
  for (const image of images) {
    const from = path.join(fileURLToPath(srcDir), image);
    const to = path.join(fileURLToPath(outDir), image);
    await ensureDir(path.dirname(to));
    await fs.copyFile(from, to);
  }
}

async function metadata(src) {
  const file = await fs.readFile(src);
  const { width, height, type, orientation } = await sizeOf(file);
  const isPortrait = (orientation || 0) >= 5;
  if (!width || !height || !type) {
    return void 0;
  }
  return {
    src,
    width: isPortrait ? height : width,
    height: isPortrait ? width : height,
    format: type
  };
}

function createPlugin(config, options) {
  const filter = (id) => /^(?!\/_image?).*.(heic|heif|avif|jpeg|jpg|png|tiff|webp|gif)$/.test(id);
  const virtualModuleId = "virtual:image-loader";
  let resolvedConfig;
  let loaderModuleId;
  async function resolveLoader(context) {
    if (!loaderModuleId) {
      const module = await context.resolve(options.serviceEntryPoint);
      if (!module) {
        throw new Error(`"${options.serviceEntryPoint}" could not be found`);
      }
      loaderModuleId = module.id;
    }
    return loaderModuleId;
  }
  return {
    name: "@astrojs/image",
    enforce: "pre",
    configResolved(viteConfig) {
      resolvedConfig = viteConfig;
    },
    async resolveId(id) {
      if (id === virtualModuleId) {
        return await resolveLoader(this);
      }
    },
    async load(id) {
      if (!filter(id)) {
        return null;
      }
      const meta = await metadata(id);
      const fileUrl = pathToFileURL(id);
      const src = resolvedConfig.isProduction ? fileUrl.pathname.replace(config.srcDir.pathname, "/") : id;
      const output = {
        ...meta,
        src: slash(src)
      };
      return `export default ${JSON.stringify(output)}`;
    }
  };
}

function isHostedService(service) {
  return "getImageSrc" in service;
}
function isSSRService(service) {
  return "transform" in service;
}

function resolveSize(transform) {
  if (transform.width && transform.height) {
    return transform;
  }
  if (!transform.width && !transform.height) {
    throw new Error(`"width" and "height" cannot both be undefined`);
  }
  if (!transform.aspectRatio) {
    throw new Error(
      `"aspectRatio" must be included if only "${transform.width ? "width" : "height"}" is provided`
    );
  }
  let aspectRatio;
  if (typeof transform.aspectRatio === "number") {
    aspectRatio = transform.aspectRatio;
  } else {
    const [width, height] = transform.aspectRatio.split(":");
    aspectRatio = Number.parseInt(width) / Number.parseInt(height);
  }
  if (transform.width) {
    return {
      ...transform,
      width: transform.width,
      height: Math.round(transform.width / aspectRatio)
    };
  } else if (transform.height) {
    return {
      ...transform,
      width: Math.round(transform.height * aspectRatio),
      height: transform.height
    };
  }
  return transform;
}
async function resolveTransform(input) {
  if (typeof input.src === "string") {
    return resolveSize(input);
  }
  const metadata = "then" in input.src ? (await input.src).default : input.src;
  let { width, height, aspectRatio, format = metadata.format, ...rest } = input;
  if (!width && !height) {
    width = metadata.width;
    height = metadata.height;
  } else if (width) {
    let ratio = parseAspectRatio(aspectRatio) || metadata.width / metadata.height;
    height = height || Math.round(width / ratio);
  } else if (height) {
    let ratio = parseAspectRatio(aspectRatio) || metadata.width / metadata.height;
    width = width || Math.round(height * ratio);
  }
  return {
    ...rest,
    src: metadata.src,
    width,
    height,
    aspectRatio,
    format
  };
}
async function getImage(transform) {
  var _a, _b, _c, _d;
  if (!transform.src) {
    throw new Error("[@astrojs/image] `src` is required");
  }
  let loader = (_a = globalThis.astroImage) == null ? void 0 : _a.loader;
  if (!loader) {
    const { default: mod } = await Promise.resolve().then(() => sharp).catch(() => {
      throw new Error(
        "[@astrojs/image] Builtin image loader not found. (Did you remember to add the integration to your Astro config?)"
      );
    });
    loader = mod;
    globalThis.astroImage = globalThis.astroImage || {};
    globalThis.astroImage.loader = loader;
  }
  const resolved = await resolveTransform(transform);
  const attributes = await loader.getImageAttributes(resolved);
  const isDev = (_b = (Object.assign({"BASE_URL":"/","MODE":"production","DEV":false,"PROD":true},{SSR:true,}))) == null ? void 0 : _b.DEV;
  const isLocalImage = !isRemoteImage(resolved.src);
  const _loader = isDev && isLocalImage ? sharp_default : loader;
  if (!_loader) {
    throw new Error("@astrojs/image: loader not found!");
  }
  if (isSSRService(_loader)) {
    const { searchParams } = _loader.serializeTransform(resolved);
    if ((_c = globalThis.astroImage) == null ? void 0 : _c.addStaticImage) {
      globalThis.astroImage.addStaticImage(resolved);
    }
    const src = ((_d = globalThis.astroImage) == null ? void 0 : _d.filenameFormat) ? globalThis.astroImage.filenameFormat(resolved, searchParams) : `${ROUTE_PATTERN}?${searchParams.toString()}`;
    return {
      ...attributes,
      src: slash(src)
    };
  }
  return attributes;
}

async function resolveAspectRatio({ src, aspectRatio }) {
  if (typeof src === "string") {
    return parseAspectRatio(aspectRatio);
  } else {
    const metadata = "then" in src ? (await src).default : src;
    return parseAspectRatio(aspectRatio) || metadata.width / metadata.height;
  }
}
async function resolveFormats({ src, formats }) {
  const unique = new Set(formats);
  if (typeof src === "string") {
    unique.add(extname(src).replace(".", ""));
  } else {
    const metadata = "then" in src ? (await src).default : src;
    unique.add(extname(metadata.src).replace(".", ""));
  }
  return [...unique];
}
async function getPicture(params) {
  const { src, widths } = params;
  if (!src) {
    throw new Error("[@astrojs/image] `src` is required");
  }
  if (!widths || !Array.isArray(widths)) {
    throw new Error("[@astrojs/image] at least one `width` is required");
  }
  const aspectRatio = await resolveAspectRatio(params);
  if (!aspectRatio) {
    throw new Error("`aspectRatio` must be provided for remote images");
  }
  async function getSource(format) {
    const imgs = await Promise.all(
      widths.map(async (width) => {
        const img = await getImage({
          src,
          format,
          width,
          height: Math.round(width / aspectRatio)
        });
        return `${img.src} ${width}w`;
      })
    );
    return {
      type: lookup(format) || format,
      srcset: imgs.join(",")
    };
  }
  const allFormats = await resolveFormats(params);
  const image = await getImage({
    src,
    width: Math.max(...widths),
    aspectRatio,
    format: allFormats[allFormats.length - 1]
  });
  const sources = await Promise.all(allFormats.map((format) => getSource(format)));
  return {
    sources,
    image
  };
}

function integration(options = {}) {
  const resolvedOptions = {
    serviceEntryPoint: "@astrojs/image/sharp",
    ...options
  };
  const staticImages = /* @__PURE__ */ new Map();
  let _config;
  let output;
  function getViteConfiguration() {
    return {
      plugins: [createPlugin(_config, resolvedOptions)],
      optimizeDeps: {
        include: ["image-size", "sharp"]
      },
      ssr: {
        noExternal: ["@astrojs/image", resolvedOptions.serviceEntryPoint]
      }
    };
  }
  return {
    name: PKG_NAME,
    hooks: {
      "astro:config:setup": ({ command, config, injectRoute, updateConfig }) => {
        _config = config;
        output = command === "dev" ? "server" : config.output;
        updateConfig({ vite: getViteConfiguration() });
        if (output === "server") {
          injectRoute({
            pattern: ROUTE_PATTERN,
            entryPoint: command === "dev" ? "@astrojs/image/endpoints/dev" : "@astrojs/image/endpoints/prod"
          });
        }
      },
      "astro:server:setup": async () => {
        globalThis.astroImage = {};
      },
      "astro:build:setup": () => {
        function addStaticImage(transform) {
          const srcTranforms = staticImages.has(transform.src) ? staticImages.get(transform.src) : /* @__PURE__ */ new Map();
          srcTranforms.set(propsToFilename(transform), transform);
          staticImages.set(transform.src, srcTranforms);
        }
        globalThis.astroImage = output === "static" ? {
          addStaticImage,
          filenameFormat
        } : {};
      },
      "astro:build:done": async ({ dir }) => {
        var _a;
        if (output === "server") {
          await ssrBuild({ srcDir: _config.srcDir, outDir: dir });
        } else {
          const loader = (_a = globalThis == null ? void 0 : globalThis.astroImage) == null ? void 0 : _a.loader;
          if (loader && "transform" in loader && staticImages.size > 0) {
            await ssgBuild({ loader, staticImages, srcDir: _config.srcDir, outDir: dir });
          }
        }
      }
    }
  };
}

const $$module1$2 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: integration,
	getImage,
	getPicture,
	isHostedService,
	isSSRService
}, Symbol.toStringTag, { value: 'Module' }));

createMetadata("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/node_modules/@astrojs/image/components/Image.astro", { modules: [{ module: $$module1$2, specifier: "../dist/index.js", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$a = createAstro("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/node_modules/@astrojs/image/components/Image.astro", "https://blackskies.vercel.app/", "file:///C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/");
const $$Image = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$a, $$props, $$slots);
  Astro2.self = $$Image;
  const { loading = "lazy", decoding = "async", ...props } = Astro2.props;
  const attrs = await getImage(props);
  const STYLES = [];
  for (const STYLE of STYLES)
    $$result.styles.add(STYLE);
  return renderTemplate`${maybeRenderHead($$result)}<img${spreadAttributes(attrs, "attrs", { "class": "astro-C563XDD6" })}${addAttribute(loading, "loading")}${addAttribute(decoding, "decoding")}>

`;
});

createMetadata("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/node_modules/@astrojs/image/components/Picture.astro", { modules: [{ module: $$module1$2, specifier: "../dist/index.js", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$9 = createAstro("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/node_modules/@astrojs/image/components/Picture.astro", "https://blackskies.vercel.app/", "file:///C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/");
const $$Picture = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$9, $$props, $$slots);
  Astro2.self = $$Picture;
  const {
    src,
    alt,
    sizes,
    widths,
    aspectRatio,
    formats = ["avif", "webp"],
    loading = "lazy",
    decoding = "async",
    ...attrs
  } = Astro2.props;
  const { image, sources } = await getPicture({ src, widths, formats, aspectRatio });
  const STYLES = [];
  for (const STYLE of STYLES)
    $$result.styles.add(STYLE);
  return renderTemplate`${maybeRenderHead($$result)}<picture${spreadAttributes(attrs, "attrs", { "class": "astro-L4E2UYFH" })}>
	${sources.map((attrs2) => renderTemplate`<source${spreadAttributes(attrs2, "attrs", { "class": "astro-L4E2UYFH" })}${addAttribute(sizes, "sizes")}>`)}
	<img${spreadAttributes(image, "image", { "class": "astro-L4E2UYFH" })}${addAttribute(loading, "loading")}${addAttribute(decoding, "decoding")}${addAttribute(alt, "alt")}>
</picture>

`;
});

const $$module2 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	Image: $$Image,
	Picture: $$Picture
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$8 = createMetadata("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/Aside.astro", { modules: [{ module: $$module1$3, specifier: "../data/author.json", assert: {} }, { module: $$module2, specifier: "@astrojs/image/components", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$8 = createAstro("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/Aside.astro", "https://blackskies.vercel.app/", "file:///C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/");
const $$Aside = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$8, $$props, $$slots);
  Astro2.self = $$Aside;
  const { name, bio, photo, twitter, twitterHandle, linkedin, github, githubHandle } = json.Mark;
  const STYLES = [];
  for (const STYLE of STYLES)
    $$result.styles.add(STYLE);
  return renderTemplate`${maybeRenderHead($$result)}<aside class="card astro-S4IG4HIU">
    <div class="image astro-S4IG4HIU">
        <img${addAttribute(photo, "src")}${addAttribute(120, "width")}${addAttribute(120, "height")} alt="Author Photo"${addAttribute(120, "height")} class="astro-S4IG4HIU">
    </div>

    <div class="text astro-S4IG4HIU">
        <div class="writer astro-S4IG4HIU">
            <h3 class="writerHeader astro-S4IG4HIU">Writer: </h3>
            <span class="astro-S4IG4HIU">${name}</span>
        </div>
        <div class="bio astro-S4IG4HIU">
            <h3 class="bioHeader astro-S4IG4HIU">Bio:</h3>
            <span class="astro-S4IG4HIU">${bio}</span>
        </div>

        <!--Social Icons-->
        <div class="social-icons astro-S4IG4HIU">
            <a${addAttribute(twitter, "href")} aria-label="Authors Twitter" class="astro-S4IG4HIU"><i class="fab fa-twitter astro-S4IG4HIU">${twitterHandle}</i></a>
            <a${addAttribute(linkedin, "href")} aria-label="Authors LinkedIn" class="astro-S4IG4HIU"><i class="fab fa-linkedin astro-S4IG4HIU">${name}</i></a>
            <a${addAttribute(github, "href")} aria-label="Authors Github" class="astro-S4IG4HIU"><i class="fab fa-github astro-S4IG4HIU">${githubHandle}</i></a>
        </div>
    </div>
</aside>`;
});

const $$file$8 = "C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/Aside.astro";
const $$url$8 = undefined;

const $$module1$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$8,
	default: $$Aside,
	file: $$file$8,
	url: $$url$8
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$7 = createMetadata("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/blog/PostPreview.astro", { modules: [], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$7 = createAstro("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/blog/PostPreview.astro", "https://blackskies.vercel.app/", "file:///C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/");
const $$PostPreview$1 = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$7, $$props, $$slots);
  Astro2.self = $$PostPreview$1;
  const { post } = Astro2.props;
  const { title, publishDate, writer, href, description, img, alt, tags } = post.frontmatter;
  const tag = tags.split(",")[0];
  const STYLES = [];
  for (const STYLE of STYLES)
    $$result.styles.add(STYLE);
  return renderTemplate`<!--Article-->${maybeRenderHead($$result)}<div class="details astro-2EXMCJX5">
    <article class="card surface3 astro-2EXMCJX5">
        <div class="coffee astro-2EXMCJX5">
            <img class="center-cropped astro-2EXMCJX5"${addAttribute(post.frontmatter.img, "src")}${addAttribute(alt, "alt")}>
        </div>

        <div class="details astro-2EXMCJX5">
            <a${addAttribute(post.url, "href")} class="astro-2EXMCJX5"><h2 class="brand text3 astro-2EXMCJX5">${title}</h2></a>
            <span class="text astro-2EXMCJX5">${publishDate}  |  ${tag}</span>
            <br class="astro-2EXMCJX5">
            <span class="text astro-2EXMCJX5">${writer}</span>
            <p class="text3 truncate astro-2EXMCJX5">${description}</p>
        </div>
    </article>
</div>

`;
});

const $$file$7 = "C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/blog/PostPreview.astro";
const $$url$7 = undefined;

const $$module5$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$7,
	default: $$PostPreview$1,
	file: $$file$7,
	url: $$url$7
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$6 = createMetadata("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/index.astro", { modules: [{ module: $$module1$5, specifier: "../components/MetaTags.astro", assert: {} }, { module: $$module3$2, specifier: "../components/cursorEffect/Cursor.astro", assert: {} }, { module: $$module2$1, specifier: "../components/Navbar.astro", assert: {} }, { module: $$module1$1, specifier: "../components/Aside.astro", assert: {} }, { module: $$module5$1, specifier: "../components/blog/PostPreview.astro", assert: {} }, { module: $$module6, specifier: "../utils/api.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [{ type: "inline", value: `

` }] });
const $$Astro$6 = createAstro("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/index.astro", "https://blackskies.vercel.app/", "file:///C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/");
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$6, $$props, $$slots);
  Astro2.self = $$Index;
  const { allBlogPosts } = await getBlogPosts();
  const { allPosts } = await getPosts();
  const title = "<BLOG />";
  const description = "Hi! My name is Mark Spratt. I am a software engineer who started a blog!";
  const permalink = "#";
  const STYLES = [];
  for (const STYLE of STYLES)
    $$result.styles.add(STYLE);
  return renderTemplate`<html lang="en" class="astro-QAYP4Q57">
	<head>
		${renderComponent($$result, "Meta", $$MetaTags, { "title": title, "description": description, "permalink": permalink, "class": "astro-QAYP4Q57" })}
	${renderHead($$result)}</head>
	<body id="top" class="page astro-QAYP4Q57" class="surface1">
		${renderComponent($$result, "Cursor", $$Cursor, { "class": "astro-QAYP4Q57" })}
		${renderComponent($$result, "Navbar", $$Navbar, { "class": "astro-QAYP4Q57" })}
		<div class="container astro-QAYP4Q57">
			${renderComponent($$result, "Aside", $$Aside, { "post": allPosts, "class": "astro-QAYP4Q57" })}
			<div class="articlelist astro-QAYP4Q57">${allBlogPosts.map((p) => renderTemplate`${renderComponent($$result, "BlogPostPreview", $$PostPreview$1, { "post": p, "class": "astro-QAYP4Q57" })}`)}</div>
		</div>
	</body>
</html>



`;
});

const $$file$6 = "C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/index.astro";
const $$url$6 = "";

const _page1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$6,
	default: $$Index,
	file: $$file$6,
	url: $$url$6
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$5 = createMetadata("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/bookShelf/PostPreview.astro", { modules: [], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$5 = createAstro("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/bookShelf/PostPreview.astro", "https://blackskies.vercel.app/", "file:///C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/");
const $$PostPreview = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$5, $$props, $$slots);
  Astro2.self = $$PostPreview;
  let { post } = Astro2.props;
  return renderTemplate`${maybeRenderHead($$result)}<article class="post-preview">
	<header>
		<p class="publish-date">${post.frontmatter.publishDate}</p>
		<a${addAttribute(post.url, "href")}><h1 id="title">${post.frontmatter.title}</h1></a>
		<img${addAttribute(post.frontmatter.img, "src")}>
	</header>
	<p>${post.frontmatter.description}</p>
	<a${addAttribute(post.url, "href")}>Read more</a>
</article>`;
});

const $$file$5 = "C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/bookShelf/PostPreview.astro";
const $$url$5 = undefined;

const $$module3 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$5,
	default: $$PostPreview,
	file: $$file$5,
	url: $$url$5
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$4 = createMetadata("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/bookreview.astro", { modules: [{ module: $$module1$5, specifier: "../components/MetaTags.astro", assert: {} }, { module: $$module2$1, specifier: "../components/Navbar.astro", assert: {} }, { module: $$module3, specifier: "../components/bookShelf/PostPreview.astro", assert: {} }, { module: $$module6, specifier: "../utils/api.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$4 = createAstro("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/bookreview.astro", "https://blackskies.vercel.app/", "file:///C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/");
const $$Bookreview = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$4, $$props, $$slots);
  Astro2.self = $$Bookreview;
  const { allBookPosts, mostRecentBookPost } = await getBookPosts();
  await getBlogPosts();
  let title = "<BOOKSHELF />";
  let description = "Looking for something to read next? Consider checking out my book shelf!";
  let permalink = "#";
  const STYLES = [];
  for (const STYLE of STYLES)
    $$result.styles.add(STYLE);
  return renderTemplate`<html lang="en" class="astro-PF6MGG54">
	<head>
		${renderComponent($$result, "Meta", $$MetaTags, { "title": title, "description": description, "permalink": permalink, "class": "astro-PF6MGG54" })}

		
	${renderHead($$result)}</head>

	<body class="astro-PF6MGG54">
		<div class="body astro-PF6MGG54">
			<div class="home_content astro-PF6MGG54">
				${renderComponent($$result, "Navbar", $$Navbar, { "class": "astro-PF6MGG54" })}
				<main class="content astro-PF6MGG54">
					<section class="intro astro-PF6MGG54">
						<h1 class="latest astro-PF6MGG54">${title}</h1>
						<p class="astro-PF6MGG54">"If you're afraid of something then do things in fear."</p>
						<br class="astro-PF6MGG54">
						<p class="astro-PF6MGG54">${description}</p>
					</section>
					<section aria-label="Book post list" class="container astro-PF6MGG54">
						${allBookPosts.map((p) => renderTemplate`${renderComponent($$result, "BookPostPreview", $$PostPreview, { "post": p, "class": "astro-PF6MGG54" })}`)}
					</section>
				</main>
			</div>
		</div>
	</body>
</html>`;
});

const $$file$4 = "C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/bookreview.astro";
const $$url$4 = "/bookreview";

const _page2 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$4,
	default: $$Bookreview,
	file: $$file$4,
	url: $$url$4
}, Symbol.toStringTag, { value: 'Module' }));

function getHeadings$f() {
  return [{
    "depth": 2,
    "slug": "the-concept",
    "text": "The Concept"
  }, {
    "depth": 2,
    "slug": "how-it-works",
    "text": "How it works"
  }];
}
const frontmatter$f = {
  "layout": "../../layouts/BlogPost.astro",
  "title": "Most Recent Post Button... A Start",
  "publishDate": "16 JUL 2022",
  "writer": "John",
  "href": "https://twitter.com/_Hopelezz",
  "description": "A simple button, to navigate to the most recent post. I had a navigation bar but nothing posted to it aside from what I was referring to as Dashboard that took you to the front page and links to my social sites. I wanted to add a bit of complexity and decided on something fairly simple just to get my head around the way Astros framework works.",
  "img": "/assets/images/mailboxes.avif",
  "alt": "mailboxes",
  "tags": "A New Start"
};

const MDXLayout$e = async function ({
  children
}) {
  const Layout = (await import('./chunks/BlogPost.2b0227ad.mjs')).default;
  return createVNode(Layout, {
    content: {
      "title": "Most Recent Post Button... A Start",
      "publishDate": "16 JUL 2022",
      "writer": "John",
      "href": "https://twitter.com/_Hopelezz",
      "description": "A simple button, to navigate to the most recent post. I had a navigation bar but nothing posted to it aside from what I was referring to as Dashboard that took you to the front page and links to my social sites. I wanted to add a bit of complexity and decided on something fairly simple just to get my head around the way Astros framework works.",
      "img": "/assets/images/mailboxes.avif",
      "alt": "mailboxes",
      "tags": "A New Start"
    },
    children: children
  });
};

function _createMdxContent$e(props) {
  const _components = Object.assign({
    h2: "h2",
    p: "p",
    code: "code",
    pre: "pre",
    div: "div",
    span: "span",
    blockquote: "blockquote"
  }, props.components);

  return createVNode(Fragment, {
    children: [createVNode(_components.h2, {
      id: "the-concept",
      children: "The Concept"
    }), "\n", createVNode(_components.p, {
      children: "I had a navigation bar but nothing posted to it aside from what I was referring to as Dashboard that took you to the front page and links to my social sites. I wanted to add a bit of complexity and decided on something fairly simple just to get my head around the way Astros framework works."
    }), "\n", createVNode(_components.h2, {
      id: "how-it-works",
      children: "How it works"
    }), "\n", createVNode(_components.p, {
      children: ["As soon as you press the ", createVNode(_components.code, {
        children: "Most Recent"
      }), " button on the Nav bar it\u2019s linked to the latest posts and published dates of all the posts. This is done by using the ", createVNode(_components.code, {
        children: "publishDate"
      }), " property field in the frontmatter of the ", createVNode(_components.code, {
        children: ".md"
      }), " file. This is a date in the format ", createVNode(_components.code, {
        children: "DD MM YYYY"
      }), "."]
    }), "\n", createVNode(_components.pre, {
      className: "shiki dracula",
      style: {
        backgroundColor: "#282A36",
        color: "#F8F8F2"
      },
      children: createVNode(_components.div, {
        className: "code-container",
        children: createVNode(_components.code, {
          children: [createVNode(_components.div, {
            className: "line",
            children: createVNode(_components.span, {
              style: {
                color: "undefined"
              },
              children: "  layout: ../../layouts/BlogPost.astro"
            })
          }), createVNode(_components.div, {
            className: "line",
            children: createVNode(_components.span, {
              style: {
                color: "undefined"
              },
              children: "  setup: |"
            })
          }), createVNode(_components.div, {
            className: "line",
            children: createVNode(_components.span, {
              style: {
                color: "undefined"
              },
              children: "    import Author from '../../components/Author.astro'"
            })
          }), createVNode(_components.div, {
            className: "line",
            children: createVNode(_components.span, {
              style: {
                color: "undefined"
              },
              children: "  title: Most Recent Post Button... A Start"
            })
          }), createVNode(_components.div, {
            className: "line",
            children: createVNode(_components.span, {
              style: {
                color: "undefined"
              },
              children: "  publishDate: 16 JUL 2022   <-- //This is the date of the post of this post."
            })
          }), createVNode(_components.div, {
            className: "line",
            children: createVNode(_components.span, {
              style: {
                color: "undefined"
              },
              children: "  name: Mark Spratt"
            })
          }), createVNode(_components.div, {
            className: "line",
            children: createVNode(_components.span, {
              style: {
                color: "undefined"
              },
              children: "  href: https://twitter.com/_Hopelezz"
            })
          }), createVNode(_components.div, {
            className: "line",
            children: createVNode(_components.span, {
              style: {
                color: "undefined"
              },
              children: "  description: A simple button, to navigate to the most recent post."
            })
          }), createVNode(_components.div, {
            className: "line",
            children: createVNode(_components.span, {
              style: {
                color: "undefined"
              },
              children: "  tags: framework, astro, react, svelte, vue, solidjs, preact, alpine, lit, vanilla"
            })
          })]
        })
      })
    }), "\n", createVNode(_components.p, {
      children: ["This ", createVNode(_components.code, {
        children: "publishDate"
      }), " field is already used to sort all the posts by date to show the users the most recent post first on the front page. This bit of code was already supplied with the Basic Blog template provided by the Astro community."]
    }), "\n", createVNode(_components.pre, {
      className: "shiki dracula",
      style: {
        backgroundColor: "#282A36",
        color: "#F8F8F2"
      },
      children: [createVNode(_components.div, {
        className: "language-id",
        children: "js"
      }), createVNode(_components.div, {
        className: "code-container",
        children: createVNode(_components.code, {
          children: [createVNode(_components.div, {
            className: "line",
            children: [createVNode(_components.span, {
              style: {
                color: "#F8F8F2"
              },
              children: "  "
            }), createVNode(_components.span, {
              style: {
                color: "#FF79C6"
              },
              children: "let"
            }), createVNode(_components.span, {
              style: {
                color: "#F8F8F2"
              },
              children: " allPosts "
            }), createVNode(_components.span, {
              style: {
                color: "#FF79C6"
              },
              children: "="
            }), createVNode(_components.span, {
              style: {
                color: "#F8F8F2"
              },
              children: " "
            }), createVNode(_components.span, {
              style: {
                color: "#FF79C6"
              },
              children: "await"
            }), createVNode(_components.span, {
              style: {
                color: "#F8F8F2"
              },
              children: " Astro."
            }), createVNode(_components.span, {
              style: {
                color: "#50FA7B"
              },
              children: "glob"
            }), createVNode(_components.span, {
              style: {
                color: "#F8F8F2"
              },
              children: "("
            }), createVNode(_components.span, {
              style: {
                color: "#E9F284"
              },
              children: "'"
            }), createVNode(_components.span, {
              style: {
                color: "#F1FA8C"
              },
              children: "../pages/*.md"
            }), createVNode(_components.span, {
              style: {
                color: "#E9F284"
              },
              children: "'"
            }), createVNode(_components.span, {
              style: {
                color: "#F8F8F2"
              },
              children: ");"
            })]
          }), createVNode(_components.div, {
            className: "line",
            children: [createVNode(_components.span, {
              style: {
                color: "#F8F8F2"
              },
              children: "  "
            }), createVNode(_components.span, {
              style: {
                color: "#6272A4"
              },
              children: "// sorts the blog posts by publishedDate"
            })]
          }), createVNode(_components.div, {
            className: "line",
            children: [createVNode(_components.span, {
              style: {
                color: "#F8F8F2"
              },
              children: "  allPosts "
            }), createVNode(_components.span, {
              style: {
                color: "#FF79C6"
              },
              children: "="
            }), createVNode(_components.span, {
              style: {
                color: "#F8F8F2"
              },
              children: " allPosts."
            }), createVNode(_components.span, {
              style: {
                color: "#50FA7B"
              },
              children: "sort"
            }), createVNode(_components.span, {
              style: {
                color: "#F8F8F2"
              },
              children: "(("
            }), createVNode(_components.span, {
              style: {
                color: "#FFB86C"
              },
              children: "a"
            }), createVNode(_components.span, {
              style: {
                color: "#F8F8F2"
              },
              children: ", "
            }), createVNode(_components.span, {
              style: {
                color: "#FFB86C"
              },
              children: "b"
            }), createVNode(_components.span, {
              style: {
                color: "#F8F8F2"
              },
              children: ") "
            }), createVNode(_components.span, {
              style: {
                color: "#FF79C6"
              },
              children: "=>"
            }), createVNode(_components.span, {
              style: {
                color: "#F8F8F2"
              },
              children: " "
            }), createVNode(_components.span, {
              style: {
                color: "#FF79C6"
              },
              children: "new"
            }), createVNode(_components.span, {
              style: {
                color: "#F8F8F2"
              },
              children: " "
            }), createVNode(_components.span, {
              style: {
                color: "#8BE9FD"
              },
              children: "Date"
            }), createVNode(_components.span, {
              style: {
                color: "#F8F8F2"
              },
              children: "(b.frontmatter.publishDate)."
            }), createVNode(_components.span, {
              style: {
                color: "#50FA7B"
              },
              children: "valueOf"
            }), createVNode(_components.span, {
              style: {
                color: "#F8F8F2"
              },
              children: "() "
            }), createVNode(_components.span, {
              style: {
                color: "#FF79C6"
              },
              children: "-"
            }), createVNode(_components.span, {
              style: {
                color: "#F8F8F2"
              },
              children: " "
            }), createVNode(_components.span, {
              style: {
                color: "#FF79C6"
              },
              children: "new"
            }), createVNode(_components.span, {
              style: {
                color: "#F8F8F2"
              },
              children: " "
            }), createVNode(_components.span, {
              style: {
                color: "#8BE9FD"
              },
              children: "Date"
            }), createVNode(_components.span, {
              style: {
                color: "#F8F8F2"
              },
              children: "(a.frontmatter.publishDate)."
            }), createVNode(_components.span, {
              style: {
                color: "#50FA7B"
              },
              children: "valueOf"
            }), createVNode(_components.span, {
              style: {
                color: "#F8F8F2"
              },
              children: "());"
            })]
          })]
        })
      })]
    }), "\n", createVNode(_components.p, {
      children: "I then use:"
    }), "\n", createVNode(_components.pre, {
      className: "shiki dracula",
      style: {
        backgroundColor: "#282A36",
        color: "#F8F8F2"
      },
      children: [createVNode(_components.div, {
        className: "language-id",
        children: "js"
      }), createVNode(_components.div, {
        className: "code-container",
        children: createVNode(_components.code, {
          children: createVNode(_components.div, {
            className: "line",
            children: [createVNode(_components.span, {
              style: {
                color: "#F8F8F2"
              },
              children: "  "
            }), createVNode(_components.span, {
              style: {
                color: "#FF79C6"
              },
              children: "let"
            }), createVNode(_components.span, {
              style: {
                color: "#F8F8F2"
              },
              children: " mostRecentPost "
            }), createVNode(_components.span, {
              style: {
                color: "#FF79C6"
              },
              children: "="
            }), createVNode(_components.span, {
              style: {
                color: "#F8F8F2"
              },
              children: " allPosts["
            }), createVNode(_components.span, {
              style: {
                color: "#BD93F9"
              },
              children: "0"
            }), createVNode(_components.span, {
              style: {
                color: "#F8F8F2"
              },
              children: "];"
            })]
          })
        })
      })]
    }), "\n", createVNode(_components.p, {
      children: "To get all the information about the most recent post. With this, I can return the URL route to the button."
    }), "\n", createVNode(_components.p, {
      children: ["Now that I have a variable with just a single post object I can pass its URL property to the components ", createVNode(_components.code, {
        children: "href"
      }), " property. This will then link the button to the most recent post."]
    }), "\n", createVNode(_components.pre, {
      className: "shiki dracula",
      style: {
        backgroundColor: "#282A36",
        color: "#F8F8F2"
      },
      children: [createVNode(_components.div, {
        className: "language-id",
        children: "js"
      }), createVNode(_components.div, {
        className: "code-container",
        children: createVNode(_components.code, {
          children: createVNode(_components.div, {
            className: "line",
            children: [createVNode(_components.span, {
              style: {
                color: "#F8F8F2"
              },
              children: "  <"
            }), createVNode(_components.span, {
              style: {
                color: "#8BE9FD"
              },
              children: "LeftSidebar"
            }), createVNode(_components.span, {
              style: {
                color: "#F8F8F2"
              },
              children: " "
            }), createVNode(_components.span, {
              style: {
                color: "#50FA7B"
              },
              children: "mostRecentBlogPost"
            }), createVNode(_components.span, {
              style: {
                color: "#FF79C6"
              },
              children: "={"
            }), createVNode(_components.span, {
              style: {
                color: "#F8F8F2"
              },
              children: "mostRecentBlogPost"
            }), createVNode(_components.span, {
              style: {
                color: "#FF79C6"
              },
              children: "}"
            }), createVNode(_components.span, {
              style: {
                color: "#F8F8F2"
              },
              children: " />"
            })]
          })
        })
      })]
    }), "\n", createVNode(_components.p, {
      children: ["I decided to name the href property ", createVNode(_components.code, {
        children: "mostRecentPost"
      }), " because inside the LeftSidebar component I have an anchor that will read:"]
    }), "\n", createVNode(_components.pre, {
      className: "shiki dracula",
      style: {
        backgroundColor: "#282A36",
        color: "#F8F8F2"
      },
      children: [createVNode(_components.div, {
        className: "language-id",
        children: "html"
      }), createVNode(_components.div, {
        className: "code-container",
        children: createVNode(_components.code, {
          children: createVNode(_components.div, {
            className: "line",
            children: [createVNode(_components.span, {
              style: {
                color: "#F8F8F2"
              },
              children: "  <"
            }), createVNode(_components.span, {
              style: {
                color: "#FF79C6"
              },
              children: "a"
            }), createVNode(_components.span, {
              style: {
                color: "#F8F8F2"
              },
              children: " "
            }), createVNode(_components.span, {
              style: {
                color: "#50FA7B"
              },
              children: "href"
            }), createVNode(_components.span, {
              style: {
                color: "#FF79C6"
              },
              children: "="
            }), createVNode(_components.span, {
              style: {
                color: "#F1FA8C"
              },
              children: "{mostRecentPost.url}"
            }), createVNode(_components.span, {
              style: {
                color: "#F8F8F2"
              },
              children: ">Most Recent Post</"
            }), createVNode(_components.span, {
              style: {
                color: "#FF79C6"
              },
              children: "a"
            }), createVNode(_components.span, {
              style: {
                color: "#F8F8F2"
              },
              children: ">"
            })]
          })
        })
      })]
    }), "\n", createVNode(_components.p, {
      children: "making the href property more concise."
    }), "\n", createVNode(_components.blockquote, {
      children: ["\n", createVNode(_components.p, {
        children: ["Update: I have since modified this by moving the fetch command inside a function of an api.astro file and splitting my blog into blog and book review folders. This is to make it easier to manage the blog and bookreview posts separately. When I need the props for my posts I import the function from the utils file and pass it to the ", createVNode(_components.code, {
          children: "blogPosts"
        }), " object."]
      }), "\n"]
    }), "\n", createVNode(_components.pre, {
      className: "shiki dracula",
      style: {
        backgroundColor: "#282A36",
        color: "#F8F8F2"
      },
      children: [createVNode(_components.div, {
        className: "language-id",
        children: "js"
      }), createVNode(_components.div, {
        className: "code-container",
        children: createVNode(_components.code, {
          children: [createVNode(_components.div, {
            className: "line",
            children: [createVNode(_components.span, {
              style: {
                color: "#F8F8F2"
              },
              children: "  "
            }), createVNode(_components.span, {
              style: {
                color: "#FF79C6"
              },
              children: "import"
            }), createVNode(_components.span, {
              style: {
                color: "#F8F8F2"
              },
              children: " { getBlogPosts } "
            }), createVNode(_components.span, {
              style: {
                color: "#FF79C6"
              },
              children: "from"
            }), createVNode(_components.span, {
              style: {
                color: "#F8F8F2"
              },
              children: " "
            }), createVNode(_components.span, {
              style: {
                color: "#E9F284"
              },
              children: "'"
            }), createVNode(_components.span, {
              style: {
                color: "#F1FA8C"
              },
              children: "../utils/api.astro"
            }), createVNode(_components.span, {
              style: {
                color: "#E9F284"
              },
              children: "'"
            }), createVNode(_components.span, {
              style: {
                color: "#F8F8F2"
              },
              children: ";"
            })]
          }), createVNode(_components.div, {
            className: "line",
            children: [createVNode(_components.span, {
              style: {
                color: "#F8F8F2"
              },
              children: "  "
            }), createVNode(_components.span, {
              style: {
                color: "#FF79C6"
              },
              children: "const"
            }), createVNode(_components.span, {
              style: {
                color: "#F8F8F2"
              },
              children: " blogPosts "
            }), createVNode(_components.span, {
              style: {
                color: "#FF79C6"
              },
              children: "="
            }), createVNode(_components.span, {
              style: {
                color: "#F8F8F2"
              },
              children: " "
            }), createVNode(_components.span, {
              style: {
                color: "#FF79C6"
              },
              children: "await"
            }), createVNode(_components.span, {
              style: {
                color: "#F8F8F2"
              },
              children: " "
            }), createVNode(_components.span, {
              style: {
                color: "#50FA7B"
              },
              children: "getBlogPosts"
            }), createVNode(_components.span, {
              style: {
                color: "#F8F8F2"
              },
              children: "(blogPosts);"
            })]
          })]
        })
      })]
    }), "\n", createVNode(_components.blockquote, {
      children: ["\n", createVNode(_components.p, {
        children: "This has to be in an async function because it is a promise. It also has to be housed inside a .astro file since it\u2019s using Astro props to fetch the post routes."
      }), "\n"]
    })]
  });
}

function MDXContent$e(props = {}) {
  return createVNode(MDXLayout$e, { ...props,
    children: createVNode(_createMdxContent$e, { ...props
    })
  });
}

__astro_tag_component__(getHeadings$f, "astro:jsx");
const url$f = "/blog/4-most-recent-post-button";
const file$f = "C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/blog/4-most-recent-post-button.mdx";

const _page3 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	getHeadings: getHeadings$f,
	frontmatter: frontmatter$f,
	default: MDXContent$e,
	url: url$f,
	file: file$f
}, Symbol.toStringTag, { value: 'Module' }));

function getHeadings$e() {
  return [{
    "depth": 1,
    "slug": "todo-create-post-on-two-factor-authentication-to-go-with-password",
    "text": "TODO: Create Post on Two Factor Authentication to go With Password"
  }, {
    "depth": 2,
    "slug": "content",
    "text": "Content"
  }, {
    "depth": 3,
    "slug": "sub-content",
    "text": "Sub Content"
  }];
}
const frontmatter$e = {
  "layout": "../../layouts/BlogPost.astro",
  "title": "Two Factor Authentication",
  "publishDate": "09 JUL 2022",
  "writer": "Mark",
  "href": "https://twitter.com/_Hopelezz",
  "description": "How does Two Factor Authentication protect your account?",
  "img": "/assets/images/twofactorauth.jpg",
  "alt": "Security",
  "tags": "security"
};

const MDXLayout$d = async function ({
  children
}) {
  const Layout = (await import('./chunks/BlogPost.2b0227ad.mjs')).default;
  return createVNode(Layout, {
    content: {
      "title": "Two Factor Authentication",
      "publishDate": "09 JUL 2022",
      "writer": "Mark",
      "href": "https://twitter.com/_Hopelezz",
      "description": "How does Two Factor Authentication protect your account?",
      "img": "/assets/images/twofactorauth.jpg",
      "alt": "Security",
      "tags": "security"
    },
    children: children
  });
};

function _createMdxContent$d(props) {
  const _components = Object.assign({
    h1: "h1",
    p: "p",
    h2: "h2",
    h3: "h3",
    ul: "ul",
    li: "li"
  }, props.components);

  return createVNode(Fragment, {
    children: [createVNode(_components.h1, {
      id: "todo-create-post-on-two-factor-authentication-to-go-with-password",
      children: "TODO: Create Post on Two Factor Authentication to go With Password"
    }), "\n", createVNode(_components.p, {
      children: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui offic"
    }), "\n", createVNode(_components.h2, {
      id: "content",
      children: "Content"
    }), "\n", createVNode(_components.p, {
      children: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui"
    }), "\n", createVNode(_components.h3, {
      id: "sub-content",
      children: "Sub Content"
    }), "\n", createVNode(_components.p, {
      children: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet,"
    }), "\n", createVNode(_components.p, {
      children: "consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    }), "\n", createVNode(_components.p, {
      children: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui"
    }), "\n", createVNode(_components.p, {
      children: "List:"
    }), "\n", createVNode(_components.ul, {
      children: ["\n", createVNode(_components.li, {
        children: "something,"
      }), "\n", createVNode(_components.li, {
        children: "something,"
      }), "\n", createVNode(_components.li, {
        children: "something"
      }), "\n"]
    })]
  });
}

function MDXContent$d(props = {}) {
  return createVNode(MDXLayout$d, { ...props,
    children: createVNode(_createMdxContent$d, { ...props
    })
  });
}

__astro_tag_component__(getHeadings$e, "astro:jsx");
const url$e = "/blog/2-two-factor-auth";
const file$e = "C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/blog/2-two-factor-auth.mdx";

const _page4 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	getHeadings: getHeadings$e,
	frontmatter: frontmatter$e,
	default: MDXContent$d,
	url: url$e,
	file: file$e
}, Symbol.toStringTag, { value: 'Module' }));

function getHeadings$d() {
  return [{
    "depth": 2,
    "slug": "motivation",
    "text": "Motivation"
  }, {
    "depth": 2,
    "slug": "what-frameworks-does-this-site-use",
    "text": "What Frameworks Does This Site Use?"
  }, {
    "depth": 2,
    "slug": "the-start",
    "text": "The Start"
  }, {
    "depth": 2,
    "slug": "100devs",
    "text": "100Devs"
  }, {
    "depth": 2,
    "slug": "a-new-journey",
    "text": "A New Journey"
  }, {
    "depth": 2,
    "slug": "learn-how-to-learn",
    "text": "Learn How To Learn"
  }, {
    "depth": 1,
    "slug": "things-i-want-to-do",
    "text": "Things I Want To Do:"
  }];
}
const frontmatter$d = {
  "layout": "../../layouts/BlogPost.astro",
  "title": "Part 1 - Starting an Astro Blog",
  "publishDate": "10 JUL 2022",
  "writer": "Mark",
  "href": "https://twitter.com/_Hopelezz",
  "description": "Documenting my journey in creating this website.",
  "img": "/assets/images/Astronaut.avif",
  "alt": "Astronaut",
  "tags": "astro, react, svelte, vue, solidjs, preact, alpine, lit, vanilla, framework"
};

const MDXLayout$c = async function ({
  children
}) {
  const Layout = (await import('./chunks/BlogPost.2b0227ad.mjs')).default;
  return createVNode(Layout, {
    content: {
      "title": "Part 1 - Starting an Astro Blog",
      "publishDate": "10 JUL 2022",
      "writer": "Mark",
      "href": "https://twitter.com/_Hopelezz",
      "description": "Documenting my journey in creating this website.",
      "img": "/assets/images/Astronaut.avif",
      "alt": "Astronaut",
      "tags": "astro, react, svelte, vue, solidjs, preact, alpine, lit, vanilla, framework"
    },
    children: children
  });
};

function _createMdxContent$c(props) {
  const _components = Object.assign({
    h2: "h2",
    p: "p",
    code: "code",
    a: "a",
    em: "em",
    pre: "pre",
    div: "div",
    span: "span",
    ul: "ul",
    li: "li",
    h1: "h1",
    input: "input"
  }, props.components);

  return createVNode(Fragment, {
    children: [createVNode(_components.h2, {
      id: "motivation",
      children: "Motivation"
    }), "\n", createVNode(_components.p, {
      children: ["At the time of writing this I\u2019m 3 month into my ", createVNode(_components.code, {
        children: "Web Development"
      }), " journey. Details of what I\u2019m capable of can be found here in my ", createVNode(_components.a, {
        href: "aboutMe",
        children: "About Me"
      }), ". If that link doesn\u2019t work I\u2019ve either not created the page or a custom 404 Page\u2026 they\u2019re still under construction. See ", createVNode(_components.a, {
        href: "#things-i-want-to-do",
        children: "Things I want to Do"
      }), " for more details."]
    }), "\n", createVNode(_components.p, {
      children: createVNode(_components.em, {
        children: "Not gonna lie, I just learned how to make this link to a different header on the page."
      })
    }), "\n", createVNode(_components.pre, {
      className: "shiki dracula",
      style: {
        backgroundColor: "#282A36",
        color: "#F8F8F2"
      },
      children: [createVNode(_components.div, {
        className: "language-id",
        children: "md"
      }), createVNode(_components.div, {
        className: "code-container",
        children: createVNode(_components.code, {
          children: createVNode(_components.div, {
            className: "line",
            children: [createVNode(_components.span, {
              style: {
                color: "#F8F8F2"
              },
              children: "["
            }), createVNode(_components.span, {
              style: {
                color: "#FF79C6"
              },
              children: "Things I want to Do"
            }), createVNode(_components.span, {
              style: {
                color: "#F8F8F2"
              },
              children: "]("
            }), createVNode(_components.span, {
              style: {
                color: "#8BE9FD"
              },
              children: "#things-i-want-to-do"
            }), createVNode(_components.span, {
              style: {
                color: "#F8F8F2"
              },
              children: ")"
            })]
          })
        })
      })]
    }), "\n", createVNode(_components.p, {
      children: "A description plus in the url part has to have #all-words-in-lower-case with hiphens between each words."
    }), "\n", createVNode(_components.p, {
      children: ["If you are struggling with the idea of ", createVNode(_components.code, {
        children: "How To"
      }), " for something like this I hope I can inspires you with this journey. Admittedly, I\u2019m winging it\u2026enjoying the process. If I break something I try to learn why it broke and how to fix it."]
    }), "\n", createVNode(_components.h2, {
      id: "what-frameworks-does-this-site-use",
      children: "What Frameworks Does This Site Use?"
    }), "\n", createVNode(_components.p, {
      children: "This is Astro & Solidjs at the time of writting this post. However, Astro natively supports every popular framework."
    }), "\n", createVNode(_components.ul, {
      children: ["\n", createVNode(_components.li, {
        children: createVNode(_components.a, {
          href: "https://reactjs.org/",
          children: "React"
        })
      }), "\n", createVNode(_components.li, {
        children: createVNode(_components.a, {
          href: "https://svelte.dev/",
          children: "Svelte"
        })
      }), "\n", createVNode(_components.li, {
        children: createVNode(_components.a, {
          href: "https://vuejs.org/",
          children: "Vue"
        })
      }), "\n", createVNode(_components.li, {
        children: createVNode(_components.a, {
          href: "https://solidjs.com/",
          children: "Solidjs"
        })
      }), "\n", createVNode(_components.li, {
        children: createVNode(_components.a, {
          href: "https://preactjs.com/",
          children: "Preact"
        })
      }), "\n", createVNode(_components.li, {
        children: createVNode(_components.a, {
          href: "https://alpinejs.dev/",
          children: "Alpine"
        })
      }), "\n", createVNode(_components.li, {
        children: createVNode(_components.a, {
          href: "https://lit.dev/",
          children: "Lit"
        })
      }), "\n", createVNode(_components.li, {
        children: createVNode(_components.a, {
          href: "https://www.javascript.com/",
          children: "Vanilla"
        })
      }), "\n"]
    }), "\n", createVNode(_components.p, {
      children: "Meaning, if I wanted to come back later and add anything specific I could with little to no issues!"
    }), "\n", createVNode(_components.p, {
      children: ["This site started out with a basic ", createVNode(_components.a, {
        href: "https://stackblitz.com/github/withastro/astro/tree/latest/examples/blog?file=README.md",
        children: "Blog template"
      }), ". By comparing the two I hope just how drastically this site has changed."]
    }), "\n", createVNode(_components.h2, {
      id: "the-start",
      children: "The Start"
    }), "\n", createVNode(_components.p, {
      children: "At the time of writing this I\u2019m an Electrical Engineer. I love the type of work I do, but I see a figurative wall for growth.\r\nWas listening one day to a Jordan Harbringer podcast on gaining wealth the discussion pertained to the idea of skill stacking. The idea is to take multiple disciplins and combine them to gain a unquie set of skills."
    }), "\n", createVNode(_components.p, {
      children: "I started into Software Development with the idea that I could modify Eplan to boost my personal productivity. Eplan is an electrical CAD. It\u2019s designed to simplify the process for creating electrical schematics. Eplan has the ability to run scripts that uses its Application Programming Interface (API). Knowing this I set out to learn C# the language of Eplan."
    }), "\n", createVNode(_components.p, {
      children: "Half way through my course on C# my lead and coworker quit. Leaving me the last electrical engineer on the team for a multi million dollar company. Taking over the department I had more on my plate than just a few scripts. I had been on the team for a little over a year and had been strugling to use the templates that had been created by my previous team. Just a month prior I had given a presentation for a new development process. Management approved!"
    }), "\n", createVNode(_components.p, {
      children: "Their departure gave me the clean slate to archive all the depricated templates, clean up the parts library, and create bring forward my new templates design scheme. This took roughly 3 months to complete along with the massive workload I had just been given. That sounds like a lot of time, but I had effectively shaved off a weeks worth of time per project, increase accuracy, and readability of the schematics. Half a year later my company finally hired new replacements. I was able to for the most part keep up with the pace of the company."
    }), "\n", createVNode(_components.p, {
      children: "Towards the end of 2020, I was still spending my weekends slowly learning C#. Along the way I had my coworker telling me I should be looking into python. Took the bait to try and learn it. I was hooked! I quickly flew through the Code Academy course. The language felt natural to me. The only downside was that I had no real decernable direction on how to use it in my work."
    }), "\n", createVNode(_components.h2, {
      id: "100devs",
      children: "100Devs"
    }), "\n", createVNode(_components.p, {
      children: "I would from time to time watch this programmer on Twitch called MidnightSimon. One evening he wasn\u2019t on so I went looking for some other streamer to watch. I stumbled onto a streamer who went by LearnWithLeon. He was talking about how to network and market yourself. This seemed to be exactly what I was looking for\u2026 except something seemed off. Leon was teaching Web Development."
    }), "\n", createVNode(_components.h2, {
      id: "a-new-journey",
      children: "A New Journey"
    }), "\n", createVNode(_components.p, {
      children: "Here I am, a newly minted Python programmer watching a course on how to get a job as a FullStack JavaScript Developer. A few classes later I finally caved in and started from class one on his youtube channel."
    }), "\n", createVNode(_components.h2, {
      id: "learn-how-to-learn",
      children: "Learn How To Learn"
    }), "\n", createVNode(_components.p, {
      children: "The first couple of classes were focused on learning how to learn and dealing with mental and physical health. This became pretty relavent when going through the course. Its set at a pretty decent pace, but the workload was heavy. I went into it knowing the basic software logics from my previous courses."
    }), "\n", createVNode(_components.h1, {
      id: "things-i-want-to-do",
      children: "Things I Want To Do:"
    }), "\n", createVNode(_components.ul, {
      className: "contains-task-list",
      children: ["\n", createVNode(_components.li, {
        className: "task-list-item",
        children: [createVNode(_components.input, {
          type: "checkbox",
          disabled: true
        }), " Turn the Logo into an SVG version"]
      }), "\n", createVNode(_components.li, {
        className: "task-list-item",
        children: [createVNode(_components.input, {
          type: "checkbox",
          checked: true,
          disabled: true
        }), " Create a section for Book Reviews\n", createVNode(_components.ul, {
          className: "contains-task-list",
          children: ["\n", createVNode(_components.li, {
            className: "task-list-item",
            children: [createVNode(_components.input, {
              type: "checkbox",
              disabled: true
            }), " Add images to Post Preview."]
          }), "\n"]
        }), "\n"]
      }), "\n", createVNode(_components.li, {
        className: "task-list-item",
        children: [createVNode(_components.input, {
          type: "checkbox",
          disabled: true
        }), " Add a ", createVNode(_components.code, {
          children: "About Me"
        }), " page"]
      }), "\n", createVNode(_components.li, {
        className: "task-list-item",
        children: [createVNode(_components.input, {
          type: "checkbox",
          disabled: true
        }), " Add a ", createVNode(_components.code, {
          children: "Hire Me"
        }), " page"]
      }), "\n", createVNode(_components.li, {
        className: "task-list-item",
        children: [createVNode(_components.input, {
          type: "checkbox",
          disabled: true
        }), " Add a ", createVNode(_components.code, {
          children: "404"
        }), " page"]
      }), "\n", createVNode(_components.li, {
        className: "task-list-item",
        children: [createVNode(_components.input, {
          type: "checkbox",
          disabled: true
        }), " Add a Dark Theme."]
      }), "\n", createVNode(_components.li, {
        className: "task-list-item",
        children: [createVNode(_components.input, {
          type: "checkbox",
          disabled: true
        }), " Searchbar for posts.\n", createVNode(_components.ul, {
          children: ["\n", createVNode(_components.li, {
            children: "Invert the colors and make everything Glow."
          }), "\n"]
        }), "\n"]
      }), "\n", createVNode(_components.li, {
        className: "task-list-item",
        children: [createVNode(_components.input, {
          type: "checkbox",
          checked: true,
          disabled: true
        }), " Fix the ", createVNode(_components.code, {
          children: "Most Recent Posts"
        }), " button on the LeftSideBar"]
      }), "\n", createVNode(_components.li, {
        className: "task-list-item",
        children: [createVNode(_components.input, {
          type: "checkbox",
          disabled: true
        }), " Add a Search Feature to query the posts for keywords"]
      }), "\n", createVNode(_components.li, {
        className: "task-list-item",
        children: [createVNode(_components.input, {
          type: "checkbox",
          disabled: true
        }), " Change the way ", createVNode(_components.code, {
          children: "Lists"
        }), " look"]
      }), "\n", createVNode(_components.li, {
        className: "task-list-item",
        children: [createVNode(_components.input, {
          type: "checkbox",
          disabled: true
        }), " Change the way ", createVNode(_components.code, {
          children: "Check Boxes"
        }), " look"]
      }), "\n", createVNode(_components.li, {
        className: "task-list-item",
        children: [createVNode(_components.input, {
          type: "checkbox",
          disabled: true
        }), " Make the Page More responsive to Mobile."]
      }), "\n", createVNode(_components.li, {
        className: "task-list-item",
        children: [createVNode(_components.input, {
          type: "checkbox",
          disabled: true
        }), " Make the Page More accessible to everyone."]
      }), "\n", createVNode(_components.li, {
        className: "task-list-item",
        children: [createVNode(_components.input, {
          type: "checkbox",
          disabled: true
        }), " Add a RightSideBar that shows the ", createVNode(_components.code, {
          children: "In This Post"
        }), " headers."]
      }), "\n", createVNode(_components.li, {
        className: "task-list-item",
        children: [createVNode(_components.input, {
          type: "checkbox",
          disabled: true
        }), " Create a template for the Astro Framework based on what I\u2019ve learned here"]
      }), "\n"]
    })]
  });
}

function MDXContent$c(props = {}) {
  return createVNode(MDXLayout$c, { ...props,
    children: createVNode(_createMdxContent$c, { ...props
    })
  });
}

__astro_tag_component__(getHeadings$d, "astro:jsx");
const url$d = "/blog/3-starting-astro";
const file$d = "C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/blog/3-starting-astro.mdx";

const _page5 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	getHeadings: getHeadings$d,
	frontmatter: frontmatter$d,
	default: MDXContent$c,
	url: url$d,
	file: file$d
}, Symbol.toStringTag, { value: 'Module' }));

function getHeadings$c() {
  return [{
    "depth": 2,
    "slug": "early-morning",
    "text": "Early Morning\u2026"
  }, {
    "depth": 3,
    "slug": "tldr",
    "text": "TLDR:"
  }, {
    "depth": 3,
    "slug": "long-version",
    "text": "Long version:"
  }, {
    "depth": 2,
    "slug": "story-time",
    "text": "Story time"
  }, {
    "depth": 2,
    "slug": "hashing",
    "text": "Hashing"
  }, {
    "depth": 2,
    "slug": "the-fix",
    "text": "The Fix"
  }, {
    "depth": 2,
    "slug": "suggestion",
    "text": "Suggestion"
  }];
}
const frontmatter$c = {
  "layout": "../../layouts/BlogPost.astro",
  "title": "Password",
  "publishDate": "05 JUL 2022",
  "writer": "Mark",
  "href": "https://twitter.com/_Hopelezz",
  "description": "What is a Password vault?",
  "img": "/assets/images/password.jpg",
  "alt": "Password",
  "tags": "passwords, vault, hash, recall, security"
};

const MDXLayout$b = async function ({
  children
}) {
  const Layout = (await import('./chunks/BlogPost.2b0227ad.mjs')).default;
  return createVNode(Layout, {
    content: {
      "title": "Password",
      "publishDate": "05 JUL 2022",
      "writer": "Mark",
      "href": "https://twitter.com/_Hopelezz",
      "description": "What is a Password vault?",
      "img": "/assets/images/password.jpg",
      "alt": "Password",
      "tags": "passwords, vault, hash, recall, security"
    },
    children: children
  });
};

function _createMdxContent$b(props) {
  const _components = Object.assign({
    h2: "h2",
    p: "p",
    h3: "h3",
    strong: "strong",
    blockquote: "blockquote",
    pre: "pre",
    div: "div",
    code: "code",
    span: "span",
    a: "a",
    em: "em"
  }, props.components);

  return createVNode(Fragment, {
    children: [createVNode("img", {
      src: "https://imgs.xkcd.com/comics/password_strength.png",
      width: "80%",
      alt: "Astro"
    }), "\n", createVNode(_components.h2, {
      id: "early-morning",
      children: "Early Morning\u2026"
    }), "\n", createVNode(_components.p, {
      children: "My mom messaged me one morning asking, \u201CWhat is a  Password vault?\u201D"
    }), "\n", createVNode(_components.h3, {
      id: "tldr",
      children: createVNode(_components.strong, {
        children: "TLDR:"
      })
    }), "\n", createVNode(_components.blockquote, {
      children: ["\n", createVNode(_components.p, {
        children: ["A Password vault is a collection of passwords that you can use to log into a website. ", createVNode("br", {}), " But you came here for something a bit more\u2026 complicated."]
      }), "\n"]
    }), "\n", createVNode(_components.h3, {
      id: "long-version",
      children: createVNode(_components.strong, {
        children: "Long version:"
      })
    }), "\n", createVNode(_components.p, {
      children: "To start off we first need to break down what a password is. According to Webster:"
    }), "\n", createVNode(_components.pre, {
      className: "shiki dracula",
      style: {
        backgroundColor: "#282A36",
        color: "#F8F8F2"
      },
      children: [createVNode(_components.div, {
        className: "language-id",
        children: "markdown"
      }), createVNode(_components.div, {
        className: "code-container",
        children: createVNode(_components.code, {
          children: [createVNode(_components.div, {
            className: "line",
            children: createVNode(_components.span, {
              style: {
                color: "#F8F8F2"
              },
              children: "Definition of password"
            })
          }), createVNode(_components.div, {
            className: "line"
          }), createVNode(_components.div, {
            className: "line",
            children: createVNode(_components.span, {
              style: {
                color: "#F8F8F2"
              },
              children: "1: something that enables one to pass or gain admission:"
            })
          }), createVNode(_components.div, {
            className: "line",
            children: createVNode(_components.span, {
              style: {
                color: "#F8F8F2"
              },
              children: "such as a spoken word or phrase required to pass by a guard"
            })
          })]
        })
      })]
    }), "\n", createVNode(_components.p, {
      children: "Passwords are these things we\u2019re all plagued with within this new age of tech. Having to remember every unique password can be a pain. Yet, using one of them for all your accounts isn\u2019t recommended. What\u2019s the fix?"
    }), "\n", createVNode(_components.p, {
      children: ["We know currently, that passwords aren\u2019t supposed to be simple. Oh, and they should contain numbers, symbols, and letters. ", createVNode(_components.code, {
        children: "but why?"
      }), " I hear you say. Hold on, let\u2019s rewind a bit. Like everything, there\u2019s a history to it, right? Well, passwords, don\u2019t have a definitive date. Some speculate it was MIT  when they created the first time-sharing system."]
    }), "\n", createVNode(_components.h2, {
      id: "story-time",
      children: "Story time"
    }), "\n", createVNode(_components.p, {
      children: ["Emerging onto the stage a wizard performing magic goes by the name of Robert Morris. To set the stage there is a realm called Unix, an operating system that was first developed in the 1960s. Morris conjured a process known as ", createVNode(_components.code, {
        children: "Hashing"
      }), ". Not the same thing used for getting stoned; although they may have been at the time. His son later created the ", createVNode(_components.a, {
        href: "https://wikipedia.org/wiki/Morris_worm",
        children: "Morris Worm"
      }), " on November 2, 1988, with the hashing concept. This infected large groups of systems. Its intended use was to see the size of the internet by exploiting loopholes in the codebase of machines. Doesn\u2019t sound like a bad idea, but it didn\u2019t work quite as expected\u2026 leading to the first felony conviction of its kind."]
    }), "\n", createVNode(_components.p, {
      children: ["Skipping a few years we get to the serious concerns for Password\u2026 theft. Such as Email accounts, MSN messengers, Geocities, Myspace, Blogger, Xanga, AIM, Yahoo, Hotmail, AOL\u2026 Remembers these? These all came with the advent of the internet created by Al Gore\u2026 Whoa\u2026 ", createVNode(_components.em, {
        children: "looks at script"
      }), ", wait one sec checking sources. Never mind, he horribly misquoted. Sources believe XEROX stumbled upon the concept of the internet without knowing what size it would become. So we have the internet and passwords are being encrypted by hashes\u2026"]
    }), "\n", createVNode(_components.h2, {
      id: "hashing",
      children: "Hashing"
    }), "\n", createVNode(_components.p, {
      children: "What even are hashes? Don\u2019t freak out\u2026Breath. You\u2019re about to see a long string of letters and numbers. This is intentional! You don\u2019t have to memorize this or even read it. Just know it\u2019s a random string of characters."
    }), "\n", createVNode(_components.blockquote, {
      children: ["\n", createVNode(_components.p, {
        children: ["Word 1: ", createVNode("br", {}), "\r\nhash(\u201Chello\u201D) = 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"]
      }), "\n"]
    }), "\n", createVNode(_components.blockquote, {
      children: ["\n", createVNode(_components.p, {
        children: ["Word 2: ", createVNode("br", {}), "\r\nhash(\u201Chbllo\u201D) = 58756879c05c68dfac9866712fad6a93f8146f337a69afe7dd238f3364946366"]
      }), "\n"]
    }), "\n", createVNode(_components.p, {
      children: ["You probably went \u201Cwait\u2026 if someone else uses the same password then they have the encryption code too.\u201D CORRECT! They were until companies banded together and started a process called ", createVNode(_components.code, {
        children: "SALT"
      }), ". By adding a header (like multiplying it or double encrypting it) to the password it varies the hash like so:"]
    }), "\n", createVNode(_components.blockquote, {
      children: ["\n", createVNode(_components.p, {
        children: "Remember this?\r\nhash(\u201Chello\u201D) = 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"
      }), "\n"]
    }), "\n", createVNode(_components.p, {
      children: "Let\u2019s sprinkle it with SALT. The SALT is a random string of letters and numbers added to the word"
    }), "\n", createVNode(_components.blockquote, {
      children: ["\n", createVNode(_components.p, {
        children: "Hash example 1:\r\nhash(\u201Chello\u201D + \u201CQxLUF1bgIAdeQX\u201D) = 9e209040c863f84a31e719795b2577523954739fe5ed3b58a75cff2127075ed1"
      }), "\n"]
    }), "\n", createVNode("br", {}), "\n", createVNode(_components.blockquote, {
      children: ["\n", createVNode(_components.p, {
        children: "Hash example 2:\r\n(\u201Chello\u201D + \u201Cbv5PehSMfV11Cd\u201D) = d1d3ec2e6f20fd420d50e2642992841d8338a314b8ea157c9e18477aaef226ab"
      }), "\n"]
    }), "\n", createVNode(_components.p, {
      children: ["This prevented hackers from using banks of passwords like ", createVNode(_components.a, {
        href: "https://en.wikipedia.org/wiki/Dictionary_attack",
        children: "dictionary attacks"
      }), ", which use lookup tables\u2026 ", createVNode(_components.em, {
        children: "Those perverts"
      }), "!"]
    }), "\n", createVNode(_components.p, {
      children: ["There have since been many other alternatives to the hashing system. For example: Password-Based Key Derivation Function 1 and 2 or ", createVNode(_components.a, {
        href: "https://en.wikipedia.org/wiki/PBKDF2",
        children: "PBKDF2"
      }), " for short."]
    }), "\n", createVNode(_components.blockquote, {
      children: ["\n", createVNode(_components.p, {
        children: "Wiki: PBKDF2 applies a pseudorandom function, such as hash-based message authentication code (HMAC), to the input password or passphrase along with a salt value and repeats the process many times to produce a derived key, which can then be used as a cryptographic key in subsequent operations."
      }), "\n"]
    }), "\n", createVNode(_components.p, {
      children: "In short, the SALT is repeated many times to create a key."
    }), "\n", createVNode(_components.h2, {
      id: "the-fix",
      children: "The Fix"
    }), "\n", createVNode(_components.p, {
      children: "We have a lot of passwords, but we don\u2019t want to recall all them. On top of that each should be unique. In comes the advent of Password Managers a.k.a. vaults."
    }), "\n", createVNode(_components.p, {
      children: "The majority of vaults encrypt passwords along with other information such as Credit Cards, addresses, and so on. Some even generate strong passwords for you to use and recalls them so you don\u2019t have to remember what they were. Assuming you are on the same device or have linked your device to the vault."
    }), "\n", createVNode(_components.p, {
      children: ["\u201CBut this still doesn\u2019t tell me what app to use!?!\u201D ", createVNode(_components.em, {
        children: "I hear you mom"
      })]
    }), "\n", createVNode(_components.p, {
      children: "There is a lot to choose from, but these are the ones used the most."
    }), "\n", createVNode(_components.p, {
      children: "Truth is if you\u2019ve been using Google Chrome for any period of time you\u2019re most likely already using one. Google Password Manager is a website password manage. This feature is baked into the Google Chrome web browser. Includes generated unique, secure passwords for each website you visit as well as. check if any of the passwords you\u2019re using online have been compromised in a data security breach."
    }), "\n", createVNode(_components.p, {
      children: "LastPass is a cloud-based manager. Allowing you to access your passwords regardless of the device you\u2019re on."
    }), "\n", createVNode(_components.p, {
      children: "KeePass is a locally stored manager. Meaning you need the device you\u2019re on to log into the account."
    }), "\n", createVNode(_components.p, {
      children: "Some apps has the ability refence Google, Facebook, Twitter, etc accounts. To help reduce the total number passwords."
    }), "\n", createVNode(_components.h2, {
      id: "suggestion",
      children: "Suggestion"
    }), "\n", createVNode(_components.p, {
      children: "Recall the comic strip in the beginning?"
    }), "\n", createVNode(_components.p, {
      children: "This one:"
    }), "\n", createVNode("img", {
      src: "https://imgs.xkcd.com/comics/password_strength.png",
      width: "80%",
      alt: "Astro"
    }), "\n", createVNode(_components.p, {
      children: ["It memes on the idea that ", createVNode(_components.code, {
        children: "Tr0ub4dor&3"
      }), " is far harder to recall than ", createVNode(_components.code, {
        children: "correcthorsebatterystaple"
      }), ". This is true!"]
    }), "\n", createVNode(_components.p, {
      children: [createVNode(_components.code, {
        children: "1MillionBabyParrots!"
      }), " is still a viable password, readable, and provides a higher level of security than something like ", createVNode(_components.code, {
        children: "Tr0ub4dor&3"
      }), "."]
    })]
  });
}

function MDXContent$b(props = {}) {
  return createVNode(MDXLayout$b, { ...props,
    children: createVNode(_createMdxContent$b, { ...props
    })
  });
}

__astro_tag_component__(getHeadings$c, "astro:jsx");
const url$c = "/blog/1-password";
const file$c = "C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/blog/1-password.mdx";

const _page6 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	getHeadings: getHeadings$c,
	frontmatter: frontmatter$c,
	default: MDXContent$b,
	url: url$c,
	file: file$c
}, Symbol.toStringTag, { value: 'Module' }));

function getHeadings$b() {
  return [{
    "depth": 1,
    "slug": "rating--310",
    "text": "Rating : 3/10"
  }, {
    "depth": 3,
    "slug": "politics-dystopic-world-view-communist",
    "text": "Politics, Dystopic, World View, Communist"
  }, {
    "depth": 2,
    "slug": "the-book",
    "text": "The Book"
  }];
}
const frontmatter$b = {
  "layout": "../../layouts/BookPost.astro",
  "title": "Communist Manifesto",
  "author": "Karl Marx",
  "year": 1848,
  "publishDate": "18 JUL 2022",
  "writer": "Mark",
  "href": "https://twitter.com/_Hopelezz",
  "description": "It formed the basis for the modern communist movement as we know it, arguing that capitalism would inevitably self-destruct, to be replaced by socialism and ultimately communism.",
  "img": "https://images-na.ssl-images-amazon.com/images/I/51vHCno0a4L._SX330_BO1,204,203,200_.jpg",
  "tags": "Politics, Dystopic, World View, Communist,"
};

const MDXLayout$a = async function ({
  children
}) {
  const Layout = (await Promise.resolve().then(() => BookPost)).default;
  return createVNode(Layout, {
    content: {
      "title": "Communist Manifesto",
      "author": "Karl Marx",
      "year": 1848,
      "publishDate": "18 JUL 2022",
      "writer": "Mark",
      "href": "https://twitter.com/_Hopelezz",
      "description": "It formed the basis for the modern communist movement as we know it, arguing that capitalism would inevitably self-destruct, to be replaced by socialism and ultimately communism.",
      "img": "https://images-na.ssl-images-amazon.com/images/I/51vHCno0a4L._SX330_BO1,204,203,200_.jpg",
      "tags": "Politics, Dystopic, World View, Communist,"
    },
    children: children
  });
};

function _createMdxContent$a(props) {
  const _components = Object.assign({
    h1: "h1",
    h3: "h3",
    em: "em",
    blockquote: "blockquote",
    p: "p",
    strong: "strong",
    h2: "h2"
  }, props.components);

  return createVNode(Fragment, {
    children: [createVNode(_components.h1, {
      id: "rating--310",
      children: "Rating : 3/10"
    }), "\n", createVNode(_components.h3, {
      id: "politics-dystopic-world-view-communist",
      children: createVNode(_components.em, {
        children: "Politics, Dystopic, World View, Communist"
      })
    }), "\n", createVNode(_components.blockquote, {
      children: ["\n", createVNode(_components.p, {
        children: [createVNode(_components.strong, {
          children: "Disclaimer:"
        }), " If you are going to judge something you should at least understand the intent. I doubt Marx or Engels had any ill intent upon the creation of this Manifesto. I do, however, believe they were wholly ignorant to the true nature of the thing in which they were creating."]
      }), "\n", createVNode("br", {}), "\n", createVNode(_components.p, {
        children: "Another thing is the stigma that surrounds certain political pieces. Almost as if one were to touch them you\u2019d be tainted."
      }), "\n", createVNode("br", {}), "\n", createVNode(_components.p, {
        children: "I once read an introduction to Mein Kampf by Abraham Foxman that said:\r\n\u201CWe preserve Mein Kampf in this spirit of remembering; we study it in the hope of securing a brighter future for humanity.\u201D"
      }), "\n"]
    }), "\n", createVNode(_components.p, {
      children: "I came to this book out of sheer interest for Dystopics and those interests started with a book called \u201CBrave New World\u201D back in my late teens. Since then I have admired, probably out of grotesque interests, the concepts hidden within these stories. Due to this personal intrigue I have since read several pieces on the origin of the topic dating back to Utopia by Sir Thomas More. I say all this because I believe the very essence of Communism is one of utopic vision."
    }), "\n", createVNode(_components.h2, {
      id: "the-book",
      children: "The Book"
    }), "\n", createVNode(_components.p, {
      children: "The Marx aims to explain the beliefs of the Communist party and its League. The first thing the reader is addressed with is a history of class struggles."
    }), "\n", createVNode(_components.p, {
      children: "I was discussing this with my friend after having read the book. He said:"
    }), "\n", createVNode(_components.blockquote, {
      children: ["\n", createVNode(_components.p, {
        children: "\u201CCommunism is a concept that isn\u2019t inherant in humans, one that has to be forced.\u201D"
      }), "\n"]
    })]
  });
}

function MDXContent$a(props = {}) {
  return createVNode(MDXLayout$a, { ...props,
    children: createVNode(_createMdxContent$a, { ...props
    })
  });
}

__astro_tag_component__(getHeadings$b, "astro:jsx");
const url$b = "/book/11-communist-manifesto";
const file$b = "C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/book/11-communist-manifesto.mdx";

const _page7 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	getHeadings: getHeadings$b,
	frontmatter: frontmatter$b,
	default: MDXContent$a,
	url: url$b,
	file: file$b
}, Symbol.toStringTag, { value: 'Module' }));

function getHeadings$a() {
  return [{
    "depth": 1,
    "slug": "rating-910",
    "text": "Rating: 9/10"
  }, {
    "depth": 3,
    "slug": "american-science-fiction-military-fiction",
    "text": "American Science Fiction, Military Fiction"
  }];
}
const frontmatter$a = {
  "layout": "../../layouts/BookPost.astro",
  "title": "Slaughterhouse-Five",
  "author": "Kurt Vonnegut",
  "year": 1969,
  "publishDate": "01 OCT 2017",
  "writer": "Mark",
  "href": "https://twitter.com/_Hopelezz",
  "description": "A 1969 semi-autobiographic science fiction-infused anti-war novel by Kurt Vonnegut.",
  "img": "https://covers.openlibrary.org/b/id/7890961-L.jpg",
  "tags": "American science fiction, the bombing of Dresden, military fiction, war stories, World War II, World War, 1939-1945, literature and the war, war, free will and determinism, literary fiction, Fiction, Animals, Boats and boating, Juvenile fiction, Domestic animals, American fiction (fictional works by one author), Large type books, Fiction, General, Fiction, war & military, World war, 1939-1945, fiction, Classic Literature, Drama, Accessible book, Protected DAISY, library, Vonnegut, Kurt, 1922-2007, American literature, history and criticism, Destruction and pillage, Literature, American literature"
};

const MDXLayout$9 = async function ({
  children
}) {
  const Layout = (await Promise.resolve().then(() => BookPost)).default;
  return createVNode(Layout, {
    content: {
      "title": "Slaughterhouse-Five",
      "author": "Kurt Vonnegut",
      "year": 1969,
      "publishDate": "01 OCT 2017",
      "writer": "Mark",
      "href": "https://twitter.com/_Hopelezz",
      "description": "A 1969 semi-autobiographic science fiction-infused anti-war novel by Kurt Vonnegut.",
      "img": "https://covers.openlibrary.org/b/id/7890961-L.jpg",
      "tags": "American science fiction, the bombing of Dresden, military fiction, war stories, World War II, World War, 1939-1945, literature and the war, war, free will and determinism, literary fiction, Fiction, Animals, Boats and boating, Juvenile fiction, Domestic animals, American fiction (fictional works by one author), Large type books, Fiction, General, Fiction, war & military, World war, 1939-1945, fiction, Classic Literature, Drama, Accessible book, Protected DAISY, library, Vonnegut, Kurt, 1922-2007, American literature, history and criticism, Destruction and pillage, Literature, American literature"
    },
    children: children
  });
};

function _createMdxContent$9(props) {
  const _components = Object.assign({
    h1: "h1",
    h3: "h3",
    em: "em",
    p: "p",
    blockquote: "blockquote"
  }, props.components);

  return createVNode(Fragment, {
    children: [createVNode(_components.h1, {
      id: "rating-910",
      children: "Rating: 9/10"
    }), "\n", createVNode(_components.h3, {
      id: "american-science-fiction-military-fiction",
      children: createVNode(_components.em, {
        children: "American Science Fiction, Military Fiction"
      })
    }), "\n", createVNode(_components.p, {
      children: "I felt that the ending was abrupt and just fell off, but that\u2019s not the selling point of the story! I loved the wit and subtle humor that\u2019s sprinkled throughout the book."
    }), "\n", createVNode(_components.blockquote, {
      children: ["\n", createVNode(_components.p, {
        children: "\u201C\u2026and the Russians came and arrested everybody except for the two horses\u201D"
      }), "\n"]
    }), "\n", createVNode(_components.blockquote, {
      children: ["\n", createVNode(_components.p, {
        children: "\u201CThis could be useful for Rocketry\u201D"
      }), "\n"]
    }), "\n", createVNode(_components.p, {
      children: "So many fun nuggets of humor\u2026 but it\u2019s bittersweet when the next moment Vonnegut\u2019s talking about the real and serious harm that has been inflicted in our history. The grey undertone of the story and the mental illness in which his protagonist is wracked with. Where he\u2019s the sole survivor of a plane crash and everyone he meets ends up dead. The telling of subtle people throughout the book in which Vonnegut describes"
    }), "\n", createVNode(_components.blockquote, {
      children: ["\n", createVNode(_components.p, {
        children: "\u201C\u2026and then they just\u2026die\u2026So It Goes\u201D"
      }), "\n"]
    }), "\n", createVNode(_components.p, {
      children: "Vonnegut uses humor in a gentle way to present a very real and grim history. The part that has my spine tingling the most is the fact Vonnegut, a prisoner of WWII, survived the bombing of Dresden in the meat locker of a slaughterhouse."
    })]
  });
}

function MDXContent$9(props = {}) {
  return createVNode(MDXLayout$9, { ...props,
    children: createVNode(_createMdxContent$9, { ...props
    })
  });
}

__astro_tag_component__(getHeadings$a, "astro:jsx");
const url$a = "/book/1-Slaughterhouse-Five";
const file$a = "C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/book/1-Slaughterhouse-Five.mdx";

const _page8 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	getHeadings: getHeadings$a,
	frontmatter: frontmatter$a,
	default: MDXContent$9,
	url: url$a,
	file: file$a
}, Symbol.toStringTag, { value: 'Module' }));

function getHeadings$9() {
  return [{
    "depth": 1,
    "slug": "rating--910",
    "text": "Rating : 9/10"
  }, {
    "depth": 3,
    "slug": "classic-fiction-dystopian-adventure",
    "text": "Classic, Fiction, Dystopian, Adventure"
  }];
}
const frontmatter$9 = {
  "layout": "../../layouts/BookPost.astro",
  "title": "Lord of the Flies",
  "author": "William Golding",
  "year": 1954,
  "publishDate": "8 OCT 2017",
  "writer": "Mark",
  "href": "https://twitter.com/_Hopelezz",
  "description": "A group of young boys who find themselves alone on a deserted island. They develop rules and a system of organization, but without any adults to serve as a civilizing impulse, the children eventually become violent and brutal.",
  "img": "https://covers.openlibrary.org/b/id/12723924-L.jpg",
  "tags": "Sci-fi, Comedy, Charming, Is-A-Movie"
};

const MDXLayout$8 = async function ({
  children
}) {
  const Layout = (await Promise.resolve().then(() => BookPost)).default;
  return createVNode(Layout, {
    content: {
      "title": "Lord of the Flies",
      "author": "William Golding",
      "year": 1954,
      "publishDate": "8 OCT 2017",
      "writer": "Mark",
      "href": "https://twitter.com/_Hopelezz",
      "description": "A group of young boys who find themselves alone on a deserted island. They develop rules and a system of organization, but without any adults to serve as a civilizing impulse, the children eventually become violent and brutal.",
      "img": "https://covers.openlibrary.org/b/id/12723924-L.jpg",
      "tags": "Sci-fi, Comedy, Charming, Is-A-Movie"
    },
    children: children
  });
};

function _createMdxContent$8(props) {
  const _components = Object.assign({
    h1: "h1",
    h3: "h3",
    em: "em",
    p: "p",
    blockquote: "blockquote"
  }, props.components);

  return createVNode(Fragment, {
    children: [createVNode(_components.h1, {
      id: "rating--910",
      children: "Rating : 9/10"
    }), "\n", createVNode(_components.h3, {
      id: "classic-fiction-dystopian-adventure",
      children: createVNode(_components.em, {
        children: "Classic, Fiction, Dystopian, Adventure"
      })
    }), "\n", createVNode(_components.p, {
      children: "At the onset of the cold war, a plane full of schoolboys gets shot down over an uninhabited island where only the children survive. Doesn\u2019t take long before the whimsical and imaginative boys start creating a hierarchy amongst themselves."
    }), "\n", createVNode(_components.blockquote, {
      children: ["\n", createVNode(_components.p, {
        children: "\u201CHe who holds the Conch shell has the authority to speak!\u201D"
      }), "\n"]
    }), "\n", createVNode(_components.p, {
      children: "So is the law of the tribe. Shortly thereafter, a system for life was set in motion. Children created a fire, started a camp, and with plenty of fruit to eat; life was good. It doesn\u2019t take long before all hell breaks loose amongst the children and their baser instincts start to take hold."
    }), "\n", createVNode(_components.blockquote, {
      children: ["\n", createVNode(_components.p, {
        children: "\u201CMaybe there is a beast\u2026 Maybe it\u2019s only us.\u201D"
      }), "\n"]
    }), "\n", createVNode(_components.p, {
      children: "Golding\u2019s writing conveys blood lust, panic, and chaos unlike any author I\u2019ve read. The story starts off slow, but with each new chapter a climax that builds off the last; a crescendo up until the last chapter when the wave of emotions crash down and all is set right again. William Golding was awarded a Nobel Prize for this masterpiece of literature in 1983 and deserves every ounce of praise for his novel."
    })]
  });
}

function MDXContent$8(props = {}) {
  return createVNode(MDXLayout$8, { ...props,
    children: createVNode(_createMdxContent$8, { ...props
    })
  });
}

__astro_tag_component__(getHeadings$9, "astro:jsx");
const url$9 = "/book/5-lord-of-the-flies";
const file$9 = "C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/book/5-lord-of-the-flies.mdx";

const _page9 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	getHeadings: getHeadings$9,
	frontmatter: frontmatter$9,
	default: MDXContent$8,
	url: url$9,
	file: file$9
}, Symbol.toStringTag, { value: 'Module' }));

function getHeadings$8() {
  return [{
    "depth": 1,
    "slug": "rating--710",
    "text": "Rating : 7/10"
  }, {
    "depth": 3,
    "slug": "melancholy-fiction-dystopic",
    "text": "Melancholy, Fiction, Dystopic"
  }];
}
const frontmatter$8 = {
  "layout": "../../layouts/BookPost.astro",
  "title": "Never Let Me Go",
  "author": "Kazuo Ishiguro",
  "publishDate": "20 APR 2020",
  "writer": "Mark",
  "href": "https://twitter.com/_Hopelezz",
  "description": "The lives of three friends, from their early school days into young adulthood, when the reality of the world they live in comes knocking.",
  "img": "https://covers.openlibrary.org/b/id/6425427-L.jpg",
  "tags": "dystopic, Melancholy, Fiction, Organ donors, Cloning, Donation of organs, tissues, Women, Literature, New York Times bestseller, Human cloning, Science fiction, psychological, science fiction, general, England, School, children, Reminiscing, Friendship, English literature"
};

const MDXLayout$7 = async function ({
  children
}) {
  const Layout = (await Promise.resolve().then(() => BookPost)).default;
  return createVNode(Layout, {
    content: {
      "title": "Never Let Me Go",
      "author": "Kazuo Ishiguro",
      "publishDate": "20 APR 2020",
      "writer": "Mark",
      "href": "https://twitter.com/_Hopelezz",
      "description": "The lives of three friends, from their early school days into young adulthood, when the reality of the world they live in comes knocking.",
      "img": "https://covers.openlibrary.org/b/id/6425427-L.jpg",
      "tags": "dystopic, Melancholy, Fiction, Organ donors, Cloning, Donation of organs, tissues, Women, Literature, New York Times bestseller, Human cloning, Science fiction, psychological, science fiction, general, England, School, children, Reminiscing, Friendship, English literature"
    },
    children: children
  });
};

function _createMdxContent$7(props) {
  const _components = Object.assign({
    h1: "h1",
    h3: "h3",
    em: "em",
    p: "p",
    blockquote: "blockquote"
  }, props.components);

  return createVNode(Fragment, {
    children: [createVNode(_components.h1, {
      id: "rating--710",
      children: "Rating : 7/10"
    }), "\n", createVNode(_components.h3, {
      id: "melancholy-fiction-dystopic",
      children: createVNode(_components.em, {
        children: "Melancholy, Fiction, Dystopic"
      })
    }), "\n", createVNode(_components.p, {
      children: "I went into this novel with expectations but was left with a sense of loss but in that good kind of way.\r\nNever Let Me Go, is a novel of a woman telling her story; similar to an autobiography."
    }), "\n", createVNode(_components.p, {
      children: "The book starts off:"
    }), "\n", createVNode(_components.blockquote, {
      children: ["\n", createVNode(_components.p, {
        children: "\u201CThere have been times over the years when I\u2019ve tried to leave Hailsham behind when I\u2019ve told myself I shouldn\u2019t look back so much. But then there came a point when I just stopped resisting. It had to do with this particular donor I had once, in my third year as a carer; it was his reaction when I mentioned I was from Hailsham.\u201D"
      }), "\n"]
    }), "\n", createVNode(_components.p, {
      children: "Centered around a school called Hailsham for children similar to that of an orphanage with a tinge of a concentration camp. The school is removed from society, in fact, society wants as little to do with them. The school is a place where children are taught to be responsible and to be kind to each other. Trained in litterature and art."
    }), "\n", createVNode(_components.p, {
      children: "In this retelling of Kathy\u2019s life, you get a sense of gloom and anxiety that pervades these children\u2019s lives even unbeknownst to them."
    })]
  });
}

function MDXContent$7(props = {}) {
  return createVNode(MDXLayout$7, { ...props,
    children: createVNode(_createMdxContent$7, { ...props
    })
  });
}

__astro_tag_component__(getHeadings$8, "astro:jsx");
const url$8 = "/book/10-never-let-me-go";
const file$8 = "C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/book/10-never-let-me-go.mdx";

const _page10 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	getHeadings: getHeadings$8,
	frontmatter: frontmatter$8,
	default: MDXContent$7,
	url: url$8,
	file: file$8
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$3 = createMetadata("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/bookShelf/Post.astro", { modules: [{ module: $$module1$1, specifier: "../Aside.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$3 = createAstro("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/bookShelf/Post.astro", "https://blackskies.vercel.app/", "file:///C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/");
const $$Post = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$3, $$props, $$slots);
  Astro2.self = $$Post;
  const { title, author, writer, publishDate, alt, img, tags } = Astro2.props;
  const STYLES = [];
  for (const STYLE of STYLES)
    $$result.styles.add(STYLE);
  return renderTemplate`${maybeRenderHead($$result)}<div class="page-container astro-J3M5FWUU">
	${renderComponent($$result, "Aside", $$Aside, { "writter": writer, "class": "astro-J3M5FWUU" })}
	<article class="article astro-J3M5FWUU">
		<div class="astro-J3M5FWUU">
			<div class="coffee astro-J3M5FWUU">
				<img class="center-cropped astro-J3M5FWUU"${addAttribute(img, "src")}${addAttribute(alt, "alt")} height="100%">
			</div>
			<div class="details astro-J3M5FWUU">
				<h1 class="astro-J3M5FWUU">${title}</h1>
				<p class="astro-J3M5FWUU">${writer}</p>
				<span class="astro-J3M5FWUU">${publishDate}  |  ${tags}</span>
			</div>
			</div>
		<main class="astro-J3M5FWUU">
			${renderSlot($$result, $$slots["default"])}
		</main>
	</article>
</div>


`;
});

const $$file$3 = "C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/bookShelf/Post.astro";
const $$url$3 = undefined;

const $$module4 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$3,
	default: $$Post,
	file: $$file$3,
	url: $$url$3
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$2 = createMetadata("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/footer/Social.astro", { modules: [], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$2 = createAstro("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/footer/Social.astro", "https://blackskies.vercel.app/", "file:///C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/");
const $$Social = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$Social;
  const STYLES = [];
  for (const STYLE of STYLES)
    $$result.styles.add(STYLE);
  return renderTemplate`${maybeRenderHead($$result)}<div class="icons astro-YO5YSBEC">
    <a href="https://twitter.com/_Hopelezz" class="ml-4 astro-YO5YSBEC" aria-label="Twitter" rel="noopener">
      <svg class="h-6 w-6 hover:text-hot-pink astro-YO5YSBEC" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs" viewBox="0 0 16 16" width="16" height="16">
        <g transform="matrix(0.6666666666666666,0,0,0.6666666666666666,0,0)" class="astro-YO5YSBEC">
          <path d="M23.32,6.44c0.212-0.177,0.241-0.492,0.065-0.704c-0.068-0.082-0.161-0.14-0.265-0.166l-0.79-0.2 c-0.268-0.067-0.431-0.339-0.364-0.606C21.974,4.731,21.986,4.7,22,4.67l0.44-0.89c0.12-0.249,0.015-0.548-0.233-0.668 C22.099,3.06,21.976,3.049,21.86,3.08l-2,0.56c-0.151,0.044-0.314,0.014-0.44-0.08c-0.865-0.649-1.918-1-3-1c-2.761,0-5,2.239-5,5 l0,0v0.36c0.001,0.127-0.094,0.235-0.22,0.25C8.39,8.5,5.7,7.07,2.8,3.73c-0.128-0.142-0.325-0.2-0.51-0.15 C2.124,3.656,2.013,3.817,2,4C1.599,5.645,1.761,7.377,2.46,8.92c0.062,0.123,0.013,0.274-0.11,0.336 C2.303,9.279,2.251,9.288,2.2,9.28L1.08,9.06C0.807,9.016,0.551,9.202,0.507,9.474C0.498,9.533,0.499,9.592,0.51,9.65 c0.175,1.555,1.047,2.945,2.37,3.78c0.124,0.06,0.176,0.21,0.116,0.334c-0.025,0.051-0.065,0.092-0.116,0.116l-0.53,0.21 c-0.256,0.103-0.381,0.394-0.278,0.65c0.005,0.014,0.011,0.027,0.018,0.04c0.595,1.302,1.791,2.229,3.2,2.48 c0.13,0.047,0.197,0.191,0.15,0.32c-0.025,0.07-0.08,0.124-0.15,0.15C3.93,18.292,2.471,18.575,1,18.56 c-0.276-0.055-0.545,0.124-0.6,0.4s0.124,0.545,0.4,0.6l0,0c2.548,1.208,5.321,1.866,8.14,1.93c2.479,0.038,4.915-0.658,7-2 c3.484-2.326,5.571-6.241,5.56-10.43V8.19c0.001-0.147,0.067-0.286,0.18-0.38L23.32,6.44z" stroke="none" fill="currentColor" stroke-width="0" stroke-linecap="round" stroke-linejoin="round" class="astro-YO5YSBEC"></path>
        </g>
      </svg>
    </a>
    <a href="https://www.youtube.com/user/panzerlink" class="ml-4 astro-YO5YSBEC" aria-label="YouTube" rel="noopener">
      <svg class="h-6 w-6 hover:text-hot-pink astro-YO5YSBEC" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs" viewBox="0 0 16 16" width="16" height="16">
        <g transform="matrix(0.6666666666666666,0,0,0.6666666666666666,0,0)" class="astro-YO5YSBEC">
          <path d="M20.06,3.5H3.94C1.764,3.5,0,5.264,0,7.44v9.12c0,2.176,1.764,3.94,3.94,3.94c0,0,0,0,0,0h16.12 c2.176,0,3.94-1.764,3.94-3.94l0,0V7.44C24,5.264,22.236,3.5,20.06,3.5L20.06,3.5z M16.54,12l-6.77,4.36 c-0.232,0.149-0.542,0.082-0.691-0.151C9.028,16.129,9,16.035,9,15.94V7.28c0-0.276,0.225-0.5,0.501-0.499 c0.095,0,0.189,0.028,0.269,0.079l6.77,4.33c0.232,0.15,0.299,0.459,0.149,0.691c-0.038,0.06-0.089,0.11-0.149,0.149V12z" stroke="none" fill="currentColor" stroke-width="0" stroke-linecap="round" stroke-linejoin="round" class="astro-YO5YSBEC"></path>
        </g>
      </svg>
    </a>
    <a href="https://github.com/Hopelezz" class="ml-4 astro-YO5YSBEC" aria-label="Github" rel="noopener">
      <svg class="h-6 w-6 hover:text-hot-pink astro-YO5YSBEC" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs" viewBox="0 0 16 16" width="16" height="16">&gt;<g transform="matrix(0.6666666666666666,0,0,0.6666666666666666,0,0)" class="astro-YO5YSBEC">
          <path d="M12,0.28C5.373,0.278-0.002,5.649-0.004,12.276c-0.002,5.197,3.342,9.804,8.284,11.414h0.29 c0.551,0.034,1.026-0.385,1.06-0.936c0.003-0.041,0.003-0.083,0-0.124v-0.21c0-0.17,0-0.4,0-1.09c-0.02-0.132-0.092-0.251-0.2-0.33 c-0.118-0.095-0.272-0.132-0.42-0.1c-2.68,0.58-3.25-1.1-3.29-1.21C5.384,18.801,4.784,18.037,4,17.5 c-0.047-0.041-0.097-0.077-0.15-0.11c0.116-0.063,0.249-0.087,0.38-0.07c0.511,0.071,0.948,0.405,1.15,0.88 c0.804,1.4,2.572,1.913,4,1.16c0.15-0.065,0.258-0.2,0.29-0.36c0.038-0.463,0.236-0.897,0.56-1.23 c0.206-0.183,0.225-0.499,0.042-0.706c-0.081-0.091-0.191-0.149-0.312-0.164c-2.37-0.27-4.79-1.1-4.79-5.19 c-0.02-1.027,0.356-2.023,1.05-2.78C6.351,8.786,6.386,8.579,6.31,8.4C6.032,7.624,6.036,6.774,6.32,6 c0.924,0.164,1.791,0.559,2.52,1.15c0.122,0.086,0.277,0.112,0.42,0.07c0.893-0.242,1.814-0.367,2.74-0.37 c0.929,0.001,1.854,0.125,2.75,0.37c0.14,0.039,0.291,0.013,0.41-0.07c0.73-0.589,1.597-0.984,2.52-1.15 c0.272,0.77,0.272,1.61,0,2.38c-0.076,0.179-0.041,0.386,0.09,0.53c0.687,0.75,1.062,1.733,1.05,2.75c0,4.09-2.43,4.91-4.81,5.18 c-0.275,0.029-0.474,0.274-0.446,0.549c0.013,0.129,0.076,0.248,0.176,0.331c0.448,0.463,0.671,1.099,0.61,1.74v3.18 c-0.01,0.317,0.122,0.621,0.36,0.83c0.303,0.227,0.696,0.298,1.06,0.19c6.285-2.103,9.676-8.902,7.573-15.187 C21.71,3.592,17.147,0.296,12,0.28z" stroke="none" fill="currentColor" stroke-width="0" stroke-linecap="round" stroke-linejoin="round" class="astro-YO5YSBEC"></path>
        </g></svg>
    </a>
    <a href="#" class="ml-4 astro-YO5YSBEC" aria-label="Email" rel="noopener">
      <svg class="h-6 w-6 astro-YO5YSBEC" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs" viewBox="0 0 16 16" width="16" height="16">&gt;<g transform="matrix(0.6666666666666666,0,0,0.6666666666666666,0,0)" class="astro-YO5YSBEC">
          <path d="M 2.25,4.5h19.5c0.828,0,1.5,0.672,1.5,1.5v12c0,0.828-0.672,1.5-1.5,1.5H2.25c-0.828,0-1.5-0.672-1.5-1.5V6 C0.75,5.172,1.422,4.5,2.25,4.5z " stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="astro-YO5YSBEC"></path>
          <path d="M 15.687,9.975L19.5,13.5 " stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="astro-YO5YSBEC"></path>
          <path d="M 8.313,9.975L4.5,13.5 " stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="astro-YO5YSBEC"></path>
          <path d="M 22.88,5.014l-9.513,6.56 c-0.823,0.568-1.911,0.568-2.734,0L1.12,5.014" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="astro-YO5YSBEC"></path>
        </g></svg>
    </a>
  </div>`;
});

const $$file$2 = "C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/footer/Social.astro";
const $$url$2 = undefined;

const $$module1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$2,
	default: $$Social,
	file: $$file$2,
	url: $$url$2
}, Symbol.toStringTag, { value: 'Module' }));

var __freeze$1 = Object.freeze;
var __defProp$1 = Object.defineProperty;
var __template$1 = (cooked, raw) => __freeze$1(__defProp$1(cooked, "raw", { value: __freeze$1(raw || cooked.slice()) }));
var _a$1;
const $$metadata$1 = createMetadata("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/footer/Footer.astro", { modules: [{ module: $$module1, specifier: "./Social.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [{ type: "external", src: "https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/plugins/autoloader/prism-autoloader.min.js" }, { type: "external", src: "https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/plugins/copy-to-clipboard/prism-copy-to-clipboard.min.js" }, { type: "external", src: "https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/plugins/toolbar/prism-toolbar.min.js" }, { type: "external", src: "https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/prism.min.js" }] });
const $$Astro$1 = createAstro("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/footer/Footer.astro", "https://blackskies.vercel.app/", "file:///C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/");
const $$Footer = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$Footer;
  const STYLES = [];
  for (const STYLE of STYLES)
    $$result.styles.add(STYLE);
  return renderTemplate(_a$1 || (_a$1 = __template$1(["", '<footer class="center astro-3MDEZAKO">\n  <div class="text-sm astro-3MDEZAKO" data-test="footer-text">&copy;<script type="text/javascript"> document.write(new Date().getFullYear()); <\/script> &lt;BLACKSKIES &#47;&gt;</div>\n  ', "\n</footer>\n\n<!-- Prism JS -->\n\n\n\n"])), maybeRenderHead($$result), renderComponent($$result, "Social", $$Social, { "class": "astro-3MDEZAKO" }));
});

const $$file$1 = "C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/footer/Footer.astro";
const $$url$1 = undefined;

const $$module5 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$1,
	default: $$Footer,
	file: $$file$1,
	url: $$url$1
}, Symbol.toStringTag, { value: 'Module' }));

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const $$metadata = createMetadata("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/layouts/BookPost.astro", { modules: [{ module: $$module1$5, specifier: "../components/MetaTags.astro", assert: {} }, { module: $$module2$1, specifier: "../components/Navbar.astro", assert: {} }, { module: $$module3$2, specifier: "../components/cursorEffect/Cursor.astro", assert: {} }, { module: $$module4, specifier: "../components/bookShelf/Post.astro", assert: {} }, { module: $$module5, specifier: "../components/footer/Footer.astro", assert: {} }, { module: $$module6, specifier: "../utils/api.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro = createAstro("/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/layouts/BookPost.astro", "https://blackskies.vercel.app/", "file:///C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/");
const $$BookPost = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$BookPost;
  await getBlogPosts();
  await getBookPosts();
  const { content } = Astro2.props;
  const { title, description, publishDate, author, heroImage, permalink, alt, img } = content;
  const STYLES = [];
  for (const STYLE of STYLES)
    $$result.styles.add(STYLE);
  return renderTemplate(_a || (_a = __template(["<html", ' class="astro-4AZ5JQEQ">\n	<head>\n\n		', '\n		<script src="https://kit.fontawesome.com/e2fcf864fc.js" crossorigin="anonymous"><\/script>\n	', '</head>\n\n		<body class="astro-4AZ5JQEQ">\n			', '\n			<div class="body astro-4AZ5JQEQ">\n\n\n				<main class="home_content astro-4AZ5JQEQ">\n\n					', '\n\n					<div class="wrapper astro-4AZ5JQEQ">\n\n						', "\n\n					</div>\n				</main>\n			</div>\n		", "\n	\n</body></html>"])), addAttribute(content.lang || "en", "lang"), renderComponent($$result, "Meta", $$MetaTags, { "title": title, "description": description, "permalink": permalink, "class": "astro-4AZ5JQEQ" }), renderHead($$result), renderComponent($$result, "Cursor", $$Cursor, { "class": "astro-4AZ5JQEQ" }), renderComponent($$result, "Navbar", $$Navbar, { "class": "astro-4AZ5JQEQ" }), renderComponent($$result, "BookPost", $$Post, { "title": title, "author": author, "publishDate": publishDate, "heroImage": heroImage, "alt": alt, "img": img, "class": "astro-4AZ5JQEQ" }, { "default": () => renderTemplate`${renderSlot($$result, $$slots["default"])}` }), renderComponent($$result, "Footer", $$Footer, { "class": "astro-4AZ5JQEQ" }));
});

const $$file = "C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/layouts/BookPost.astro";
const $$url = undefined;

const BookPost = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata,
	default: $$BookPost,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const html = "<h1 id=\"rating--910\">Rating : 9/10</h1>\n<h3 id=\"cyberpunk-scifi-action-adventure-dystopic-puzzles-virtual-reality-future-fiction\"><em>Cyberpunk, SciFi, Action, Adventure, Dystopic, Puzzles, Virtual Reality, Future, Fiction</em></h3>\n<p>I was hooked from the moment I started the book. Barely putting it down!</p>\n<blockquote>\n<p>“Going outside is highly overrated”</p>\n</blockquote>\n<p>Ready Player One is set in a depraved world of the future, where people are desperate to ‘escape’ reality. Set in the future 2044, a boy named Wade Watts grows up learning everything he knows through a game called OASIS. OASIS is a Virtual Reality (VR) immersion platform free for anyone. OASIS is jammed packed with every literature, movie, game, song, ever created. All you have to do is access it. While the world is crumbling around them in despair at least everyone has the OASIS to forget their troubles. Wade in reality and virtually has no money to his name. Both mother and father died when he was younger and is in the custody of his aunt who treats him miserably. His aunt lives in the stacks which are futuristic trailer parks. (Trailers are stacked on top of one another held together by scaffolding and prayers.) Wade grows up forced to survive on his one for the most part, but thankfully there’s OASIS. The creator of OASIS known in the game as Anorak. When the creator died, he gave the world of OASIS a VR treasure hunt that will set you back in your seats for a page-turning warp speed of a ride.\r\nOne of the reviews called it a Willy Wonka Meets the Matrix. Possibly the most app description to describe the book. The book is brimming with 80’s nostalgia! While I’m more of a 90’s kid I grew up with a lot of the pop references mentioned in RPO. It covers all the basis Movies, Books, Music, TV Shows, Games along with some other pop references to the 80’s.\r\nJust to give you an idea.</p>\n<h5 id=\"movies\">Movies:</h5>\n<ul>\n<li>Montey Python</li>\n<li>Blade Runner</li>\n<li>Ghost Busters</li>\n<li>Back to the Future</li>\n<li>Ferris Buller’s Day Off</li>\n<li>Weird Science</li>\n<li>WarGames</li>\n<li>Pretty in Pink</li>\n<li>Breakfast Club</li>\n</ul>\n<h5 id=\"books-all-amazing-authors\">Books: (All Amazing Authors!)</h5>\n<ul>\n<li>Vonnegut</li>\n<li>Orson Scott Card</li>\n<li>Stephen King</li>\n<li>Terry Pratchett</li>\n<li>J.R.R. Tolkien</li>\n<li>Douglas Adams</li>\n</ul>\n<h5 id=\"music\">Music:</h5>\n<ul>\n<li>SchoolHouse Rock</li>\n<li>Pat Benatar</li>\n<li>They Might Be Giants</li>\n<li>Rush</li>\n</ul>\n<h5 id=\"tv-shows\">TV Shows:</h5>\n<ul>\n<li>A-Team</li>\n<li>Twilight Zone</li>\n<li>Gundam</li>\n<li>Spider-Man</li>\n<li>Ultraman</li>\n<li>Cowboy Bebop</li>\n<li>Kikaida</li>\n<li>Voltron</li>\n<li>Max Headroom</li>\n<li>Family Ties</li>\n<li>Star Trek</li>\n<li>Dr.Who</li>\n<li>The Cosmos</li>\n</ul>\n<h5 id=\"games\">GAMES:</h5>\n<ul>\n<li>PacMan</li>\n<li>Dig Dug</li>\n<li>Joust</li>\n<li>Black Tiger</li>\n<li>Adventure</li>\n<li>and many others</li>\n</ul>\n<blockquote>\n<p>“As Terrifying and painful as reality can be, it’s also the only place where you can find true happiness.”</p>\n</blockquote>";

				const frontmatter$7 = {"layout":"../../layouts/BookPost.astro","setup":"import Author from '../../components/Author.astro'\n","title":"Ready Player One by Ernest Cline","publishDate":"02 OCT 2017","href":"https://twitter.com/_Hopelezz","name":"Mark Spratt","description":"The story, set in a dystopia in 2045, follows protagonist Wade Watts on his search for an Easter egg in a worldwide virtual reality game","img":"https://covers.openlibrary.org/b/id/8750149-L.jpg","tags":"cyberpunk, science fiction, action, adventure, dystopian, Puzzles, Virtual reality, Future, Fiction, science fiction, action & adventure, dystopic"};
				const file$7 = "C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/book/2-ready-player-one.md";
				const url$7 = "/book/2-ready-player-one";
				function rawContent() {
					return "\r\n# Rating : 9/10\r\n\r\n### _Cyberpunk, SciFi, Action, Adventure, Dystopic, Puzzles, Virtual Reality, Future, Fiction_\r\n\r\n\r\nI was hooked from the moment I started the book. Barely putting it down!\r\n\r\n>\"Going outside is highly overrated\"\r\n\r\nReady Player One is set in a depraved world of the future, where people are desperate to 'escape' reality. Set in the future 2044, a boy named Wade Watts grows up learning everything he knows through a game called OASIS. OASIS is a Virtual Reality (VR) immersion platform free for anyone. OASIS is jammed packed with every literature, movie, game, song, ever created. All you have to do is access it. While the world is crumbling around them in despair at least everyone has the OASIS to forget their troubles. Wade in reality and virtually has no money to his name. Both mother and father died when he was younger and is in the custody of his aunt who treats him miserably. His aunt lives in the stacks which are futuristic trailer parks. (Trailers are stacked on top of one another held together by scaffolding and prayers.) Wade grows up forced to survive on his one for the most part, but thankfully there's OASIS. The creator of OASIS known in the game as Anorak. When the creator died, he gave the world of OASIS a VR treasure hunt that will set you back in your seats for a page-turning warp speed of a ride.\r\nOne of the reviews called it a Willy Wonka Meets the Matrix. Possibly the most app description to describe the book. The book is brimming with 80's nostalgia! While I'm more of a 90's kid I grew up with a lot of the pop references mentioned in RPO. It covers all the basis Movies, Books, Music, TV Shows, Games along with some other pop references to the 80's.\r\nJust to give you an idea.\r\n\r\n##### Movies: \r\n\r\n- Montey Python\r\n- Blade Runner\r\n- Ghost Busters\r\n- Back to the Future\r\n- Ferris Buller's Day Off\r\n- Weird Science\r\n- WarGames\r\n- Pretty in Pink\r\n- Breakfast Club\r\n\r\n##### Books: (All Amazing Authors!)\r\n- Vonnegut\r\n- Orson Scott Card\r\n- Stephen King\r\n- Terry Pratchett\r\n- J.R.R. Tolkien\r\n- Douglas Adams\r\n\r\n##### Music: \r\n\r\n- SchoolHouse Rock\r\n- Pat Benatar\r\n- They Might Be Giants\r\n- Rush\r\n\r\n##### TV Shows: \r\n- A-Team\r\n- Twilight Zone\r\n- Gundam\r\n- Spider-Man\r\n- Ultraman\r\n- Cowboy Bebop\r\n- Kikaida\r\n- Voltron\r\n- Max Headroom\r\n- Family Ties\r\n- Star Trek\r\n- Dr.Who\r\n- The Cosmos\r\n##### GAMES:\r\n- PacMan\r\n- Dig Dug\r\n- Joust\r\n- Black Tiger\r\n- Adventure\r\n- and many others\r\n\r\n>\"As Terrifying and painful as reality can be, it's also the only place where you can find true happiness.\"";
				}
				function compiledContent() {
					return html;
				}
				function getHeadings$7() {
					return [{"depth":1,"slug":"rating--910","text":"Rating : 9/10"},{"depth":3,"slug":"cyberpunk-scifi-action-adventure-dystopic-puzzles-virtual-reality-future-fiction","text":"Cyberpunk, SciFi, Action, Adventure, Dystopic, Puzzles, Virtual Reality, Future, Fiction"},{"depth":5,"slug":"movies","text":"Movies:"},{"depth":5,"slug":"books-all-amazing-authors","text":"Books: (All Amazing Authors!)"},{"depth":5,"slug":"music","text":"Music:"},{"depth":5,"slug":"tv-shows","text":"TV Shows:"},{"depth":5,"slug":"games","text":"GAMES:"}];
				}
				function getHeaders() {
					console.warn('getHeaders() have been deprecated. Use getHeadings() function instead.');
					return getHeadings$7();
				}				async function Content() {
					const { layout, ...content } = frontmatter$7;
					content.file = file$7;
					content.url = url$7;
					content.astro = {};
					Object.defineProperty(content.astro, 'headings', {
						get() {
							throw new Error('The "astro" property is no longer supported! To access "headings" from your layout, try using "Astro.props.headings."')
						}
					});
					Object.defineProperty(content.astro, 'html', {
						get() {
							throw new Error('The "astro" property is no longer supported! To access "html" from your layout, try using "Astro.props.compiledContent()."')
						}
					});
					Object.defineProperty(content.astro, 'source', {
						get() {
							throw new Error('The "astro" property is no longer supported! To access "source" from your layout, try using "Astro.props.rawContent()."')
						}
					});
					const contentFragment = createVNode(Fragment, { 'set:html': html });
					return createVNode($$BookPost, {
									content,
									frontmatter: content,
									headings: getHeadings$7(),
									rawContent,
									compiledContent,
									'server:root': true,
									children: contentFragment
								});
				}

const _page11 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	frontmatter: frontmatter$7,
	file: file$7,
	url: url$7,
	rawContent,
	compiledContent,
	getHeadings: getHeadings$7,
	getHeaders,
	Content,
	default: Content
}, Symbol.toStringTag, { value: 'Module' }));

function getHeadings$6() {
  return [{
    "depth": 1,
    "slug": "rating--910",
    "text": "Rating : 9/10"
  }, {
    "depth": 3,
    "slug": "cyberpunk-scifi-action-adventure-dystopic-puzzles-virtual-reality-future-fiction",
    "text": "Cyberpunk, SciFi, Action, Adventure, Dystopic, Puzzles, Virtual Reality, Future, Fiction"
  }, {
    "depth": 5,
    "slug": "movies",
    "text": "Movies:"
  }, {
    "depth": 5,
    "slug": "books-all-amazing-authors",
    "text": "Books: (All Amazing Authors!)"
  }, {
    "depth": 5,
    "slug": "music",
    "text": "Music:"
  }, {
    "depth": 5,
    "slug": "tv-shows",
    "text": "TV Shows:"
  }, {
    "depth": 5,
    "slug": "games",
    "text": "GAMES:"
  }];
}
const frontmatter$6 = {
  "layout": "../../layouts/BookPost.astro",
  "title": "Ready Player One",
  "author": "Ernest Cline",
  "year": 2016,
  "publishDate": "02 OCT 2017",
  "writer": "Mark",
  "href": "https://twitter.com/_Hopelezz",
  "description": "The story, set in a dystopia in 2045, follows protagonist Wade Watts on his search for an Easter egg in a worldwide virtual reality game",
  "img": "https://covers.openlibrary.org/b/id/8750149-L.jpg",
  "tags": "cyberpunk, science fiction, action, adventure, dystopian, Puzzles, Virtual reality, Future, Fiction, science fiction, action & adventure, dystopic"
};

const MDXLayout$6 = async function ({
  children
}) {
  const Layout = (await Promise.resolve().then(() => BookPost)).default;
  return createVNode(Layout, {
    content: {
      "title": "Ready Player One",
      "author": "Ernest Cline",
      "year": 2016,
      "publishDate": "02 OCT 2017",
      "writer": "Mark",
      "href": "https://twitter.com/_Hopelezz",
      "description": "The story, set in a dystopia in 2045, follows protagonist Wade Watts on his search for an Easter egg in a worldwide virtual reality game",
      "img": "https://covers.openlibrary.org/b/id/8750149-L.jpg",
      "tags": "cyberpunk, science fiction, action, adventure, dystopian, Puzzles, Virtual reality, Future, Fiction, science fiction, action & adventure, dystopic"
    },
    children: children
  });
};

function _createMdxContent$6(props) {
  const _components = Object.assign({
    h1: "h1",
    h3: "h3",
    em: "em",
    p: "p",
    blockquote: "blockquote",
    h5: "h5",
    ul: "ul",
    li: "li"
  }, props.components);

  return createVNode(Fragment, {
    children: [createVNode(_components.h1, {
      id: "rating--910",
      children: "Rating : 9/10"
    }), "\n", createVNode(_components.h3, {
      id: "cyberpunk-scifi-action-adventure-dystopic-puzzles-virtual-reality-future-fiction",
      children: createVNode(_components.em, {
        children: "Cyberpunk, SciFi, Action, Adventure, Dystopic, Puzzles, Virtual Reality, Future, Fiction"
      })
    }), "\n", createVNode(_components.p, {
      children: "I was hooked from the moment I started the book. Barely putting it down!"
    }), "\n", createVNode(_components.blockquote, {
      children: ["\n", createVNode(_components.p, {
        children: "\u201CGoing outside is highly overrated\u201D"
      }), "\n"]
    }), "\n", createVNode(_components.p, {
      children: "Ready Player One is set in a depraved world of the future, where people are desperate to \u2018escape\u2019 reality. Set in the future 2044, a boy named Wade Watts grows up learning everything he knows through a game called OASIS. OASIS is a Virtual Reality (VR) immersion platform free for anyone. OASIS is jammed packed with every literature, movie, game, song, ever created. All you have to do is access it. While the world is crumbling around them in despair at least everyone has the OASIS to forget their troubles. Wade in reality and virtually has no money to his name. Both mother and father died when he was younger and is in the custody of his aunt who treats him miserably. His aunt lives in the stacks which are futuristic trailer parks. (Trailers are stacked on top of one another held together by scaffolding and prayers.) Wade grows up forced to survive on his one for the most part, but thankfully there\u2019s OASIS. The creator of OASIS known in the game as Anorak. When the creator died, he gave the world of OASIS a VR treasure hunt that will set you back in your seats for a page-turning warp speed of a ride.\r\nOne of the reviews called it a Willy Wonka Meets the Matrix. Possibly the most app description to describe the book. The book is brimming with 80\u2019s nostalgia! While I\u2019m more of a 90\u2019s kid I grew up with a lot of the pop references mentioned in RPO. It covers all the basis Movies, Books, Music, TV Shows, Games along with some other pop references to the 80\u2019s.\r\nJust to give you an idea."
    }), "\n", createVNode(_components.h5, {
      id: "movies",
      children: "Movies:"
    }), "\n", createVNode(_components.ul, {
      children: ["\n", createVNode(_components.li, {
        children: "Montey Python"
      }), "\n", createVNode(_components.li, {
        children: "Blade Runner"
      }), "\n", createVNode(_components.li, {
        children: "Ghost Busters"
      }), "\n", createVNode(_components.li, {
        children: "Back to the Future"
      }), "\n", createVNode(_components.li, {
        children: "Ferris Buller\u2019s Day Off"
      }), "\n", createVNode(_components.li, {
        children: "Weird Science"
      }), "\n", createVNode(_components.li, {
        children: "WarGames"
      }), "\n", createVNode(_components.li, {
        children: "Pretty in Pink"
      }), "\n", createVNode(_components.li, {
        children: "Breakfast Club"
      }), "\n"]
    }), "\n", createVNode(_components.h5, {
      id: "books-all-amazing-authors",
      children: "Books: (All Amazing Authors!)"
    }), "\n", createVNode(_components.ul, {
      children: ["\n", createVNode(_components.li, {
        children: "Vonnegut"
      }), "\n", createVNode(_components.li, {
        children: "Orson Scott Card"
      }), "\n", createVNode(_components.li, {
        children: "Stephen King"
      }), "\n", createVNode(_components.li, {
        children: "Terry Pratchett"
      }), "\n", createVNode(_components.li, {
        children: "J.R.R. Tolkien"
      }), "\n", createVNode(_components.li, {
        children: "Douglas Adams"
      }), "\n"]
    }), "\n", createVNode(_components.h5, {
      id: "music",
      children: "Music:"
    }), "\n", createVNode(_components.ul, {
      children: ["\n", createVNode(_components.li, {
        children: "SchoolHouse Rock"
      }), "\n", createVNode(_components.li, {
        children: "Pat Benatar"
      }), "\n", createVNode(_components.li, {
        children: "They Might Be Giants"
      }), "\n", createVNode(_components.li, {
        children: "Rush"
      }), "\n"]
    }), "\n", createVNode(_components.h5, {
      id: "tv-shows",
      children: "TV Shows:"
    }), "\n", createVNode(_components.ul, {
      children: ["\n", createVNode(_components.li, {
        children: "A-Team"
      }), "\n", createVNode(_components.li, {
        children: "Twilight Zone"
      }), "\n", createVNode(_components.li, {
        children: "Gundam"
      }), "\n", createVNode(_components.li, {
        children: "Spider-Man"
      }), "\n", createVNode(_components.li, {
        children: "Ultraman"
      }), "\n", createVNode(_components.li, {
        children: "Cowboy Bebop"
      }), "\n", createVNode(_components.li, {
        children: "Kikaida"
      }), "\n", createVNode(_components.li, {
        children: "Voltron"
      }), "\n", createVNode(_components.li, {
        children: "Max Headroom"
      }), "\n", createVNode(_components.li, {
        children: "Family Ties"
      }), "\n", createVNode(_components.li, {
        children: "Star Trek"
      }), "\n", createVNode(_components.li, {
        children: "Dr.Who"
      }), "\n", createVNode(_components.li, {
        children: "The Cosmos"
      }), "\n"]
    }), "\n", createVNode(_components.h5, {
      id: "games",
      children: "GAMES:"
    }), "\n", createVNode(_components.ul, {
      children: ["\n", createVNode(_components.li, {
        children: "PacMan"
      }), "\n", createVNode(_components.li, {
        children: "Dig Dug"
      }), "\n", createVNode(_components.li, {
        children: "Joust"
      }), "\n", createVNode(_components.li, {
        children: "Black Tiger"
      }), "\n", createVNode(_components.li, {
        children: "Adventure"
      }), "\n", createVNode(_components.li, {
        children: "and many others"
      }), "\n"]
    }), "\n", createVNode(_components.blockquote, {
      children: ["\n", createVNode(_components.p, {
        children: "\u201CAs Terrifying and painful as reality can be, it\u2019s also the only place where you can find true happiness.\u201D"
      }), "\n"]
    })]
  });
}

function MDXContent$6(props = {}) {
  return createVNode(MDXLayout$6, { ...props,
    children: createVNode(_createMdxContent$6, { ...props
    })
  });
}

__astro_tag_component__(getHeadings$6, "astro:jsx");
const url$6 = "/book/2-ready-player-one";
const file$6 = "C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/book/2-ready-player-one.mdx";

const _page12 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	getHeadings: getHeadings$6,
	frontmatter: frontmatter$6,
	default: MDXContent$6,
	url: url$6,
	file: file$6
}, Symbol.toStringTag, { value: 'Module' }));

function getHeadings$5() {
  return [{
    "depth": 1,
    "slug": "rating--810",
    "text": "Rating : 8/10"
  }, {
    "depth": 3,
    "slug": "classics-literature-psychology-feminism-novel-poetry-mental-health",
    "text": "Classics, Literature, Psychology, Feminism, Novel, Poetry, Mental Health"
  }];
}
const frontmatter$5 = {
  "layout": "../../layouts/BookPost.astro",
  "title": "The Bell Jar",
  "author": "Sylvia Plath",
  "year": 1963,
  "publishDate": "05 Oct 2017",
  "writer": "Mark",
  "href": "https://twitter.com/_Hopelezz",
  "description": "A semi-autobiographical with the names of places and people changed. The book is",
  "img": "https://covers.openlibrary.org/b/id/8457807-L.jpg",
  "tags": "women college students, summer, Classics, Literature, Psychology, Feminism, Novel, Poetry, Mental Health, American, Adult, Fiction, Mental Depression, Suicidal behavior, Mentally ill, Psychiatric hospital patients, Mental illness, Women authors, Treatment, Women periodical editors, College students, Suicide, Psychological fiction, Autobiographical fiction, Roman \xE0 clef, open_syllabus_project, Women psychotherapy patients, Fiction, psychological, American fiction (fictional works by one author), Young women, fiction, Students, fiction, Children's fiction, Depression, mental, fiction, Fiction, biographical, Fiction, general, New york (n.y.), fiction, Large type books, American literature"
};

const MDXLayout$5 = async function ({
  children
}) {
  const Layout = (await Promise.resolve().then(() => BookPost)).default;
  return createVNode(Layout, {
    content: {
      "title": "The Bell Jar",
      "author": "Sylvia Plath",
      "year": 1963,
      "publishDate": "05 Oct 2017",
      "writer": "Mark",
      "href": "https://twitter.com/_Hopelezz",
      "description": "A semi-autobiographical with the names of places and people changed. The book is",
      "img": "https://covers.openlibrary.org/b/id/8457807-L.jpg",
      "tags": "women college students, summer, Classics, Literature, Psychology, Feminism, Novel, Poetry, Mental Health, American, Adult, Fiction, Mental Depression, Suicidal behavior, Mentally ill, Psychiatric hospital patients, Mental illness, Women authors, Treatment, Women periodical editors, College students, Suicide, Psychological fiction, Autobiographical fiction, Roman \xE0 clef, open_syllabus_project, Women psychotherapy patients, Fiction, psychological, American fiction (fictional works by one author), Young women, fiction, Students, fiction, Children's fiction, Depression, mental, fiction, Fiction, biographical, Fiction, general, New york (n.y.), fiction, Large type books, American literature"
    },
    children: children
  });
};

function _createMdxContent$5(props) {
  const _components = Object.assign({
    h1: "h1",
    h3: "h3",
    em: "em",
    p: "p",
    blockquote: "blockquote"
  }, props.components);

  return createVNode(Fragment, {
    children: [createVNode(_components.h1, {
      id: "rating--810",
      children: "Rating : 8/10"
    }), "\n", createVNode(_components.h3, {
      id: "classics-literature-psychology-feminism-novel-poetry-mental-health",
      children: createVNode(_components.em, {
        children: "Classics, Literature, Psychology, Feminism, Novel, Poetry, Mental Health"
      })
    }), "\n", createVNode(_components.p, {
      children: createVNode(_components.em, {
        children: ["This book could be a trigger for those who deal with ", createVNode("u", {
          children: "suicidal tendencies"
        }), "."]
      })
    }), "\n", createVNode(_components.p, {
      children: "Reading The Bell Jar, I felt the pathos that are heavily inlaid into the story of this semi-autobiographical novel and it melted my heart."
    }), "\n", createVNode(_components.blockquote, {
      children: ["\n", createVNode(_components.p, {
        children: "\u201CIt was a queer, sultry summer, the summer they electrocuted the Rosenbergs, and I didn\u2019t know what I was doing in New York.\u201D"
      }), "\n"]
    }), "\n", createVNode(_components.p, {
      children: "And thus the tale of Esther Greenwood, our Protagonist, begins. The book covers her struggles through relationships, abuse, and the pressure of an adult life, encapsulated through the lens of teen angst. All to the point she starts to suffocate and spiral out of control. Forced into therapy, but it goes horribly wrong."
    }), "\n", createVNode(_components.p, {
      children: "I would love to tell you about different details about the book past this point, but I can\u2019t for fear I would be devoiding you of the same ambivalent feeling in which I was consumed with."
    }), "\n", createVNode(_components.p, {
      children: "Or in Esther\u2019s own words:"
    }), "\n", createVNode(_components.blockquote, {
      children: ["\n", createVNode(_components.p, {
        children: "\u201CI felt very still and empty, the way the eye of a tornado must feel, moving dully along in the middle of the surrounding hullabaloo.\u201D"
      }), "\n"]
    }), "\n", createVNode(_components.p, {
      children: "I\u2019ve come to the conclusion I\u2019m not fond much of teen angst because it only translates to me as \u201Csnooty\u201D. Mind you, my feelings were just my experience with the characters in this Novel and Catcher in the Rye, which I read back to back. Many others have found both novels amusing in a seriocomic sort of way. Anyhow, please give this book a serious look as you\u2019re deciding on which book to read next!"
    })]
  });
}

function MDXContent$5(props = {}) {
  return createVNode(MDXLayout$5, { ...props,
    children: createVNode(_createMdxContent$5, { ...props
    })
  });
}

__astro_tag_component__(getHeadings$5, "astro:jsx");
const url$5 = "/book/4-the-bell-jar";
const file$5 = "C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/book/4-the-bell-jar.mdx";

const _page13 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	getHeadings: getHeadings$5,
	frontmatter: frontmatter$5,
	default: MDXContent$5,
	url: url$5,
	file: file$5
}, Symbol.toStringTag, { value: 'Module' }));

function getHeadings$4() {
  return [{
    "depth": 1,
    "slug": "rating--1010",
    "text": "Rating : 10/10"
  }, {
    "depth": 3,
    "slug": "sci-fi-comedy",
    "text": "Sci-fi, Comedy"
  }];
}
const frontmatter$4 = {
  "layout": "../../layouts/BookPost.astro",
  "title": "Old Man's War",
  "author": "John Scalzi",
  "year": 2005,
  "publishDate": "2 MAR 2019",
  "writer": "Mark",
  "href": "https://twitter.com/_Hopelezz",
  "description": "Hitchhickers guide to the Galaxy meets Stormship troopers!",
  "img": "https://covers.openlibrary.org/b/id/3365280-L.jpg",
  "tags": "Sci-fi, Comedy, Charming, Is-A-Movie"
};

const MDXLayout$4 = async function ({
  children
}) {
  const Layout = (await Promise.resolve().then(() => BookPost)).default;
  return createVNode(Layout, {
    content: {
      "title": "Old Man's War",
      "author": "John Scalzi",
      "year": 2005,
      "publishDate": "2 MAR 2019",
      "writer": "Mark",
      "href": "https://twitter.com/_Hopelezz",
      "description": "Hitchhickers guide to the Galaxy meets Stormship troopers!",
      "img": "https://covers.openlibrary.org/b/id/3365280-L.jpg",
      "tags": "Sci-fi, Comedy, Charming, Is-A-Movie"
    },
    children: children
  });
};

function _createMdxContent$4(props) {
  const _components = Object.assign({
    h1: "h1",
    h3: "h3",
    em: "em",
    p: "p"
  }, props.components);

  return createVNode(Fragment, {
    children: [createVNode(_components.h1, {
      id: "rating--1010",
      children: "Rating : 10/10"
    }), "\n", createVNode(_components.h3, {
      id: "sci-fi-comedy",
      children: createVNode(_components.em, {
        children: "Sci-fi, Comedy"
      })
    }), "\n", createVNode(_components.p, {
      children: "Hitchhickers guide to the Galaxy meets Stormship troopers! Old Man\u2019s War is brilliantly written! Scalzi has some of the freshest and most unique take on future tech I\u2019ve come across in a while."
    }), "\n", createVNode(_components.p, {
      children: "Premise of the story is people who turn 75 can apply for the colonial forces, but have to give up everything they know. In exchange they get a fresh new body for as long as they serve in the fleet. During their stay they fight several diverse and sometimes brutal types of aliens."
    })]
  });
}

function MDXContent$4(props = {}) {
  return createVNode(MDXLayout$4, { ...props,
    children: createVNode(_createMdxContent$4, { ...props
    })
  });
}

__astro_tag_component__(getHeadings$4, "astro:jsx");
const url$4 = "/book/8-old-mans-war";
const file$4 = "C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/book/8-old-mans-war.mdx";

const _page14 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	getHeadings: getHeadings$4,
	frontmatter: frontmatter$4,
	default: MDXContent$4,
	url: url$4,
	file: file$4
}, Symbol.toStringTag, { value: 'Module' }));

function getHeadings$3() {
  return [{
    "depth": 1,
    "slug": "rating--1010",
    "text": "Rating : 10/10"
  }, {
    "depth": 3,
    "slug": "sci-fi-comedy-charming-is-a-movie",
    "text": "Sci-fi, Comedy, Charming, Is-A-Movie"
  }];
}
const frontmatter$3 = {
  "layout": "../../layouts/BookPost.astro",
  "title": "The Martian",
  "author": "Andy Weir",
  "year": 2011,
  "publishDate": "14 OCT 2017",
  "writer": "Mark",
  "href": "https://twitter.com/_Hopelezz",
  "description": "A space expedition goes horribly wrong...",
  "img": "https://covers.openlibrary.org/b/id/11446888-L.jpg",
  "tags": "Sci-fi, Comedy, Charming, Is-A-Movie"
};

const MDXLayout$3 = async function ({
  children
}) {
  const Layout = (await Promise.resolve().then(() => BookPost)).default;
  return createVNode(Layout, {
    content: {
      "title": "The Martian",
      "author": "Andy Weir",
      "year": 2011,
      "publishDate": "14 OCT 2017",
      "writer": "Mark",
      "href": "https://twitter.com/_Hopelezz",
      "description": "A space expedition goes horribly wrong...",
      "img": "https://covers.openlibrary.org/b/id/11446888-L.jpg",
      "tags": "Sci-fi, Comedy, Charming, Is-A-Movie"
    },
    children: children
  });
};

function _createMdxContent$3(props) {
  const _components = Object.assign({
    h1: "h1",
    h3: "h3",
    em: "em",
    p: "p",
    blockquote: "blockquote"
  }, props.components);

  return createVNode(Fragment, {
    children: [createVNode(_components.h1, {
      id: "rating--1010",
      children: "Rating : 10/10"
    }), "\n", createVNode(_components.h3, {
      id: "sci-fi-comedy-charming-is-a-movie",
      children: createVNode(_components.em, {
        children: "Sci-fi, Comedy, Charming, Is-A-Movie"
      })
    }), "\n", createVNode(_components.p, {
      children: "A space expedition goes wrong after Sol 6 on the planet of Mars (The Antagonist). A sudden dust storm causes the team to evacuate, but Mark Watney (the protagonist) gets injured and presumed dead. Watney, a botanist and mechanical mastermind, has the skillset needed to survive on the treacherous planet, but for how long?"
    }), "\n", createVNode(_components.p, {
      children: "The story advances through update logs in a unique and comical way through Watney\u2019s optimistic perspective. Using his optimism Watney reshape his unfortunate situation and sheds light on his ever growing list of problems."
    }), "\n", createVNode(_components.blockquote, {
      children: ["\n", createVNode(_components.p, {
        children: "I guess you could call it a failure, but I prefer the term learning experience."
      }), "\n"]
    }), "\n", createVNode(_components.p, {
      children: "He has this witty and charming personality that\u2019s hard not to love as you read. Imagine if Castaway, Mission to Mars, Apollo 13, and MacGyver were to have a baby The Martian would be the outcome. With it\u2019s near plausible circumstances and close to accurate science The Martian offers the readers a much desired story that\u2019s been begging to be told for centuries."
    }), "\n", createVNode(_components.p, {
      children: "Side note: For those who\u2019ve watched the Movie but have yet to read the book, I encourage you read the book! The Movie shifts around some details and the book has a ton of humor that never made it to the movie."
    })]
  });
}

function MDXContent$3(props = {}) {
  return createVNode(MDXLayout$3, { ...props,
    children: createVNode(_createMdxContent$3, { ...props
    })
  });
}

__astro_tag_component__(getHeadings$3, "astro:jsx");
const url$3 = "/book/7-the-martian";
const file$3 = "C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/book/7-the-martian.mdx";

const _page15 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	getHeadings: getHeadings$3,
	frontmatter: frontmatter$3,
	default: MDXContent$3,
	url: url$3,
	file: file$3
}, Symbol.toStringTag, { value: 'Module' }));

function getHeadings$2() {
  return [{
    "depth": 1,
    "slug": "rating--710",
    "text": "Rating : 7/10"
  }, {
    "depth": 3,
    "slug": "fiction-psychological-suspense",
    "text": "Fiction, Psychological, Suspense"
  }];
}
const frontmatter$2 = {
  "layout": "../../layouts/BookPost.astro",
  "title": "Supermarket",
  "author": "Bobby Hall",
  "year": 2019,
  "publishDate": "23 NOV 2019",
  "writer": "Mark",
  "href": "https://twitter.com/_Hopelezz",
  "description": null,
  "img": "https://covers.openlibrary.org/b/isbn/9781982127138-L.jpg",
  "tags": "Fiction, psychological, Fiction, Suspense"
};

const MDXLayout$2 = async function ({
  children
}) {
  const Layout = (await Promise.resolve().then(() => BookPost)).default;
  return createVNode(Layout, {
    content: {
      "title": "Supermarket",
      "author": "Bobby Hall",
      "year": 2019,
      "publishDate": "23 NOV 2019",
      "writer": "Mark",
      "href": "https://twitter.com/_Hopelezz",
      "description": null,
      "img": "https://covers.openlibrary.org/b/isbn/9781982127138-L.jpg",
      "tags": "Fiction, psychological, Fiction, Suspense"
    },
    children: children
  });
};

function _createMdxContent$2(props) {
  const _components = Object.assign({
    h1: "h1",
    h3: "h3",
    em: "em",
    p: "p"
  }, props.components);

  return createVNode(Fragment, {
    children: [createVNode(_components.h1, {
      id: "rating--710",
      children: "Rating : 7/10"
    }), "\n", createVNode(_components.h3, {
      id: "fiction-psychological-suspense",
      children: createVNode(_components.em, {
        children: "Fiction, Psychological, Suspense"
      })
    }), "\n", createVNode(_components.p, {
      children: "The book starts with a compelling narrative. It\u2019ll suck you in, but right after it shifts drastically to some boring guys\u2019 (Flynn) life. He\u2019s an author, writing about a supermarket. For the most part, the story is bland day-to-day nonsense, but with insights into his thoughts on writing his novel."
    }), "\n", createVNode(_components.p, {
      children: "It\u2019s very much like Fight Club in the way to story plays out, but with twists like Flynn breaking the 4th wall or retelling events as if they happened when they\u2019re all in his head. This gave the story a fresh take. I very much like the 2nd half of the book more as this is when the story starts getting fleshed out and changes narrative mindsets."
    }), "\n", createVNode(_components.p, {
      children: "For the most part, it\u2019s a solid book for a new author."
    })]
  });
}

function MDXContent$2(props = {}) {
  return createVNode(MDXLayout$2, { ...props,
    children: createVNode(_createMdxContent$2, { ...props
    })
  });
}

__astro_tag_component__(getHeadings$2, "astro:jsx");
const url$2 = "/book/9-supermarket";
const file$2 = "C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/book/9-supermarket.mdx";

const _page16 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	getHeadings: getHeadings$2,
	frontmatter: frontmatter$2,
	default: MDXContent$2,
	url: url$2,
	file: file$2
}, Symbol.toStringTag, { value: 'Module' }));

function getHeadings$1() {
  return [{
    "depth": 1,
    "slug": "rating--1010",
    "text": "Rating : 10/10"
  }, {
    "depth": 3,
    "slug": "fiction-american-autobiographical",
    "text": "Fiction, American, Autobiographical"
  }];
}
const frontmatter$1 = {
  "layout": "../../layouts/BookPost.astro",
  "title": "Slapstick",
  "author": "Kurt Vonnegut",
  "year": 1976,
  "publishDate": "12 OCT 2017",
  "writer": "Mark",
  "href": "https://twitter.com/_Hopelezz",
  "description": "Depicts Vonnegut's views of loneliness, both on an individual and social scale.",
  "img": "https://covers.openlibrary.org/b/id/6632174-L.jpg",
  "tags": "Presidents, Fiction, American Fiction"
};

const MDXLayout$1 = async function ({
  children
}) {
  const Layout = (await Promise.resolve().then(() => BookPost)).default;
  return createVNode(Layout, {
    content: {
      "title": "Slapstick",
      "author": "Kurt Vonnegut",
      "year": 1976,
      "publishDate": "12 OCT 2017",
      "writer": "Mark",
      "href": "https://twitter.com/_Hopelezz",
      "description": "Depicts Vonnegut's views of loneliness, both on an individual and social scale.",
      "img": "https://covers.openlibrary.org/b/id/6632174-L.jpg",
      "tags": "Presidents, Fiction, American Fiction"
    },
    children: children
  });
};

function _createMdxContent$1(props) {
  const _components = Object.assign({
    h1: "h1",
    h3: "h3",
    em: "em",
    blockquote: "blockquote",
    p: "p",
    code: "code"
  }, props.components);

  return createVNode(Fragment, {
    children: [createVNode(_components.h1, {
      id: "rating--1010",
      children: "Rating : 10/10"
    }), "\n", createVNode(_components.h3, {
      id: "fiction-american-autobiographical",
      children: createVNode(_components.em, {
        children: "Fiction, American, Autobiographical"
      })
    }), "\n", createVNode(_components.blockquote, {
      children: ["\n", createVNode(_components.p, {
        children: "\u201CThis is the closest I will ever come to writing an autobiography. I have called it \u201CSlapstick\u201D because it is grotesque, situational poetry \u2014 like the slapstick film comedies, especially those of Laurel and Hardy, of long ago. It is about what life feels like to me.\u201D"
      }), "\n"]
    }), "\n", createVNode(_components.p, {
      children: "You see, Kurt\u2019s sister Alice, whom he was close with, died of cancer. A few days later her husband followed in an accident.\r\nAfter having read Slaughterhouse-five one would think okay this will be somewhat distorted fiction\u2026 No. This is one whirlwind of neurotic-psychedelic-nightmares infused by Dali or some such artist. One you masochistically can\u2019t put down. Strap in you\u2019re going for a ride!"
    }), "\n", createVNode(_components.p, {
      children: "Wilbur and Eliza Swain are twins. At birth the parents were told they wouldn\u2019t live past their childhood years. Misshapen and appearing unintelligent like that of Neanderthals, with small incoherent words. Their parents made their lives as comfortable as possible. Being of wealth, they made it as comfortable for them as possible and spared no expenses to provide the best possible life they could imagine, including the best physicians money could afford. To keep this from the public, they created a fortress like home surrounded by two sets of fences. One around the house and the other an apple orchard that surrounded the house. The two children for much of their childhood practically inseparable and together brilliant minded; each representing the two halves of a brain. When separated, they function poorly:"
    }), "\n", createVNode(_components.blockquote, {
      children: ["\n", createVNode(_components.p, {
        children: "\u201CI felt as though my head were turning to wood\u201D or \u201Cmy skull was filling up with maple syrup\u201D"
      }), "\n"]
    }), "\n", createVNode(_components.p, {
      children: "A bitter psychiatrist who feels as though her time is wasted on the two snivel nosed beasts, convinces the parents to separate them. Wilbur who\u2019s able to read and write gets sent off to schools around the world while Eliza is sent off to an asylum because she was considered \u201Cuseless: without her brother, but that\u2019s far from reality."
    }), "\n", createVNode(_components.p, {
      children: ["This mind scrambler of a tale keept me entertained with this bizarre comedic sort of way while glaze in a melancholy tone. There\u2019s tiny China men ", createVNode(_components.code, {
        children: "No. Seriously. \u201CTiny\u201D China men"
      }), ", a mysterious \u201Cgreen death\u201D disease that\u2019s killing thousands of people, Gravitational fluctuations, and so many more absurdities to the point, it\u2019s absurd, yet with the way Kurt portrays his story you can\u2019t help, but be wonder struck and amazed by the tale."]
    }), "\n", createVNode(_components.blockquote, {
      children: ["\n", createVNode(_components.p, {
        children: "\u201CHi ho.\u201D"
      }), "\n"]
    })]
  });
}

function MDXContent$1(props = {}) {
  return createVNode(MDXLayout$1, { ...props,
    children: createVNode(_createMdxContent$1, { ...props
    })
  });
}

__astro_tag_component__(getHeadings$1, "astro:jsx");
const url$1 = "/book/6-slapstick";
const file$1 = "C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/book/6-slapstick.mdx";

const _page17 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	getHeadings: getHeadings$1,
	frontmatter: frontmatter$1,
	default: MDXContent$1,
	url: url$1,
	file: file$1
}, Symbol.toStringTag, { value: 'Module' }));

function getHeadings() {
  return [{
    "depth": 1,
    "slug": "rating--1010",
    "text": "Rating : 10/10"
  }, {
    "depth": 3,
    "slug": "sci-fi-thriller-action-packed-aliens-enders-game-clone",
    "text": "Sci-fi, Thriller, Action-packed, Aliens, Ender\u2019s-Game-Clone"
  }];
}
const frontmatter = {
  "layout": "../../layouts/BookPost.astro",
  "title": "Armada",
  "author": "Ernest Cline",
  "year": 2015,
  "publishDate": "11 JUL 2017",
  "writer": "Mark",
  "href": "https://twitter.com/_Hopelezz",
  "description": "The story follows a teenager who plays an online video game about defending against an alien invasion, only to find out that the game is a simulator to prepare him and people around the world for defending against an actual alien invasion.",
  "img": "https://covers.openlibrary.org/b/id/10375880-L.jpg",
  "tags": "Thriller, Action-packed, Aliens, Ender's-Game-Clone"
};

const MDXLayout = async function ({
  children
}) {
  const Layout = (await Promise.resolve().then(() => BookPost)).default;
  return createVNode(Layout, {
    content: {
      "title": "Armada",
      "author": "Ernest Cline",
      "year": 2015,
      "publishDate": "11 JUL 2017",
      "writer": "Mark",
      "href": "https://twitter.com/_Hopelezz",
      "description": "The story follows a teenager who plays an online video game about defending against an alien invasion, only to find out that the game is a simulator to prepare him and people around the world for defending against an actual alien invasion.",
      "img": "https://covers.openlibrary.org/b/id/10375880-L.jpg",
      "tags": "Thriller, Action-packed, Aliens, Ender's-Game-Clone"
    },
    children: children
  });
};

function _createMdxContent(props) {
  const _components = Object.assign({
    h1: "h1",
    h3: "h3",
    em: "em",
    p: "p",
    blockquote: "blockquote"
  }, props.components);

  return createVNode(Fragment, {
    children: [createVNode(_components.h1, {
      id: "rating--1010",
      children: "Rating : 10/10"
    }), "\n", createVNode(_components.h3, {
      id: "sci-fi-thriller-action-packed-aliens-enders-game-clone",
      children: createVNode(_components.em, {
        children: "Sci-fi, Thriller, Action-packed, Aliens, Ender\u2019s-Game-Clone"
      })
    }), "\n", createVNode(_components.p, {
      children: "Armada is about a guy named Zack Lightman, who is daydreaming out a window in class and sees an alien spaceship. The same ship from a video game he\u2019s been playing for 3 years. He comes to realize that the powers-that-be have been preparing the world to defend against an Alien invasion for years. Zack\u2019s personal story will have you in a whirl of emotions and engaged through the entire story."
    }), "\n", createVNode(_components.blockquote, {
      children: ["\n", createVNode(_components.p, {
        children: "I\u2019d spent my entire life overdosing on uncut escapism, willingly allowing fantasy to become my reality."
      }), "\n"]
    }), "\n", createVNode(_components.p, {
      children: ["Even though I had read Ready Player One with a fervor, I approached Armada with some skepticism. ", createVNode(_components.em, {
        children: "How could Cline top his previous book?"
      }), " With Armada of course. I read this book in 3 days; which is a record for myself. I have an obsession with a book series written by Orson Scott Card known as Ender Series.  Ender is about a boy who tests out to be one of the brightest kids in the world and is chosen to defend earth with his critical thinking skills. A while back I had read that Card wrote the books for his children so he kept it on the less gritty side. Armada is an adult version of Ender\u2019s Game (The first in the series), not so much gore, but sheer intensity. Armada pays homage to Card\u2019s books and even references it in Armada. While Armada has a few of the key elements Enders uses, it\u2019s no carbon copy by any means."]
    }), "\n", createVNode(_components.p, {
      children: "Cline uses pop culture to immerse the reader in nostalgia all while telling a story through the eyes of the main character. It\u2019s almost as if you\u2019re in conversation with someone telling an incredible story. Every artifact Cline mentions that I didn\u2019t know made me want to research them or listen to the songs. A scattering of hidden eggs can be found throughout the book. Oh, and the ending? The ending\u2026 on second thought, I\u2019ll let you read it for yourself. I was in awe."
    })]
  });
}

function MDXContent(props = {}) {
  return createVNode(MDXLayout, { ...props,
    children: createVNode(_createMdxContent, { ...props
    })
  });
}

__astro_tag_component__(getHeadings, "astro:jsx");
const url = "/book/3-armada";
const file = "C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/pages/book/3-armada.mdx";

const _page18 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	getHeadings,
	frontmatter,
	default: MDXContent,
	url,
	file
}, Symbol.toStringTag, { value: 'Module' }));

const pageMap = new Map([['node_modules/@astrojs/image/dist/endpoints/prod.js', _page0],['src/pages/index.astro', _page1],['src/pages/bookreview.astro', _page2],['src/pages/blog/4-most-recent-post-button.mdx', _page3],['src/pages/blog/2-two-factor-auth.mdx', _page4],['src/pages/blog/3-starting-astro.mdx', _page5],['src/pages/blog/1-password.mdx', _page6],['src/pages/book/11-communist-manifesto.mdx', _page7],['src/pages/book/1-Slaughterhouse-Five.mdx', _page8],['src/pages/book/5-lord-of-the-flies.mdx', _page9],['src/pages/book/10-never-let-me-go.mdx', _page10],['src/pages/book/2-ready-player-one.md', _page11],['src/pages/book/2-ready-player-one.mdx', _page12],['src/pages/book/4-the-bell-jar.mdx', _page13],['src/pages/book/8-old-mans-war.mdx', _page14],['src/pages/book/7-the-martian.mdx', _page15],['src/pages/book/9-supermarket.mdx', _page16],['src/pages/book/6-slapstick.mdx', _page17],['src/pages/book/3-armada.mdx', _page18],]);
const renderers = [Object.assign({"name":"astro:jsx","serverEntrypoint":"astro/jsx/server.js","jsxImportSource":"astro"}, { ssr: server_default }),Object.assign({"name":"@astrojs/solid-js","clientEntrypoint":"@astrojs/solid-js/client.js","serverEntrypoint":"@astrojs/solid-js/server.js","jsxImportSource":"solid-js"}, { ssr: _renderer1 }),Object.assign({"name":"@astrojs/preact","clientEntrypoint":"@astrojs/preact/client.js","serverEntrypoint":"@astrojs/preact/server.js","jsxImportSource":"preact"}, { ssr: _renderer2 }),];

if (typeof process !== "undefined") {
  if (process.argv.includes("--verbose")) ; else if (process.argv.includes("--silent")) ; else ;
}

const SCRIPT_EXTENSIONS = /* @__PURE__ */ new Set([".js", ".ts"]);
new RegExp(
  `\\.(${Array.from(SCRIPT_EXTENSIONS).map((s) => s.slice(1)).join("|")})($|\\?)`
);

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
new RegExp(
  `\\.(${Array.from(STYLE_EXTENSIONS).map((s) => s.slice(1)).join("|")})($|\\?)`
);

function getRouteGenerator(segments, addTrailingSlash) {
  const template = segments.map((segment) => {
    return segment[0].spread ? `/:${segment[0].content.slice(3)}(.*)?` : "/" + segment.map((part) => {
      if (part)
        return part.dynamic ? `:${part.content}` : part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }).join("");
  }).join("");
  let trailing = "";
  if (addTrailingSlash === "always" && segments.length) {
    trailing = "/";
  }
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

const _manifest = Object.assign(deserializeManifest({"adapterName":"@astrojs/vercel/serverless","routes":[{"file":"","links":[],"scripts":[],"routeData":{"type":"endpoint","route":"/_image","pattern":"^\\/_image$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/@astrojs/image/dist/endpoints/prod.js","pathname":"/_image","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/index.f40f6732.css","assets/9dad50dd.256302b4.css","assets/7f648411.76a79a5e.css"],"scripts":[{"type":"external","value":"hoisted.2af3ced0.js"}],"routeData":{"route":"/","type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/9dad50dd.256302b4.css","assets/7f648411.76a79a5e.css"],"scripts":[{"type":"external","value":"hoisted.2af3ced02.js"}],"routeData":{"route":"/bookreview","type":"page","pattern":"^\\/bookreview\\/?$","segments":[[{"content":"bookreview","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/bookreview.astro","pathname":"/bookreview","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/9dad50dd.256302b4.css","assets/7f648411.76a79a5e.css"],"scripts":[{"type":"external","value":"hoisted.2af3ced02.js"}],"routeData":{"route":"/blog/4-most-recent-post-button","type":"page","pattern":"^\\/blog\\/4-most-recent-post-button\\/?$","segments":[[{"content":"blog","dynamic":false,"spread":false}],[{"content":"4-most-recent-post-button","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/blog/4-most-recent-post-button.mdx","pathname":"/blog/4-most-recent-post-button","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/9dad50dd.256302b4.css","assets/7f648411.76a79a5e.css"],"scripts":[{"type":"external","value":"hoisted.2af3ced02.js"}],"routeData":{"route":"/blog/2-two-factor-auth","type":"page","pattern":"^\\/blog\\/2-two-factor-auth\\/?$","segments":[[{"content":"blog","dynamic":false,"spread":false}],[{"content":"2-two-factor-auth","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/blog/2-two-factor-auth.mdx","pathname":"/blog/2-two-factor-auth","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/9dad50dd.256302b4.css","assets/7f648411.76a79a5e.css"],"scripts":[{"type":"external","value":"hoisted.2af3ced02.js"}],"routeData":{"route":"/blog/3-starting-astro","type":"page","pattern":"^\\/blog\\/3-starting-astro\\/?$","segments":[[{"content":"blog","dynamic":false,"spread":false}],[{"content":"3-starting-astro","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/blog/3-starting-astro.mdx","pathname":"/blog/3-starting-astro","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/9dad50dd.256302b4.css","assets/7f648411.76a79a5e.css"],"scripts":[{"type":"external","value":"hoisted.2af3ced02.js"}],"routeData":{"route":"/blog/1-password","type":"page","pattern":"^\\/blog\\/1-password\\/?$","segments":[[{"content":"blog","dynamic":false,"spread":false}],[{"content":"1-password","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/blog/1-password.mdx","pathname":"/blog/1-password","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/9dad50dd.256302b4.css","assets/7f648411.76a79a5e.css"],"scripts":[{"type":"external","value":"hoisted.2af3ced02.js"}],"routeData":{"route":"/book/11-communist-manifesto","type":"page","pattern":"^\\/book\\/11-communist-manifesto\\/?$","segments":[[{"content":"book","dynamic":false,"spread":false}],[{"content":"11-communist-manifesto","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/book/11-communist-manifesto.mdx","pathname":"/book/11-communist-manifesto","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/9dad50dd.256302b4.css","assets/7f648411.76a79a5e.css"],"scripts":[{"type":"external","value":"hoisted.2af3ced02.js"}],"routeData":{"route":"/book/1-slaughterhouse-five","type":"page","pattern":"^\\/book\\/1-Slaughterhouse-Five\\/?$","segments":[[{"content":"book","dynamic":false,"spread":false}],[{"content":"1-Slaughterhouse-Five","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/book/1-Slaughterhouse-Five.mdx","pathname":"/book/1-Slaughterhouse-Five","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/9dad50dd.256302b4.css","assets/7f648411.76a79a5e.css"],"scripts":[{"type":"external","value":"hoisted.2af3ced02.js"}],"routeData":{"route":"/book/5-lord-of-the-flies","type":"page","pattern":"^\\/book\\/5-lord-of-the-flies\\/?$","segments":[[{"content":"book","dynamic":false,"spread":false}],[{"content":"5-lord-of-the-flies","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/book/5-lord-of-the-flies.mdx","pathname":"/book/5-lord-of-the-flies","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/9dad50dd.256302b4.css","assets/7f648411.76a79a5e.css"],"scripts":[{"type":"external","value":"hoisted.2af3ced02.js"}],"routeData":{"route":"/book/10-never-let-me-go","type":"page","pattern":"^\\/book\\/10-never-let-me-go\\/?$","segments":[[{"content":"book","dynamic":false,"spread":false}],[{"content":"10-never-let-me-go","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/book/10-never-let-me-go.mdx","pathname":"/book/10-never-let-me-go","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/9dad50dd.256302b4.css","assets/7f648411.76a79a5e.css"],"scripts":[{"type":"external","value":"hoisted.2af3ced02.js"}],"routeData":{"route":"/book/2-ready-player-one","type":"page","pattern":"^\\/book\\/2-ready-player-one\\/?$","segments":[[{"content":"book","dynamic":false,"spread":false}],[{"content":"2-ready-player-one","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/book/2-ready-player-one.md","pathname":"/book/2-ready-player-one","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/9dad50dd.256302b4.css","assets/7f648411.76a79a5e.css"],"scripts":[{"type":"external","value":"hoisted.2af3ced02.js"}],"routeData":{"route":"/book/2-ready-player-one","type":"page","pattern":"^\\/book\\/2-ready-player-one\\/?$","segments":[[{"content":"book","dynamic":false,"spread":false}],[{"content":"2-ready-player-one","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/book/2-ready-player-one.mdx","pathname":"/book/2-ready-player-one","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/9dad50dd.256302b4.css","assets/7f648411.76a79a5e.css"],"scripts":[{"type":"external","value":"hoisted.2af3ced02.js"}],"routeData":{"route":"/book/4-the-bell-jar","type":"page","pattern":"^\\/book\\/4-the-bell-jar\\/?$","segments":[[{"content":"book","dynamic":false,"spread":false}],[{"content":"4-the-bell-jar","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/book/4-the-bell-jar.mdx","pathname":"/book/4-the-bell-jar","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/9dad50dd.256302b4.css","assets/7f648411.76a79a5e.css"],"scripts":[{"type":"external","value":"hoisted.2af3ced02.js"}],"routeData":{"route":"/book/8-old-mans-war","type":"page","pattern":"^\\/book\\/8-old-mans-war\\/?$","segments":[[{"content":"book","dynamic":false,"spread":false}],[{"content":"8-old-mans-war","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/book/8-old-mans-war.mdx","pathname":"/book/8-old-mans-war","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/9dad50dd.256302b4.css","assets/7f648411.76a79a5e.css"],"scripts":[{"type":"external","value":"hoisted.2af3ced02.js"}],"routeData":{"route":"/book/7-the-martian","type":"page","pattern":"^\\/book\\/7-the-martian\\/?$","segments":[[{"content":"book","dynamic":false,"spread":false}],[{"content":"7-the-martian","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/book/7-the-martian.mdx","pathname":"/book/7-the-martian","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/9dad50dd.256302b4.css","assets/7f648411.76a79a5e.css"],"scripts":[{"type":"external","value":"hoisted.2af3ced02.js"}],"routeData":{"route":"/book/9-supermarket","type":"page","pattern":"^\\/book\\/9-supermarket\\/?$","segments":[[{"content":"book","dynamic":false,"spread":false}],[{"content":"9-supermarket","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/book/9-supermarket.mdx","pathname":"/book/9-supermarket","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/9dad50dd.256302b4.css","assets/7f648411.76a79a5e.css"],"scripts":[{"type":"external","value":"hoisted.2af3ced02.js"}],"routeData":{"route":"/book/6-slapstick","type":"page","pattern":"^\\/book\\/6-slapstick\\/?$","segments":[[{"content":"book","dynamic":false,"spread":false}],[{"content":"6-slapstick","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/book/6-slapstick.mdx","pathname":"/book/6-slapstick","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/9dad50dd.256302b4.css","assets/7f648411.76a79a5e.css"],"scripts":[{"type":"external","value":"hoisted.2af3ced02.js"}],"routeData":{"route":"/book/3-armada","type":"page","pattern":"^\\/book\\/3-armada\\/?$","segments":[[{"content":"book","dynamic":false,"spread":false}],[{"content":"3-armada","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/book/3-armada.mdx","pathname":"/book/3-armada","_meta":{"trailingSlash":"ignore"}}}],"site":"https://blackskies.vercel.app/","base":"/","markdown":{"drafts":false,"syntaxHighlight":"shiki","shikiConfig":{"langs":[],"theme":"dracula","wrap":true},"remarkPlugins":[],"rehypePlugins":[],"isAstroFlavoredMd":false},"pageMap":null,"renderers":[],"entryModules":{"\u0000@astrojs-ssr-virtual-entry":"entry.js","C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/layouts/BlogPost.astro":"chunks/BlogPost.2b0227ad.mjs","/@fs/C:/Users/panze/OneDrive/Documents/GitHub/HopelezzBlog/src/components/search/Search":"Search.a2bc2bf5.js","@astrojs/solid-js/client.js":"client.4067c78d.js","@astrojs/preact/client.js":"client.0cca1885.js","/astro/hoisted.js?q=0":"hoisted.2af3ced0.js","/astro/hoisted.js?q=1":"hoisted.2af3ced02.js","astro:scripts/before-hydration.js":"data:text/javascript;charset=utf-8,//[no before-hydration script]"},"assets":["/assets/9dad50dd.256302b4.css","/assets/index.f40f6732.css","/assets/7f648411.76a79a5e.css","/android-chrome-192x192.png","/android-chrome-512x512.png","/apple-touch-icon.png","/client.0cca1885.js","/client.4067c78d.js","/favicon-16x16.png","/favicon-32x32.png","/favicon.ico","/hoisted.2af3ced0.js","/hoisted.2af3ced02.js","/robots.txt","/Search.a2bc2bf5.js","/site.webmanifest","/social.jpg","/social.png","/chunks/darkmode.astro_astro_type_script_index_0_lang.0abd001b.js","/chunks/web.6f31aee9.js","/assets/LOGO.html","/assets/LOGO.svg","/assets/search.534732cb.css","/assets/authors/John.avif","/assets/authors/Mark.avif","/assets/blog/introducing-astro.jpg","/assets/images/Astronaut.avif","/assets/images/LOGO.png","/assets/images/mailboxes.avif","/assets/images/password.jpg","/assets/images/twofactorauth.jpg","/assets/bookreview/Armada.jpg","/assets/bookreview/OldMansWar.jpg","/assets/bookreview/TheMartian.jpg"]}), {
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

export { $$module1$1 as $, createAstro as a, createComponent as b, createMetadata as c, renderComponent as d, _default as default, $$Aside as e, addAttribute as f, renderSlot as g, $$module1$5 as h, $$module2$1 as i, $$module3$2 as j, $$module5 as k, $$Footer as l, maybeRenderHead as m, $$Navbar as n, $$Cursor as o, renderHead as p, $$MetaTags as q, renderTemplate as r };
